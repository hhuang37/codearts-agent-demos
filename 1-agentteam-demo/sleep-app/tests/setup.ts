/**
 * Jest 全局 mock（tests/setup.ts）
 *
 * 在每个测试文件运行前初始化微信小程序 API mock，避免 wx.* 报错。
 */

const noop = () => {};

// ===== 简易内存存储（替代 wx.storage） =====
class MemoryStorage {
  private store: Record<string, string> = {};

  setStorageSync(key: string, value: string) {
    this.store[key] = value;
  }
  getStorageSync(key: string): string | undefined {
    return this.store[key];
  }
  removeStorageSync(key: string) {
    delete this.store[key];
  }
  getStorageInfoSync() {
    return {
      keys: Object.keys(this.store),
      currentSize: 0,
      limitSize: 10240,
    };
  }
  clear() {
    this.store = {};
  }
}

const storage = new MemoryStorage();

// ===== 微信全局对象 =====
const wxMock = {
  // 存储
  setStorageSync: (k: string, v: string) => storage.setStorageSync(k, v),
  getStorageSync: (k: string) => storage.getStorageSync(k),
  removeStorageSync: (k: string) => storage.removeStorageSync(k),
  getStorageInfoSync: () => storage.getStorageInfoSync(),

  // 用户反馈
  showToast: noop,
  showModal: noop,
  showLoading: noop,
  hideLoading: noop,

  // 登录/订阅
  login: (opts: any) => opts.success && opts.success({ code: 'mock_code_' + Date.now() }),
  checkSession: (opts: any) => opts.success && opts.success({ errMsg: '' }),
  requestSubscribeMessage: (opts: any) => {
    const res: Record<string, string> = {};
    (opts.tmplIds || []).forEach((id: string) => (res[id] = 'accept'));
    opts.success && opts.success(res);
  },

  // 音频
  getBackgroundAudioManager: () => ({
    title: '',
    src: '',
    onPlay: noop,
    onPause: noop,
    onStop: noop,
    onEnded: noop,
    play: noop,
    pause: noop,
    stop: noop,
  }),

  // 云开发
  cloud: {
    callFunction: ({ success, fail }: any) => {
      const cb = success || fail;
      cb && cb({ result: { code: 0, data: {} }, errMsg: 'ok' });
    },
  },

  // 网络
  request: ({ success, fail }: any) => {
    const cb = success || fail;
    cb && cb({ data: {}, statusCode: 200 });
  },

  // 系统信息
  getSystemInfoSync: () => ({
    platform: 'devtools',
    system: 'mock',
    version: '1.0.0',
    screenWidth: 375,
    screenHeight: 667,
  }),

  // 其它
  reportMonitor: noop,
};

// 将 mock 挂到 globalThis 上
(globalThis as any).wx = wxMock;
(globalThis as any).storage = storage;
(globalThis as any).WechatMiniprogram = {
  LoginSuccessCallbackResult: class {},
  RequestSubscribeMessageSuccessCallbackResult: class {},
};

// 每个测试用例前清空存储，避免污染
beforeEach(() => {
  storage.clear();
});