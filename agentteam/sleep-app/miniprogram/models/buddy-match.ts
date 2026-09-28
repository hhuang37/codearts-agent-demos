/**
 * 睡眠搭子匹配模型（models/buddy-match.ts）
 *
 * 与 design.md §5.1.8 对齐
 *
 * v1.0 MVP 仅提供类型定义与基础工具函数，
 * 实际匹配在 P1 阶段接入云函数
 */

export type BuddyMessageTemplate = 'greeting' | 'status' | 'closing';
export type BuddyMatchStatus = 'active' | 'expired' | 'closed';

export interface BuddyMessage {
  fromUserId: string;
  templateId: BuddyMessageTemplate;
  content: string;
  sentAt: number;
}

export interface BuddyMatch {
  _id: string;
  /** 搭子 A 的 openid 哈希 */
  userIdA: string;
  /** 搭子 B 的 openid 哈希 */
  userIdB: string;
  /** 匹配时间（FR-8.3） */
  matchedAt: number;
  /** 失效时间（FR-8.7 06:00 自动销毁） */
  expireAt: number;
  /** 搭子 A 的今日总结 */
  summaryA: string;
  /** 搭子 B 的今日总结 */
  summaryB: string;
  /** 最多 3 条固定模板 */
  messages: BuddyMessage[];
  status: BuddyMatchStatus;
}

/** 固定 3 种模板消息 */
export const BUDDY_TEMPLATES: Record<BuddyMessageTemplate, string> = {
  greeting: '今晚好，你也准备睡了吗？',
  status: '今天有点累，但想跟你说一声晚安',
  closing: '明天一起好好过。',
};