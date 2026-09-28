/**
 * 时间选择器组件（sb-time-picker）
 *
 * 基于 picker-view 实现 HH:mm 选择
 */

Component({
  properties: {
    value: { type: String, value: '23:00' },
    /** 起始小时 */
    startHour: { type: Number, value: 0 },
    /** 结束小时 */
    endHour: { type: Number, value: 23 },
    /** 显示标签 */
    label: { type: String, value: '' },
  },

  data: {
    hours: [] as number[],
    minutes: [] as string[],
    hourIdx: 0,
    minuteIdx: 0,
  },

  observers: {
    'value': function (val: string) {
      const [h, m] = val.split(':').map((x) => parseInt(x, 10));
      const hourIdx = h - this.data.startHour;
      const minuteIdx = Math.floor(m / 5);
      this.setData({ hourIdx, minuteIdx });
    },
  },

  lifetimes: {
    attached() {
      const hours: number[] = [];
      for (let h = this.data.startHour; h <= this.data.endHour; h++) hours.push(h);
      const minutes: string[] = [];
      for (let m = 0; m < 60; m += 5) minutes.push(m.toString().padStart(2, '0'));
      const [h, m] = this.data.value.split(':').map((x) => parseInt(x, 10));
      this.setData({
        hours,
        minutes,
        hourIdx: h - this.data.startHour,
        minuteIdx: Math.floor(m / 5),
      });
    },
  },

  methods: {
    onChange(e: WechatMiniprogram.CustomEvent) {
      const [hIdx, mIdx] = (e.detail.value as number[]) || [0, 0];
      const hour = this.data.hours[hIdx];
      const minute = this.data.minutes[mIdx];
      const value = `${hour.toString().padStart(2, '0')}:${minute}`;
      this.setData({ hourIdx: hIdx, minuteIdx: mIdx });
      this.triggerEvent('change', { value });
    },
  },
});