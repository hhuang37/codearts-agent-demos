/**
 * i18n.test.ts —— COPY 文案与 complianceReplace 合规替换测试
 */

import { COPY, complianceReplace, safeUGC } from '../../miniprogram/utils/i18n/copy';

describe('utils/i18n/copy', () => {
  describe('COPY 对象结构', () => {
    it('应包含 app / home / record / report / scene / alarm / privacy / common / compliance 等主要分组', () => {
      expect(COPY.app).toBeDefined();
      expect(COPY.home).toBeDefined();
      expect(COPY.record).toBeDefined();
      expect(COPY.report).toBeDefined();
      expect(COPY.scene).toBeDefined();
      expect(COPY.alarm).toBeDefined();
      expect(COPY.privacy).toBeDefined();
      expect(COPY.common).toBeDefined();
      expect(COPY.compliance).toBeDefined();
    });

    it('app 名称应为"陪你睡个好觉"', () => {
      expect(COPY.app.name).toBe('陪你睡个好觉');
      expect(COPY.app.slogan).toBeDefined();
    });

    it('所有问候语应有内容', () => {
      expect(COPY.home.greeting_morning).toBeTruthy();
      expect(COPY.home.greeting_afternoon).toBeTruthy();
      expect(COPY.home.greeting_evening).toBeTruthy();
      expect(COPY.home.greeting_night).toBeTruthy();
    });

    it('5 个场景文案应存在', () => {
      expect(COPY.scene.pick_exam).toBeTruthy();
      expect(COPY.scene.pick_overtime).toBeTruthy();
      expect(COPY.scene.pick_travel).toBeTruthy();
      expect(COPY.scene.pick_pregnancy).toBeTruthy();
      expect(COPY.scene.pick_menstrual).toBeTruthy();
    });

    it('合规替换表应有三条', () => {
      expect(COPY.compliance.monitor_to).toBe('睡眠记录');
      expect(COPY.compliance.score_to).toBe('自我感受');
      expect(COPY.compliance.deep_to).toBe('深度休息');
    });
  });

  describe('complianceReplace', () => {
    it('应替换"睡眠监测" -> "睡眠记录"', () => {
      expect(complianceReplace('开启睡眠监测功能')).toContain('睡眠记录');
    });

    it('应替换"睡眠评分" -> "自我感受"', () => {
      expect(complianceReplace('睡眠评分系统')).toContain('自我感受');
    });

    it('应替换"深度睡眠" -> "深度休息"', () => {
      expect(complianceReplace('深度睡眠阶段')).toContain('深度休息');
    });

    it('应替换"医疗/治疗/诊断"为温柔版本', () => {
      const r = complianceReplace('医疗方案');
      expect(r).not.toContain('医疗');
    });

    it('空字符串应返回空字符串', () => {
      expect(complianceReplace('')).toBe('');
    });

    it('无敏感词应原样返回', () => {
      expect(complianceReplace('普通文本')).toBe('普通文本');
    });

    it('多次出现的敏感词应全部替换', () => {
      const r = complianceReplace('睡眠监测睡眠监测');
      expect(r).not.toContain('睡眠监测');
    });
  });

  describe('safeUGC', () => {
    it('应去除控制字符并截断', () => {
      const dirty = 'hello\x00world';
      expect(safeUGC(dirty)).toBe('helloworld');
    });

    it('超长应截断到 maxLen', () => {
      expect(safeUGC('a'.repeat(200), 50)).toHaveLength(50);
    });

    it('空字符串应返回空', () => {
      expect(safeUGC('')).toBe('');
    });
  });
});