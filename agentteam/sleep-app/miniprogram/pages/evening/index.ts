/**
 * 晚安电台页（pages/evening/index）
 *
 * FR-5 晚安电台睡前陪伴
 * - 展示今日晚安卡片
 * - 填写"今天值得被记住的事"（FR-5.5 匿名投送）
 * - 打卡"明天要完成的小事"
 * - 订阅 21:00 提醒
 */

import { EveningCard } from '../../models/evening-card';
import {
  getTodayCard,
  saveMemory,
  saveTask,
  subscribeReminder,
} from '../../services/evening';
import { play, stop } from '../../services/soundscape';
import { COPY } from '../../utils/i18n/copy';
import { getTodayKey } from '../../utils/date';

Page({
  data: {
    card: null as EveningCard | null,
    memory: '',
    task: '',
    anonymous: false,
    playing: false,
    currentId: '',
    COPY: COPY.evening,
  },

  onShow() {
    this.loadCard();
  },

  loadCard() {
    const card = getTodayCard();
    this.setData({
      card,
      memory: card.memoryText || '',
      task: card.taskText || '',
      anonymous: !!card.memoryAnonymousCast,
    });
  },

  /**
   * 播放/暂停推荐白噪音
   */
  onPlayToggle() {
    if (!this.data.card) return;
    const id = this.data.card.recommendedSoundscapeId;
    if (this.data.playing) {
      stop();
      this.setData({ playing: false, currentId: '' });
    } else if (id) {
      const ok = play(id);
      if (ok) {
        this.setData({ playing: true, currentId: id });
      }
    }
  },

  /**
   * 保存记忆
   */
  onSaveMemory() {
    if (!this.data.memory.trim()) {
      wx.showToast({ title: '写一句话给自己', icon: 'none' });
      return;
    }
    saveMemory(this.data.memory, this.data.anonymous);
    wx.showToast({ title: '已保存', icon: 'success' });
  },

  /**
   * 保存任务
   */
  onSaveTask() {
    if (!this.data.task.trim()) {
      wx.showToast({ title: '给自己立个小 flag', icon: 'none' });
      return;
    }
    saveTask(this.data.task);
    wx.showToast({ title: '已打卡', icon: 'success' });
  },

  /**
   * 切换匿名投送
   */
  onAnonymousChange(e: any) {
    this.setData({ anonymous: e.detail.value });
  },

  onMemoryInput(e: WechatMiniprogram.Input) {
    this.setData({ memory: e.detail.value || '' });
  },

  onTaskInput(e: WechatMiniprogram.Input) {
    this.setData({ task: e.detail.value || '' });
  },

  /**
   * 订阅 21:00 提醒
   */
  async onSubscribe() {
    const res = await subscribeReminder();
    if (res.ok) {
      wx.showToast({ title: COPY.evening.subscribe_done, icon: 'success' });
    } else {
      wx.showToast({ title: res.reason || '订阅失败', icon: 'none' });
    }
  },

  /**
   * 跳转星空页
   */
  onGoSky() {
    wx.navigateTo({ url: '/pages/evening/sky' });
  },
});

// 占位：防止 TS6133
void getTodayKey;