/**
 * 数据校验工具（utils/validator.ts）
 *
 * 提供：
 * - 睡眠记录时间合法性
 * - 午睡时长合法性
 * - 评分合法性
 * - 邮箱、手机号等通用校验
 */

import { NAP_DURATION, NIGHT_SLEEP } from './constants';

/**
 * 校验睡眠记录时间是否合理（endAt > startAt）
 * 返回 { ok: boolean, error?: string }
 */
export function validateSleepTime(
  startAt: Date | number,
  endAt: Date | number,
): { ok: boolean; error?: string } {
  const ts = typeof startAt === 'number' ? startAt : startAt.getTime();
  const te = typeof endAt === 'number' ? endAt : endAt.getTime();
  if (ts >= te) {
    return { ok: false, error: '时间不合理，请检查' };
  }
  const minMs = NIGHT_SLEEP.MIN_HOURS * 3600 * 1000;
  const maxMs = NIGHT_SLEEP.MAX_HOURS * 3600 * 1000;
  const dur = te - ts;
  if (dur < minMs) {
    return { ok: false, error: '时长不足 4 小时，请确认' };
  }
  if (dur > maxMs) {
    return { ok: false, error: '时长超过 14 小时，请确认' };
  }
  return { ok: true };
}

/**
 * 校验午睡时长（FR-2.7：10-60 分钟）
 */
export function validateNapDuration(durationMin: number): { ok: boolean; error?: string } {
  if (durationMin < NAP_DURATION.MIN) {
    return { ok: false, error: '午睡时长需 10-60 分钟' };
  }
  if (durationMin > NAP_DURATION.MAX) {
    return { ok: false, error: '午睡时长需 10-60 分钟' };
  }
  return { ok: true };
}

/**
 * 校验自评分数（1-5）
 */
export function validateSelfRating(rating: number): boolean {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

/**
 * 校验场景编码（白名单）
 */
export function validateSceneCode(code: string): boolean {
  const whitelist = ['exam', 'overtime', 'travel', 'pregnancy', 'menstrual'];
  return whitelist.includes(code);
}

/**
 * 校验邮箱
 */
export function isEmail(text: string): boolean {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(text);
}

/**
 * 校验手机号
 */
export function isPhone(text: string): boolean {
  return /^1[3-9]\d{9}$/.test(text);
}

/**
 * 限制文本长度（用于备注等字段）
 */
export function truncate(text: string, maxLen: number): string {
  if (!text) return '';
  return text.length > maxLen ? text.slice(0, maxLen) : text;
}

/**
 * 校验 HH:mm 字符串
 */
export function isValidHHMM(text: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(text);
}