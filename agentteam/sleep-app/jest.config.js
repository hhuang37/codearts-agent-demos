/**
 * Jest 配置（jest.config.js）
 *
 * 测试 miniprogram/ 下的纯业务逻辑（utils/services/models/stores）。
 * 不测试页面（pages/）、组件（components/）和小程序入口（app.ts）。
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests', '<rootDir>/miniprogram'],
  // 测试匹配：tests/**/*.test.ts
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  // 模块路径：miniprogram/ 下的代码可省略前缀
  modulePaths: ['<rootDir>/miniprogram'],
  // 全局 mock 初始化
  setupFilesAfterEach: [],
  setupFiles: ['<rootDir>/tests/setup.ts'],
  // 转换 ts-jest 配置
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: {
          // 复用项目根目录的 tsconfig，关闭 lib 校验以兼容 Node 环境
          target: 'ES2020',
          module: 'commonjs',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          strict: false,
          skipLibCheck: true,
          resolveJsonModule: true,
          isolatedModules: true,
          // 不解析 types（小程序 .d.ts 与 Node 环境冲突）
          types: [],
        },
        // 微信小程序 API 全局变量（wx/WechatMiniprogram）通过 setup.ts mock
        diagnostics: {
          ignoreCodes: [151001, 2304, 2307, 2339, 2345, 2349, 2552, 2554, 2555, 2571, 7016],
        },
      },
    ],
  },
  // 不收集小程序特有代码的覆盖率
  collectCoverageFrom: [
    'miniprogram/utils/**/*.ts',
    'miniprogram/services/**/*.ts',
    'miniprogram/models/**/*.ts',
    'miniprogram/stores/**/*.ts',
    '!miniprogram/**/*.d.ts',
    '!miniprogram/utils/constants.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 75,
      lines: 80,
      statements: 80,
    },
  },
  // 性能：仅串行跑测试，避免 wx mock 状态污染
  maxWorkers: 1,
  testTimeout: 10000,
  verbose: true,
};