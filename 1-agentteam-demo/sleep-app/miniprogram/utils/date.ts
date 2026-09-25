/**
 * 日期工具（utils/date.ts）
 *
 * 封装 dayjs 的常用功能，提供：
 * - 格式化（YYYY-MM-DD HH:mm 等）
 * - 相对时间（"3 小时前"）
 * - 时长计算（分钟差、小时差）
 * - 跨天判断、星期获取
 *
 * 注意：本文件不直接引入 dayjs，避免小程序包体积膨胀，
 *      使用自实现轻量日期工具替代
 */

const DAY_NAMES_CN = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

/**
 * 补零：1 -> "01"
 */
function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/**
 * 格式化日期
 * @param date Date 对象或毫秒时间戳
 * @param pattern 模板：
 *   YYYY 4 位年
 *   MM   2 位月
 *   DD   2 位日
 *   HH   2 位小时（24h）
 *   mm   2 位分钟
 *   ss   2 位秒
 */
export function formatDate(date: Date | number, pattern = 'YYYY-MM-DD HH:mm'): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  const tokens: Record<string, string> = {
    YYYY: `${d.getFullYear()}`,
    MM: pad2(d.getMonth() + 1),
    DD: pad2(d.getDate()),
    HH: pad2(d.getHours()),
    mm: pad2(d.getMinutes()),
    ss: pad2(d.getSeconds()),
  };
  return pattern.replace(/YYYY|MM|DD|HH|mm|ss/g, (m) => tokens[m]);
}

/**
 * 相对时间："3 分钟前"、"2 小时前"、"昨天"
 */
export function fromNow(target: Date | number): string {
  const ts = typeof target === 'number' ? target : target.getTime();
  const diff = Date.now() - ts;
  if (diff < 60_000) return '刚刚';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)} 天前`;
  return formatDate(target, 'YYYY-MM-DD');
}

/**
 * 两个时间戳之间的分钟数（结果为正数表示 target 在 base 之后）
 */
export function diffInMinutes(a: Date | number, b: Date | number): number {
  const ta = typeof a === 'number' ? a : a.getTime();
  const tb = typeof b === 'number' ? b : b.getTime();
  return Math.floor((tb - ta) / 60_000);
}

/**
 * 计算睡眠时长（小时，保留 1 位小数）
 */
export function formatDurationHours(minutes: number): string {
  return `${(minutes / 60).toFixed(1)}`;
}

/**
 * 计算睡眠时长（HH:mm 格式，分钟转 小时:分钟）
 */
export function formatDurationHM(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  return `${pad2(h)}:${pad2(m)}`;
}

/**
 * 当前日期键：YYYY-MM-DD，用于按天分桶
 */
export function getTodayKey(date: Date = new Date()): string {
  return formatDate(date, 'YYYY-MM-DD');
}

/**
 * 中文星期
 */
export function getChineseWeekday(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  return DAY_NAMES_CN[d.getDay()];
}

/**
 * 判断是否同一天
 */
export function isSameDay(a: Date | number, b: Date | number): boolean {
  const da = typeof a === 'number' ? new Date(a) : a;
  const db = typeof b === 'number' ? new Date(b) : b;
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

/**
 * 获取一天的开始时间戳（00:00:00）
 */
export function startOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * 获取一天的结束时间戳（23:59:59）
 */
export function endOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * 给 HH:mm 增加分钟数，返回新的 HH:mm
 * 用于闹钟时间窗口计算
 */
export function addMinutesToHHMM(hhmm: string, minutes: number): string {
  const parts = hhmm.split(':');
  if (parts.length !== 2) return hhmm;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const total = h * 60 + m + minutes;
  const nh = Math.floor((total / 60) % 24);
  const nm = total % 60;
  return `${pad2(nh)}:${pad2(nm)}`;
}

/**
 * 当前时间是否在 [start, end] 之间（HH:mm）
 */
export function isInHHMMRange(now: Date, start: string, end: string): boolean {
  const cur = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = start.split(':').map((x) => parseInt(x, 10));
  const [eh, em] = end.split(':').map((x) => parseInt(x, 10));
  const s = sh * 60 + sm;
  const e = eh * 60 + em;
  return cur >= s && cur <= e;
}

/**
 * 将 "HH:mm" 转分钟数（用于比较）
 */
export function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map((x) => parseInt(x, 10));
  return h * 60 + m;
}