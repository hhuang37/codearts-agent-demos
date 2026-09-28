/**
 * AI 报告服务（services/ai-report.ts）
 *
 * 与 design.md §6.2.2 对齐
 *
 * v1.0 MVP：本地规则引擎生成（v2.0 接 LLM）
 *
 * 关键点：
 * - 缓存命中检查（同 sleepRecordId 24h 内复用）
 * - 配额控制（免费 5 次/天，付费 999 次/天）
 * - 追问接口在 v1.0 提供本地简单回答（v2.0 接 LLM）
 */

import { LocalStore } from '../utils/storage';
import { STORAGE_KEYS, AI_QUOTA } from '../utils/constants';
import { Logger } from '../utils/logger';
import { getTodayKey } from '../utils/date';
import { userStore } from '../stores/user-store';
import { SleepRecord } from '../models/sleep-record';
import { AIDailyReport, AIFollowUpItem } from '../models/ai-report';
import { generateByRule } from './rule-engine';

const logger = new Logger('ai-report-service');

const CACHE_TTL = 24 * 3600 * 1000;

/**
 * 生成（或读取缓存）一份 AI 报告
 * FR-1.4 / FR-3.1：保存记录后自动生成
 */
export async function generateReport(record: SleepRecord): Promise<AIDailyReport> {
  // 1. 缓存命中
  const cached = lookupCachedReport(record._id);
  if (cached) {
    logger.info('report cache hit', { recordId: record._id });
    return { ...cached, cached: true };
  }

  // 2. 规则引擎生成
  const generated = generateByRule(record);

  // 3. 构造报告对象
  const now = Date.now();
  const report: AIDailyReport = {
    _id: `rpt_${record._id}_${now}`,
    userId: record.userId,
    sleepRecordId: record._id,
    currentStatus: generated.currentStatus,
    cause: generated.cause,
    suggestion: generated.suggestion,
    followUpCount: 0,
    followUpQuota: userStore.isPremium() ? AI_QUOTA.PAID_DAILY : AI_QUOTA.FREE_DAILY,
    model: 'rule-v1',
    cached: false,
    generatedAt: now,
    expireAt: now + 90 * 24 * 3600 * 1000,
  };

  // 4. 写入缓存
  persistReport(report);

  logger.info('report generated', { id: report._id, ruleId: generated.ruleId });
  return report;
}

/**
 * 追问接口（v1.0 仅本地简单回复，v2.0 替换为 LLM）
 *
 * 检查配额 → 生成回答 → 增加计数
 */
export async function askFollowUp(
  reportId: string,
  question: string,
): Promise<{ ok: boolean; answer?: string; reason?: string }> {
  // 1. 检查配额
  const quota = getQuota();
  if (quota.used >= quota.total) {
    return { ok: false, reason: '今日追问已用完，明日 0 点重置' };
  }

  // 2. v1.0 本地简单回复（关键词触发）
  const answer = localFollowUp(question);

  // 3. 增加计数 + 持久化
  incrementFollowUp(reportId);

  return { ok: true, answer };
}

/**
 * 查询当日配额
 */
export function getQuota(): { used: number; total: number } {
  const key = `quota:ai:${getTodayKey()}`;
  const used = LocalStore.getItem<number>(key, 0) || 0;
  const total = userStore.isPremium() ? AI_QUOTA.PAID_DAILY : AI_QUOTA.FREE_DAILY;
  return { used, total };
}

/**
 * 追问历史（v1.0 仅保留内存中的临时列表，刷新即清空）
 */
const followUpHistory = new Map<string, AIFollowUpItem[]>();

/**
 * 获取追问历史
 */
export function getFollowUpHistory(reportId: string): AIFollowUpItem[] {
  return followUpHistory.get(reportId) || [];
}

/**
 * 本地追问（v1.0 占位实现）
 * v2.0 替换为 LLM 调用
 */
function localFollowUp(question: string): string {
  const q = (question || '').trim();
  if (!q) return '想问点什么都可以，比如"为什么这么说？"。';
  // 关键词模板
  const lower = q.toLowerCase();
  if (/(为什么|why|怎么)/.test(lower)) {
    return '主要根据你这次的时长和自评分数推测。如果是第一次有这种感觉，可以连续记录一周看看规律。';
  }
  if (/(怎么办|how|改善|解决)/.test(lower)) {
    return '先从小事开始：固定上床时间、关灯后不看手机、白噪音帮身体慢下来。';
  }
  if (/(失眠|睡不着|累|焦虑)/.test(lower)) {
    return '别硬撑，先起来喝杯温水，再回到床上做几次深呼吸。';
  }
  return '你的问题我先记下来了，下次可以试着更具体一点描述当时的感受。';
}

/**
 * 缓存命中检查
 */
function lookupCachedReport(sleepRecordId: string): AIDailyReport | null {
  const reports = LocalStore.getList<AIDailyReport>(STORAGE_KEYS.REPORTS_TODAY);
  const now = Date.now();
  const target = reports.find(
    (r) => r.sleepRecordId === sleepRecordId && r.expireAt > now,
  );
  if (!target) return null;
  // 24h 内复用
  if (now - target.generatedAt > CACHE_TTL) return null;
  return target;
}

/**
 * 写入缓存（每日一组 key）
 */
function persistReport(report: AIDailyReport): void {
  const reports = LocalStore.getList<AIDailyReport>(STORAGE_KEYS.REPORTS_TODAY);
  // 去重
  const filtered = reports.filter(
    (r) => r.sleepRecordId !== report.sleepRecordId,
  );
  filtered.unshift(report);
  LocalStore.setList(STORAGE_KEYS.REPORTS_TODAY, filtered.slice(0, 50));
}

/**
 * 递增追问计数（按 reportId）
 */
function incrementFollowUp(reportId: string): void {
  // 当日配额 +1
  const key = `quota:ai:${getTodayKey()}`;
  const cur = LocalStore.getItem<number>(key, 0) || 0;
  LocalStore.setItem(key, cur + 1);
  // 更新报告内的 followUpCount
  const reports = LocalStore.getList<AIDailyReport>(STORAGE_KEYS.REPORTS_TODAY);
  const idx = reports.findIndex((r) => r._id === reportId);
  if (idx >= 0) {
    reports[idx].followUpCount += 1;
    LocalStore.setList(STORAGE_KEYS.REPORTS_TODAY, reports);
  }
}