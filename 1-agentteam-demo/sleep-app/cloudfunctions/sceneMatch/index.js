/**
 * 云函数：sceneMatch（接口骨架）
 *
 * 入参：
 *   - action: 'list' | 'prescription'
 *   - code: SceneCode
 *   - answers: Record<string, string>
 *   - openidHash: string
 *
 * v1.0 MVP：场景模板已在 services/scene-templates.ts 内置
 * v1.1 可替换为云端场景库 + 处方推荐模型
 */

exports.main = async (event /*, context */) => {
  const { action, code, answers, openidHash } = event || {};

  switch (action) {
    case 'list':
      return {
        code: 0,
        message: 'ok',
        data: {
          scenes: [
            { code: 'exam', name: '考试周', isFree: true },
            { code: 'overtime', name: '加班冲刺', isFree: true },
            { code: 'travel', name: '出差倒时差', isFree: true },
            { code: 'pregnancy', name: '孕中期', isFree: false },
            { code: 'menstrual', name: '经期调理', isFree: false },
          ],
        },
      };

    case 'prescription':
      return {
        code: 0,
        message: 'ok',
        data: {
          prescription: {
            schedule: [],
            soundscapeIds: [],
            actions: [],
            notices: [],
            // v1.0 占位：实际由前端 services/scene.ts 生成
          },
        },
      };

    default:
      return { code: -1, message: 'unknown action', data: null };
  }
};