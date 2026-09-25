/**
 * 场景问卷页（pages/scene/questionnaire）
 *
 * 5-7 题问卷，提交后生成 7 天处方
 */

import { getScene } from '../../services/scene';
import { Scene, SceneCode, QuestionnaireItem } from '../../models/scene';
import { COPY } from '../../utils/i18n/copy';

Page({
  data: {
    scene: null as Scene | null,
    code: '',
    questions: [] as QuestionnaireItem[],
    answers: {} as Record<string, string>,
    currentIdx: 0,
    COPY: COPY.scene,
  },

  onLoad(query: Record<string, string>) {
    const code = (query.code || '') as SceneCode;
    const scene = getScene(code);
    if (!scene) {
      wx.showToast({ title: COPY.scene.unavailable, icon: 'none' });
      return;
    }
    this.setData({ scene, code, questions: scene.questionnaire, currentIdx: 0 });
  },

  /**
   * 选择答案
   */
  onPick(e: WechatMiniprogram.CustomEvent) {
    const qid = (e.currentTarget.dataset.qid as string) || '';
    const val = (e.currentTarget.dataset.val as string) || '';
    if (!qid || !val) return;
    const answers = { ...this.data.answers, [qid]: val };
    this.setData({ answers });
  },

  /**
   * 下一题
   */
  onNext() {
    const cur = this.data.questions[this.data.currentIdx];
    if (cur && cur.required && !this.data.answers[cur.id]) {
      wx.showToast({ title: '请先回答这道题', icon: 'none' });
      return;
    }
    if (this.data.currentIdx < this.data.questions.length - 1) {
      this.setData({ currentIdx: this.data.currentIdx + 1 });
    } else {
      // 提交
      this.onSubmit();
    }
  },

  /**
   * 上一题
   */
  onPrev() {
    if (this.data.currentIdx > 0) {
      this.setData({ currentIdx: this.data.currentIdx - 1 });
    }
  },

  /**
   * 提交问卷 → 跳转处方页
   */
  onSubmit() {
    wx.redirectTo({
      url: `/pages/scene/prescription?code=${this.data.code}&answers=${encodeURIComponent(JSON.stringify(this.data.answers))}`,
    });
  },
});