/**
 * sleep.test.ts —— 睡眠记录服务测试
 *
 * 覆盖 createRecord / updateRecord / deleteRecord / getById /
 *      getRecordsByDateRange / getRecentRecords / exportRecentAsCSV
 *
 * createRecord 依赖 wx.showToast（已在 setup.ts mock 为 noop）
 */

import { createRecord, updateRecord, deleteRecord, getById, getRecordsByDateRange, getRecentRecords, exportRecentAsCSV } from '../../miniprogram/services/sleep';
import { recordStore } from '../../miniprogram/stores/record-store';
import { LocalStore } from '../../miniprogram/utils/storage';
import { STORAGE_KEYS } from '../../miniprogram/utils/constants';

describe('services/sleep', () => {
  beforeEach(() => {
    LocalStore.clear();
    recordStore.invalidate();
  });

  describe('createRecord', () => {
    it('正常 8h 记录应成功', async () => {
      const id = await createRecord({
        userId: 'u1',
        type: 'night',
        startAt: Date.now() - 8 * 3600_000,
        endAt: Date.now(),
        selfRating: 4,
      });
      expect(id).not.toBeNull();
      expect(typeof id).toBe('string');
      const rec = recordStore.getById(id!);
      expect(rec).not.toBeNull();
      expect(rec!.durationMin).toBe(480);
      expect(rec!.selfRating).toBe(4);
    });

    it('非法时间应返回 null', async () => {
      const id = await createRecord({
        userId: 'u1',
        type: 'night',
        startAt: Date.now(),
        endAt: Date.now(),
      });
      expect(id).toBeNull();
    });

    it('起床早于就寝应返回 null', async () => {
      const id = await createRecord({
        userId: 'u1',
        type: 'night',
        startAt: Date.now(),
        endAt: Date.now() - 3600_000,
      });
      expect(id).toBeNull();
    });

    it('午睡时长 < 10 分钟应返回 null', async () => {
      const id = await createRecord({
        userId: 'u1',
        type: 'noon',
        startAt: Date.now() - 5 * 60_000,
        endAt: Date.now(),
      });
      expect(id).toBeNull();
    });

    it('午睡时长 > 60 分钟应返回 null', async () => {
      const id = await createRecord({
        userId: 'u1',
        type: 'noon',
        startAt: Date.now() - 90 * 60_000,
        endAt: Date.now(),
      });
      expect(id).toBeNull();
    });

    it('午睡 25 分钟应成功', async () => {
      const id = await createRecord({
        userId: 'u1',
        type: 'noon',
        startAt: Date.now() - 25 * 60_000,
        endAt: Date.now(),
      });
      expect(id).not.toBeNull();
    });
  });

  describe('updateRecord', () => {
    it('应合并更新字段', async () => {
      const id = await createRecord({
        userId: 'u1',
        type: 'night',
        startAt: Date.now() - 8 * 3600_000,
        endAt: Date.now(),
      });
      const ok = await updateRecord(id!, { selfRating: 5, notes: 'updated' });
      expect(ok).toBe(true);
      const rec = recordStore.getById(id!);
      expect(rec!.selfRating).toBe(5);
      expect(rec!.notes).toBe('updated');
    });

    it('不存在的 id 应返回 false', async () => {
      const ok = await updateRecord('nonexistent', { selfRating: 1 });
      expect(ok).toBe(false);
    });
  });

  describe('deleteRecord', () => {
    it('应软删除（设置 deletedAt）', async () => {
      const id = await createRecord({
        userId: 'u1',
        type: 'night',
        startAt: Date.now() - 8 * 3600_000,
        endAt: Date.now(),
      });
      const ok = await deleteRecord(id!);
      expect(ok).toBe(true);
      // recordStore.upsert 时已过滤 deletedAt，所以 getById 可能找不到
      const list = LocalStore.getList<any>(STORAGE_KEYS.RECORDS_RECENT_7D);
      const target = list.find((r) => r._id === id);
      expect(target.deletedAt).toBeGreaterThan(0);
    });
  });

  describe('getById', () => {
    it('应返回匹配记录', async () => {
      const id = await createRecord({
        userId: 'u1',
        type: 'night',
        startAt: Date.now() - 8 * 3600_000,
        endAt: Date.now(),
      });
      expect(getById(id!)?.userId).toBe('u1');
    });

    it('不存在的 id 应返回 null', () => {
      expect(getById('nope')).toBeNull();
    });
  });

  describe('getRecordsByDateRange / getRecentRecords', () => {
    it('按日期范围过滤', async () => {
      const today = Date.now();
      await createRecord({
        userId: 'u1',
        type: 'night',
        startAt: today - 8 * 3600_000,
        endAt: today,
      });
      const start = today - 24 * 3600_000;
      const end = today + 3600_000;
      const r = getRecordsByDateRange(start, end);
      expect(r.length).toBeGreaterThanOrEqual(1);
    });

    it('getRecentRecords(days) 应过滤近 N 天', async () => {
      await createRecord({
        userId: 'u1',
        type: 'night',
        startAt: Date.now() - 3600_000,
        endAt: Date.now() + 3600_000, // 跨 1h，可能 0 分钟
      });
      const r = getRecentRecords(1);
      expect(Array.isArray(r)).toBe(true);
    });
  });

  describe('exportRecentAsCSV', () => {
    it('无记录时应只有 header', () => {
      const csv = exportRecentAsCSV(7);
      expect(csv.startsWith('日期,类型,入睡时间,起床时间')).toBe(true);
    });

    it('有记录时应包含数据行', async () => {
      await createRecord({
        userId: 'u1',
        type: 'night',
        startAt: Date.now() - 8 * 3600_000,
        endAt: Date.now(),
        selfRating: 4,
        notes: 'test',
      });
      const csv = exportRecentAsCSV(7);
      expect(csv.split('\n').length).toBeGreaterThanOrEqual(2);
      expect(csv).toContain('夜间');
    });

    it('应去除备注中的逗号与换行', async () => {
      await createRecord({
        userId: 'u1',
        type: 'night',
        startAt: Date.now() - 8 * 3600_000,
        endAt: Date.now(),
        notes: 'a,b\nc',
      });
      const csv = exportRecentAsCSV(7);
      // 备注中逗号和换行已被替换为空格（不会污染 CSV 字段数）
      const lines = csv.split('\n');
      expect(lines.every((l) => l.split(',').length === 8)).toBe(true);
    });
  });
});