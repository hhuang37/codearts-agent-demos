/**
 * msgsec.test.ts —— 内容安全审核测试
 */

import { checkText, checkTextSync, checkImage } from '../../miniprogram/services/msgsec';

describe('services/msgsec', () => {
  describe('checkText', () => {
    it('正常文本应通过', async () => {
      expect(await checkText('今天睡得不错')).toBe(true);
    });

    it('含敏感词"色情"应拒绝', async () => {
      expect(await checkText('含色情内容')).toBe(false);
    });

    it('含敏感词"暴力"应拒绝', async () => {
      expect(await checkText('暴力视频')).toBe(false);
    });

    it('含敏感词"赌博"应拒绝', async () => {
      expect(await checkText('赌博')).toBe(false);
    });

    it('大小写不敏感（中文不影响）', async () => {
      expect(await checkText('毒 品')).toBe(false);
    });

    it('空字符串应直接通过', async () => {
      expect(await checkText('')).toBe(true);
    });
  });

  describe('checkTextSync', () => {
    it('正常文本应同步通过', () => {
      expect(checkTextSync('hello world')).toBe(true);
    });

    it('含敏感词应同步拒绝', () => {
      expect(checkTextSync('涉法轮功')).toBe(false);
    });

    it('空字符串应同步通过', () => {
      expect(checkTextSync('')).toBe(true);
    });
  });

  describe('checkImage', () => {
    it('v1.0 占位实现应直接通过', async () => {
      expect(await checkImage('any_media_id')).toBe(true);
    });
  });
});