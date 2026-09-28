/**
 * 通用卡片组件（sb-card）
 *
 * 视觉规范：圆角 16px、内边距 16-20px、阴影 0 4rpx 16rpx
 */

interface CardData {
  title: string;
  subtitle: string;
  footer: string;
  showArrow: boolean;
  padding: 'small' | 'medium' | 'large';
}

Component({
  options: {
    multipleSlots: true,
  },

  properties: {
    title: { type: String, value: '' },
    subtitle: { type: String, value: '' },
    footer: { type: String, value: '' },
    showArrow: { type: Boolean, value: false },
    padding: {
      type: String,
      value: 'medium',
    },
    /** 自定义背景色（默认白） */
    bgColor: { type: String, value: '#FFFFFF' },
  },

  data: {} as CardData,

  methods: {
    /** 点击卡片 */
    onTap() {
      this.triggerEvent('tap');
    },
  },
});