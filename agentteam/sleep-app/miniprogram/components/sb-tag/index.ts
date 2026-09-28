/**
 * 标签组件（sb-tag）
 *
 * 用于显示场景标签、状态标签等
 */

Component({
  properties: {
    text: { type: String, value: '' },
    type: {
      type: String,
      value: 'default', // default | primary | accent | warning
    },
    closable: { type: Boolean, value: false },
  },

  methods: {
    onTap() {
      this.triggerEvent('tap');
    },
    onClose() {
      this.triggerEvent('close');
    },
  },
});