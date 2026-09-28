/**
 * 场景与处方模型（models/scene.ts, models/prescription.ts）
 *
 * 与 design.md §5.1.4 / §5.1.5 对齐
 */

import type { SubscriptionTier } from './user';

export type SceneCode = 'exam' | 'overtime' | 'travel' | 'pregnancy' | 'menstrual';

export type QuestionType = 'single' | 'multi' | 'scale' | 'date';

export interface QuestionnaireOption {
  value: string;
  label: string;
}

export interface QuestionnaireItem {
  id: string;
  type: QuestionType;
  question: string;
  options?: QuestionnaireOption[];
  required: boolean;
}

export interface ScheduleEntry {
  /** 第几天（1-7） */
  day: number;
  /** HH:mm */
  bedtime: string;
  /** HH:mm */
  wakeupTime: string;
  /** 午睡分钟数（0 表示不午睡） */
  napDuration: number;
  /** 当日备注 */
  note?: string;
}

export interface PrescriptionTemplate {
  /** 默认 7 天 */
  durationDays: number;
  /** 作息表 */
  schedule: ScheduleEntry[];
  /** 推荐白噪音 ID */
  soundscapeIds: string[];
  /** 醒来行动清单 */
  actions: string[];
  /** 注意事项 */
  notice: string;
}

export interface Scene {
  _id: string;
  /** 场景标识（FR-4.1 白名单） */
  code: SceneCode;
  /** 场景名称 */
  name: string;
  /** 场景描述 */
  description: string;
  /** 问卷题（5-7 题） */
  questionnaire: QuestionnaireItem[];
  /** 处方模板 */
  template: PrescriptionTemplate;
  /** 是否会员专属（FR-4.5） */
  isPremium: boolean;
  /** 是否启用 */
  enabled: boolean;
  /** 排序权重 */
  order: number;
}

export interface Prescription {
  _id: string;
  userId: string;
  sceneCode: SceneCode;
  startDate: number;
  durationDays: number;
  schedule: ScheduleEntry[];
  soundscapeIds: string[];
  actions: string[];
  notice: string;
  /** 是否订阅 21:00 提醒（FR-4.6） */
  reminderSubscribed: boolean;
  active: boolean;
  createdAt: number;
}

/** 5 个白名单场景（FR-4.1） */
export const SCENE_WHITELIST: SceneCode[] = [
  'exam',
  'overtime',
  'travel',
  'pregnancy',
  'menstrual',
];

/** 处方模板对应的最低订阅层级 */
export function minTierForScene(scene: Scene): SubscriptionTier {
  return scene.isPremium ? 'monthly' : 'free';
}