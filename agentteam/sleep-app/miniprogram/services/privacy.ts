/**
 * 隐私服务（services/privacy.ts）
 *
 * 与 design.md §6.2.9 对齐
 *
 * v1.0 MVP：
 * - 导出 CSV（基于近 30 天本地记录）
 * - 启动账户注销（7 天软删，本地立即标记）
 * - 关闭云端备份（仅标记 user.cloudBackupEnabled = false）
 */

import { LocalStore } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';
import { Logger } from '../utils/logger';
import { userStore } from '../stores/user-store';
import { exportRecentAsCSV } from './sleep';
import { uuid } from '../utils/uuid';
import { PrivacyRequest } from '../models/privacy-request';

const logger = new Logger('privacy-service');

/**
 * 导出近 N 天 CSV
 * @returns CSV 文本内容（前端可调用 wx.setClipboardData 或上传后下载）
 */
export function exportCSV(days = 30): string {
  return exportRecentAsCSV(days);
}

/**
 * 启动账户注销（v1.0 本地标记，7 天后云端硬删）
 */
export function requestDeletion(): { ok: boolean; effectiveAt?: number; reason?: string } {
  const user = userStore.getUser();
  if (!user._id || user._id.startsWith('guest_')) {
    return { ok: false, reason: '当前为游客态，无账户可注销' };
  }
  const now = Date.now();
  const effectiveAt = now + 7 * 24 * 3600 * 1000;
  const req: PrivacyRequest = {
    _id: `pr_${uuid()}`,
    userId: user._id,
    type: 'delete',
    status: 'pending',
    requestedAt: now,
    completedAt: null,
    effectiveAt,
    payload: { acknowledged: true },
  };
  // 写入本地请求队列
  const list = LocalStore.getList<PrivacyRequest>('privacy:requests');
  list.push(req);
  LocalStore.setList('privacy:requests', list);
  logger.info('deletion requested', { effectiveAt });
  return { ok: true, effectiveAt };
}

/**
 * 取消注销
 */
export function cancelDeletion(): boolean {
  const list = LocalStore.getList<PrivacyRequest>('privacy:requests');
  const filtered = list.filter((r) => r.type !== 'delete' || r.status !== 'pending');
  LocalStore.setList('privacy:requests', filtered);
  return true;
}

/**
 * 关闭云端备份（FR-10.3）
 */
export function disableCloudBackup(): boolean {
  userStore.setCloudBackup(false);
  logger.info('cloud backup disabled');
  return true;
}

/**
 * 启用云端备份
 */
export function enableCloudBackup(): boolean {
  userStore.setCloudBackup(true);
  return true;
}

/**
 * 查询注销请求
 */
export function getDeletionRequest(): PrivacyRequest | null {
  const list = LocalStore.getList<PrivacyRequest>('privacy:requests');
  return list.find((r) => r.type === 'delete' && r.status === 'pending') || null;
}

void STORAGE_KEYS;