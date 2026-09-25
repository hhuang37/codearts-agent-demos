/**
 * 处方展示页（pages/scene/prescription）
 *
 * 展示 7 天处方：作息表 + 白噪音组合 + 行动清单 + 注意事项
 * FR-4.3：3 秒内返回
 * FR-4.6：引导订阅 21:00 提醒
 */

import { generatePrescription } from '../../services/scene';
import { subscribeReminder } from '../../services/evening';
import { Scene, SceneCode, Prescription } from '../../models/scene';
import { getScene } from '../../services/scene';
import { COPY } from '../../utils/i18n/copy';

Page({
  data: {
    code: '',
    scene: null as Scene | null,
    prescription: null as Prescription | null,
    subscribed: false,
    COPY: COPY.scene,
  },

  onLoad(query: Record<string, string>) {
    const code = (query.code || '') as SceneCode;
    let answers: Record<string, string> = {};
    try {
      answers = JSON.parse(decodeURIComponent(query.answers || '{}'));
    } catch {
      answers = {};
    }
    const scene = getScene(code);
    if (!scene) {
      wx.showToast({ title: COPY.scene.unavailable, icon: 'none' });
      return;
    }
    // 调用服务生成本地处方
    const result = generatePrescription(code, answers);
    if (!result.ok || !result.prescription) {
      wx.showToast({ title: result.error || '生成失败', icon: 'none' });
      setTimeout(() => wx.navigateBack({ delta: 2 }), 800);
      return;
    }
    this.setData({
      code,
      scene,
      prescription: result.prescription,
    });
  },

  /**
   * 订阅 21:00 提醒
   */
  async onSubscribe() {
    const res = await subscribeReminder();
    if (res.ok) {
      this.setData({ subscribed: true });
      wx.showToast({ title: COPY.evening.subscribe_done, icon: 'success' });
    } else {
      wx.showToast({ title: res.reason || '订阅失败', icon: 'none' });
    }
  },

  /**
   * 完成
   */
  onDone() {
    wx.switchTab({ url: '/pages/home/index' });
  },
});