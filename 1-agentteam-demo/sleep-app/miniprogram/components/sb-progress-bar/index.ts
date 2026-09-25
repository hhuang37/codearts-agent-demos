/**
 * 进度条组件（sb-progress-bar）
 *
 * 用于展示睡眠时长比例、深睡比例等
 */

Component({
  properties: {
    /** 当前进度（0-100） */
    value: { type: Number, value: 0 },
    /** 颜色 */
    color: { type: String, value: '#FFD66B' },
    /** 背景色 */
    bgColor: { type: String, value: 'rgba(26, 27, 58, 0.06)' },
    /** 高度（rpx） */
    height: { type: Number, value: 12 },
    /** 显示文字（如 "75%"） */
    showText: { type: Boolean, value: false },
  },

  methods: {},
});