/**
 * 评分组件（sb-rating）
 *
 * 1-5 星评分，支持只读模式
 */

Component({
  properties: {
    value: { type: Number, value: 0 },
    max: { type: Number, value: 5 },
    readonly: { type: Boolean, value: false },
    /** 星级大小（rpx） */
    size: { type: Number, value: 60 },
  },

  data: {
    stars: [] as number[],
  },

  observers: {
    'max': function (max: number) {
      const stars: number[] = [];
      for (let i = 1; i <= max; i++) stars.push(i);
      this.setData({ stars });
    },
  },

  lifetimes: {
    attached() {
      const max = this.data.max;
      const stars: number[] = [];
      for (let i = 1; i <= max; i++) stars.push(i);
      this.setData({ stars });
    },
  },

  methods: {
    onTapStar(e: WechatMiniprogram.TouchEvent) {
      if (this.data.readonly) return;
      const idx = (e.currentTarget.dataset.idx as number) || 0;
      // 二次点击同一颗星 = 清除
      const next = this.data.value === idx ? 0 : idx;
      this.setData({ value: next });
      this.triggerEvent('change', { value: next });
    },
  },
});