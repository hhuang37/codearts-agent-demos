/**
 * UI 全局状态（stores/ui-store.ts）
 *
 * 集中管理：
 * - 当前主题（暂仅浅色，预留夜间模式扩展）
 * - 全局 loading 计数
 * - Toast 队列
 */

import { LocalStore } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';

interface UiState {
  /** 主题：light/dark，v1.0 仅 light */
  theme: 'light' | 'dark';
  /** 隐私弹窗版本号（用户确认后写入） */
  privacyAcceptedVersion: string;
}

class UIStoreImpl {
  private state: UiState = {
    theme: 'light',
    privacyAcceptedVersion: '',
  };

  constructor() {
    const cached = LocalStore.getItem<UiState>(STORAGE_KEYS.SETTINGS);
    if (cached) {
      this.state = { ...this.state, ...cached };
    }
  }

  /**
   * 获取主题
   */
  getTheme(): 'light' | 'dark' {
    return this.state.theme;
  }

  /**
   * 设置主题
   */
  setTheme(theme: 'light' | 'dark'): void {
    this.state.theme = theme;
    this.persist();
  }

  /**
   * 记录隐私弹窗已确认
   */
  acceptPrivacy(version: string): void {
    this.state.privacyAcceptedVersion = version;
    this.persist();
  }

  /**
   * 检查隐私是否已确认
   */
  isPrivacyAccepted(version: string): boolean {
    return this.state.privacyAcceptedVersion === version;
  }

  /**
   * 持久化
   */
  private persist(): void {
    LocalStore.setItem(STORAGE_KEYS.SETTINGS, this.state);
  }
}

export const uiStore = new UIStoreImpl();