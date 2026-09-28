/**
 * 睡眠记录业务服务（services/sleep.ts）
 *
 * 与 design.md §6.2.1 对齐
 *
 * 核心职责：
 * - 写入前本地校验（时间合法性、午睡时长）
 * - 先写 LocalStore，再异步同步云端
 * - 提供日期范围查询、近 N 天查询
 */

import { recordStore } from '../stores/record-store';
import { userStore } from '../stores/user-store';
import { LocalStore } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';
import { Logger } from '../utils/logger';
import { validateSleepTime, validateNapDuration } from '../utils/validator';
import {
  createSleepRecord,
  CreateSleepRecordDto,
  SleepRecord,
} from '../models/sleep-record';

const logger = new Logger('sleep-service');

/**
 * 创建睡眠记录
 * @returns 新记录的 id；非法输入时返回 null
 */
export async function createRecord(dto: CreateSleepRecordDto): Promise<string | null> {
  // 1. 校验
  const timeCheck = validateSleepTime(dto.startAt, dto.endAt);
  if (!timeCheck.ok) {
    logger.warn('createRecord: invalid time', { dto });
    wx.showToast({ title: timeCheck.error || '时间不合理', icon: 'none' });
    return null;
  }
  if (dto.type === 'noon') {
    const dur = Math.floor((dto.endAt - dto.startAt) / 60_000);
    const napCheck = validateNapDuration(dur);
    if (!napCheck.ok) {
      wx.showToast({ title: napCheck.error || '午睡时长不对', icon: 'none' });
      return null;
    }
  }

  // 2. 构造实体
  const record = createSleepRecord(dto);

  // 3. 写入 LocalStore（首要落点）
  recordStore.upsert(record);

  // 4. 异步同步云端（失败不影响主流程）
  syncToCloud(record).catch((err) => {
    logger.warn('createRecord: cloud sync failed', { error: String(err) });
  });

  logger.info('createRecord success', { id: record._id, type: record.type });
  return record._id;
}

/**
 * 更新记录
 */
export async function updateRecord(
  id: string,
  patch: Partial<SleepRecord>,
): Promise<boolean> {
  const list = LocalStore.getList<SleepRecord>(STORAGE_KEYS.RECORDS_RECENT_7D);
  const idx = list.findIndex((r) => r._id === id);
  if (idx < 0) return false;
  list[idx] = { ...list[idx], ...patch, updatedAt: Date.now() };
  LocalStore.setList(STORAGE_KEYS.RECORDS_RECENT_7D, list);
  recordStore.invalidate();
  return true;
}

/**
 * 软删除记录
 */
export async function deleteRecord(id: string): Promise<boolean> {
  recordStore.softDelete(id);
  // 云端同步逻辑略
  return true;
}

/**
 * 按 ID 查询
 */
export function getById(id: string): SleepRecord | null {
  return recordStore.getById(id);
}

/**
 * 按日期范围查询
 */
export function getRecordsByDateRange(
  startDate: Date | number,
  endDate: Date | number,
): SleepRecord[] {
  const ts = typeof startDate === 'number' ? startDate : startDate.getTime();
  const te = typeof endDate === 'number' ? endDate : endDate.getTime();
  return recordStore.getRecent().filter((r) => r.startAt >= ts && r.startAt <= te);
}

/**
 * 查询近 N 天
 */
export function getRecentRecords(days: number): SleepRecord[] {
  const cutoff = Date.now() - days * 24 * 3600 * 1000;
  return recordStore.getRecent().filter((r) => r.startAt >= cutoff);
}

/**
 * 同步本地记录到云端
 * v1.0 仅占位调用 wx.cloud.callFunction（实际未部署时不影响）
 */
async function syncToCloud(record: SleepRecord): Promise<void> {
  if (!userStore.getUser().cloudBackupEnabled) return;
  // TODO: 部署云函数后启用
  // await wx.cloud.callFunction({ name: 'sleepRecord', data: { action: 'create', record } });
  logger.debug('syncToCloud: skipped (cloud function not deployed)', { id: record._id });
}

/**
 * 同步本地全部记录到云端
 * v1.0 占位
 */
export async function syncAllToCloud(): Promise<{ success: number; failed: number }> {
  const records = recordStore.getRecent().filter((r) => !r.deletedAt);
  let success = 0;
  let failed = 0;
  for (const r of records) {
    try {
      await syncToCloud(r);
      success++;
    } catch {
      failed++;
    }
  }
  return { success, failed };
}

/**
 * 导出最近 N 天记录为 CSV
 */
export function exportRecentAsCSV(days: number): string {
  const records = getRecentRecords(days);
  const header = '日期,类型,入睡时间,起床时间,时长(分钟),自评,备注,来源';
  const rows = records.map((r) => {
    const date = new Date(r.startAt);
    const ymd = `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
    const startTime = `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
    const endDate = new Date(r.endAt);
    const endTime = `${pad2(endDate.getHours())}:${pad2(endDate.getMinutes())}`;
    const notes = (r.notes || '').replace(/[\r\n,]/g, ' ');
    return [
      ymd,
      r.type === 'night' ? '夜间' : '午睡',
      startTime,
      endTime,
      String(r.durationMin),
      String(r.selfRating || 0),
      notes,
      r.source,
    ].join(',');
  });
  return [header, ...rows].join('\n');
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}