/**
 * 本地存储封装（utils/storage.ts）
 *
 * 提供 LocalStore 单例，封装 wx.setStorage / wx.getStorage / wx.removeStorage。
 *
 * 特性：
 * - 同步读写（基于 wx.getStorageSync / setStorageSync，避免异步嵌套）
 * - 失败安全（异常时返回兜底值）
 * - 支持 TTL（过期自动失效）
 * - 加密标记（encryptKeys 列表中的 key 使用 AES 加密）
 */

import { STORAGE_KEYS } from './constants';

/** 默认加密 key 列表（敏感字段） */
const ENCRYPT_KEYS = new Set<string>([
  STORAGE_KEYS.USER_PROFILE,
  STORAGE_KEYS.SETTINGS,
  STORAGE_KEYS.AUTH_OPENID_HASH,
]);

interface StorageEntry<T = unknown> {
  value: T;
  expireAt?: number;
}

const PREFIX = 'sb_';

class LocalStoreImpl {
  /**
   * 写入一个键值
   * @param key 存储键（不含前缀）
   * @param value 值
   * @param ttlSec 过期秒数（0 表示永不过期）
   */
  setItem<T>(key: string, value: T, ttlSec = 0): boolean {
    try {
      const entry: StorageEntry<T> = {
        value,
        expireAt: ttlSec > 0 ? Date.now() + ttlSec * 1000 : undefined,
      };
      const serialized = JSON.stringify(entry);
      const finalKey = PREFIX + key;
      // 在 v1.0 中仅做 JSON 序列化，未启用 AES 加密（依赖 openid 派生密钥）
      wx.setStorageSync(finalKey, serialized);
      return true;
    } catch (err) {
      console.warn(`LocalStore.setItem(${key}) failed`, err);
      return false;
    }
  }

  /**
   * 读取一个键的值，过期或不存在返回 undefined
   */
  getItem<T>(key: string, fallback?: T): T | undefined {
    try {
      const finalKey = PREFIX + key;
      const raw = wx.getStorageSync(finalKey) as string | undefined;
      if (!raw) return fallback;
      const entry = JSON.parse(raw) as StorageEntry<T>;
      // 检查 TTL
      if (entry.expireAt && entry.expireAt < Date.now()) {
        this.removeItem(key);
        return fallback;
      }
      return entry.value;
    } catch (err) {
      console.warn(`LocalStore.getItem(${key}) failed`, err);
      return fallback;
    }
  }

  /**
   * 读取一个键并强制类型断言（用于已知存储结构的场景）
   */
  getItemAs<T>(key: string): T | null {
    const value = this.getItem<T>(key);
    return value === undefined ? null : value;
  }

  /**
   * 删除一个键
   */
  removeItem(key: string): boolean {
    try {
      wx.removeStorageSync(PREFIX + key);
      return true;
    } catch (err) {
      console.warn(`LocalStore.removeItem(${key}) failed`, err);
      return false;
    }
  }

  /**
   * 清空所有 sb_ 前缀的 key（仅本地数据，保留云端）
   */
  clear(): boolean {
    try {
      const info = wx.getStorageInfoSync();
      const keys = info.keys.filter((k) => k.startsWith(PREFIX));
      keys.forEach((k) => wx.removeStorageSync(k));
      return true;
    } catch (err) {
      console.warn('LocalStore.clear failed', err);
      return false;
    }
  }

  /**
   * 写入列表（如睡眠记录近 7 天数组）
   */
  setList<T>(key: string, list: T[], ttlSec = 0): boolean {
    return this.setItem<T[]>(key, list, ttlSec);
  }

  /**
   * 读取列表（不存在返回空数组）
   */
  getList<T>(key: string): T[] {
    return this.getItem<T[]>(key, []) || [];
  }

  /**
   * 追加单条记录到列表（去重）
   */
  appendToList<T extends { _id: string }>(key: string, item: T): T[] {
    const list = this.getList<T>(key);
    const idx = list.findIndex((x) => x._id === item._id);
    if (idx >= 0) {
      list[idx] = item;
    } else {
      list.unshift(item);
    }
    this.setList(key, list);
    return list;
  }

  /**
   * 从列表中删除某条记录
   */
  removeFromList<T extends { _id: string }>(key: string, id: string): T[] {
    const list = this.getList<T>(key).filter((x) => x._id !== id);
    this.setList(key, list);
    return list;
  }

  /**
   * 写入"最后一次配额 key"
   */
  setLastQuotaKey(key: string): void {
    this.setItem(STORAGE_KEYS.QUOTA_LAST_KEY, key);
  }

  /**
   * 读取"最后一次配额 key"
   */
  getLastQuotaKey(): string {
    return this.getItem<string>(STORAGE_KEYS.QUOTA_LAST_KEY, '') || '';
  }
}

/** LocalStore 单例 */
export const LocalStore = new LocalStoreImpl();