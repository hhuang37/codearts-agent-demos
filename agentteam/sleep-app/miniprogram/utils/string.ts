/**
 * 字符串工具（utils/string.ts）
 *
 * 简单的字符串处理：截断、隐藏、转义等
 */

/**
 * 隐藏字符串中间部分（手机号 138****8000）
 */
export function maskMiddle(text: string, startKeep = 3, endKeep = 4, maskChar = '*'): string {
  if (!text) return '';
  if (text.length <= startKeep + endKeep) return text;
  const start = text.slice(0, startKeep);
  const end = text.slice(-endKeep);
  const masked = maskChar.repeat(text.length - startKeep - endKeep);
  return `${start}${masked}${end}`;
}

/**
 * 截断并加省略号
 */
export function ellipsis(text: string, maxLen: number): string {
  if (!text) return '';
  return text.length > maxLen ? `${text.slice(0, maxLen)}...` : text;
}

/**
 * 是否为空字符串（trim 后）
 */
export function isBlank(text: string | undefined | null): boolean {
  return !text || text.trim().length === 0;
}

/**
 * emoji 安全检测（仅去除危险字符）
 */
export function sanitizeUGC(text: string, maxLen = 100): string {
  if (!text) return '';
  // 去除控制字符
  const clean = text.replace(/[\x00-\x1F\x7F]/g, '');
  return clean.length > maxLen ? clean.slice(0, maxLen) : clean;
}