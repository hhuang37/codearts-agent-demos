# 陪你睡个好觉（SleepBuddy）微信小程序

> 读懂 + 解法 + 陪伴 —— 一个克制的睡眠陪伴小程序

## 项目简介

SleepBuddy 是一款微信小程序 MVP（最小可行产品），面向有睡眠困扰、焦虑型失眠、孕产期女性等用户。核心理念：
- **读懂**：用一句话讲清楚昨晚发生了什么（不再用"睡眠评分 78 分"这种冷冰冰的术语）
- **解法**：针对具体场景（考试周 / 加班 / 出差 / 孕中期 / 经期）生成 7 天处方
- **陪伴**：晚安电台、智能闹钟、匿名匹配，在睡前默默陪你

## 技术栈

| 项目 | 选型 |
| --- | --- |
| 小程序框架 | 微信小程序原生 + TypeScript |
| 后端 | 微信云开发（v1.0 仅占位接口） |
| 状态管理 | 自实现轻量 Store（无第三方依赖） |
| 样式 | 原生 WXSS（CSS 变量集中管理） |
| 包管理 | 最小化依赖（仅 typescript 类型） |

## 目录结构

```
sleep-app/
├── miniprogram/                # 小程序主目录
│   ├── app.{ts,json,wxss}     # 全局入口
│   ├── components/             # 业务组件（11 个）
│   │   └── sb-{card,button,tag,rating,time-picker,
│   │        progress-bar,list-item,modal,skeleton,toast,subscribe-bar}/
│   ├── pages/                  # 页面（14 个）
│   │   ├── home/index          # 首页
│   │   ├── record/night/index  # 夜间记录
│   │   ├── record/noon/index   # 午睡记录
│   │   ├── report/index        # AI 报告
│   │   ├── scene/index         # 场景选择
│   │   ├── scene/questionnaire # 问卷
│   │   ├── scene/prescription  # 处方
│   │   ├── evening/index       # 晚安电台
│   │   ├── evening/sky         # 星空投送
│   │   ├── alarm/index         # 智能闹钟
│   │   ├── soundscape/index    # 白噪音
│   │   ├── profile/index       # 我的
│   │   ├── privacy/index       # 隐私保险箱
│   │   ├── login/index         # 登录
│   │   ├── buddy/index         # 睡眠搭子
│   │   └── datahub/index       # 数据中枢
│   ├── utils/                  # 工具模块（9 个）
│   │   ├── constants.ts        # 常量（存储键、错误码、配额）
│   │   ├── date.ts             # 日期/时间
│   │   ├── storage.ts          # LocalStore 单例 + TTL
│   │   ├── logger.ts           # 日志
│   │   ├── uuid.ts             # ID 生成
│   │   ├── validator.ts        # 校验
│   │   ├── eventbus.ts         # 事件总线
│   │   ├── string.ts           # 字符串处理
│   │   └── i18n/copy.ts        # 文案集中管理 + 合规词替换
│   ├── models/                 # 数据模型（10 个）
│   │   ├── user.ts
│   │   ├── sleep-record.ts
│   │   ├── ai-report.ts
│   │   ├── scene.ts
│   │   ├── prescription.ts
│   │   ├── soundscape.ts
│   │   ├── evening-card.ts
│   │   ├── buddy-match.ts
│   │   ├── data-source-auth.ts
│   │   └── privacy-request.ts
│   ├── stores/                 # 状态管理（4 个）
│   │   ├── user-store.ts
│   │   ├── record-store.ts
│   │   ├── audio-store.ts
│   │   └── ui-store.ts
│   ├── services/               # 业务服务（13 个）
│   │   ├── rule-engine.ts      # 30+ 条 AI 报告规则
│   │   ├── sleep.ts            # 睡眠记录
│   │   ├── aiReport.ts         # AI 报告生成 + 追问配额
│   │   ├── scene.ts            # 场景处方
│   │   ├── scene-templates.ts  # 内置 5 个场景模板
│   │   ├── soundscape.ts       # 白噪音播放
│   │   ├── soundscape-meta.ts  # 50 个白噪音元数据
│   │   ├── alarm.ts            # 智能闹钟
│   │   ├── evening.ts          # 晚安电台
│   │   ├── privacy.ts          # 隐私 / 导出 / 删除
│   │   ├── auth.ts             # 登录
│   │   ├── subscription.ts     # 订阅消息
│   │   ├── msgsec.ts           # 敏感词
│   │   ├── buddy.ts            # 早睡搭子匹配
│   │   └── datahub.ts          # 数据导入
│   └── sitemap.json
├── cloudfunctions/             # 云函数（6 个，仅接口骨架）
│   ├── login/
│   ├── sleepRecord/
│   ├── aiReport/
│   ├── sceneMatch/
│   ├── eveningCard/
│   └── privacyRequest/
├── package.json                # 仅声明 typescript 类型
├── tsconfig.json               # strict + paths 别名
├── project.config.json         # 微信开发者工具配置
├── project.private.config.json # 本地私有配置
├── .eslintrc.js
├── .prettierrc
├── .gitignore
└── README.md
```

