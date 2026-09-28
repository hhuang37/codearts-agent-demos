/**
 * 隐私请求模型（models/privacy-request.ts）
 *
 * 与 design.md §5.1.10 对齐
 *
 * v1.0 MVP 仅在 P1"隐私保险箱"模块使用
 */

export type PrivacyRequestType = 'export' | 'delete' | 'disable-cloud';
export type PrivacyRequestStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface PrivacyRequest {
  _id: string;
  userId: string;
  type: PrivacyRequestType;
  status: PrivacyRequestStatus;
  requestedAt: number;
  completedAt: number | null;
  /** 注销生效时间（FR-10.4 7 天后） */
  effectiveAt: number | null;
  /** 导出文件 URL 等 */
  payload: Record<string, unknown>;
}