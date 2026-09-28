/**
 * 睡眠记录状态管理（stores/record-store.ts）
 *
 * 集中管理：
 * - 近 7 天记录（首页时间轴）
 * - 今日记录
 * - 选中记录（详情页）
 */

import { LocalStore } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';
import { Logger } from '../utils/logger';
import { SleepRecord } from '../models/sleep-record';

const logger = new Logger('record-store');

class RecordStoreImpl {
  private cache: SleepRecord[] | null = null;

  /**
   * 获取近 7 天记录（按 startAt 倒序）
   */
  getRecent(): SleepRecord[] {
    if (this.cache) return this.cache;
    const list = LocalStore.getList<SleepRecord>(STORAGE_KEYS.RECORDS_RECENT_7D);
    list.sort((a, b) => b.startAt - a.startAt);
    this.cache = list;
    return list;
  }

  /**
   * 失效缓存
   */
  invalidate(): void {
    this.cache = null;
  }

  /**
   * 添加 / 更新一条记录
   */
  upsert(record: SleepRecord): void {
    const list = LocalStore.appendToList<SleepRecord>(
      STORAGE_KEYS.RECORDS_RECENT_7D,
      record,
    );
    // 仅保留近 7 天
    const cutoff = Date.now() - 7 * 24 * 3600 * 1000;
    const filtered = list.filter((r) => r.startAt >= cutoff && !r.deletedAt);
    LocalStore.setList(STORAGE_KEYS.RECORDS_RECENT_7D, filtered);
    this.invalidate();
    logger.info('record upsert', { id: record._id, type: record.type });
  }

  /**
   * 软删除记录
   */
  softDelete(id: string): void {
    const list = LocalStore.getList<SleepRecord>(STORAGE_KEYS.RECORDS_RECENT_7D);
    const target = list.find((r) => r._id === id);
    if (target) {
      target.deletedAt = Date.now();
      LocalStore.setList(STORAGE_KEYS.RECORDS_RECENT_7D, list);
      this.invalidate();
    }
  }

  /**
   * 通过 ID 获取记录
   */
  getById(id: string): SleepRecord | null {
    return this.getRecent().find((r) => r._id === id) || null;
  }

  /**
   * 获取今日记录（用于首页快捷展示）
   */
  getToday(): SleepRecord[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = today.getTime() + 24 * 3600 * 1000;
    return this.getRecent().filter(
      (r) => r.startAt >= today.getTime() && r.startAt < tomorrow,
    );
  }

  /**
   * 按类型筛选（night/noon）
   */
  filterByType(type: 'night' | 'noon'): SleepRecord[] {
    return this.getRecent().filter((r) => r.type === type);
  }
}

export const recordStore = new RecordStoreImpl();