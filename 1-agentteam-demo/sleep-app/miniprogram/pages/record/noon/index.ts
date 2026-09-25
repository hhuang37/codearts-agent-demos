/**
 * 午睡卡快速记录页（pages/record/noon）
 *
 * FR-2 午睡卡独立记录
 * - 10-60 分钟倒计时
 * - 倒计时结束 / 提前结束 → 填写午睡卡（地点/深度/恢复）
 * - FR-2.7：时长不在 10-60 范围内拒绝保存
 */

import { userStore } from '../../../stores/user-store';
import { createRecord } from '../../../services/sleep';
import { NAP_LOCATIONS } from '../../../models/sleep-record';
import { COPY } from '../../../utils/i18n/copy';
import { validateNapDuration } from '../../../utils/validator';

interface PageData {
  status: 'idle' | 'running' | 'finished';
  duration: number;
  remaining: number;
  startedAt: number;
  endedAt: number;
  location: string;
  depth: number;
  recovery: number;
  locations: string[];
  showAskPending: boolean;
  COPY: typeof COPY.record;
}

Page({
  data: {
    status: 'idle',
    duration: 30,
    remaining: 0,
    startedAt: 0,
    endedAt: 0,
    location: '办公桌',
    depth: 2,
    recovery: 2,
    locations: NAP_LOCATIONS as unknown as string[],
    showAskPending: false,
    COPY: COPY.record,
  } as PageData,

  timer: null as number | null,

  onLoad() {
    // FR-2.6：检查是否有未结束的午睡
    const pending = wx.getStorageSync('pending:nap');
    if (pending && pending.status === 'running') {
      this.setData({ showAskPending: true });
    }
  },

  onUnload() {
    this.clearTimer();
  },

  /**
   * 启动倒计时
   */
  onStart() {
    const duration = this.data.duration;
    const check = validateNapDuration(duration);
    if (!check.ok) {
      wx.showToast({ title: check.error || '时长不对', icon: 'none' });
      return;
    }
    const now = Date.now();
    this.setData({
      status: 'running',
      startedAt: now,
      remaining: duration * 60,
    });
    wx.setStorageSync('pending:nap', { status: 'running', startedAt: now, duration });
    this.startTimer();
  },

  /**
   * 启动 setInterval
   */
  startTimer() {
    this.clearTimer();
    this.timer = setInterval(() => {
      const r = this.data.remaining - 1;
      if (r <= 0) {
        this.setData({ remaining: 0, status: 'finished' });
        this.clearTimer();
        wx.vibrateShort({ type: 'light' });
      } else {
        this.setData({ remaining: r });
      }
    }, 1000) as unknown as number;
  },

  clearTimer() {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  /**
   * 提前结束
   */
  onEndEarly() {
    const startedAt = this.data.startedAt;
    const endedAt = Date.now();
    const dur = Math.floor((endedAt - startedAt) / 60_000);
    if (dur < 10) {
      wx.showToast({ title: COPY.record.nap_invalid, icon: 'none' });
      return;
    }
    this.setData({ status: 'finished', endedAt });
    this.clearTimer();
    wx.removeStorageSync('pending:nap');
  },

  /**
   * 倒计时归零后自动结束
   */
  onEndByTimer() {
    this.setData({ endedAt: this.data.startedAt + this.data.duration * 60 * 1000 });
    wx.removeStorageSync('pending:nap');
  },

  /**
   * 选择时长
   */
  onPickDuration(e: WechatMiniprogram.CustomEvent) {
    const v = parseInt((e.detail.value as string) || '30', 10);
    this.setData({ duration: v });
  },

  /**
   * 选择地点
   */
  onPickLocation(e: WechatMiniprogram.CustomEvent) {
    const idx = parseInt((e.detail.value as string) || '0', 10);
    this.setData({ location: NAP_LOCATIONS[idx] });
  },

  onSetDepth(e: WechatMiniprogram.CustomEvent) {
    this.setData({ depth: e.detail.value as number });
  },

  onSetRecovery(e: WechatMiniprogram.CustomEvent) {
    this.setData({ recovery: e.detail.value as number });
  },

  /**
   * 保存午睡卡
   */
  async onSave() {
    const endedAt = this.data.endedAt || Date.now();
    const startedAt = this.data.startedAt || endedAt - this.data.duration * 60 * 1000;
    const dur = Math.floor((endedAt - startedAt) / 60_000);
    if (dur < 10 || dur > 60) {
      wx.showToast({ title: COPY.record.nap_invalid, icon: 'none' });
      return;
    }
    const user = userStore.getUser();
    const id = await createRecord({
      userId: user._id,
      type: 'noon',
      startAt: startedAt,
      endAt: endedAt,
      selfRating: 0,
      location: this.data.location,
      depth: this.data.depth,
      recovery: this.data.recovery,
    });
    if (!id) return;
    wx.showToast({ title: '午睡卡已生成', icon: 'success' });
    setTimeout(() => {
      wx.redirectTo({ url: `/pages/report/index?id=${id}` });
    }, 600);
  },

  /**
   * 上次午睡是否已结束？—— 选"已结束"
   */
  onPendingYes() {
    const pending = wx.getStorageSync('pending:nap');
    if (pending) {
      const endedAt = Date.now();
      this.setData({
        showAskPending: false,
        status: 'finished',
        startedAt: pending.startedAt,
        duration: pending.duration,
        endedAt,
      });
    }
    wx.removeStorageSync('pending:nap');
  },

  /**
   * 上次午睡是否已结束？—— 选"还没结束"
   */
  onPendingNo() {
    this.setData({ showAskPending: false, status: 'running' });
    this.startTimer();
  },

  /**
   * 重置
   */
  onReset() {
    this.setData({ status: 'idle', remaining: 0, endedAt: 0 });
  },

  /**
   * 格式化剩余时间 mm:ss
   */
  fmtMMSS(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  },
});