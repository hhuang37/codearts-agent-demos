/**
 * 场景选择入口页（pages/scene/index）
 *
 * FR-4 睡眠处方
 * - 5 个场景标签（FR-4.1）
 * - 选择场景 → 跳转问卷页
 */

import { listScenes } from '../../services/scene';
import { Scene } from '../../models/scene';
import { userStore } from '../../stores/user-store';
import { COPY } from '../../utils/i18n/copy';

Page({
  data: {
    scenes: [] as Scene[],
    COPY: COPY.scene,
  },

  onShow() {
    const scenes = listScenes();
    const user = userStore.getUser();
    this.setData({ scenes });
    void user; // 保留 user 用于后续判定会员
  },

  onPick(e: WechatMiniprogram.TouchEvent) {
    const code = (e.currentTarget.dataset.code as string) || '';
    if (!code) return;
    const scene = this.data.scenes.find((s) => s.code === code);
    if (scene?.isPremium && !userStore.isPremium()) {
      wx.showToast({ title: '该场景为会员专属，请先升级', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: `/pages/scene/questionnaire?code=${code}` });
  },
});