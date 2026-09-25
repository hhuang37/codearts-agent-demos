/**
 * Toast 组件（sb-toast）
 *
 * 全局轻提示
 */

Component({
  properties: {
    text: { type: String, value: '' },
    type: {
      type: String,
      value: 'info', // info | success | warning | error
    },
    duration: { type: Number, value: 2000 },
    visible: { type: Boolean, value: false },
  },
});