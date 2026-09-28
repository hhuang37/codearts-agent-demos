/**
 * 简单哈希工具（utils/uuid.ts）
 *
 * 不依赖 uuid 库，使用 Math.random + 时间戳生成 36 位 ID
 */

let counter = 0;

/**
 * 生成 36 位唯一 ID（类似 UUID v4）
 * 格式：xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
export function uuid(): string {
  counter = (counter + 1) % 0xffff;
  const r = (n: number) => Math.floor(Math.random() * n);
  const hex = (n: number) => n.toString(16);
  const ts = Date.now().toString(16);
  return `${hex(r(0xffffffff))}-${ts.slice(-4)}-4${hex(r(0xfff)).padStart(3, '0')}-${hex(8 + r(4))}${hex(r(0xfff)).padStart(3, '0')}-${hex(r(0xffffffff)).padStart(8, '0')}${counter.toString(16).padStart(4, '0')}`;
}

/**
 * 短 ID（用于白噪音/午睡卡等不重要的临时 ID）
 */
export function shortId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * 简易字符串哈希（djb2），用于将 openid 转为定长哈希
 */
export function hashString(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xffffffff;
  }
  return (hash >>> 0).toString(36);
}