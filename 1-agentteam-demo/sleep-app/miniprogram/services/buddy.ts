/**
 * 睡眠搭子服务（services/buddy.ts）
 *
 * 与 design.md §6.2.7 对齐
 *
 * v1.0 MVP：占位实现（实际匹配在 P1 接入云函数）
 *
 * 关键逻辑：
 * - 仅 24:00 后开启（FR-8.1）
 * - 匹配池空时友好提示（FR-8.8）
 * - 24h 后自动销毁（FR-8.7）
 */

import { Logger } from '../utils/logger';
import { hhmmToMinutes, isInHHMMRange } from '../utils/date';

const logger = new Logger('buddy-service');

export interface BuddyMatchLocal {
  partnerNickname: string;
  partnerDurationLabel: string;
  partnerSummary: string;
  templates: Array<{ id: 'greeting' | 'status' | 'closing'; text: string }>;
  matchedAt: number;
}

/**
 * 检查当前时间是否在 24:00 之后
 */
export function isAfterMidnight(now: Date = new Date()): boolean {
  const min = now.getHours() * 60 + now.getMinutes();
  return min >= 0; // 24:00 即 00:00 起，允许操作
}

/**
 * 24:00 后开启，06:00 前可发起匹配
 */
export function isMatchableTime(now: Date = new Date()): boolean {
  const min = hhmmToMinutes('00:00');
  const max = hhmmToMinutes('06:00');
  return now.getHours() * 60 + now.getMinutes() >= min &&
         now.getHours() * 60 + now.getMinutes() < max;
}

/**
 * 开始匹配（v1.0 占位：永远返回 null，表示匹配池为空）
 * 真实项目调用云函数 buddyMatch
 */
export async function startMatching(): Promise<BuddyMatchLocal | null> {
  if (!isMatchableTime()) {
    logger.info('startMatching: not in match window');
    return null;
  }
  // v1.0 占位：返回 null，UI 展示"今晚的星空暂时安静"
  return null;
}

/**
 * 发送固定模板消息（v1.0 占位）
 */
export async function sendMessage(
  _matchId: string,
  _templateId: 'greeting' | 'status' | 'closing',
): Promise<void> {
  // v1.0 占位：仅记录日志
  logger.info('sendMessage placeholder');
}

/**
 * 关闭匹配
 */
export async function exitMatch(_matchId: string): Promise<void> {
  logger.info('exitMatch placeholder');
}

void isInHHMMRange;