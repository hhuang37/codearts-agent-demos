/**
 * 多端数据源授权模型（models/data-source-auth.ts）
 *
 * 与 design.md §5.1.9 对齐
 *
 * v1.0 MVP 仅在 P1"睡眠数据中枢"模块使用，
 * 此处先定义类型
 */

export type DataSource = 'healthkit' | 'huawei' | 'xiaomi' | 'wechat-sport';

export interface DataSourceAuth {
  _id: string;
  userId: string;
  source: DataSource;
  authorized: boolean;
  authorizedAt: number | null;
  lastSyncAt: number | null;
  /** 增量同步 token（华为/苹果用） */
  syncToken: string | null;
}

/** 各数据源的中文显示名 */
export const DATA_SOURCE_LABELS: Record<DataSource, string> = {
  healthkit: 'iPhone / Apple Health',
  huawei: '华为运动健康',
  xiaomi: '小米运动健康',
  'wechat-sport': '微信运动',
};