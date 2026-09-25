/**
 * 晚安电台服务（services/evening.ts）
 *
 * 与 design.md §6.2.4 对齐
 *
 * v1.0 MVP：
 * - 获取今日晚安卡片（按 cardDate 缓存）
 * - 保存"今天值得被记住的事"（FR-5.5 匿名投送）
 * - 打卡"明天要完成的小事"
 * - 订阅 21:00 提醒（wx.requestSubscribeMessage）
 */

import { LocalStore } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';
import { Logger } from '../utils/logger';
import { getTodayKey } from '../utils/date';
import { userStore } from '../stores/user-store';
import { EveningCard } from '../models/evening-card';
import { uuid } from '../utils/uuid';
import { safeUGC } from '../utils/i18n/copy';

const logger = new Logger('evening-service');

/**
 * 获取今日晚安卡片
 */
export function getTodayCard(): EveningCard {
  const cardDate = getTodayKey();
  const userId = userStore.getUser()._id;
  const list = LocalStore.getList<EveningCard>('evening_cards:list');
  let card = list.find((c) => c.userId === userId && c.cardDate === cardDate);
  if (!card) {
    card = {
      id: `ec_${userId}_${cardDate}`,
      userId,
      cardDate,
      voiceUrl: `cloud://sleepbuddy/voice/${(cardDate)}.mp3`,
      recommendedSoundscapeId: 's_free_2', // 默认推荐春雨
      memoryText: '',
      taskText: '',
      memoryAnonymousCast: false,
      readAt: null,
    } as unknown as EveningCard;
  }
  return card;
}

/**
 * 保存"今天值得被记住的事"（FR-5.5）
 *
 * @param text 用户文本
 * @param anonymousCast 是否匿名投送
 */
export function saveMemory(text: string, anonymousCast = false): boolean {
  const userId = userStore.getUser()._id;
  const card = getTodayCard();
  card.memoryText = safeUGC(text, 100);
  card.memoryAnonymousCast = anonymousCast;
  card.readAt = Date.now();
  persistCard(card);
  logger.info('memory saved', { anonymous: anonymousCast });
  return true;
}

/**
 * 打卡"明天要完成的小事"
 */
export function saveTask(text: string): boolean {
  const card = getTodayCard();
  card.taskText = safeUGC(text, 100);
  card.readAt = Date.now();
  persistCard(card);
  return true;
}

/**
 * 订阅 21:00 提醒（v1.0 占位：调用 wx.requestSubscribeMessage）
 */
export async function subscribeReminder(): Promise<{ ok: boolean; reason?: string }> {
  if (typeof wx === 'undefined' || !wx.requestSubscribeMessage) {
    return { ok: false, reason: '当前环境不支持订阅消息' };
  }
  try {
    // 真实项目中 tmplIds 应从云端拉取，此处占位
    const tmplIds = ['TPL_GOODNIGHT_V1'];
    await new Promise<WechatMiniprogram.RequestSubscribeMessageSuccessCallbackResult>(
      (resolve, reject) => {
        wx.requestSubscribeMessage({
          tmplIds,
          success: resolve,
          fail: reject,
        });
      },
    );
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: String(err) };
  }
}

/**
 * 持久化晚安卡片
 */
function persistCard(card: EveningCard): void {
  const list = LocalStore.getList<EveningCard>('evening_cards:list');
  const idx = list.findIndex((c) => c.userId === card.userId && c.cardDate === card.cardDate);
  if (idx >= 0) {
    list[idx] = card;
  } else {
    list.push(card);
  }
  LocalStore.setList('evening_cards:list', list);
}

/**
 * 获取"星空投送"列表（FR-5.5 24h 内的匿名文本）
 */
export function listAnonymousCast(): Array<{ text: string; castAt: number }> {
  const now = Date.now();
  const list = LocalStore.getList<EveningCard>('evening_cards:list');
  const result: Array<{ text: string; castAt: number }> = [];
  list.forEach((c) => {
    if (c.memoryAnonymousCast && c.memoryText) {
      if (c.readAt && now - c.readAt < 24 * 3600 * 1000) {
        result.push({ text: c.memoryText, castAt: c.readAt });
      }
    }
  });
  return result.sort((a, b) => b.castAt - a.castAt).slice(0, 50);
}

/** UUID 占位，避免删除时 import 警告 */
void uuid;
void STORAGE_KEYS;