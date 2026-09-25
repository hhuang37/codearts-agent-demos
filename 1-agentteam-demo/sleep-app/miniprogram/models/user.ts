/**
 * 用户模型（models/user.ts）
 *
 * 与 design.md §5.1.1 对齐
 */

export type SubscriptionTier = 'free' | 'monthly' | 'yearly';

export interface User {
  /** 主键：openid 哈希 */
  _id: string;
  /** 微信 openid（仅后端持有，前端只见哈希） */
  openid?: string;
  /** 用户昵称（脱敏，前缀 + "**"） */
  nickname: string;
  /** 头像 URL（可选） */
  avatarUrl: string;
  /** 订阅层级 */
  subscriptionTier: SubscriptionTier;
  /** 会员到期时间（毫秒时间戳） */
  subscriptionExpireAt: number | null;
  /** 是否开启云端备份（FR-10.6 默认 true） */
  cloudBackupEnabled: boolean;
  /** 注册时间 */
  createdAt: number;
  /** 更新时间 */
  updatedAt: number;
}

/**
 * 创建默认用户（首次启动时）
 */
export function createDefaultUser(openidHash: string): User {
  const now = Date.now();
  return {
    _id: openidHash,
    nickname: '朋友',
    avatarUrl: '',
    subscriptionTier: 'free',
    subscriptionExpireAt: null,
    cloudBackupEnabled: true,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * 判断用户是否为付费会员
 */
export function isPremium(user: User): boolean {
  if (user.subscriptionTier === 'free') return false;
  if (!user.subscriptionExpireAt) return false;
  return user.subscriptionExpireAt > Date.now();
}