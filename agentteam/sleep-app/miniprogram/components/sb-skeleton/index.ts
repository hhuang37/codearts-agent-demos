/**
 * 骨架屏组件（sb-skeleton）
 *
 * 用于页面初次加载占位
 */

Component({
  properties: {
    /** 骨架行数 */
    rows: { type: Number, value: 3 },
    /** 类型 */
    type: {
      type: String,
      value: 'card', // card | list | form
    },
  },
});