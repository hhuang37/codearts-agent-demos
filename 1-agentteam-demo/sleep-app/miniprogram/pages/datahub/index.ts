/**
 * 睡眠数据中枢页（pages/datahub/index.ts）
 *
 * 与 design.md §6.2.10 对齐（v1.0 占位）
 *
 * 功能：导入其他设备/平台的睡眠 CSV 数据（如小米手环导出）
 */

import { importCSV } from '../../services/datahub';
import { COPY } from '../../utils/i18n/copy';
import { Logger } from '../../utils/logger';

const logger = new Logger('datahub-page');

Page({
  data: {
    importedCount: 0,
    history: [] as Array<{ filename: string; count: number; importedAt: string }>,
    COPY: COPY.common,
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    // 读取本地的导入历史
    try {
      const history = wx.getStorageSync('datahub:history') as Array<any> | [];
      const importedCount = (history || []).reduce((s: number, h: any) => s + (h.count || 0), 0);
      this.setData({
        importedCount,
        history: (history || []).slice(-5).reverse(),
      });
    } catch (err) {
      logger.warn('read history failed', { error: String(err) });
    }
  },

  /**
   * 粘贴导入（让用户从剪贴板读取 CSV 文本）
   */
  async onPaste() {
    try {
      const { data } = await wx.getClipboardData();
      if (!data || !data.includes(',')) {
        wx.showToast({ title: '剪贴板无 CSV 数据', icon: 'none' });
        return;
      }
      const result = importCSV(data);
      if (result.ok) {
        wx.showToast({ title: `导入 ${result.count} 条`, icon: 'success' });
        this.refresh();
      } else {
        wx.showToast({ title: result.error || '导入失败', icon: 'none' });
      }
    } catch (err) {
      logger.warn('paste failed', { error: String(err) });
    }
  },

  /**
   * 清空
   */
  onClear() {
    try {
      wx.showModal({
        title: '清空导入记录',
        content: '仅清空导入历史，不影响已有睡眠记录。',
        success: (res) => {
          if (res.confirm) {
            wx.removeStorageSync('datahub:history');
            this.refresh();
          }
        },
      });
    } catch (err) {
      logger.warn('clear failed', { error: String(err) });
    }
  },
});