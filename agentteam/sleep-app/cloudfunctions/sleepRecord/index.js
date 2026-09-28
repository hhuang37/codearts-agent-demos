/**
 * 云函数：sleepRecord（接口骨架）
 *
 * 入参：
 *   - action: 'create' | 'list' | 'softDelete' | 'sync'
 *   - record: SleepRecord
 *   - openidHash: string
 *
 * v1.0 MVP：前端 LocalStore 即可，云端为可选备份
 */

exports.main = async (event /*, context */) => {
  const { action, record, openidHash } = event || {};

  // TODO: 连接 cloud.database() 中的 sleepRecords 集合
  // TODO: 根据 action 分发到 create / list / softDelete / sync

  switch (action) {
    case 'create':
      // TODO: await db.collection('sleepRecords').add({ ...record, openidHash })
      return { code: 0, message: 'created', data: { id: record?._id || `rec_${Date.now()}` } };

    case 'list':
      // TODO: await db.collection('sleepRecords').where({ openidHash }).get()
      return { code: 0, message: 'ok', data: { records: [] } };

    case 'softDelete':
      // TODO: await db.collection('sleepRecords').doc(record._id).update({ deletedAt: Date.now() })
      return { code: 0, message: 'deleted' };

    case 'sync':
      // 批量同步近 7 天
      return { code: 0, message: 'synced', data: { syncedCount: 0 } };

    default:
      return { code: -1, message: 'unknown action', data: null };
  }
};