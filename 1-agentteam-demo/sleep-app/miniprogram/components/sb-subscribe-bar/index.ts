/**
 * 订阅消息授权条（sb-subscribe-bar）
 *
 * FR-5.6：仅在用户主动点击时引导订阅，失败不重复请求
 */

import { requestSubscribe } from '../../services/subscription';

Component({
  properties: {
    tmplId: { type: String, value: 'TPL_GOODNIGHT_V1' },
    content: { type: String, value: '订阅 21:00 晚安提醒，每晚我们陪你' },
  },

  data: {
    requested: false,
  },

  methods: {
    /**
     * 点击订阅按钮
     */
    async onTap() {
      if (this.data.requested) {
        this.triggerEvent('already');
        return;
      }
      const res = await requestSubscribe([this.data.tmplId]);
      this.setData({ requested: true });
      this.triggerEvent('result', { res });
    },
  },
});