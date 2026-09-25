/**
 * 白噪音服务（services/soundscape.ts）
 *
 * 与 design.md §6.2.5 对齐
 *
 * v1.0 MVP：
 * - 内置 50 个白噪音元数据（30 个永久免费 + 20 个会员）
 * - 播放/暂停/恢复/停止
 * - 定时关闭
 * - 实际播放依赖 wx.getBackgroundAudioManager
 */

import { LocalStore } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';
import { Logger } from '../utils/logger';
import { audioStore } from '../stores/audio-store';
import { Soundscape, SoundscapeCategory } from '../models/soundscape';
import { BUILTIN_SOUNDSCAPES } from './soundscape-meta';

const logger = new Logger('soundscape-service');

let bgAudioManager: WechatMiniprogram.BackgroundAudioManager | null = null;

function getBGM(): WechatMiniprogram.BackgroundAudioManager | null {
  if (typeof wx === 'undefined' || !wx.getBackgroundAudioManager) return null;
  if (!bgAudioManager) bgAudioManager = wx.getBackgroundAudioManager();
  return bgAudioManager;
}

/**
 * 列出白噪音（可按分类 + 关键词筛选）
 */
export function list(category?: SoundscapeCategory, keyword?: string): Soundscape[] {
  let scenes = LocalStore.getList<Soundscape>(STORAGE_KEYS.SOUNDSCAPES_CACHE);
  if (scenes.length === 0) {
    LocalStore.setList(STORAGE_KEYS.SOUNDSCAPES_CACHE, BUILTIN_SOUNDSCAPES);
    scenes = BUILTIN_SOUNDSCAPES;
  }
  return scenes.filter((s) => {
    if (!s.enabled) return false;
    if (category && s.category !== category) return false;
    if (keyword) {
      const k = keyword.toLowerCase();
      if (
        !s.name.toLowerCase().includes(k) &&
        !s.tags.some((t) => t.toLowerCase().includes(k))
      ) {
        return false;
      }
    }
    return true;
  });
}

/**
 * 通过 ID 获取
 */
export function getById(id: string): Soundscape | null {
  return list().find((s) => s._id === id) || null;
}

/**
 * 播放白噪音
 */
export function play(id: string, options?: { timer?: number }): boolean {
  const target = getById(id);
  if (!target) {
    logger.warn('play: not found', { id });
    return false;
  }
  const bgm = getBGM();
  if (!bgm) {
    logger.warn('play: BackgroundAudioManager not available');
    return false;
  }
  try {
    bgm.title = target.name;
    bgm.epname = '陪你睡个好觉';
    bgm.singer = 'SleepBuddy';
    bgm.coverImgUrl = target.cover || '';
    // v1.0 占位 URL（实际项目走云存储）
    bgm.src = target.audioUrl || `https://example.com/audio/${id}.mp3`;
    bgm.protocol = 'oboe';
    bgm.play();
    audioStore.setState({
      currentId: target._id,
      currentName: target.name,
      playing: true,
      startedAt: Date.now(),
      timerRemainSec: 0,
    });
    if (options?.timer && options.timer > 0) {
      setTimer(options.timer);
    }
    logger.info('play started', { id, name: target.name });
    return true;
  } catch (err) {
    logger.warn('play failed', { error: String(err) });
    return false;
  }
}

/**
 * 暂停
 */
export function pause(): void {
  const bgm = getBGM();
  if (!bgm) return;
  try {
    bgm.pause();
    audioStore.setState({ playing: false });
  } catch (err) {
    logger.warn('pause failed', { error: String(err) });
  }
}

/**
 * 恢复
 */
export function resume(): void {
  const bgm = getBGM();
  if (!bgm) return;
  try {
    bgm.play();
    audioStore.setState({ playing: true });
  } catch (err) {
    logger.warn('resume failed', { error: String(err) });
  }
}

/**
 * 停止
 */
export function stop(): void {
  const bgm = getBGM();
  if (!bgm) return;
  try {
    bgm.stop();
    audioStore.reset();
  } catch (err) {
    logger.warn('stop failed', { error: String(err) });
  }
}

/**
 * 设置定时关闭（分钟）
 */
let timerHandle: number | null = null;

export function setTimer(minutes: number): void {
  clearTimer();
  audioStore.setTimer(minutes);
  timerHandle = setTimeout(
    () => {
      stop();
      audioStore.clearTimer();
      try {
        wx.showToast({ title: '白噪音已停止', icon: 'none' });
      } catch {
        // ignore
      }
    },
    Math.max(0, minutes) * 60 * 1000,
  ) as unknown as number;
  logger.info('timer set', { minutes });
}

export function clearTimer(): void {
  if (timerHandle !== null) {
    clearTimeout(timerHandle);
    timerHandle = null;
  }
  audioStore.clearTimer();
}