/**
 * 云函数：privacyRequest（接口骨架）
 *
 * 入参：
 *   - action: 'export' | 'requestDeletion' | 'cancelDeletion'
 *   - openidHash: string
 *
 * v1.0 MVP：本地即可完成（services/privacy.ts）
 * v1.1：导出走云端聚合（多设备合并），注销走 cloud.database 删除
 */

exports.main = async (event /*, context */) => {
  const { action, openidHash } = event || {};

  switch (action) {
    case 'export':
      // TODO: 聚合该 openidHash 下所有集合的数据，返回 CSV
      return {
        code: 0,
        message: 'ok',
        data: { csvUrl: '' },
      };

    case 'requestDeletion':
      // TODO: 在 privacyRequests 集合写入待处理记录，7 天后硬删
      return {
        code: 0,
        message: 'submitted',
        data: { effectiveAt: Date.now() + 7 * 24 * 3600 * 1000 },
      };

    case 'cancelDeletion':
      // TODO: 更新 privacyRequests 集合对应记录 status='cancelled'
      return { code: 0, message: 'cancelled' };

    default:
      return { code: -1, message: 'unknown action', data: null };
  }
};