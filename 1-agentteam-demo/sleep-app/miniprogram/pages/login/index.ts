/**
 * 登录页（pages/login/index.ts）
 *
 * v1.0 MVP：极简登录（仅获取 openid 哈希）
 *
 * 调用云函数 login 换 openidHash，本地存储到 userStore。
 * 登录后回到上一页或首页。
 */

import { userStore } from '../../stores/user-store';
import { login as loginService } from '../../services/auth';
import { COPY } from '../../utils/i18n/copy';
import { Logger } from '../../utils/logger';

const logger = new Logger('login-page');

Page({
  data: {
    loading: false,
    agreed: false,
    COPY: COPY.app,
  },

  /**
   * 同意协议切换
   */
  onAgreeChange(e: WechatMiniprogram.CustomEvent) {
    this.setData({ agreed: e.detail.value as boolean });
  },

  /**
   * 登录（微信一键登录）
   */
  async onLogin() {
    if (!this.data.agreed) {
      wx.showToast({ title: '请先同意协议', icon: 'none' });
      return;
    }
    this.setData({ loading: true });
    try {
      const res = await loginService();
      if (res.ok && res.openidHash) {
        const u = userStore.getUser();
        u._id = res.openidHash;
        u.nickname = u.nickname || '睡眠中的朋友';
        userStore.setUser(u);
        wx.showToast({ title: '登录成功', icon: 'success' });
        setTimeout(() => wx.navigateBack({ delta: 1 }), 600);
      } else {
        wx.showToast({ title: res.error || '登录失败', icon: 'none' });
      }
    } catch (err) {
      logger.warn('login failed', { error: String(err) });
      wx.showToast({ title: '登录失败，请重试', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 跳过（游客模式）
   */
  onSkip() {
    wx.navigateBack({ delta: 1 });
  },

  /**
   * 查看协议（占位）
   */
  onViewPolicy() {
    wx.showModal({
      title: '用户协议 / 隐私政策',
      content: '完整文档正在准备中。',
      showCancel: false,
    });
  },
});