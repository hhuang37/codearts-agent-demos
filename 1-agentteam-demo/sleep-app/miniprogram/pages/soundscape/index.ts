/**
 * 白噪音页（pages/soundscape/index.ts）
 *
 * 与 design.md §6.2.5 对齐
 *
 * 功能：
 * - 分类切换（全部/自然/雨声/城市/动物/音乐）
 * - 关键词搜索
 * - 播放/暂停/恢复/停止
 * - 定时关闭
 * - 免费/会员角标
 */

import {
  list as listSoundscapes,
  play,
  pause,
  resume,
  stop,
  setTimer,
  clearTimer,
} from '../../services/soundscape';
import { audioStore } from '../../stores/audio-store';
import { userStore } from '../../stores/user-store';
import { Soundscape, SoundscapeCategory } from '../../models/soundscape';
import { CATEGORY_LABELS } from '../../models/soundscape';
import { COPY } from '../../utils/i18n/copy';
import { Logger } from '../../utils/logger';

const logger = new Logger('soundscape-page');

const CATEGORY_TABS: { value: SoundscapeCategory | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'nature', label: CATEGORY_LABELS.nature },
  { value: 'rain', label: CATEGORY_LABELS.rain },
  { value: 'city', label: CATEGORY_LABELS.city },
  { value: 'animal', label: CATEGORY_LABELS.animal },
  { value: 'music', label: CATEGORY_LABELS.music },
];

const TIMER_OPTIONS = [0, 15, 30, 60];

interface TimerOption { value: number; label: string }

Page({
  data: {
    tabs: CATEGORY_TABS,
    activeTab: 'all' as SoundscapeCategory | 'all',
    keyword: '',
    list: [] as Soundscape[],
    currentId: '',
    playing: false,
    timerRemainMin: 0,
    timerOptions: [] as TimerOption[],
    showTimerSheet: false,
    isPremium: false,
    COPY: COPY.soundscape,
    loading: true,
  },

  onLoad() {
    const timerOptions = TIMER_OPTIONS.map((v) => ({
      value: v,
      label: v === 0 ? COPY.soundscape.timer_off : `${v} 分钟`,
    }));
    this.setData({ timerOptions });
    this.loadList();
  },

  onShow() {
    // 同步播放状态（用户可能从处方页跳回来）
    const st = audioStore.getState();
    this.setData({
      currentId: st.currentId,
      playing: st.playing,
      timerRemainMin: Math.ceil(st.timerRemainSec / 60),
      isPremium: userStore.isPremium(),
    });
  },

  /**
   * 加载列表
   */
  loadList() {
    try {
      this.setData({ loading: true });
      const list = listSoundscapes(
        this.data.activeTab === 'all' ? undefined : (this.data.activeTab as SoundscapeCategory),
        this.data.keyword || undefined,
      );
      this.setData({ list, loading: false });
    } catch (err) {
      logger.warn('load soundscape list failed', { error: String(err) });
      this.setData({ loading: false });
      wx.showToast({ title: COPY.soundscape.load_failed, icon: 'none' });
    }
  },

  /**
   * 切换分类
   */
  onTabTap(e: WechatMiniprogram.CustomEvent) {
    const tab = e.currentTarget.dataset.tab as SoundscapeCategory | 'all';
    if (tab === this.data.activeTab) return;
    this.setData({ activeTab: tab });
    this.loadList();
  },

  /**
   * 搜索
   */
  onSearchInput(e: WechatMiniprogram.CustomEvent) {
    this.setData({ keyword: e.detail.value });
    this.loadList();
  },

  /**
   * 点击白噪音卡片
   */
  onItemTap(e: WechatMiniprogram.CustomEvent) {
    const id = e.currentTarget.dataset.id as string;
    const target = this.data.list.find((s) => s._id === id);
    if (!target) return;
    if (!target.isFree && !userStore.isPremium()) {
      wx.showToast({ title: '升级会员解锁全部音效', icon: 'none' });
      return;
    }
    // 同一首：切换播放/暂停
    if (this.data.currentId === id && this.data.playing) {
      pause();
      this.setData({ playing: false });
      return;
    }
    if (this.data.currentId === id && !this.data.playing) {
      resume();
      this.setData({ playing: true });
      return;
    }
    // 不同：播放新
    const ok = play(id);
    if (ok) {
      this.setData({ currentId: id, playing: true });
    }
  },

  /**
   * 停止
   */
  onStop() {
    stop();
    this.setData({ currentId: '', playing: false, timerRemainMin: 0 });
  },

  /**
   * 暂停/恢复
   */
  onTogglePlay() {
    if (this.data.playing) {
      pause();
      this.setData({ playing: false });
    } else {
      if (this.data.currentId) {
        resume();
        this.setData({ playing: true });
      }
    }
  },

  /**
   * 打开定时器面板
   */
  onOpenTimer() {
    this.setData({ showTimerSheet: true });
  },

  /**
   * 关闭定时器面板
   */
  onCloseTimer() {
    this.setData({ showTimerSheet: false });
  },

  /**
   * 选择定时
   */
  onPickTimer(e: WechatMiniprogram.CustomEvent) {
    const minutes = e.currentTarget.dataset.min as number;
    if (minutes <= 0) {
      clearTimer();
      this.setData({ timerRemainMin: 0, showTimerSheet: false });
    } else {
      setTimer(minutes);
      this.setData({ timerRemainMin: minutes, showTimerSheet: false });
    }
  },

  /**
   * 阻止冒泡
   */
  noop() {
    // 阻止蒙层点击穿透
  },
});