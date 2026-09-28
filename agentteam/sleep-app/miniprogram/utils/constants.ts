/**
 * 全局常量（utils/constants.ts）
 *
 * 集中存放魔法值、枚举、文案占位等，避免散落
 */

export const COPYRIGHT = {
  name: '陪你睡个好觉',
  code: 'SleepBuddy',
  version: '1.0.0',
  copyright: '© 2026 SleepBuddy Team',
};

/** 本地存储键常量（与 design.md §5.3 对齐） */
export const STORAGE_KEYS = {
  USER_PROFILE: 'user:profile',
  RECORDS_RECENT_7D: 'records:recent:7d',
  RECORDS_TODAY: 'records:today',
  REPORTS_TODAY: 'reports:today',
  SCENES_CACHE: 'scenes:cache',
  SOUNDSCAPES_CACHE: 'soundscapes:cache',
  AUDIO_STATE: 'audio:state',
  QUOTA_AI: 'quota:ai:YYYY-MM-DD',
  QUOTA_LAST_KEY: 'quota:last-key',
  SETTINGS: 'settings',
  AUTH_OPENID_HASH: 'auth:openid-hash',
  PENDING_NAP: 'pending:nap',
} as const;

/** 业务错误码（与 design.md §6.1.2 对齐） */
export const ERROR_CODE = {
  SUCCESS: 0,
  NOT_LOGGED_IN: 1001,
  PERMISSION_DENIED: 1002,
  QUOTA_EXHAUSTED: 1003,
  DATA_NOT_FOUND: 2001,
  DATA_VALIDATION_FAILED: 2002,
  CONTENT_INSECURE: 3001,
  LLM_FAILED: 3002,
  SERVICE_ERROR: 5001,
} as const;

/** 业务类型枚举 */
export const RECORD_TYPE = {
  NIGHT: 'night',
  NOON: 'noon',
} as const;

export const SOURCE_TYPE = {
  MANUAL: 'manual',
  HEALTHKIT: 'healthkit',
  HUAWEI: 'huawei',
  XIAOMI: 'xiaomi',
  WECHAT_SPORT: 'wechat-sport',
} as const;

export const SUBSCRIPTION_TIER = {
  FREE: 'free',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
} as const;

export const SCENE_CODE = {
  EXAM: 'exam',
  OVERTIME: 'overtime',
  TRAVEL: 'travel',
  PREGNANCY: 'pregnancy',
  MENSTRUAL: 'menstrual',
} as const;

export const SOUNDSCAPE_CATEGORY = {
  NATURE: 'nature',
  RAIN: 'rain',
  CITY: 'city',
  ANIMAL: 'animal',
  MUSIC: 'music',
} as const;

/** 时间范围常量（分钟） */
export const NAP_DURATION = {
  MIN: 10,
  MAX: 60,
  DEFAULT: 30,
} as const;

export const NIGHT_SLEEP = {
  MIN_HOURS: 4,
  MAX_HOURS: 14,
} as const;

/** AI 追问配额（design.md §6.2.2） */
export const AI_QUOTA = {
  FREE_DAILY: 5,
  PAID_DAILY: 999,
} as const;

/** 闹钟默认参数（design.md §6.2.6） */
export const ALARM_DEFAULT = {
  WAKE_WINDOW_MIN: 30,
  SNOOZE_MIN: 5,
  MAX_SNOOZE_COUNT: 2,
} as const;

/** 缓动函数（design.md §9.1.6） */
export const EASING = {
  CARD_PUSH: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  FADE_IN: '200ms',
  FADE_OUT: '200ms',
} as const;

/** 内置订阅消息模板 ID（开发期占位） */
export const SUBSCRIBE_TMPL = {
  GOODNIGHT: 'TPL_GOODNIGHT_V1',
  REMINDER: 'TPL_REMINDER_V1',
} as const;