/**
 * 睡眠记录模型（models/sleep-record.ts）
 *
 * 与 design.md §5.1.2 对齐，覆盖夜间睡眠（type=night）与午睡（type=noon）
 */

import { uuid } from '../utils/uuid';

export type SleepRecordType = 'night' | 'noon';
export type SleepRecordSource = 'manual' | 'healthkit' | 'huawei' | 'xiaomi' | 'wechat-sport';

/** 午睡地点选项 */
export const NAP_LOCATIONS = ['办公桌', '车里', '沙发', '床上', '会议室', '其他'] as const;
export type NapLocation = (typeof NAP_LOCATIONS)[number];

/** 午睡深度（1 浅 / 2 中 / 3 深） */
export type NapDepth = 1 | 2 | 3;

/** 恢复体感（1 差 / 2 一般 / 3 好） */
export type NapRecovery = 1 | 2 | 3;

export interface SleepRecord {
  /** 主键：uuid */
  _id: string;
  /** 关联 user._id */
  userId: string;
  /** 记录类型（FR-1.2 / FR-2.2） */
  type: SleepRecordType;
  /** 入睡 / 开始时间（毫秒时间戳） */
  startAt: number;
  /** 起床 / 结束时间（毫秒时间戳） */
  endAt: number;
  /** 时长（分钟，自动计算） */
  durationMin: number;
  /** 自评分数 1-5（0 表示未评） */
  selfRating: number;
  /** 备注（≤ 100 字） */
  notes: string;
  /** 地点（午睡用） */
  location: string;
  /** 深度（午睡用） */
  depth: number;
  /** 恢复体感（午睡用） */
  recovery: number;
  /** 数据来源 */
  source: SleepRecordSource;
  /** 深睡时长（分钟，仅外部导入数据有） */
  deepSleepMin: number | null;
  /** 浅睡时长 */
  lightSleepMin: number | null;
  /** REM 时长 */
  remMin: number | null;
  /** HRV（仅外部导入数据，本项目不采集） */
  hrv: number | null;
  /** 是否处于编辑状态（FR-1.5） */
  editing: boolean;
  /** 软删除时间戳 */
  deletedAt: number | null;
  /** 创建时间 */
  createdAt: number;
  /** 更新时间 */
  updatedAt: number;
}

/** 创建记录的最小入参 */
export interface CreateSleepRecordDto {
  userId: string;
  type: SleepRecordType;
  startAt: number;
  endAt: number;
  selfRating?: number;
  notes?: string;
  location?: string;
  depth?: number;
  recovery?: number;
  source?: SleepRecordSource;
}

/**
 * 工厂函数：创建一条新记录（自动计算 durationMin）
 */
export function createSleepRecord(dto: CreateSleepRecordDto): SleepRecord {
  const now = Date.now();
  const durationMin = Math.max(0, Math.floor((dto.endAt - dto.startAt) / 60_000));
  return {
    _id: uuid(),
    userId: dto.userId,
    type: dto.type,
    startAt: dto.startAt,
    endAt: dto.endAt,
    durationMin,
    selfRating: dto.selfRating || 0,
    notes: dto.notes || '',
    location: dto.location || '',
    depth: dto.depth || 0,
    recovery: dto.recovery || 0,
    source: dto.source || 'manual',
    deepSleepMin: null,
    lightSleepMin: null,
    remMin: null,
    hrv: null,
    editing: false,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * 默认自评（无评分场景）
 */
export function defaultSelfRating(): number {
  return 0;
}