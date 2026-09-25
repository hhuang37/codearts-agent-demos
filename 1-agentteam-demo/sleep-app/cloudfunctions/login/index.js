/**
 * 云函数：login（接口骨架）
 *
 * v1.0 实际由前端 services/auth.ts 完成（无云端）。
 * v1.1 可替换为云函数：换 openid、生成 openidHash 写入 user 集合。
 *
 * 当前为接口骨架，返回固定格式。
 */

exports.main = async (event /*, context */) => {
  // TODO: 调用 cloud.openapi.auth.code2Session 换 openid
  // TODO: 在 user 集合中 upsert 该 openid 对应的用户档案
  return {
    code: 0,
    message: 'success',
    data: {
      openidHash: `mock_${Date.now()}`,
      isNewUser: true,
      sessionToken: '',
    },
  };
};