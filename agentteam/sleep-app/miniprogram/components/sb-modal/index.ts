/**
 * 弹窗组件（sb-modal）
 */

Component({
  properties: {
    visible: { type: Boolean, value: false },
    title: { type: String, value: '' },
    content: { type: String, value: '' },
    confirmText: { type: String, value: '确定' },
    cancelText: { type: String, value: '取消' },
    showCancel: { type: Boolean, value: true },
  },

  methods: {
    onConfirm() {
      this.triggerEvent('confirm');
      this.triggerEvent('close');
    },
    onCancel() {
      this.triggerEvent('cancel');
      this.triggerEvent('close');
    },
    onMaskTap() {
      this.triggerEvent('close');
    },
  },
});