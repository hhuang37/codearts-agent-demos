/**
 * 睡眠数据中枢服务（services/datahub.ts）
 *
 * 与 design.md §6.2.8 对齐
 *
 * v1.0 MVP：仅提供接口骨架，实际导入逻辑在 P1 实现
 */

import { Logger } from '../utils/logger';
import { DataSource } from '../models/data-source-auth';
import { SleepRecord } from '../models/sleep-record';
import { recordStore } from '../stores/record-store';
import { createSleepRecord } from '../models/sleep-record';

const logger = new Logger('datahub-service');

/**
 * 检查数据源授权状态（v1.0 占位）
 */
export async function checkAuth(_source: DataSource): Promise<boolean> {
  // TODO: 真实项目通过 wx.getSetting + 数据源特定 SDK
  return false;
}

/**
 * 请求授权
 */
export async function requestAuth(_source: DataSource): Promise<boolean> {
  // TODO: 真实项目通过 wx.openAppAuthorizeSetting 等
  return false;
}

/**
 * 拉取近 N 天数据
 */
export async function fetchRecent(_source: DataSource, _days = 30): Promise<SleepRecord[]> {
  // TODO: 真实项目调用云函数 dataImport
  return [];
}

/**
 * CSV 导入（v1.0 简单实现：解析 wx.chooseMessageFile 返回的文件）
 */
export async function importCSV(fileContent: string): Promise<{ imported: number; failed: number }> {
  const lines = fileContent.split(/\r?\n/).filter((l) => l.trim());
  let imported = 0;
  let failed = 0;
  // 跳过表头
  for (let i = 1; i < lines.length; i++) {
    try {
      const cols = lines[i].split(',');
      // 期望格式：date,start_time,end_time,deep_min,light_min,rem_min,score
      if (cols.length < 4) {
        failed++;
        continue;
      }
      const date = cols[0].trim();
      const startTime = cols[1].trim();
      const endTime = cols[2].trim();
      const startAt = new Date(`${date} ${startTime}`).getTime();
      const endAt = new Date(`${date} ${endTime}`).getTime();
      if (!startAt || !endAt || endAt <= startAt) {
        failed++;
        continue;
      }
      const record = createSleepRecord({
        userId: 'csv-import',
        type: 'night',
        startAt,
        endAt,
        source: 'xiaomi',
      });
      recordStore.upsert(record);
      imported++;
    } catch {
      failed++;
    }
  }
  logger.info('CSV imported', { imported, failed });
  return { imported, failed };
}

/**
 * 归一化（v1.0 仅占位）
 */
export async function normalize(_records: unknown[]): Promise<SleepRecord[]> {
  // TODO: 真实项目做单位转换、字段对齐
  return [];
}