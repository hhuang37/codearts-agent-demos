/**
 * uuid.test.ts —— UUID / 短 ID / 哈希工具测试
 */

import { uuid, shortId, hashString } from '../../miniprogram/utils/uuid';

describe('utils/uuid', () => {
  describe('uuid', () => {
    it('应返回 36 位字符串', () => {
      const id = uuid();
      // 含 4 个 dash（标准 UUID 长度 = 32 + 4 = 36）
      expect(id.length).toBeGreaterThanOrEqual(36);
      expect(id.split('-')).toHaveLength(5);
    });

    it('多次调用应返回不同值', () => {
      const set = new Set<string>();
      for (let i = 0; i < 100; i++) set.add(uuid());
      expect(set.size).toBeGreaterThan(50); // 至少大多数不重复
    });

    it('应符合 UUID v4 风格（第三段以 4 开头）', () => {
      const id = uuid();
      const parts = id.split('-');
      expect(parts[2][0]).toBe('4');
    });
  });

  describe('shortId', () => {
    it('应返回非空字符串', () => {
      const id = shortId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('多次调用应返回不同值', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 50; i++) ids.add(shortId());
      expect(ids.size).toBeGreaterThan(40);
    });
  });

  describe('hashString (djb2)', () => {
    it('空字符串应返回基础哈希', () => {
      // djb2 of "" = 5381 -> base36 = "487"
      expect(hashString('')).toBe('487');
    });

    it('相同输入应产生相同输出（幂等）', () => {
      expect(hashString('hello')).toBe(hashString('hello'));
    });

    it('不同输入通常产生不同输出', () => {
      expect(hashString('hello')).not.toBe(hashString('world'));
    });

    it('结果应为正数 base36 字符串', () => {
      const h = hashString('test-string');
      expect(h).toMatch(/^[0-9a-z]+$/);
    });
  });
});