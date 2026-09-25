/**
 * 云函数：eveningCard（接口骨架）
 *
 * 入参：
 *   - action: 'getToday' | 'saveMemory' | 'saveTask' | 'subscribe'
 *   - openidHash: string
 *   - payload: { memory?, task? }
 *
 * v1.0 MVP：本地生成 + 本地保存即可（design.md §8.4）
 */

exports.main = async (event /*, context */) => {
  const { action, openidHash, payload } = event || {};

  switch (action) {
    case 'getToday':
      return {
        code: 0,
        message: 'ok',
        data: {
          card: {
            title: '今晚的月亮很亮',
            subtitle: '去做一件简单的小事吧',
            weatherHint: '多云',
            moonPhase: '上弦月',
          },
        },
      };

    case 'saveMemory':
      // TODO: 写入 cloud.database 的 eveningMemories 集合
      return { code: 0, message: 'saved' };

    case 'saveTask':
      // TODO: 写入 cloud.database 的 eveningTasks 集合
      return { code: 0, message: 'saved' };

    case 'subscribe':
      // TODO: 调用 cloud.openapi.subscribeMessage.send 投递订阅消息
      return { code: 0, message: 'subscribed' };

    default:
      return { code: -1, message: 'unknown action', data: null };
  }
};