/**
 * 报告页（pages/report/index）
 *
 * FR-3 「睡后一句话」AI 报告
 * - 三段式：现状 → 归因 → 建议
 * - 长按触发追问（v1.0 本地、v2.0 LLM）
 * - 配额控制：免费 5 次/天
 */

import { recordStore } from '../../stores/record-store';
import { SleepRecord } from '../../models/sleep-record';
import { AIDailyReport } from '../../models/ai-report';
import { generateReport, askFollowUp, getQuota, getFollowUpHistory } from '../../services/aiReport';
import { COPY } from '../../utils/i18n/copy';
import { formatDurationHM, formatDate } from '../../utils/date';

Page({
  data: {
    record: null as SleepRecord | null,
    report: null as AIDailyReport | null,
    loading: true,
    showFollowup: false,
    followupInput: '',
    followups: [] as Array<{ question: string; answer: string }>,
    quota: { used: 0, total: 5 },
    COPY: COPY.report,
  },

  onLoad(query: Record<string, string>) {
    const id = query.id || '';
    if (!id) {
      wx.showToast({ title: '记录不存在', icon: 'none' });
      return;
    }
    this.loadRecord(id);
  },

  /**
   * 加载记录并生成报告
   */
  async loadRecord(id: string) {
    this.setData({ loading: true });
    const record = recordStore.getById(id);
    if (!record) {
      this.setData({ loading: false });
      wx.showToast({ title: '记录不存在', icon: 'none' });
      return;
    }
    const report = await generateReport(record);
    this.setData({
      record,
      report,
      loading: false,
      quota: getQuota(),
      followups: getFollowUpHistory(report._id).map((f) => ({
        question: f.question,
        answer: f.answer,
      })),
    });
  },

  /**
   * 长按报告卡片 → 显示追问入口
   */
  onReportLongPress() {
    this.setData({ showFollowup: true });
  },

  /**
   * 输入追问
   */
  onFollowupInput(e: WechatMiniprogram.Input) {
    this.setData({ followupInput: e.detail.value || '' });
  },

  /**
   * 发送追问
   */
  async onSendFollowup() {
    const q = (this.data.followupInput || '').trim();
    if (!q) return;
    if (!this.data.report) return;
    const res = await askFollowUp(this.data.report._id, q);
    if (!res.ok) {
      wx.showToast({ title: res.reason || '追问失败', icon: 'none' });
      return;
    }
    this.setData({
      followups: [
        ...this.data.followups,
        { question: q, answer: res.answer || '' },
      ],
      followupInput: '',
      quota: getQuota(),
    });
  },

  /**
   * 关闭追问弹窗
   */
  onCloseFollowup() {
    this.setData({ showFollowup: false });
  },

  /**
   * 格式化时长
   */
  fmtDuration(min: number): string {
    return formatDurationHM(min);
  },

  /**
   * 格式化时间
   */
  fmtTime(ts: number): string {
    return formatDate(ts, 'HH:mm');
  },

  /**
   * 格式化日期
   */
  fmtDate(ts: number): string {
    return formatDate(ts, 'YYYY-MM-DD');
  },
});