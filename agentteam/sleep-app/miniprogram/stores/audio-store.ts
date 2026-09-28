/**
 * 音频播放状态管理（stores/audio-store.ts）
 *
 * 集中管理：
 * - 当前播放的白噪音
 * - 播放/暂停状态
 * - 定时关闭
 *
 * 实际播放由 wx.getBackgroundAudioManager 处理
 */

import { LocalStore } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';
import { Logger } from '../utils/logger';

const logger = new Logger('audio-store');

export interface AudioState {
  /** 当前播放白噪音 ID（空 = 无播放） */
  currentId: string;
  /** 当前播放名称 */
  currentName: string;
  /** 是否正在播放 */
  playing: boolean;
  /** 定时关闭剩余秒数，0 表示无 */
  timerRemainSec: number;
  /** 播放开始时间戳 */
  startedAt: number;
}

class AudioStoreImpl {
  private state: AudioState = {
    currentId: '',
    currentName: '',
    playing: false,
    timerRemainSec: 0,
    startedAt: 0,
  };

  constructor() {
    const cached = LocalStore.getItem<AudioState>(STORAGE_KEYS.AUDIO_STATE);
    if (cached) this.state = cached;
  }

  /**
   * 写入播放状态
   */
  setState(patch: Partial<AudioState>): void {
    this.state = { ...this.state, ...patch };
    LocalStore.setItem(STORAGE_KEYS.AUDIO_STATE, this.state);
    logger.info('audio state', { patch });
  }

  /**
   * 获取当前状态
   */
  getState(): AudioState {
    return { ...this.state };
  }

  /**
   * 设置定时关闭（分钟）
   */
  setTimer(minutes: number): void {
    this.setState({ timerRemainSec: minutes * 60 });
  }

  /**
   * 清除定时
   */
  clearTimer(): void {
    this.setState({ timerRemainSec: 0 });
  }

  /**
   * 是否正在播放
   */
  isPlaying(): boolean {
    return this.state.playing;
  }

  /**
   * 重置（停止播放）
   */
  reset(): void {
    this.state = {
      currentId: '',
      currentName: '',
      playing: false,
      timerRemainSec: 0,
      startedAt: 0,
    };
    LocalStore.removeItem(STORAGE_KEYS.AUDIO_STATE);
  }
}

export const audioStore = new AudioStoreImpl();