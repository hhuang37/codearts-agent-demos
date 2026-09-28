/**
 * 睡眠搭子页（pages/buddy/index.ts）
 *
 * 与 design.md §6.2.8 对齐（v1.0 占位）
 *
 * 早睡搭子匹配：仅 00:00-06:00 开放匹配入口，匿名、不留 ID。
 * v1.0 MVP：仅展示页面 + 占位入口，匹配逻辑留待 v1.1
 */

import { COPY } from '../../utils/i18n/copy';
import { isMatchableTime } from '../../services/buddy';
import { Logger } from '../../utils/logger';

const logger = new Logger('buddy-page');

Page({
  data: {
    matchable: false,
    matched: 0,
    COPY: COPY.common,
  },

  onLoad() {
    this.refresh();
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    this.setData({ matchable: isMatchableTime() });
  },

  /**
   * 触发匹配（占位）
   */
  onMatch() {
    if (!this.data.matchable) {
      wx.showToast({ title: '匹配窗口为 00:00-06:00', icon: 'none' });
      return;
    }
    try {
      wx.showToast({ title: '匹配中…', icon: 'loading' });
      // v1.0 占位：未实现真实匹配
      setTimeout(() => {
        this.setData({ matched: this.data.matched + 1 });
        wx.showToast({ title: '已为你找到一位同行者', icon: 'success' });
      }, 1200);
    } catch (err) {
      logger.warn('match failed', { error: String(err) });
    }
  },
});