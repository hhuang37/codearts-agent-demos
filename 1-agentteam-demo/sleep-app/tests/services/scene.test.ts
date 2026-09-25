/**
 * scene.test.ts —— 场景处方服务测试
 *
 * 覆盖：
 * - listScenes（首次写入缓存，二次走缓存）
 * - getScene / getBuiltinTemplate
 * - generatePrescription（5 个场景、白名单校验、必答校验、会员权限、问卷微调）
 * - getActivePrescription / cancelPrescription
 *
 * 依赖：LocalStore、userStore（store 之间相互 import，会一并被 jest 加载并 mock wx）
 */

import {
  listScenes,
  getScene,
  generatePrescription,
  getActivePrescription,
  cancelPrescription,
  getBuiltinTemplate,
} from '../../miniprogram/services/scene';
import { BUILTIN_SCENES, ALL_SCENE_CODES } from '../../miniprogram/services/scene-templates';
import { LocalStore } from '../../miniprogram/utils/storage';
import { userStore } from '../../miniprogram/stores/user-store';

describe('services/scene', () => {
  beforeEach(() => {
    LocalStore.clear();
    userStore.clear();
  });

  describe('listScenes / getScene', () => {
    it('应返回 5 个内置场景', () => {
      const list = listScenes();
      expect(list).toHaveLength(5);
      expect(list.map((s) => s.code).sort()).toEqual([...ALL_SCENE_CODES].sort());
    });

    it('第二次调用应走缓存（不重复写入）', () => {
      listScenes();
      const before = JSON.stringify(LocalStore.getList('scenes:cache'));
      listScenes();
      const after = JSON.stringify(LocalStore.getList('scenes:cache'));
      expect(after).toBe(before);
    });

    it('getScene 应返回指定 code 的场景', () => {
      expect(getScene('exam')?.name).toBe('考试周');
      expect(getScene('overtime')?.name).toBe('加班冲刺');
      expect(getScene('pregnancy')?.isPremium).toBe(true);
    });

    it('getScene 未知 code 应返回 null', () => {
      expect(getScene('unknown' as any)).toBeNull();
    });

    it('getBuiltinTemplate 应返回模板', () => {
      expect(getBuiltinTemplate('exam')).not.toBeNull();
      expect(getBuiltinTemplate('exam')?.schedule.length).toBe(7);
    });
  });

  describe('generatePrescription 校验', () => {
    it('非白名单场景应拒绝', () => {
      const r = generatePrescription('unknown' as any, {});
      expect(r.ok).toBe(false);
      expect(r.error).toContain('暂未上线');
    });

    it('必答题未回答应拒绝', () => {
      const r = generatePrescription('exam', { stress_level: 'low' });
      // exam 的必答题包括 stress_level / bedtime / wakeup_time / workload
      expect(r.ok).toBe(false);
      expect(r.error).toContain('请回答');
    });

    it('非会员调用会员场景应拒绝', () => {
      const answers = {
        stress_level: 'low',
        bedtime: '23:00',
        wakeup_time: '07:00',
        workload: 'light',
      };
      const r = generatePrescription('pregnancy', answers);
      expect(r.ok).toBe(false);
      expect(r.error).toContain('会员专属');
    });

    it('完整答卷应生成 prescription', () => {
      const answers = {
        stress_level: 'mid',
        bedtime: '23:00',
        wakeup_time: '07:00',
        workload: 'heavy',
      };
      const r = generatePrescription('exam', answers);
      expect(r.ok).toBe(true);
      expect(r.prescription).toBeDefined();
      expect(r.prescription!.sceneCode).toBe('exam');
      expect(r.prescription!.schedule).toHaveLength(7);
    });

    it('生成后应写入 LocalStore', () => {
      generatePrescription('overtime', {
        stress_level: 'low',
        bedtime: '23:00',
        wakeup_time: '07:00',
        workload: 'light',
      });
      const active = getActivePrescription();
      expect(active).not.toBeNull();
      expect(active!.sceneCode).toBe('overtime');
    });

    it('cancelPrescription 应清除生效处方', () => {
      generatePrescription('exam', {
        stress_level: 'low',
        bedtime: '23:00',
        wakeup_time: '07:00',
        workload: 'light',
      });
      cancelPrescription();
      expect(getActivePrescription()).toBeNull();
    });
  });

  describe('问卷答案微调作息表', () => {
    it('合法的 wakeup_time 应覆盖模板', () => {
      const r = generatePrescription('travel', {
        stress_level: 'low',
        bedtime: '22:00',
        wakeup_time: '06:00',
        timezone_diff: '3',
        trip_duration: 'short',
      });
      expect(r.ok).toBe(true);
      expect(r.prescription!.schedule.every((s) => s.wakeupTime === '06:00')).toBe(true);
    });

    it('合法的 bedtime 应覆盖模板', () => {
      const r = generatePrescription('travel', {
        stress_level: 'low',
        bedtime: '21:30',
        wakeup_time: '07:00',
        timezone_diff: '3',
        trip_duration: 'short',
      });
      expect(r.ok).toBe(true);
      expect(r.prescription!.schedule.every((s) => s.bedtime === '21:30')).toBe(true);
    });

    it('非法的 wakeup_time 应被忽略（不抛错）', () => {
      const r = generatePrescription('travel', {
        stress_level: 'low',
        bedtime: '22:00',
        wakeup_time: 'bad-time',
        timezone_diff: '3',
        trip_duration: 'short',
      });
      expect(r.ok).toBe(true);
    });
  });

  describe('问卷答案追加行动建议', () => {
    it('stress_level=high 应追加 4-7-8 呼吸', () => {
      const r = generatePrescription('exam', {
        stress_level: 'high',
        bedtime: '23:00',
        wakeup_time: '07:00',
        workload: 'light',
      });
      expect(r.ok).toBe(true);
      expect(r.prescription!.actions.some((a) => a.includes('呼吸'))).toBe(true);
    });

    it('workload=heavy 应追加关电脑建议', () => {
      const r = generatePrescription('overtime', {
        stress_level: 'low',
        bedtime: '23:00',
        wakeup_time: '07:00',
        workload: 'heavy',
      });
      expect(r.ok).toBe(true);
      expect(r.prescription!.actions.some((a) => a.includes('关电脑'))).toBe(true);
    });

    it('timezone_diff>=3 应追加晒太阳建议', () => {
      const r = generatePrescription('travel', {
        stress_level: 'low',
        bedtime: '22:00',
        wakeup_time: '07:00',
        timezone_diff: '6',
        trip_duration: 'short',
      });
      expect(r.ok).toBe(true);
      expect(r.prescription!.actions.some((a) => a.includes('太阳'))).toBe(true);
    });
  });

  describe('5 个场景都能正常生成处方', () => {
    const fillAnswers = (code: string): Record<string, string> => {
      const base = {
        stress_level: 'low',
        bedtime: '23:00',
        wakeup_time: '07:00',
      };
      switch (code) {
        case 'exam':
          return { ...base, workload: 'light' };
        case 'overtime':
          return { ...base, workload: 'light' };
        case 'travel':
          return { ...base, timezone_diff: '1', trip_duration: 'short' };
        case 'pregnancy':
          return {
            stress_level: 'low',
            bedtime: '23:00',
            wakeup_time: '07:00',
            pregnancy_week: 'mid',
          };
        case 'menstrual':
          return { ...base, cycle_phase: 'before' };
        default:
          return base;
      }
    };

    it.each(['exam', 'overtime', 'travel', 'menstrual'])(
      '场景 %s（免费）应生成成功',
      (code) => {
        const r = generatePrescription(code as any, fillAnswers(code));
        expect(r.ok).toBe(true);
        expect(r.prescription!.actions.length).toBeGreaterThan(0);
      },
    );

    it('场景 pregnancy（会员）非会员应失败', () => {
      const r = generatePrescription('pregnancy', fillAnswers('pregnancy'));
      expect(r.ok).toBe(false);
    });
  });

  describe('内置模板一致性', () => {
    it('5 个场景模板应有 schedule + actions + soundscapeIds + notice', () => {
      BUILTIN_SCENES.forEach((s) => {
        expect(s.template.schedule.length).toBeGreaterThan(0);
        expect(s.template.actions.length).toBeGreaterThan(0);
        expect(s.template.soundscapeIds.length).toBeGreaterThan(0);
        expect(s.template.notice).toBeTruthy();
      });
    });
  });
});