/**
 * storage.test.ts —— LocalStore 单例单元测试
 *
 * 依赖：wx.setStorageSync/getStorageSync/removeStorageSync/getStorageInfoSync
 * 这些 API 已在 tests/setup.ts 中 mock 为内存存储。
 */

import { LocalStore } from '../../miniprogram/utils/storage';

describe('utils/storage', () => {
  describe('setItem / getItem', () => {
    it('基本写入读取', () => {
      LocalStore.setItem('foo', { a: 1 });
      expect(LocalStore.getItem('foo')).toEqual({ a: 1 });
    });

    it('读取不存在的 key 返回 undefined', () => {
      expect(LocalStore.getItem('nope')).toBeUndefined();
    });

    it('读取不存在的 key 时返回 fallback', () => {
      expect(LocalStore.getItem('nope', 'default')).toBe('default');
    });

    it('setItem 在底层异常时应返回 false', () => {
      (globalThis as any).wx.setStorageSync = () => {
        throw new Error('quota exceeded');
      };
      const r = LocalStore.setItem('will-fail', { a: 1 });
      expect(r).toBe(false);
      // 恢复
      (globalThis as any).wx.setStorageSync = (k: string, v: string) =>
        (globalThis as any).storage.setStorageSync(k, v);
    });

    it('getItem 在解析失败时应返回 fallback', () => {
      (globalThis as any).wx.getStorageSync = () => 'invalid-json{';
      const r = LocalStore.getItem('anything', 'fb');
      expect(r).toBe('fb');
      // 恢复
      (globalThis as any).wx.getStorageSync = (k: string) =>
        (globalThis as any).storage.getStorageSync(k);
    });
  });

  describe('TTL 过期', () => {
    it('过期 key 应返回 fallback 并自动移除', () => {
      LocalStore.setItem('temp', { x: 1 }, 1); // ttl 1 秒
      expect(LocalStore.getItem('temp')).toEqual({ x: 1 });

      // 模拟时间流逝
      const realNow = Date.now;
      Date.now = () => realNow() + 5000;
      const r = LocalStore.getItem('temp', 'expired');
      expect(r).toBe('expired');

      Date.now = realNow;
    });

    it('ttl=0 表示永不过期', () => {
      LocalStore.setItem('forever', { x: 1 }, 0);
      expect(LocalStore.getItem('forever')).toEqual({ x: 1 });
    });
  });

  describe('getItemAs', () => {
    it('存在值时强类型返回', () => {
      LocalStore.setItem('a', 42);
      const r = LocalStore.getItemAs<number>('a');
      expect(r).toBe(42);
    });

    it('不存在时返回 null（而非 undefined）', () => {
      expect(LocalStore.getItemAs<number>('nonexistent')).toBeNull();
    });
  });

  describe('removeItem', () => {
    it('删除存在的 key 应返回 true', () => {
      LocalStore.setItem('rm', 'v');
      expect(LocalStore.removeItem('rm')).toBe(true);
      expect(LocalStore.getItem('rm')).toBeUndefined();
    });

    it('删除不存在的 key 应返回 true', () => {
      expect(LocalStore.removeItem('never-existed')).toBe(true);
    });
  });

  describe('clear', () => {
    it('应清空所有 sb_ 前缀的 key', () => {
      LocalStore.setItem('a', 1);
      LocalStore.setItem('b', 2);
      (globalThis as any).wx.setStorageSync('user_xyz', 'kept'); // 非 sb_ 前缀
      expect(LocalStore.clear()).toBe(true);
      expect(LocalStore.getItem('a')).toBeUndefined();
      expect(LocalStore.getItem('b')).toBeUndefined();
      // 非 sb_ 前缀应保留
      expect((globalThis as any).wx.getStorageSync('user_xyz')).toBe('kept');
    });
  });

  describe('setList / getList', () => {
    it('读取不存在时返回空数组', () => {
      expect(LocalStore.getList('list-empty')).toEqual([]);
    });

    it('写入读取数组', () => {
      LocalStore.setList('items', [{ id: 1 }, { id: 2 }]);
      expect(LocalStore.getList('items')).toHaveLength(2);
    });
  });

  describe('appendToList / removeFromList', () => {
    it('新增应插到列表头', () => {
      const a = { _id: '1', name: 'a' };
      const b = { _id: '2', name: 'b' };
      LocalStore.appendToList('rec', a);
      LocalStore.appendToList('rec', b);
      const list = LocalStore.getList<typeof a>('rec');
      expect(list[0]._id).toBe('2'); // 最新在前
      expect(list[1]._id).toBe('1');
    });

    it('同 _id 第二次 append 应覆盖而非新增', () => {
      LocalStore.appendToList('rec', { _id: '1', name: 'a' });
      LocalStore.appendToList('rec', { _id: '1', name: 'a-updated' });
      const list = LocalStore.getList<{ _id: string; name: string }>('rec');
      expect(list).toHaveLength(1);
      expect(list[0].name).toBe('a-updated');
    });

    it('removeFromList 应按 _id 删除', () => {
      LocalStore.appendToList('rec', { _id: '1', name: 'a' });
      LocalStore.appendToList('rec', { _id: '2', name: 'b' });
      const after = LocalStore.removeFromList<{ _id: string; name: string }>('rec', '1');
      expect(after).toHaveLength(1);
      expect(after[0]._id).toBe('2');
    });
  });

  describe('quota last-key', () => {
    it('setLastQuotaKey / getLastQuotaKey', () => {
      expect(LocalStore.getLastQuotaKey()).toBe('');
      LocalStore.setLastQuotaKey('quota:ai:2026-01-05');
      expect(LocalStore.getLastQuotaKey()).toBe('quota:ai:2026-01-05');
    });
  });
});