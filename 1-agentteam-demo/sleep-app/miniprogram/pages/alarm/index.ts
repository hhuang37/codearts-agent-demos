/**
 * 智能闹钟页（pages/alarm/index.ts）
 *
 * 与 design.md §6.2.6 对齐
 *
 * 功能：
 * - 列出已配置的闹钟
 * - 新建/编辑/删除闹钟
 * - 浅睡唤醒提示（FR-6.2）
 * - 节假日跳过开关（FR-6.4）
 */

import {
  AlarmConfig,
  list as listAlarms,
  create as createAlarm,
  update as updateAlarm,
  remove as removeAlarm,
  toggle as toggleAlarm,
  isHoliday,
  estimateOptimalRingTime,
  getRecentRecords,
} from '../../services/alarm';
import { recordStore } from '../../stores/record-store';
import { userStore } from '../../stores/user-store';
import { COPY } from '../../utils/i18n/copy';
import { Logger } from '../../utils/logger';

const logger = new Logger('alarm-page');

// 星期映射：1-6 表示周一到周六，0 表示周日
const WEEKDAYS = [
  { label: '日', value: 0 },
  { label: '一', value: 1 },
  { label: '二', value: 2 },
  { label: '三', value: 3 },
  { label: '四', value: 4 },
  { label: '五', value: 5 },
  { label: '六', value: 6 },
];

interface EditDraft {
  id?: string;
  targetTime: string;
  wakeWindowMin: number;
  repeatDays: number[];
  skipHoliday: boolean;
  ringtone: string;
  vibrate: boolean;
  enabled: boolean;
}

