/**
 * 按钮组件（sb-button）
 *
 * 类型：primary / secondary / text
 * 状态：normal / disabled / loading
 */

Component({
  properties: {
    text: { type: String, value: '' },
    type: {
      type: String,
      value: 'primary', // primary | secondary | text | danger
    },
    size: {
      type: String,
      value: 'medium', // small | medium | large
    },
    disabled: { type: Boolean, value: false },
    loading: { type: Boolean, value: false },
    block: { type: Boolean, value: false },
  },

  methods: {
    onTap() {
      if (this.data.disabled || this.data.loading) return;
      this.triggerEvent('tap');
    },
  },
});