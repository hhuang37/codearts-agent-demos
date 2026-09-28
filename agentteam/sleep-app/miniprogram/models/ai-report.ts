/**
 * AI 报告模型（models/ai-report.ts）
 *
 * 与 design.md §5.1.3 对齐
 */

export type AIModel = 'rule-v1' | 'deepseek' | 'qwen' | 'ernie';

export interface AIDailyReport {
  _id: string;
  userId: string;
  /** 关联 SleepRecord */
  sleepRecordId: string;
  /** 现状描述（≤ 30 字） */
  currentStatus: string;
  /** 归因描述（≤ 30 字） */
  cause: string;
  /** 建议描述（≤ 30 字） */
  suggestion: string;
  /** 当日追问次数（FR-3.7） */
  followUpCount: number;
  /** 当日配额（免费 5 / 会员 999） */
  followUpQuota: number;
  /** 实际生成来源 */
  model: AIModel;
  /** 是否来自缓存（避免重复生成） */
  cached: boolean;
  /** 生成时间 */
  generatedAt: number;
  /** 过期时间（90 天后自动清理） */
  expireAt: number;
}

/** 追问历史项 */
export interface AIFollowUpItem {
  _id: string;
  reportId: string;
  question: string;
  answer: string;
  createdAt: number;
}

/**
 * 默认报告（生成失败兜底）
 */
export function emptyReport(userId: string, sleepRecordId: string): AIDailyReport {
  const now = Date.now();
  return {
    _id: `rpt_${now}`,
    userId,
    sleepRecordId,
    currentStatus: '你安静地睡了一觉',
    cause: '身体在慢慢找回节奏',
    suggestion: '今晚 22:30 关灯，给自己一点缓冲',
    followUpCount: 0,
    followUpQuota: 5,
    model: 'rule-v1',
    cached: false,
    generatedAt: now,
    expireAt: now + 90 * 24 * 3600 * 1000,
  };
}