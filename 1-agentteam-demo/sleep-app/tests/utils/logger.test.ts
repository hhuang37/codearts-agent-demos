/**
 * logger.test.ts —— 统一日志测试
 */

import { Logger } from '../../miniprogram/utils/logger';

describe('utils/logger', () => {
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let debugSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
    debugSpy.mockRestore();
  });

  it('debug 应输出 console.debug 且格式为 JSON', () => {
    const l = new Logger('test');
    l.debug('msg', { a: 1 });
    expect(debugSpy).toHaveBeenCalledTimes(1);
    const line = debugSpy.mock.calls[0][0];
    const parsed = JSON.parse(line);
    expect(parsed.level).toBe('debug');
    expect(parsed.tag).toBe('test');
    expect(parsed.message).toBe('msg');
    expect(parsed.meta).toEqual({ a: 1 });
  });

  it('info 应输出 console.log', () => {
    const l = new Logger('svc');
    l.info('hello');
    expect(logSpy).toHaveBeenCalled();
    const parsed = JSON.parse(logSpy.mock.calls[0][0]);
    expect(parsed.level).toBe('info');
  });

  it('warn 应输出 console.warn', () => {
    const l = new Logger('svc');
    l.warn('w');
    expect(warnSpy).toHaveBeenCalled();
    const parsed = JSON.parse(warnSpy.mock.calls[0][0]);
    expect(parsed.level).toBe('warn');
  });

  it('error 应输出 console.error', () => {
    const l = new Logger('svc');
    l.error('e');
    expect(errorSpy).toHaveBeenCalled();
    const parsed = JSON.parse(errorSpy.mock.calls[0][0]);
    expect(parsed.level).toBe('error');
  });

  it('应包含 traceId', () => {
    const l = new Logger('svc');
    l.info('x');
    const parsed = JSON.parse(logSpy.mock.calls[0][0]);
    expect(parsed.traceId).toMatch(/^local_/);
  });

  it('应包含 timestamp（数字）', () => {
    const l = new Logger('svc');
    l.info('x');
    const parsed = JSON.parse(logSpy.mock.calls[0][0]);
    expect(typeof parsed.timestamp).toBe('number');
  });

  it('无 meta 时 meta 字段应为 undefined', () => {
    const l = new Logger('svc');
    l.info('no-meta');
    const parsed = JSON.parse(logSpy.mock.calls[0][0]);
    expect(parsed.meta).toBeUndefined();
  });
});