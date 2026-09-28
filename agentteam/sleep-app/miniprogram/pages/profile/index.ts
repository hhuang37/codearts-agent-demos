/**
 * 我的页（pages/profile/index.ts）
 *
 * 与 design.md §6.2.10 对齐
 *
 * 功能：
 * - 用户信息（昵称/会员状态）
 * - 设置入口（隐私保险箱/通知设置/睡眠搭子/睡眠数据中枢）
 * - 退出登录
 */

import { userStore } from '../../stores/user-store';
import { recordStore } from '../../stores/record-store';
import { COPY } from '../../utils/i18n/copy';
import { Logger } from '../../utils/logger';

const logger = new Logger('profile-page');

interface MenuItem {
  key: string;
  label: string;
  url: string;
  icon: string;
  showArrow: boolean;
}

Page({
  data: {
    nickname: '',
    isPremium: false,
    memberLabel: '',
    memberColor: '',
    totalRecords: 0,
    menuGroups: [] as { title: string; items: MenuItem[] }[],
    COPY: COPY.profile,
  },

  onLoad() {
    this.refresh();
  },

  onShow() {
    this.refresh();
  },

  /**
   * 刷新用户信息
   */
  refresh() {
    try {
      const user = userStore.getUser();
      const isPremium = userStore.isPremium();
      const total = recordStore.getRecent().length;
      const memberLabel = isPremium ? COPY.profile.monthly : COPY.profile.free;
      const memberColor = isPremium ? '#FFD66B' : '#6B6F8A';

      const menuGroups: { title: string; items: MenuItem[] }[] = [
        {
          title: '睡眠服务',
          items: [
            { key: 'sleep_buddy', label: COPY.profile.sleep_buddy, url: '/pages/buddy/index', icon: '🤝', showArrow: true },
            { key: 'data_hub', label: COPY.profile.data_hub, url: '/pages/datahub/index', icon: '📊', showArrow: true },
          ],
        },
        {
          title: COPY.profile.settings,
          items: [
            { key: 'privacy', label: COPY.profile.privacy_vault, url: '/pages/privacy/index', icon: '🔒', showArrow: true },
            { key: 'feedback', label: COPY.profile.feedback, url: '', icon: '💬', showArrow: false },
            { key: 'about', label: COPY.profile.about, url: '', icon: 'ℹ️', showArrow: true },
          ],
        },
      ];

      this.setData({
        nickname: user.nickname || '睡眠中的朋友',
        isPremium,
        memberLabel,
        memberColor,
        totalRecords: total,
        menuGroups,
      });
    } catch (err) {
      logger.warn('profile refresh failed', { error: String(err) });
    }
  },

  /**
   * 菜单点击
   */
  onMenuTap(e: WechatMiniprogram.CustomEvent) {
    const url = e.currentTarget.dataset.url as string;
    const key = e.currentTarget.dataset.key as string;
    if (!url) {
      wx.showToast({ title: COPY.common.coming_soon, icon: 'none' });
      return;
    }
    if (key === 'feedback') {
      // 复制邮箱到剪贴板（占位）
      wx.setClipboardData({
        data: 'feedback@sleepbuddy.example',
        success: () => wx.showToast({ title: '邮箱已复制', icon: 'success' }),
      });
      return;
    }
    try {
      wx.navigateTo({ url });
    } catch (err) {
      logger.warn('navigate failed', { url, error: String(err) });
      wx.showToast({ title: COPY.common.error, icon: 'none' });
    }
  },

  /**
   * 升级会员（占位）
   */
  onUpgrade() {
    wx.showToast({ title: '即将上线', icon: 'none' });
  },

  /**
   * 退出登录（清空本地用户态）
   */
  onLogout() {
    try {
      wx.showModal({
        title: COPY.profile.logout,
        content: '退出后本地数据将保留，云端备份需重新登录',
        confirmText: COPY.common.confirm,
        cancelText: COPY.common.cancel,
        success: (res) => {
          if (res.confirm) {
            userStore.clear();
            wx.showToast({ title: '已退出', icon: 'success' });
            setTimeout(() => wx.reLaunch({ url: '/pages/home/index' }), 600);
          }
        },
      });
    } catch (err) {
      logger.warn('logout failed', { error: String(err) });
    }
  },
});