## 本地开发

### 前置要求
- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) 最新版
- Node.js 14+（仅用于类型检查与云函数依赖安装）

### 启动步骤
1. 用微信开发者工具打开本目录（不是 `miniprogram` 子目录）
2. 工具会自动识别 `project.config.json`，加载 `miniprogram/` 作为小程序根目录
3. 关闭「ES6 转 ES5」/「增强编译」勾选（v1.0 不依赖编译）
4. 点击「编译」即可在模拟器中预览

### 类型检查
```bash
# 仅安装 TypeScript 类型（不安装任何第三方 npm 包）
npm install --save-dev typescript@4.7.4
npx tsc --noEmit
```

### 云函数（可选）
v1.0 所有云函数均为接口骨架，本地可正常运行。如果需要启用云端：
1. 在 `project.config.json` 中配置云开发环境 ID（`cloudfunctionRoot`）
2. 在云开发控制台为每个 cloudfunction 目录「上传并部署」
3. 替换前端对应服务的 `// TODO: 云函数调用` 注释（services/ 下的注释有标注）

## 功能矩阵（v1.0 MVP）

| 模块 | 功能 | 状态 |
| --- | --- | --- |
| FR-1 | 手动记录夜间睡眠 | ✅ |
| FR-2 | 午睡模式 10-60 分钟 + 兜底弹窗 | ✅ |
| FR-3 | AI 报告（本地规则引擎，30+ 规则） | ✅ |
| FR-3.4 | 追问 + 每日 3 次配额 | ✅ |
| FR-4 | 5 个场景处方（考试/加班/出差/孕中/经期） | ✅ |
| FR-4.6 | 订阅 21:00 晚安提醒 | ✅ |
| FR-5 | 晚安电台（每日卡片 + 记忆/任务 + 星空） | ✅ |
| FR-6 | 智能闹钟 + 浅睡启发式 + 节假日跳过 | ✅ |
| FR-7 | 50 个白噪音 + 分类/搜索/会员角标 | ✅ |
| FR-8 | 睡眠搭子（00:00-06:00 匹配窗口） | 占位 |
| FR-9 | 数据中枢（CSV 导入） | ✅ |
| FR-10 | 隐私保险箱 + 7 天软删 + 导出 | ✅ |

## 设计原则

- **数据主权**：用户的数据归用户，导出 / 删除一键完成（FR-10）
- **温柔克制的文案**：所有 UI 文案集中在 `utils/i18n/copy.ts`，像朋友讲话
- **合规词替换**：自动把"睡眠监测/评分/深度睡眠"替换为"睡眠记录/自我感受/深度休息"（design.md §10.5）
- **零第三方依赖**：不引入 lodash/moment 等，保持依赖最小化
- **离线优先**：所有核心功能不依赖网络；云函数为可选增强

## 核心约束

| 维度 | 取值 |
| --- | --- |
| 主色 | `#1A1B3A` |
| 背景 | `#F4F6FA` |
| 强调色 | `#FFD66B` |
| 卡片圆角 | 32rpx (16px) |
| 按钮圆角 | 48rpx (24px) |
| AI 追问配额 | 3 次 / 天（每日 0 点重置） |
| 午睡时长 | 10-60 分钟 |
| 闹钟窗口 | 默认 30 分钟 |
| 节假日跳过 | 内置 2026 年国家法定节假日表 |
| 白噪音免费档 | 30 个永久免费 + 20 个会员 |

## 测试账号

v1.0 MVP 不强制登录，进入应用即进入游客态，可使用全部功能。
如需体验云端同步，可在小程序内点击「我的 -> 微信一键登录」。

## License

仅用于 Demo，未经允许不得商用。