/**
 * 星空投送页（pages/evening/sky）
 *
 * FR-5.5 星空：匿名投送，24 小时后自动消失
 */

import { listAnonymousCast } from '../../services/evening';
import { COPY } from '../../utils/i18n/copy';
import { fromNow } from '../../utils/date';

Page({
  data: {
    items: [] as Array<{ text: string; castAt: number; ago: string }>,
    COPY: COPY.evening,
  },

  onShow() {
    const items = listAnonymousCast().map((x) => ({
      text: x.text,
      castAt: x.castAt,
      ago: fromNow(x.castAt),
    }));
    this.setData({ items });
  },
});