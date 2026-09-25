/**
 * 智能闹钟服务（services/alarm.ts）
 *
 * 与 design.md §6.2.6 对齐
 *
 * v1.0 MVP：
 * - 创建/更新/删除闹钟（前端 wx.setStorage 持久化）
 * - 节假日跳过（内置 2026 年节假日表）
 * - 浅睡检测启发式（基于近 7 天历史估算）
 */

import { LocalStore } from '../utils/storage';
import { STORAGE_KEYS, ALARM_DEFAULT } from '../utils/constants';
import { Logger } from '../utils/logger';
import { SleepRecord } from '../models/sleep-record';
import { recordStore } from '../stores/record-store';
import { uuid } from '../utils/uuid';

const logger = new Logger('alarm-service');

export interface AlarmConfig {
  id?: string;
  /** HH:mm */
  targetTime: string;
  /** 唤醒窗口，默认 30 分钟 */
  wakeWindowMin: number;
  /** 0-6 表示周日-周六 */
  repeatDays: number[];
  /** FR-6.4 节假日跳过 */
  skipHoliday: boolean;
  /** 铃声 ID（v1.0 占位） */
  ringtone: string;
  vibrate: boolean;
  /** 已开启 */
  enabled: boolean;
  /** 创建时间 */
  createdAt: number;
}

const ALARMS_KEY = 'alarms:list';

/**
 * 列出所有闹钟
 */
export function list(): AlarmConfig[] {
  return LocalStore.getList<AlarmConfig>(ALARMS_KEY);
}

/**
 * 创建闹钟
 */
export function create(config: Omit<AlarmConfig, 'id' | 'createdAt'>): string {
  const id = `alm_${uuid()}`;
  const item: AlarmConfig = {
    ...config,
    id,
    wakeWindowMin: config.wakeWindowMin || ALARM_DEFAULT.WAKE_WINDOW_MIN,
    createdAt: Date.now(),
  };
  const list = LocalStore.getList<AlarmConfig>(ALARMS_KEY);
  list.push(item);
  LocalStore.setList(ALARMS_KEY, list);
  logger.info('alarm created', { id, targetTime: item.targetTime });
  return id;
}

/**
 * 更新闹钟
 */
export function update(id: string, patch: Partial<AlarmConfig>): boolean {
  const list = LocalStore.getList<AlarmConfig>(ALARMS_KEY);
  const idx = list.findIndex((a) => a.id === id);
  if (idx < 0) return false;
  list[idx] = { ...list[idx], ...patch };
  LocalStore.setList(ALARMS_KEY, list);
  return true;
}

/**
 * 删除闹钟
 */
export function remove(id: string): boolean {
  const list = LocalStore.getList<AlarmConfig>(ALARMS_KEY).filter((a) => a.id !== id);
  LocalStore.setList(ALARMS_KEY, list);
  return true;
}

/**
 * 切换开关
 */
export function toggle(id: string, enabled: boolean): boolean {
  return update(id, { enabled });
}

/**
 * 检查指定日期是否为节假日（内置 2026 年节假日表）
 */
export function isHoliday(date: Date): boolean {
  const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  return HOLIDAYS_2026.has(key);
}

/**
 * 浅睡检测启发式（FR-6.2）
 *
 * 基于近 7 天睡眠历史估算最佳唤醒时间点
 */
export function estimateOptimalRingTime(
  targetTime: string,
  wakeWindowMin: number,
  records: SleepRecord[],
): { optimalTime: string; inLightSleep: boolean } {
  // 平均时长（分钟）
  const recent = records.filter((r) => !r.deletedAt && r.type === 'night').slice(0, 7);
  if (recent.length === 0) {
    // 无数据：直接 targetTime
    return { optimalTime: targetTime, inLightSleep: false };
  }
  const avgMin =
    recent.reduce((s, r) => s + r.durationMin, 0) / recent.length;
  // 健康成人深睡比例约 22%（医学常识）
  const lightSleepRatio = 0.4;
  // 简化：浅睡期约在醒来的前 30% 时间段
  const lightSleepMin = avgMin * lightSleepRatio;
  // 计算窗口起点
  const [h, m] = targetTime.split(':').map((x) => parseInt(x, 10));
  const targetMin = h * 60 + m;
  const windowStartMin = targetMin - wakeWindowMin;
  // 在窗口起点后 30% 处尝试唤醒
  const offset = Math.min(wakeWindowMin, lightSleepMin);
  let ringMin = windowStartMin + offset;
  // 取模 24 小时
  if (ringMin < 0) ringMin += 24 * 60;
  const rh = Math.floor((ringMin / 60) % 24);
  const rm = ringMin % 60;
  const optimalTime = `${rh.toString().padStart(2, '0')}:${rm.toString().padStart(2, '0')}`;
  return { optimalTime, inLightSleep: true };
}

/**
 * 节假日表（2026 年）
 * 仅含国家法定节假日（10 个）
 */
const HOLIDAYS_2026 = new Set<string>([
  '2026-1-1', // 元旦
  '2026-2-16', '2026-2-17', '2026-2-18', '2026-2-19', '2026-2-20', '2026-2-21', '2026-2-22', // 春节
  '2026-4-4', '2026-4-5', '2026-4-6', // 清明
  '2026-5-1', '2026-5-2', '2026-5-3', // 劳动节
  '2026-6-19', '2026-6-20', '2026-6-21', // 端午
  '2026-9-25', '2026-9-26', '2026-9-27', // 中秋
  '2026-10-1', '2026-10-2', '2026-10-3', '2026-10-4', '2026-10-5', '2026-10-6', '2026-10-7', // 国庆
]);

/**
 * 获取最近历史记录（用于浅睡检测）
 */
export function getRecentRecords(days = 7): SleepRecord[] {
  const cutoff = Date.now() - days * 24 * 3600 * 1000;
  return recordStore.getRecent().filter((r) => r.startAt >= cutoff);
}