/**
 * validator.test.ts —— 数据校验工具单元测试
 *
 * 覆盖：
 * - validateSleepTime（正常、不合理、跨天、时长边界）
 * - validateNapDuration（10-60 分钟边界）
 * - validateSelfRating（1-5 整数）
 * - validateSceneCode（5 个白名单场景）
 * - isEmail / isPhone
 * - truncate
 * - isValidHHMM
 */

import {
  validateSleepTime,
  validateNapDuration,
  validateSelfRating,
  validateSceneCode,
  isEmail,
  isPhone,
  truncate,
  isValidHHMM,
} from '../../miniprogram/utils/validator';

describe('utils/validator', () => {
  describe('validateSleepTime', () => {
    it('正常 8 小时睡眠（Date 入参）应通过', () => {
      const start = new Date('2026-01-01T22:00:00');
      const end = new Date('2026-01-02T06:00:00');
      expect(validateSleepTime(start, end)).toEqual({ ok: true });
    });

    it('正常 8 小时睡眠（数字时间戳入参）应通过', () => {
      const start = Date.now() - 8 * 3600000;
      const end = Date.now();
      expect(validateSleepTime(start, end)).toEqual({ ok: true });
    });

    it('混合入参（Date + number）应通过', () => {
      const start = new Date();
      const end = start.getTime() + 5 * 3600000;
      const r = validateSleepTime(start, end);
      expect(r.ok).toBe(true);
    });

    it('起床早于就寝应拒绝', () => {
      const start = new Date('2026-01-01T08:00:00');
      const end = new Date('2026-01-01T06:00:00');
      const r = validateSleepTime(start, end);
      expect(r.ok).toBe(false);
      expect(r.error).toContain('时间不合理');
    });

    it('起止时间相同应拒绝', () => {
      const t = Date.now();
      const r = validateSleepTime(t, t);
      expect(r.ok).toBe(false);
    });

    it('时长不足 4 小时应拒绝', () => {
      const start = new Date('2026-01-01T22:00:00');
      const end = new Date('2026-01-02T01:00:00');
      const r = validateSleepTime(start, end);
      expect(r.ok).toBe(false);
      expect(r.error).toContain('时长不足');
    });

    it('时长恰好 4 小时应通过', () => {
      const start = new Date('2026-01-01T22:00:00');
      const end = new Date('2026-01-02T02:00:00');
      expect(validateSleepTime(start, end).ok).toBe(true);
    });

    it('时长超过 14 小时应拒绝', () => {
      const start = new Date('2026-01-01T20:00:00');
      const end = new Date('2026-01-02T20:00:00'); // 24h
      const r = validateSleepTime(start, end);
      expect(r.ok).toBe(false);
      expect(r.error).toContain('超过');
    });

    it('跨天场景（0-7 点起床）应通过', () => {
      const start = new Date('2026-01-01T23:30:00');
      const end = new Date('2026-01-02T06:30:00');
      expect(validateSleepTime(start, end).ok).toBe(true);
    });
  });

  describe('validateNapDuration', () => {
    it.each([
      [10, true],
      [25, true],
      [30, true],
      [60, true],
    ])('午睡 %i 分钟应通过', (min, expected) => {
      expect(validateNapDuration(min).ok).toBe(expected);
    });

    it.each([
      [0, false],
      [9, false],
      [61, false],
      [120, false],
    ])('午睡 %i 分钟应拒绝', (min, expected) => {
      expect(validateNapDuration(min).ok).toBe(expected);
    });

    it('拒绝时应返回错误信息', () => {
      expect(validateNapDuration(5).error).toBeDefined();
      expect(validateNapDuration(120).error).toContain('10-60');
    });
  });

  describe('validateSelfRating', () => {
    it('1-5 整数应通过', () => {
      expect(validateSelfRating(1)).toBe(true);
      expect(validateSelfRating(3)).toBe(true);
      expect(validateSelfRating(5)).toBe(true);
    });

    it('0 / 6 / 负数 / 小数应拒绝', () => {
      expect(validateSelfRating(0)).toBe(false);
      expect(validateSelfRating(6)).toBe(false);
      expect(validateSelfRating(-1)).toBe(false);
      expect(validateSelfRating(3.5)).toBe(false);
    });
  });

  describe('validateSceneCode', () => {
    it.each(['exam', 'overtime', 'travel', 'pregnancy', 'menstrual'])(
      '白名单场景 %s 应通过',
      (code) => {
        expect(validateSceneCode(code)).toBe(true);
      },
    );

    it.each(['', 'unknown', 'EXAM', 'rest', 'fitness'])(
      '非白名单场景 %s 应拒绝',
      (code) => {
        expect(validateSceneCode(code)).toBe(false);
      },
    );
  });

  describe('isEmail', () => {
    it.each([
      'user@example.com',
      'a.b@foo-bar.cn',
      'name+tag@sub.example.org',
    ])('合法邮箱 %s 应通过', (s) => {
      expect(isEmail(s)).toBe(true);
    });

    it.each([
      'no-at-symbol.com',
      '@no-user.com',
      'user@',
      'user@x',
      'user space@example.com',
    ])('非法邮箱 %s 应拒绝', (s) => {
      expect(isEmail(s)).toBe(false);
    });
  });

  describe('isPhone', () => {
    it.each(['13800000000', '15912345678', '19876543210'])(
      '合法手机号 %s 应通过',
      (s) => {
        expect(isPhone(s)).toBe(true);
      },
    );

    it.each([
      '12800000000',
      '1380000000',
      '138000000000',
      'abc',
      '',
      '1380000000a',
    ])('非法手机号 %s 应拒绝', (s) => {
      expect(isPhone(s)).toBe(false);
    });
  });

  describe('truncate', () => {
    it('短文本应原样返回', () => {
      expect(truncate('hello', 10)).toBe('hello');
    });

    it('超长文本应截断', () => {
      expect(truncate('abcdefghij', 5)).toBe('abcde');
    });

    it('空字符串应返回空', () => {
      expect(truncate('', 10)).toBe('');
    });

    it('恰好等于 maxLen 应返回原值', () => {
      expect(truncate('12345', 5)).toBe('12345');
    });
  });

  describe('isValidHHMM', () => {
    it.each(['00:00', '09:30', '12:00', '23:59', '7:05'])(
      '合法时间 %s 应通过',
      (s) => {
        expect(isValidHHMM(s)).toBe(true);
      },
    );

    it.each(['24:00', '1:60', '12:5', 'abc', '99:99', '1:1'])(
      '非法时间 %s 应拒绝',
      (s) => {
        expect(isValidHHMM(s)).toBe(false);
      },
    );
  });
});