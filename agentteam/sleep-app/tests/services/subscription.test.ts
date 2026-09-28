/**
 * subscription.test.ts —— 订阅消息服务测试
 */

import { requestSubscribe, checkSubscribed, clearCache } from '../../miniprogram/services/subscription';
import { LocalStore } from '../../miniprogram/utils/storage';

describe('services/subscription', () => {
  beforeEach(() => LocalStore.clear());

  describe('requestSubscribe', () => {
    it('应返回 accept/reject 分类', async () => {
      const r = await requestSubscribe(['TPL_GOODNIGHT_V1', 'TPL_REMINDER_V1']);
      expect(r.accept).toContain('TPL_GOODNIGHT_V1');
      expect(r.reject).toEqual([]);
    });

    it('应缓存已接受的模板 ID', async () => {
      await requestSubscribe(['TPL_GOODNIGHT_V1']);
      expect(checkSubscribed('TPL_GOODNIGHT_V1')).toBe(true);
    });

    it('无 wx 环境时应拒绝全部', async () => {
      const original = (globalThis as any).wx.requestSubscribeMessage;
      (globalThis as any).wx.requestSubscribeMessage = undefined;
      const r = await requestSubscribe(['TPL_X']);
      expect(r.accept).toEqual([]);
      expect(r.reject).toEqual(['TPL_X']);
      // 恢复
      (globalThis as any).wx.requestSubscribeMessage = original;
    });

    it('wx.requestSubscribeMessage 失败时应拒绝全部', async () => {
      const original = (globalThis as any).wx.requestSubscribeMessage;
      (globalThis as any).wx.requestSubscribeMessage = ({ fail }: any) =>
        fail && fail(new Error('rejected'));
      const r = await requestSubscribe(['TPL_X']);
      expect(r.accept).toEqual([]);
      // 恢复
      (globalThis as any).wx.requestSubscribeMessage = original;
    });
  });

  describe('checkSubscribed', () => {
    it('未订阅应返回 false', () => {
      expect(checkSubscribed('NOT_SUBSCRIBED')).toBe(false);
    });
  });

  describe('clearCache', () => {
    it('应清除订阅缓存', async () => {
      await requestSubscribe(['TPL_GOODNIGHT_V1']);
      expect(checkSubscribed('TPL_GOODNIGHT_V1')).toBe(true);
      clearCache();
      expect(checkSubscribed('TPL_GOODNIGHT_V1')).toBe(false);
    });
  });
});