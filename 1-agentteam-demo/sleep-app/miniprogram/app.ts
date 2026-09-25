/**
 * 小程序入口逻辑（app.ts）
 *
 * 负责：
 * 1. 全局 globalData（用户信息、当前播放音频等）
 * 2. 应用生命周期（onLaunch、onShow、onHide、onError）
 * 3. 初始化本地存储、订阅消息授权态等
 */

import { LocalStore } from './utils/storage';
import { Logger } from './utils/logger';
import { getTodayKey, formatDate } from './utils/date';
import { COPYRIGHT } from './utils/constants';

const logger = new Logger('app');

interface AppGlobalData {
  /** 当前用户 openid（仅哈希） */
  openidHash: string;
  /** 当前用户昵称 */
  nickname: string;
  /** 订阅层级：free / monthly / yearly */
  subscriptionTier: 'free' | 'monthly' | 'yearly';
  /** 是否开启云端备份 */
  cloudBackupEnabled: boolean;
  /** 应用是否处于前台 */
  isActive: boolean;
  /** 当前播放的白噪音 ID */
  currentSoundscapeId: string;
  /** 当前会话 traceId（用于链路追踪） */
  traceId: string;
  /** 启动时间 */
  launchTime: number;
}

interface AppOption {
  globalData: AppGlobalData;
}

App({
  globalData: {
    openidHash: '',
    nickname: '朋友',
    subscriptionTier: 'free',
    cloudBackupEnabled: true,
    isActive: true,
    currentSoundscapeId: '',
    traceId: '',
    launchTime: 0,
  } as AppGlobalData,

  /**
   * 小程序初始化
   * 加载本地缓存、初始化全局 traceId、检查隐私政策版本
   */
  onLaunch() {
    const g = (this as unknown as AppOption).globalData;
    g.launchTime = Date.now();
    // 生成每次启动的 traceId（用于日志串联）
    g.traceId = `t_${g.launchTime}_${Math.random().toString(36).slice(2, 8)}`;

    logger.info('onLaunch', { traceId: g.traceId });

    // 1. 加载本地用户信息（不阻塞 UI）
    this.bootstrapUser();

    // 2. 清理过期 AI 追问配额（跨天重置）
    this.resetDailyQuotaIfNeeded();

    // 3. 记录启动事件（可选埋点）
    this.trackLaunch();
  },

  /**
   * 小程序从后台进入前台
   */
  onShow() {
    (this as unknown as AppOption).globalData.isActive = true;
    logger.info('onShow');
  },

  /**
   * 小程序从前台进入后台
   */
  onHide() {
    (this as unknown as AppOption).globalData.isActive = false;
    logger.info('onHide');
  },

  /**
   * 小程序发生脚本错误或 API 调用报错时触发
   */
  onError(error: string) {
    logger.error('onError', { error });
    // 实际项目中上报 Sentry
  },

  /**
   * 初始化用户信息（从 LocalStore 加载）
   */
  bootstrapUser() {
    try {
      const cachedUser = LocalStore.getItem('user:profile');
      if (cachedUser) {
        const g = (this as unknown as AppOption).globalData;
        g.openidHash = cachedUser._id || '';
        g.nickname = cachedUser.nickname || '朋友';
        g.subscriptionTier = cachedUser.subscriptionTier || 'free';
        g.cloudBackupEnabled =
          typeof cachedUser.cloudBackupEnabled === 'boolean'
            ? cachedUser.cloudBackupEnabled
            : true;
        logger.info('bootstrapUser success', {
          subscriptionTier: g.subscriptionTier,
        });
      }
    } catch (err) {
      logger.warn('bootstrapUser failed', { error: String(err) });
    }
  },

  /**
   * 检查日期变更，重置每日配额
   * 跨天时清空 quota:ai:YYYY-MM-DD 计数
   */
  resetDailyQuotaIfNeeded() {
    try {
      const todayKey = getTodayKey();
      // 仅保留当日配额键
      const validKey = `quota:ai:${todayKey}`;
      const lastKey = LocalStore.getLastQuotaKey();
      if (lastKey && lastKey !== validKey) {
        // 删除过期 key（仅作示意，避免膨胀）
        LocalStore.removeItem(lastKey);
        LocalStore.setLastQuotaKey(validKey);
      } else if (!lastKey) {
        LocalStore.setLastQuotaKey(validKey);
      }
    } catch (err) {
      logger.warn('resetDailyQuotaIfNeeded failed', { error: String(err) });
    }
  },

  /**
   * 启动事件埋点（v1.0 仅记录日志）
   */
  trackLaunch() {
    const g = (this as unknown as AppOption).globalData;
    logger.info('launch_event', {
      traceId: g.traceId,
      date: formatDate(new Date(), 'YYYY-MM-DD'),
      appVersion: COPYRIGHT.version,
    });
  },
});