Page({
  data: {
    alarms: [] as AlarmConfig[],
    holidayToday: false,
    draft: null as EditDraft | null,
    showEditor: false,
    weekdays: WEEKDAYS,
    todayKey: '',
    COPY: COPY.alarm,
  },

  onLoad() {
    this.refresh();
    const today = new Date();
    this.setData({
      todayKey: `${today.getMonth() + 1}月${today.getDate()}日`,
      holidayToday: isHoliday(today),
    });
  },

  onShow() {
    this.refresh();
  },

  /**
   * 刷新列表
   */
  refresh() {
    const list = listAlarms().sort((a, b) => a.targetTime.localeCompare(b.targetTime));
    this.setData({ alarms: list });
  },

  /**
   * 浅睡唤醒建议（基于近 7 天历史）
   */
  getOptimalHint(targetTime: string, wakeWindowMin: number): string {
    try {
      const records = getRecentRecords(7);
      if (records.length === 0) return COPY.alarm.optimal_none;
      const { optimalTime, inLightSleep } = estimateOptimalRingTime(
        targetTime,
        wakeWindowMin,
        records,
      );
      if (!inLightSleep) return COPY.alarm.optimal_none;
      return `${COPY.alarm.optimal_hint}${optimalTime}`;
    } catch (err) {
      logger.warn('optimal hint failed', { error: String(err) });
      return COPY.alarm.optimal_none;
    }
  },

  /**
   * 新建闹钟
   */
  onCreate() {
    const draft: EditDraft = {
      targetTime: '07:30',
      wakeWindowMin: 30,
      repeatDays: [1, 2, 3, 4, 5],
      skipHoliday: true,
      ringtone: 'default',
      vibrate: true,
      enabled: true,
    };
    this.setData({ draft, showEditor: true });
  },

  /**
   * 编辑闹钟
   */
  onEdit(e: WechatMiniprogram.CustomEvent) {
    const id = e.currentTarget.dataset.id as string;
    const alarm = listAlarms().find((a) => a.id === id);
    if (!alarm) return;
    const draft: EditDraft = {
      id: alarm.id,
      targetTime: alarm.targetTime,
      wakeWindowMin: alarm.wakeWindowMin,
      repeatDays: alarm.repeatDays.slice(),
      skipHoliday: alarm.skipHoliday,
      ringtone: alarm.ringtone,
      vibrate: alarm.vibrate,
      enabled: alarm.enabled,
    };
    this.setData({ draft, showEditor: true });
  },

  /**
   * 保存闹钟
   */
  onSave() {
    const draft = this.data.draft;
    if (!draft) return;
    // 校验：HH:mm 格式
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(draft.targetTime)) {
      wx.showToast({ title: COPY.alarm.invalid_time, icon: 'none' });
      return;
    }
    try {
      if (draft.id) {
        updateAlarm(draft.id, {
          targetTime: draft.targetTime,
          wakeWindowMin: draft.wakeWindowMin,
          repeatDays: draft.repeatDays,
          skipHoliday: draft.skipHoliday,
          ringtone: draft.ringtone,
          vibrate: draft.vibrate,
          enabled: draft.enabled,
        });
      } else {
        createAlarm({
          targetTime: draft.targetTime,
          wakeWindowMin: draft.wakeWindowMin,
          repeatDays: draft.repeatDays,
          skipHoliday: draft.skipHoliday,
          ringtone: draft.ringtone,
          vibrate: draft.vibrate,
          enabled: draft.enabled,
        });
      }
      wx.showToast({ title: COPY.alarm.save_done, icon: 'success' });
      this.setData({ showEditor: false, draft: null });
      this.refresh();
    } catch (err) {
      logger.warn('save alarm failed', { error: String(err) });
      wx.showToast({ title: COPY.common.error, icon: 'none' });
    }
  },

  /**
   * 切换开关
   */
  onToggle(e: WechatMiniprogram.CustomEvent) {
    const id = e.currentTarget.dataset.id as string;
    const enabled = e.detail.value as boolean;
    try {
      toggleAlarm(id, enabled);
      this.refresh();
    } catch (err) {
      logger.warn('toggle alarm failed', { error: String(err) });
    }
  },

  /**
   * 删除闹钟（带确认）
   */
  onDelete(e: WechatMiniprogram.CustomEvent) {
    const id = e.currentTarget.dataset.id as string;
    try {
      wx.showModal({
        title: COPY.alarm.confirm_delete_title,
        content: COPY.alarm.confirm_delete,
        confirmText: COPY.common.confirm,
        cancelText: COPY.common.cancel,
        success: (res) => {
          if (res.confirm) {
            removeAlarm(id);
            this.refresh();
            wx.showToast({ title: COPY.alarm.deleted, icon: 'success' });
          }
        },
      });
    } catch (err) {
      logger.warn('delete alarm failed', { error: String(err) });
    }
  },

  /**
   * 选择时间
   */
  onTimeChange(e: WechatMiniprogram.CustomEvent) {
    const val = e.detail.value as string;
    const draft = this.data.draft;
    if (!draft) return;
    draft.targetTime = val;
    this.setData({ draft });
  },

  /**
   * 切换重复日
   */
  onDayToggle(e: WechatMiniprogram.CustomEvent) {
    const day = e.currentTarget.dataset.day as number;
    const draft = this.data.draft;
    if (!draft) return;
    const idx = draft.repeatDays.indexOf(day);
    if (idx >= 0) draft.repeatDays.splice(idx, 1);
    else draft.repeatDays.push(day);
    this.setData({ draft });
  },

  /**
   * 切换节假日跳过
   */
  onSkipHolidayToggle(e: WechatMiniprogram.CustomEvent) {
    const draft = this.data.draft;
    if (!draft) return;
    draft.skipHoliday = e.detail.value as boolean;
    this.setData({ draft });
  },

  /**
   * 切换震动
   */
  onVibrateToggle(e: WechatMiniprogram.CustomEvent) {
    const draft = this.data.draft;
    if (!draft) return;
    draft.vibrate = e.detail.value as boolean;
    this.setData({ draft });
  },

  /**
   * 关闭窗口
   */
  onCancel() {
    this.setData({ showEditor: false, draft: null });
  },

  /**
   * 阻止冒泡
   */
  noop() {
    // 阻止蒙层点击穿透
  },
});

// 引用 userStore 以避免 tree-shaking 误删
void userStore;
void recordStore;