/**
 * string.test.ts —— 字符串工具测试
 */

import { maskMiddle, ellipsis, isBlank, sanitizeUGC } from '../../miniprogram/utils/string';

describe('utils/string', () => {
  describe('maskMiddle', () => {
    it('手机号脱敏', () => {
      expect(maskMiddle('13800001234')).toBe('138****1234');
    });

    it('短字符串应原样返回', () => {
      expect(maskMiddle('12345', 3, 4)).toBe('12345');
    });

    it('空字符串应返回空', () => {
      expect(maskMiddle('')).toBe('');
    });

    it('自定义 maskChar', () => {
      expect(maskMiddle('abcdefgh', 2, 2, '#')).toBe('ab####gh');
    });
  });

  describe('ellipsis', () => {
    it('短文本原样返回', () => {
      expect(ellipsis('hi', 10)).toBe('hi');
    });

    it('长文本截断加省略号', () => {
      expect(ellipsis('abcdefghij', 5)).toBe('abcde...');
    });

    it('空字符串应返回空', () => {
      expect(ellipsis('', 10)).toBe('');
    });
  });

  describe('isBlank', () => {
    it('空字符串应返回 true', () => {
      expect(isBlank('')).toBe(true);
    });

    it('纯空格应返回 true', () => {
      expect(isBlank('   ')).toBe(true);
    });

    it('null/undefined 应返回 true', () => {
      expect(isBlank(null)).toBe(true);
      expect(isBlank(undefined)).toBe(true);
    });

    it('有内容应返回 false', () => {
      expect(isBlank(' a ')).toBe(false);
    });
  });

  describe('sanitizeUGC', () => {
    it('去除控制字符', () => {
      const dirty = 'hello\x00\x01\x02world';
      expect(sanitizeUGC(dirty)).toBe('helloworld');
    });

    it('超过 maxLen 应截断', () => {
      const s = 'a'.repeat(150);
      expect(sanitizeUGC(s, 100)).toHaveLength(100);
    });

    it('空字符串应返回空', () => {
      expect(sanitizeUGC('')).toBe('');
    });

    it('正常文本应原样保留', () => {
      expect(sanitizeUGC('hello world')).toBe('hello world');
    });
  });
});