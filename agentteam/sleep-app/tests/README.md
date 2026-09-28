# 单元测试说明

## 概述

本目录包含"陪你睡个好觉（SleepBuddy）"微信小程序的核心业务逻辑单元测试。

## 测试范围

| 层级 | 文件 | 覆盖模块 |
|------|------|----------|
| **P0** | `tests/utils/*.test.ts` | validator、date、storage、uuid、string、i18n、logger |
| **P0** | `tests/services/rule-engine.test.ts` | AI 报告规则引擎（30+ 条规则） |
| **P0** | `tests/services/scene.test.ts` | 睡眠处方场景匹配 |
| **P0** | `tests/services/alarm.test.ts` | 智能闹钟浅睡启发式 |
| **P0** | `tests/services/sleep.test.ts` | 睡眠记录 CRUD + CSV 导出 |
| **P0** | `tests/services/privacy.test.ts` | 隐私导出 + 注销流程 |
| **P1** | `tests/services/auth.test.ts` | 登录态管理 |
| **P1** | `tests/services/subscription.test.ts` | 订阅消息 |
| **P1** | `tests/services/msgsec.test.ts` | 本地敏感词 |

## 不测试的内容

- 小程序页面（`miniprogram/pages/**`）：依赖运行时 Page 上下文，无法 Jest 单测
- 小程序组件（`miniprogram/components/**`）：依赖 Component 上下文
- 云函数实现（`cloudfunctions/**`）：依赖云开发环境，需在云端运行

## 运行测试

```bash
# 安装依赖
npm install

# 运行全部测试
npm test

# 监听模式
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

## Mock 策略

`tests/setup.ts` 提供完整的 `wx` API mock：

| Mock API | 行为 |
|----------|------|
| `wx.setStorageSync / getStorageSync` | 内存对象（Map） |
| `wx.showToast / showModal` | noop |
| `wx.login` | 返回 mock code |
| `wx.requestSubscribeMessage` | 全部返回 accept |
| `wx.getBackgroundAudioManager` | 返回空对象 |
| `wx.cloud.callFunction` | 返回 `{ code: 0, data: {} }` |
| `wx.getSystemInfoSync` | 返回 devtools 信息 |

每个测试用例前自动清空内存存储。

## 测试覆盖率目标

- 分支覆盖率 ≥ 60%
- 函数覆盖率 ≥ 75%
- 行/语句覆盖率 ≥ 80%

## 添加新测试

1. 在对应模块下创建 `*.test.ts`
2. 引入被测模块：`import { xxx } from '../../miniprogram/...'`
3. 使用 `describe` / `it` / `expect` 编写用例
4. 不需要额外的 mock（全局 wx API 已在 setup.ts 处理）