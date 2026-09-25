/**
 * date.test.ts —— 日期工具单元测试
 *
 * 覆盖：formatDate / fromNow / diffInMinutes / formatDurationHours /
 *       formatDurationHM / getTodayKey / getChineseWeekday /
 *       isSameDay / startOfDay / endOfDay / addMinutesToHHMM /
 *       isInHHMMRange / hhmmToMinutes
 */

import {
  formatDate,
  fromNow,
  diffInMinutes,
  formatDurationHours,
  formatDurationHM,
  getTodayKey,
  getChineseWeekday,
  isSameDay,
  startOfDay,
  endOfDay,
  addMinutesToHHMM,
  isInHHMMRange,
  hhmmToMinutes,
} from '../../miniprogram/utils/date';

describe('utils/date', () => {
  describe('formatDate', () => {
    it('默认 YYYY-MM-DD HH:mm 格式', () => {
      const d = new Date(2026, 0, 5, 9, 30); // 2026-01-05 09:30
      expect(formatDate(d)).toBe('2026-01-05 09:30');
    });

    it('自定义 pattern YYYY/MM/DD', () => {
      const d = new Date(2026, 11, 31, 0, 0);
      expect(formatDate(d, 'YYYY/MM/DD')).toBe('2026/12/31');
    });

    it('支持秒格式 ss', () => {
      const d = new Date(2026, 0, 1, 0, 0, 7);
      expect(formatDate(d, 'YYYY-MM-DD HH:mm:ss')).toBe('2026-01-01 00:00:07');
    });

    it('支持数字时间戳入参', () => {
      const ts = new Date(2026, 5, 15, 12, 30).getTime();
      expect(formatDate(ts, 'YYYY-MM-DD')).toBe('2026-06-15');
    });

    it('补零：1 -> 01', () => {
      const d = new Date(2026, 0, 1, 1, 1);
      expect(formatDate(d, 'MM-DD HH:mm')).toBe('01-01 01:01');
    });
  });

  describe('fromNow', () => {
    it('小于 60 秒应返回"刚刚"', () => {
      expect(fromNow(Date.now() - 30_000)).toBe('刚刚');
    });

    it('分钟级应返回 N 分钟前', () => {
      expect(fromNow(Date.now() - 5 * 60_000)).toBe('5 分钟前');
    });

    it('小时级应返回 N 小时前', () => {
      expect(fromNow(Date.now() - 3 * 3600_000)).toBe('3 小时前');
    });

    it('天级应返回 N 天前', () => {
      expect(fromNow(Date.now() - 3 * 86400_000)).toBe('3 天前');
    });

    it('超过 7 天应返回 YYYY-MM-DD', () => {
      const ts = new Date(2020, 0, 1).getTime();
      expect(fromNow(ts)).toBe('2020-01-01');
    });
  });

  describe('diffInMinutes', () => {
    it('a 在 b 之前应返回负值', () => {
      const a = Date.now();
      const b = a + 60_000;
      expect(diffInMinutes(a, b)).toBe(1);
    });

    it('a 在 b 之后应返回负数', () => {
      const a = Date.now();
      const b = a - 120_000;
      expect(diffInMinutes(a, b)).toBe(-2);
    });

    it('相同时间应返回 0', () => {
      const t = Date.now();
      expect(diffInMinutes(t, t)).toBe(0);
    });
  });

  describe('formatDurationHours', () => {
    it('480 分钟 -> 8.0', () => {
      expect(formatDurationHours(480)).toBe('8.0');
    });

    it('510 分钟 -> 8.5', () => {
      expect(formatDurationHours(510)).toBe('8.5');
    });

    it('30 分钟 -> 0.5', () => {
      expect(formatDurationHours(30)).toBe('0.5');
    });
  });

  describe('formatDurationHM', () => {
    it('480 分钟 -> 08:00', () => {
      expect(formatDurationHM(480)).toBe('08:00');
    });

    it('510 分钟 -> 08:30', () => {
      expect(formatDurationHM(510)).toBe('08:30');
    });

    it('0 分钟 -> 00:00', () => {
      expect(formatDurationHM(0)).toBe('00:00');
    });

    it('25 分钟 -> 00:25', () => {
      expect(formatDurationHM(25)).toBe('00:25');
    });
  });

  describe('getTodayKey', () => {
    it('无参返回今天 YYYY-MM-DD', () => {
      const now = new Date();
      const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      expect(getTodayKey()).toBe(expected);
    });

    it('传 Date 应按传入值格式化', () => {
      const d = new Date(2026, 2, 7);
      expect(getTodayKey(d)).toBe('2026-03-07');
    });
  });

  describe('getChineseWeekday', () => {
    it('2026-01-04 是星期日', () => {
      const d = new Date(2026, 0, 4);
      expect(getChineseWeekday(d)).toBe('星期日');
    });

    it('2026-01-05 是星期一', () => {
      const d = new Date(2026, 0, 5);
      expect(getChineseWeekday(d)).toBe('星期一');
    });
  });

  describe('isSameDay', () => {
    it('同一天不同时间应返回 true', () => {
      const a = new Date(2026, 0, 1, 9, 0);
      const b = new Date(2026, 0, 1, 23, 0);
      expect(isSameDay(a, b)).toBe(true);
    });

    it('相邻两天应返回 false', () => {
      const a = new Date(2026, 0, 1, 23, 0);
      const b = new Date(2026, 0, 2, 0, 0);
      expect(isSameDay(a, b)).toBe(false);
    });
  });

  describe('startOfDay / endOfDay', () => {
    it('startOfDay 应清零时分秒', () => {
      const d = new Date(2026, 0, 5, 14, 30, 45);
      const s = startOfDay(d);
      expect(s.getHours()).toBe(0);
      expect(s.getMinutes()).toBe(0);
      expect(s.getSeconds()).toBe(0);
    });

    it('endOfDay 应设为 23:59:59.999', () => {
      const d = new Date(2026, 0, 5, 0, 0);
      const e = endOfDay(d);
      expect(e.getHours()).toBe(23);
      expect(e.getMinutes()).toBe(59);
      expect(e.getSeconds()).toBe(59);
    });
  });

  describe('addMinutesToHHMM', () => {
    it('加 30 分钟', () => {
      expect(addMinutesToHHMM('06:00', 30)).toBe('06:30');
    });

    it('加 60 分钟进位 1 小时', () => {
      expect(addMinutesToHHMM('06:30', 60)).toBe('07:30');
    });

    it('跨日 23:30 + 60 = 00:30', () => {
      expect(addMinutesToHHMM('23:30', 60)).toBe('00:30');
    });

    it('非法格式原样返回', () => {
      expect(addMinutesToHHMM('bad', 30)).toBe('bad');
    });
  });

  describe('isInHHMMRange', () => {
    it('在区间内', () => {
      const now = new Date(2026, 0, 1, 10, 0);
      expect(isInHHMMRange(now, '09:00', '11:00')).toBe(true);
    });

    it('在区间外', () => {
      const now = new Date(2026, 0, 1, 12, 0);
      expect(isInHHMMRange(now, '09:00', '11:00')).toBe(false);
    });

    it('边界值：起点', () => {
      const now = new Date(2026, 0, 1, 9, 0);
      expect(isInHHMMRange(now, '09:00', '11:00')).toBe(true);
    });
  });

  describe('hhmmToMinutes', () => {
    it('00:00 -> 0', () => {
      expect(hhmmToMinutes('00:00')).toBe(0);
    });

    it('06:30 -> 390', () => {
      expect(hhmmToMinutes('06:30')).toBe(390);
    });

    it('23:59 -> 1439', () => {
      expect(hhmmToMinutes('23:59')).toBe(1439);
    });
  });
});