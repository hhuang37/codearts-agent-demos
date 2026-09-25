/**
 * 订阅消息授权服务（services/subscription.ts）
 *
 * 与 design.md §6.2.11 对齐
 *
 * v1.0 MVP：
 * - 请求订阅消息授权
 * - 检查订阅状态（基于本地缓存 + wx.getSetting）
 */

import { LocalStore } from '../utils/storage';
import { Logger } from '../utils/logger';

const logger = new Logger('subscription-service');

const SUB_KEY = 'subscribe:allowed_tmpl';

/**
 * 请求订阅消息授权
 */
export async function requestSubscribe(
  tmplIds: string[],
): Promise<{ accept: string[]; reject: string[] }> {
  if (typeof wx === 'undefined' || !wx.requestSubscribeMessage) {
    return { accept: [], reject: tmplIds };
  }
  try {
    const res = await new Promise<WechatMiniprogram.RequestSubscribeMessageSuccessCallbackResult>(
      (resolve, reject) => {
        wx.requestSubscribeMessage({
          tmplIds,
          success: resolve,
          fail: reject,
        });
      },
    );
    const accept: string[] = [];
    const reject: string[] = [];
    tmplIds.forEach((id) => {
      if (res[id] === 'accept') accept.push(id);
      else reject.push(id);
    });
    // 缓存已接受的 tmplId
    const allowed = LocalStore.getList<string>(SUB_KEY);
    accept.forEach((id) => {
      if (!allowed.includes(id)) allowed.push(id);
    });
    LocalStore.setList(SUB_KEY, allowed);
    return { accept, reject };
  } catch (err) {
    logger.warn('requestSubscribe failed', { error: String(err) });
    return { accept: [], reject: tmplIds };
  }
}

/**
 * 检查是否已授权指定模板
 * （v1.0 仅看本地缓存；云端可通过 wx.getSetting 二次校验）
 */
export function checkSubscribed(tmplId: string): boolean {
  return LocalStore.getList<string>(SUB_KEY).includes(tmplId);
}

/**
 * 清除订阅缓存（用于登出）
 */
export function clearCache(): void {
  LocalStore.removeItem(SUB_KEY);
}