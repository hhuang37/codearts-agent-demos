/**
 * alarm.test.ts —— 智能闹钟服务测试
 */

import { create, update, remove, toggle, isHoliday, estimateOptimalRingTime } from '../../miniprogram/services/alarm';
import { LocalStore } from '../../miniprogram/utils/storage';
import { createSleepRecord } from '../../miniprogram/models/sleep-record';

describe('services/alarm', () => {
  beforeEach(() => LocalStore.clear());

  describe('CRUD', () => {
    it('create 应返回 id 并写入', () => {
      const id = create({
        targetTime: '07:00',
        wakeWindowMin: 30,
        repeatDays: [1, 2, 3, 4, 5],
        skipHoliday: true,
        ringtone: 'bell-1',
        vibrate: true,
        enabled: true,
      });
      expect(id).toMatch(/^alm_/);
    });

    it('update 应修改字段', () => {
      const id = create({
        targetTime: '07:00',
        wakeWindowMin: 30,
        repeatDays: [],
        skipHoliday: false,
        ringtone: 'r',
        vibrate: false,
        enabled: true,
      });
      const ok = update(id, { targetTime: '08:00' });
      expect(ok).toBe(true);
      const list = LocalStore.getList<any>('alarms:list');
      const updated = list.find((x) => x.id === id);
      expect(updated.targetTime).toBe('08:00');
    });

    it('update 不存在的 id 应返回 false', () => {
      expect(update('nonexistent', {})).toBe(false);
    });

    it('remove 应从列表中删除', () => {
      const id = create({
        targetTime: '07:00',
        wakeWindowMin: 30,
        repeatDays: [],
        skipHoliday: false,
        ringtone: 'r',
        vibrate: false,
        enabled: true,
      });
      expect(remove(id)).toBe(true);
      const list = LocalStore.getList<any>('alarms:list');
      expect(list.find((x) => x.id === id)).toBeUndefined();
    });

    it('toggle 应切换 enabled', () => {
      const id = create({
        targetTime: '07:00',
        wakeWindowMin: 30,
        repeatDays: [],
        skipHoliday: false,
        ringtone: 'r',
        vibrate: false,
        enabled: true,
      });
      toggle(id, false);
      const list = LocalStore.getList<any>('alarms:list');
      expect(list.find((x) => x.id === id).enabled).toBe(false);
      toggle(id, true);
      const list2 = LocalStore.getList<any>('alarms:list');
      expect(list2.find((x) => x.id === id).enabled).toBe(true);
    });
  });

  describe('isHoliday', () => {
    it('2026-01-01 元旦应识别为节假日', () => {
      expect(isHoliday(new Date(2026, 0, 1))).toBe(true);
    });

    it('2026-02-16 春节应识别为节假日', () => {
      expect(isHoliday(new Date(2026, 1, 16))).toBe(true);
    });

    it('2026-02-15 非节假日', () => {
      expect(isHoliday(new Date(2026, 1, 15))).toBe(false);
    });

    it('2026-10-01 国庆节应识别', () => {
      expect(isHoliday(new Date(2026, 9, 1))).toBe(true);
    });

    it('普通工作日应返回 false', () => {
      expect(isHoliday(new Date(2026, 2, 10))).toBe(false); // 3-10 周二
    });
  });

  describe('estimateOptimalRingTime（浅睡启发式）', () => {
    it('无历史记录时应直接返回 targetTime', () => {
      const r = estimateOptimalRingTime('07:00', 30, []);
      expect(r.optimalTime).toBe('07:00');
      expect(r.inLightSleep).toBe(false);
    });

    it('有历史记录时应计算 optimalTime', () => {
      const records = [
        { ...createSleepRecord({ userId: 'u', type: 'night', startAt: 0, endAt: 480 * 60_000 }), deletedAt: null } as any,
        { ...createSleepRecord({ userId: 'u', type: 'night', startAt: 0, endAt: 460 * 60_000 }), deletedAt: null } as any,
      ];
      const r = estimateOptimalRingTime('07:00', 30, records);
      expect(r.inLightSleep).toBe(true);
      // optimalTime 格式应为 HH:mm
      expect(r.optimalTime).toMatch(/^\d{2}:\d{2}$/);
    });

    it('软删除的记录应被排除', () => {
      const rec = {
        ...createSleepRecord({ userId: 'u', type: 'night', startAt: 0, endAt: 480 * 60_000 }),
        deletedAt: Date.now(),
      } as any;
      const r = estimateOptimalRingTime('07:00', 30, [rec]);
      expect(r.inLightSleep).toBe(false);
    });

    it('仅 noon 类型记录应被排除', () => {
      const rec = {
        ...createSleepRecord({ userId: 'u', type: 'noon', startAt: 0, endAt: 25 * 60_000 }),
        deletedAt: null,
      } as any;
      const r = estimateOptimalRingTime('07:00', 30, [rec]);
      expect(r.inLightSleep).toBe(false);
    });

    it('窗口起点跨天（凌晨）应正确取模', () => {
      // 目标时间 01:00，唤醒窗口 30 分钟 -> 窗口起点 00:30
      const records = [
        { ...createSleepRecord({ userId: 'u', type: 'night', startAt: 0, endAt: 480 * 60_000 }), deletedAt: null } as any,
      ];
      const r = estimateOptimalRingTime('01:00', 30, records);
      expect(r.optimalTime).toMatch(/^\d{2}:\d{2}$/);
    });
  });
});