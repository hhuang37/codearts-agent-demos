/**
 * 隐私保险箱页（pages/privacy/index.ts）
 *
 * 与 design.md §6.2.9 对齐
 *
 * 功能：
 * - 显示隐私承诺
 * - 导出我的数据（CSV）到剪贴板
 * - 关闭/开启云端备份
 * - 启动账户注销（7 天软删）
 * - 查看完整隐私政策（占位）
 */

import {
  exportCSV,
  requestDeletion,
  cancelDeletion,
  disableCloudBackup,
  enableCloudBackup,
  getDeletionRequest,
} from '../../services/privacy';
import { userStore } from '../../stores/user-store';
import { COPY } from '../../utils/i18n/copy';
import { Logger } from '../../utils/logger';

const logger = new Logger('privacy-page');

Page({
  data: {
    promise: '',
    cloudBackupEnabled: true,
    deletionPending: false,
    effectiveAtText: '',
    COPY: COPY.privacy,
  },

  onLoad() {
    this.refresh();
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    try {
      const user = userStore.getUser();
      const req = getDeletionRequest();
      let effectiveAtText = '';
      if (req && req.effectiveAt) {
        const d = new Date(req.effectiveAt);
        effectiveAtText = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
      }
      this.setData({
        promise: COPY.privacy.promise,
        cloudBackupEnabled: !!user.cloudBackupEnabled,
        deletionPending: !!req,
        effectiveAtText,
      });
    } catch (err) {
      logger.warn('privacy refresh failed', { error: String(err) });
    }
  },

  /**
   * 导出数据
   */
  onExport() {
    try {
      const csv = exportCSV(30);
      if (!csv || csv.length < 10) {
        wx.showToast({ title: '暂无记录可导出', icon: 'none' });
        return;
      }
      wx.setClipboardData({
        data: csv,
        success: () => {
          wx.showModal({
            title: '导出成功',
            content: '近 30 天记录已复制到剪贴板，请粘贴到邮箱或备忘录保存',
            showCancel: false,
          });
        },
      });
    } catch (err) {
      logger.warn('export failed', { error: String(err) });
      wx.showToast({ title: COPY.common.error, icon: 'none' });
    }
  },

  /**
   * 切换云端备份
   */
  onToggleCloudBackup(e: WechatMiniprogram.CustomEvent) {
    const enabled = e.detail.value as boolean;
    try {
      if (enabled) {
        enableCloudBackup();
      } else {
        disableCloudBackup();
      }
      this.setData({ cloudBackupEnabled: enabled });
      wx.showToast({
        title: enabled ? '已开启云端备份' : '已关闭云端备份',
        icon: 'success',
      });
    } catch (err) {
      logger.warn('toggle cloud backup failed', { error: String(err) });
    }
  },

  /**
   * 启动账户注销（二次确认）
   */
  onRequestDelete() {
    if (this.data.deletionPending) {
      // 已提交：显示取消
      wx.showModal({
        title: '已提交注销',
        content: `数据将于 ${this.data.effectiveAtText} 永久删除，是否撤销申请？`,
        confirmText: '撤销',
        cancelText: COPY.common.cancel,
        success: (res) => {
          if (res.confirm) {
            cancelDeletion();
            this.setData({ deletionPending: false, effectiveAtText: '' });
            wx.showToast({ title: '已撤销注销申请', icon: 'success' });
          }
        },
      });
      return;
    }
    try {
      wx.showModal({
        title: COPY.privacy.delete_account,
        content: COPY.privacy.delete_warning,
        confirmText: COPY.privacy.delete_confirm,
        confirmColor: '#E55B5B',
        cancelText: COPY.common.cancel,
        success: (res) => {
          if (!res.confirm) return;
          const result = requestDeletion();
          if (!result.ok) {
            wx.showToast({ title: result.reason || COPY.common.error, icon: 'none' });
            return;
          }
          const d = new Date(result.effectiveAt || 0);
          const text = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
          this.setData({ deletionPending: true, effectiveAtText: text });
          wx.showModal({
            title: '申请已提交',
            content: `你的数据将在 ${text} 永久删除。在此之前你随时可以撤销。`,
            showCancel: false,
          });
        },
      });
    } catch (err) {
      logger.warn('request deletion failed', { error: String(err) });
    }
  },

  /**
   * 查看隐私政策
   */
  onViewPolicy() {
    wx.showModal({
      title: '隐私政策',
      content: '完整隐私政策文档正在准备中。你可以随时通过「意见反馈」联系我们。',
      showCancel: false,
    });
  },
});