/**
 * 首页（pages/home/index）
 *
 * 功能：
 * - 顶部问候语（按时段）
 * - 今日睡眠卡片 + 时间轴
 * - 6 个快捷入口（记录/午睡/处方/白噪音/闹钟/晚安）
 * - 「+」按钮唤起菜单（FR-1.3）
 */

import { recordStore } from '../../stores/record-store';
import { SleepRecord } from '../../models/sleep-record';
import { formatDate, getChineseWeekday } from '../../utils/date';
import { COPY } from '../../utils/i18n/copy';

const HOUR_GREETING: Array<{ min: number; max: number; key: keyof typeof COPY.home }> = [
  { min: 5, max: 11, key: 'greeting_morning' },
  { min: 11, max: 14, key: 'greeting_afternoon' },
  { min: 14, max: 18, key: 'greeting_afternoon' },
  { min: 18, max: 21, key: 'greeting_evening' },
  { min: 21, max: 30, key: 'greeting_night' },
];

Page({
  data: {
    greeting: '',
    todayDate: '',
    weekday: '',
    showMenu: false,
    menuTop: 0,
    records: [] as SleepRecord[],
    latest: null as SleepRecord | null,
    COPY,
  },

  onShow() {
    // 每次回到首页刷新数据
    const records = recordStore.getRecent();
    const latest = records[0] || null;
    const now = new Date();
    this.setData({
      greeting: this.pickGreeting(now),
      todayDate: formatDate(now, 'YYYY-MM-DD'),
      weekday: getChineseWeekday(now),
      records,
      latest,
    });
  },

  /**
   * 根据时段选择问候语
   */
  pickGreeting(now: Date): string {
    const h = now.getHours();
    for (const slot of HOUR_GREETING) {
      if (h >= slot.min && h < slot.max) return COPY.home[slot.key] as string;
    }
    return COPY.home.greeting_night as string;
  },

  /**
   * "+" 按钮：显示菜单
   */
  onPlusTap() {
    this.setData({ showMenu: !this.data.showMenu });
  },

  /**
   * 跳转开始记录
   */
  onGoRecord() {
    this.setData({ showMenu: false });
    wx.navigateTo({ url: '/pages/record/night/index' });
  },

  /**
   * 跳转午睡模式
   */
  onGoNap() {
    this.setData({ showMenu: false });
    wx.navigateTo({ url: '/pages/record/noon/index' });
  },

  /**
   * 点击菜单背景收起
   */
  onMenuMaskTap() {
    this.setData({ showMenu: false });
  },

  /**
   * 跳转处方
   */
  onGoScene() {
    wx.switchTab({ url: '/pages/scene/index' });
  },

  /**
   * 跳转白噪音
   */
  onGoSoundscape() {
    wx.switchTab({ url: '/pages/soundscape/index' });
  },

  /**
   * 跳转闹钟
   */
  onGoAlarm() {
    wx.navigateTo({ url: '/pages/alarm/index' });
  },

  /**
   * 跳转晚安电台
   */
  onGoEvening() {
    wx.navigateTo({ url: '/pages/evening/index' });
  },

  /**
   * 点击最近记录
   */
  onRecordTap(e: WechatMiniprogram.TouchEvent) {
    const id = (e.currentTarget.dataset.id as string) || '';
    if (!id) return;
    wx.navigateTo({ url: `/pages/report/index?id=${id}` });
  },

  /**
   * 格式化记录时长
   */
  fmtDuration(min: number): string {
    if (!min) return '0 分钟';
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h > 0) return `${h} 小时${m > 0 ? ` ${m} 分钟` : ''}`;
    return `${m} 分钟`;
  },
});