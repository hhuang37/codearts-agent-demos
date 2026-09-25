/**
 * 夜间睡眠记录页（pages/record/night）
 *
 * FR-1 手动睡眠记录
 * - 填写就寝时间、起床时间
 * - 自评分数（1-5 星）
 * - 备注
 * - 保存后跳转 AI 报告页
 */

import { userStore } from '../../../stores/user-store';
import { createRecord } from '../../../services/sleep';
import { generateReport } from '../../../services/aiReport';
import { COPY } from '../../../utils/i18n/copy';
import { formatDate, diffInMinutes } from '../../../utils/date';

interface PageData {
  bedtime: string;
  waketime: string;
  rating: number;
  notes: string;
  saving: boolean;
  editing: boolean;
  durationMin: number;
  COPY: typeof COPY.record;
}

Page({
  data: {
    bedtime: '23:00',
    waketime: '07:00',
    rating: 0,
    notes: '',
    saving: false,
    editing: false,
    durationMin: 480,
    COPY: COPY.record,
  } as PageData,

  onLoad() {
    // 默认填入合理的初始时间
    const now = new Date();
    const yesterday = new Date(now.getTime() - 8 * 3600 * 1000);
    this.setData({
      bedtime: formatDate(yesterday, 'HH:mm'),
      waketime: formatDate(now, 'HH:mm'),
    });
  },

  onBedtimeChange(e: WechatMiniprogram.CustomEvent) {
    const v = (e.detail.value as string) || '23:00';
    this.setData({ bedtime: v, editing: true });
    this.recalcDuration();
  },

  onWaketimeChange(e: WechatMiniprogram.CustomEvent) {
    const v = (e.detail.value as string) || '07:00';
    this.setData({ waketime: v, editing: true });
    this.recalcDuration();
  },

  onRatingChange(e: WechatMiniprogram.CustomEvent) {
    this.setData({ rating: e.detail.value as number });
  },

  onNotesInput(e: WechatMiniprogram.Input) {
    this.setData({ notes: e.detail.value || '' });
  },

  /**
   * 重算时长
   */
  recalcDuration() {
    const { bedtime, waketime } = this.data;
    const today = formatDate(new Date(), 'YYYY-MM-DD');
    const startAt = new Date(`${formatDate(new Date(Date.now() - 8 * 3600 * 1000), 'YYYY-MM-DD')} ${bedtime}:00`).getTime();
    const endAt = new Date(`${today} ${waketime}:00`).getTime();
    this.setData({ durationMin: diffInMinutes(startAt, endAt) });
  },

  /**
   * 保存记录
   */
  async onSave() {
    if (this.data.saving) return;
    this.setData({ saving: true });
    try {
      // 计算开始/结束时间戳
      const now = new Date();
      const yesterday = new Date(now.getTime() - 12 * 3600 * 1000);
      const startAt = new Date(`${formatDate(yesterday, 'YYYY-MM-DD')} ${this.data.bedtime}:00`).getTime();
      const endAt = new Date(`${formatDate(now, 'YYYY-MM-DD')} ${this.data.waketime}:00`).getTime();
      const user = userStore.getUser();
      const id = await createRecord({
        userId: user._id,
        type: 'night',
        startAt,
        endAt,
        selfRating: this.data.rating,
        notes: this.data.notes,
      });
      if (!id) {
        this.setData({ saving: false });
        return;
      }
      wx.showToast({ title: COPY.record.save_success, icon: 'none' });
      // 跳转到报告页
      setTimeout(() => {
        wx.redirectTo({ url: `/pages/report/index?id=${id}` });
      }, 600);
    } catch (err) {
      this.setData({ saving: false });
      wx.showToast({ title: COPY.common.network_error, icon: 'none' });
    }
  },

  onCancel() {
    wx.navigateBack({ delta: 1 });
  },

  // 占位：prevent generateReport 函数引用警告
  _ignore: undefined as undefined,
});
// 调用一次避免 unused
void generateReport;