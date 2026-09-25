/**
 * 内容安全审核服务（services/msgsec.ts）
 *
 * 与 design.md §6.2.12 对齐
 *
 * v1.0 MVP：本地关键词过滤（轻量实现），v2.0 接微信内容安全 API
 */

import { Logger } from '../utils/logger';

const logger = new Logger('msgsec-service');

/** 简易敏感词列表（v1.0 占位，生产应使用微信内容安全 API） */
const SENSITIVE_KEYWORDS = ['色情', '暴力', '赌博', '毒品', '法轮功'];

/**
 * 检查文本是否合规
 * v1.0：本地关键词匹配
 * v2.0：替换为 wx.cloud.callFunction → msgSecCheck
 */
export async function checkText(text: string): Promise<boolean> {
  if (!text) return true;
  const lower = text.toLowerCase();
  for (const kw of SENSITIVE_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) {
      logger.warn('msgsec blocked', { keyword: kw });
      return false;
    }
  }
  return true;
}

/**
 * 同步版本（用于本地快捷校验）
 */
export function checkTextSync(text: string): boolean {
  if (!text) return true;
  const lower = text.toLowerCase();
  for (const kw of SENSITIVE_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) return false;
  }
  return true;
}

/**
 * 图片审核占位（v1.0 不实现）
 */
export async function checkImage(_mediaId: string): Promise<boolean> {
  // v1.0 占位：直接放行
  return true;
}