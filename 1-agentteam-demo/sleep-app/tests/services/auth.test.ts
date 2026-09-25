/**
 * auth.test.ts —— 鉴权服务测试
 */

import { login, checkSession, logout } from '../../miniprogram/services/auth';
import { userStore } from '../../miniprogram/stores/user-store';
import { LocalStore } from '../../miniprogram/utils/storage';

describe('services/auth', () => {
  beforeEach(() => {
    LocalStore.clear();
    userStore.clear();
  });

  describe('login', () => {
    it('应返回 true 并设置 _id 为 openidHash', async () => {
      const ok = await login();
      expect(ok).toBe(true);
      const user = userStore.getUser();
      expect(user._id).toBeTruthy();
      expect(user._id.startsWith('guest_')).toBe(false);
    });

    it('wx.login 失败时应返回 false', async () => {
      (globalThis as any).wx.login = ({ fail }: any) =>
        fail && fail(new Error('user denied'));
      const ok = await login();
      expect(ok).toBe(false);
      // 恢复
      (globalThis as any).wx.login = (opts: any) =>
        opts.success && opts.success({ code: 'mock_code_' + Date.now() });
    });
  });

  describe('checkSession', () => {
    it('游客态应返回 false', () => {
      expect(checkSession()).toBe(false);
    });

    it('已登录态应返回 true', () => {
      const user = userStore.getUser();
      user._id = 'real_hash';
      userStore.setUser(user);
      expect(checkSession()).toBe(true);
    });
  });

  describe('logout', () => {
    it('应清空 userStore', () => {
      const user = userStore.getUser();
      user._id = 'real_hash';
      userStore.setUser(user);
      logout();
      const next = userStore.getUser();
      // 重新生成游客态
      expect(next._id.startsWith('guest_')).toBe(true);
    });
  });
});