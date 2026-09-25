/**
 * 统一日志（utils/logger.ts）
 *
 * 提供分级日志（debug/info/warn/error），统一 JSON 格式，含 traceId。
 *
 * 注意：v1.0 阶段仅 console 输出，云函数日志通过 wx.reportMonitor 上报。
 */

import { getTodayKey } from './date';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: number;
  level: LogLevel;
  traceId: string;
  tag: string;
  message: string;
  meta?: Record<string, unknown>;
}

const TRACE_ID = `local_${getTodayKey()}_${Math.random().toString(36).slice(2, 8)}`;

class LoggerImpl {
  private tag: string;

  constructor(tag: string) {
    this.tag = tag;
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.output('debug', message, meta);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.output('info', message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.output('warn', message, meta);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.output('error', message, meta);
    // 真实项目中调用 wx.reportMonitor 上报到 Sentry
  }

  /**
   * 输出日志（JSON 格式）
   */
  private output(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      traceId: TRACE_ID,
      tag: this.tag,
      message,
      meta,
    };
    const line = JSON.stringify(entry);
    switch (level) {
      case 'debug':
        // eslint-disable-next-line no-console
        console.debug(line);
        break;
      case 'info':
        // eslint-disable-next-line no-console
        console.log(line);
        break;
      case 'warn':
        // eslint-disable-next-line no-console
        console.warn(line);
        break;
      case 'error':
        // eslint-disable-next-line no-console
        console.error(line);
        break;
    }
  }
}

/**
 * 创建带标签的 logger
 */
export const Logger = LoggerImpl;