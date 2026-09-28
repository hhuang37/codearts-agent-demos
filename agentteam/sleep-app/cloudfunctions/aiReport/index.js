/**
 * 云函数：aiReport（接口骨架）
 *
 * 入参：
 *   - action: 'generate' | 'followup'
 *   - record: SleepRecord
 *   - question: string（仅 followup）
 *   - openidHash: string
 *
 * v1.0 MVP：本地规则引擎（services/rule-engine.ts）已实现完整逻辑
 * v1.1 可替换为云端 LLM 推理（design.md §8.1）
 */

exports.main = async (event /*, context */) => {
  const { action, record, question, openidHash } = event || {};

  // TODO: 调用云端 LLM（豆包 / DeepSeek）生成三段式报告
  // TODO: 配额检查（每日 3 次追问，从 quota:ai:YYYY-MM-DD 计数）

  switch (action) {
    case 'generate':
      return {
        code: 0,
        message: 'ok',
        data: {
          current: '（云端 LLM 占位：建议结合近 7 天平均时长）',
          cause: '（云端 LLM 占位：可能与今日运动量或咖啡因摄入相关）',
          suggestion: '（云端 LLM 占位：明天同一时间再小睡一会儿试试）',
          generatedAt: Date.now(),
        },
      };

    case 'followup':
      return {
        code: 0,
        message: 'ok',
        data: {
          answer: '（云端 LLM 占位：根据你说的，我们再聊聊）',
          quotaRemaining: 2,
        },
      };

    default:
      return { code: -1, message: 'unknown action', data: null };
  }
};