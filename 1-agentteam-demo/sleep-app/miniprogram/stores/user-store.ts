/**
 * 用户状态管理（stores/user-store.ts）
 *
 * 集中管理：
 * - 当前用户信息
 * - 会员状态
 * - 云端备份开关
 *
 * 设计原则：写入 LocalStore 作为权威源，store 仅做内存缓存
 */

import { LocalStore } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';
import { Logger } from '../utils/logger';
import { createDefaultUser, isPremium, User } from '../models/user';

const logger = new Logger('user-store');

class UserStoreImpl {
  private currentUser: User | null = null;

  /**
   * 获取当前用户（从内存或 LocalStore）
   */
  getUser(): User {
    if (this.currentUser) return this.currentUser;
    const cached = LocalStore.getItem<User>(STORAGE_KEYS.USER_PROFILE);
    if (cached) {
      this.currentUser = cached;
      return cached;
    }
    // 未登录态：使用临时 openidHash
    const tempId = `guest_${Math.random().toString(36).slice(2, 10)}`;
    const guest = createDefaultUser(tempId);
    this.currentUser = guest;
    return guest;
  }

  /**
   * 写入用户信息
   */
  setUser(user: User): void {
    this.currentUser = { ...user, updatedAt: Date.now() };
    LocalStore.setItem(STORAGE_KEYS.USER_PROFILE, this.currentUser);
    logger.info('user updated', { tier: user.subscriptionTier });
  }

  /**
   * 是否付费会员
   */
  isPremium(): boolean {
    return isPremium(this.getUser());
  }

  /**
   * 更新云端备份开关
   */
  setCloudBackup(enabled: boolean): void {
    const user = this.getUser();
    user.cloudBackupEnabled = enabled;
    this.setUser(user);
  }

  /**
   * 清空（登出/重置）
   */
  clear(): void {
    this.currentUser = null;
    LocalStore.removeItem(STORAGE_KEYS.USER_PROFILE);
  }
}

export const userStore = new UserStoreImpl();