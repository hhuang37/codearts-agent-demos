/**
 * 场景处方服务（services/scene.ts）
 *
 * 与 design.md §6.2.3 对齐
 *
 * v1.0 MVP：
 * - 内置 5 个场景模板（FR-4.1）
 * - 提交问卷 → 本地生成 7 天处方
 * - 校验会员权限（FR-4.5）
 */

import { LocalStore } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';
import { Logger } from '../utils/logger';
import { userStore } from '../stores/user-store';
import { uuid } from '../utils/uuid';
import {
  Scene,
  SceneCode,
  Prescription,
  PrescriptionTemplate,
  ScheduleEntry,
  SCENE_WHITELIST,
} from '../models/scene';
import { BUILTIN_SCENES } from './scene-templates';

const logger = new Logger('scene-service');

/**
 * 列出所有可用场景（运营配置 + 内置）
 */
export function listScenes(): Scene[] {
  const cached = LocalStore.getList<Scene>(STORAGE_KEYS.SCENES_CACHE);
  if (cached.length > 0) return cached.filter((s) => s.enabled);
  // 首次加载：写入内置场景
  LocalStore.setList(STORAGE_KEYS.SCENES_CACHE, BUILTIN_SCENES);
  return BUILTIN_SCENES.filter((s) => s.enabled);
}

/**
 * 通过 code 获取单个场景
 */
export function getScene(code: SceneCode): Scene | null {
  return listScenes().find((s) => s.code === code) || null;
}

/**
 * 提交问卷生成处方（v1.0 本地计算）
 *
 * FR-4.3：3 秒内返回
 * FR-4.5：会员权限校验
 */
export function generatePrescription(
  sceneCode: SceneCode,
  answers: Record<string, string>,
): { ok: boolean; prescription?: Prescription; error?: string } {
  // 1. 校验场景白名单（FR-4.7）
  if (!SCENE_WHITELIST.includes(sceneCode)) {
    return { ok: false, error: '该场景暂未上线，敬请期待' };
  }

  // 2. 获取场景
  const scene = getScene(sceneCode);
  if (!scene) {
    return { ok: false, error: '场景不存在' };
  }

  // 3. 会员权限校验（FR-4.5）
  if (scene.isPremium && !userStore.isPremium()) {
    return { ok: false, error: '该场景为会员专属，请先升级' };
  }

  // 4. 校验必答项
  for (const q of scene.questionnaire) {
    if (q.required && !answers[q.id]) {
      return { ok: false, error: `请回答：${q.question}` };
    }
  }

  // 5. 模板填充 + 问卷微调
  const template = scene.template;
  const adjustedSchedule = adjustScheduleByAnswers(template.schedule, answers);
  const adjustedActions = adjustActionsByAnswers(template.actions, answers);

  const now = Date.now();
  const prescription: Prescription = {
    _id: `pre_${uuid()}`,
    userId: userStore.getUser()._id,
    sceneCode,
    startDate: now,
    durationDays: template.durationDays,
    schedule: adjustedSchedule,
    soundscapeIds: template.soundscapeIds,
    actions: adjustedActions,
    notice: template.notice,
    reminderSubscribed: false,
    active: true,
    createdAt: now,
  };

  // 6. 持久化（缓存当前处方）
  LocalStore.setItem(STORAGE_KEYS.SETTINGS + ':active_prescription', prescription);

  logger.info('prescription generated', {
    scene: sceneCode,
    actions: prescription.actions.length,
  });

  return { ok: true, prescription };
}

/**
 * 查询当前生效的处方
 */
export function getActivePrescription(): Prescription | null {
  return LocalStore.getItemAs<Prescription>(
    STORAGE_KEYS.SETTINGS + ':active_prescription',
  );
}

/**
 * 取消处方
 */
export function cancelPrescription(): void {
  LocalStore.removeItem(STORAGE_KEYS.SETTINGS + ':active_prescription');
}

/**
 * 根据问卷答案微调作息表
 *
 * 例如：用户答"我通常 6 点起床"，bedtime 自动后推
 */
function adjustScheduleByAnswers(
  schedule: ScheduleEntry[],
  answers: Record<string, string>,
): ScheduleEntry[] {
  const wakeupTime = answers.wakeup_time;
  const bedtime = answers.bedtime;
  if (!wakeupTime && !bedtime) return schedule;

  return schedule.map((entry) => {
    const updated = { ...entry };
    if (wakeupTime && /^([01]\d|2[0-3]):[0-5]\d$/.test(wakeupTime)) {
      updated.wakeupTime = wakeupTime;
    }
    if (bedtime && /^([01]\d|2[0-3]):[0-5]\d$/.test(bedtime)) {
      updated.bedtime = bedtime;
    }
    return updated;
  });
}

/**
 * 根据问卷答案追加行动建议
 */
function adjustActionsByAnswers(
  baseActions: string[],
  answers: Record<string, string>,
): string[] {
  const extras: string[] = [];
  // 紧张/焦虑场景
  if (answers.stress_level === 'high' || answers.mood === 'heavy') {
    extras.push('睡前 10 分钟做 4-7-8 呼吸');
  }
  // 加班严重
  if (answers.workload === 'heavy' || answers.workload === 'extreme') {
    extras.push('22:00 后关电脑，不带工作进卧室');
  }
  // 出差倒时差
  if (answers.timezone_diff && Number(answers.timezone_diff) >= 3) {
    extras.push('到达后第一天尽量在户外晒 15 分钟太阳');
  }
  return [...baseActions, ...extras];
}

/**
 * 取内置模板
 */
export function getBuiltinTemplate(sceneCode: SceneCode): PrescriptionTemplate | null {
  const scene = BUILTIN_SCENES.find((s) => s.code === sceneCode);
  return scene ? scene.template : null;
}