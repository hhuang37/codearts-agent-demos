/**
 * 列表项组件（sb-list-item）
 */

Component({
  properties: {
    title: { type: String, value: '' },
    desc: { type: String, value: '' },
    arrow: { type: Boolean, value: true },
    icon: { type: String, value: '' },
    value: { type: String, value: '' },
  },

  methods: {
    onTap() {
      this.triggerEvent('tap');
    },
  },
});