/**
 * privacy.test.ts —— 隐私服务测试
 */

import { exportCSV, requestDeletion, cancelDeletion, disableCloudBackup, enableCloudBackup, getDeletionRequest } from '../../miniprogram/services/privacy';
import { userStore } from '../../miniprogram/stores/user-store';
import { LocalStore } from '../../miniprogram/utils/storage';

describe('services/privacy', () => {
  beforeEach(() => {
    LocalStore.clear();
    userStore.clear();
  });

  describe('exportCSV', () => {
    it('应返回 CSV 字符串（含 header）', () => {
      const csv = exportCSV(30);
      expect(typeof csv).toBe('string');
      expect(csv.startsWith('日期,类型')).toBe(true);
    });
  });

  describe('requestDeletion', () => {
    it('游客态应拒绝', () => {
      const r = requestDeletion();
      expect(r.ok).toBe(false);
      expect(r.reason).toContain('游客');
    });

    it('已登录用户应成功并设置 effectiveAt 7 天后', () => {
      const user = userStore.getUser();
      user._id = 'real_user_hash';
      userStore.setUser(user);
      const before = Date.now();
      const r = requestDeletion();
      expect(r.ok).toBe(true);
      expect(r.effectiveAt).toBeGreaterThan(before + 7 * 24 * 3600_000 - 1000);
    });

    it('应写入本地请求队列', () => {
      const user = userStore.getUser();
      user._id = 'real_user_hash';
      userStore.setUser(user);
      requestDeletion();
      const list = LocalStore.getList<any>('privacy:requests');
      expect(list.length).toBeGreaterThanOrEqual(1);
      expect(list[0].type).toBe('delete');
      expect(list[0].status).toBe('pending');
    });
  });

  describe('cancelDeletion', () => {
    it('应从请求队列移除 pending 的 delete 请求', () => {
      const user = userStore.getUser();
      user._id = 'real_user_hash';
      userStore.setUser(user);
      requestDeletion();
      const ok = cancelDeletion();
      expect(ok).toBe(true);
      expect(getDeletionRequest()).toBeNull();
    });
  });

  describe('cloud backup', () => {
    it('disableCloudBackup 应关闭云端备份', () => {
      disableCloudBackup();
      expect(userStore.getUser().cloudBackupEnabled).toBe(false);
    });

    it('enableCloudBackup 应开启云端备份', () => {
      enableCloudBackup();
      expect(userStore.getUser().cloudBackupEnabled).toBe(true);
    });
  });

  describe('getDeletionRequest', () => {
    it('无请求时应返回 null', () => {
      expect(getDeletionRequest()).toBeNull();
    });

    it('有请求时应返回匹配的 pending delete', () => {
      const user = userStore.getUser();
      user._id = 'real_user_hash';
      userStore.setUser(user);
      requestDeletion();
      const r = getDeletionRequest();
      expect(r).not.toBeNull();
      expect(r!.type).toBe('delete');
    });
  });
});