/**
 * 跨页面事件总线（utils/eventbus.ts）
 *
 * 基于简单的订阅发布模式（不引入 mitt 以减少包体积）：
 * - on(event, handler)
 * - off(event, handler)
 * - emit(event, payload)
 *
 * 用于跨页面事件广播（订阅消息点击进入、白噪音续播等）
 */

type EventHandler = (payload?: unknown) => void;

class EventBusImpl {
  private handlers: Map<string, EventHandler[]> = new Map();

  /**
   * 订阅事件
   */
  on(event: string, handler: EventHandler): void {
    const list = this.handlers.get(event) || [];
    list.push(handler);
    this.handlers.set(event, list);
  }

  /**
   * 取消订阅
   */
  off(event: string, handler: EventHandler): void {
    const list = this.handlers.get(event) || [];
    this.handlers.set(
      event,
      list.filter((h) => h !== handler),
    );
  }

  /**
   * 发布事件
   */
  emit(event: string, payload?: unknown): void {
    const list = this.handlers.get(event);
    if (!list || list.length === 0) return;
    list.forEach((h) => {
      try {
        h(payload);
      } catch (err) {
        console.warn(`EventBus handler for ${event} threw`, err);
      }
    });
  }

  /**
   * 清空所有事件订阅
   */
  clear(): void {
    this.handlers.clear();
  }
}

/** 全局事件名常量 */
export const EVENT = {
  /** 订阅消息点击进入晚安电台 */
  SUBSCRIBE_OPEN_EVENING: 'subscribe:open_evening',
  /** 白噪音续播 */
  AUDIO_RESUME: 'audio:resume',
  /** 白噪音暂停 */
  AUDIO_PAUSE: 'audio:pause',
  /** 用户登录完成 */
  USER_LOGIN: 'user:login',
  /** 用户登出 */
  USER_LOGOUT: 'user:logout',
  /** 闹钟响铃 */
  ALARM_RING: 'alarm:ring',
  /** 闹钟关闭 */
  ALARM_CLOSE: 'alarm:close',
} as const;

export const EventBus = new EventBusImpl();