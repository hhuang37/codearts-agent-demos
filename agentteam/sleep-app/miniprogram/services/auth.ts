/**
 * 鉴权服务（services/auth.ts）
 *
 * 与 design.md §6.2.10 对齐
 *
 * v1.0 MVP：
 * - 微信登录（wx.login → 云函数换取 openid）
 * - 检查登录态
 * - 登出
 *
 * 云函数 login 占位，本地仅维护哈希身份
 */

import { userStore } from '../stores/user-store';
import { Logger } from '../utils/logger';
import { hashString } from '../utils/uuid';

const logger = new Logger('auth-service');

/**
 * 微信登录（v1.0 本地生成 openidHash 占位）
 */
export async function login(): Promise<boolean> {
  try {
    // 1. 调用 wx.login 拿 code
    const loginRes = await new Promise<WechatMiniprogram.LoginSuccessCallbackResult>(
      (resolve, reject) => {
        wx.login({
          success: resolve,
          fail: reject,
        });
      },
    );
    // 2. 真实项目：调用云函数换取 openid
    //    v1.0 占位：直接用 code 做哈希
    const openidHash = hashString(loginRes.code || 'anonymous');
    // 3. 更新 user store
    const user = userStore.getUser();
    user._id = openidHash;
    user.openid = loginRes.code; // v1.0 仅作占位
    userStore.setUser(user);
    logger.info('login success', { openidHash });
    return true;
  } catch (err) {
    logger.warn('login failed', { error: String(err) });
    return false;
  }
}

/**
 * 检查登录态
 */
export function checkSession(): boolean {
  const user = userStore.getUser();
  return !!user._id && !user._id.startsWith('guest_');
}

/**
 * 登出
 */
export function logout(): void {
  userStore.clear();
  logger.info('logged out');
}