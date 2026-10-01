# CodeArts Agent Demos

[English](README.md) | 简体中文

Hands-on demos of CodeArts Agent features — step-by-step guides and screen recordings.

CodeArts Agent 各特性的实操 demo 合集：分步图文指南 + 录屏。

## Demos

| 特性 | 说明 | 对照结果 | 指南 | 视频 | 状态 |
| --- | --- | --- | --- | --- | --- |
| Codebase | 代码索引（Cloud Index）开关对源码定位问答的影响 | 关闭 10 min 46 s → 开启 1 min 41 s（约 6.4x） | [中文](codebase/codebase_readme.zh-CN.md) | [7 分 13 秒](https://github.com/hhuang37/codearts-agent-demos/releases/download/v0.1.0/codebases_demo.mp4) | 已完成 |
| Agent Team | 多智能体协作：Leader 拆解分派，Teammate 并行执行同一条需求 | 一条需求并行产出电商首页与商品、架构文档 | [中文](agentteam/agentteam_readme.zh-CN.md) | [4 分 17 秒](https://github.com/hhuang37/codearts-agent-demos/releases/download/v0.3.0/agentteams-demo.mp4) | 已完成 |
| SDD | 规范驱动开发：一句业务需求经 `/sdd-new` → `/sdd-design` → `/sdd-tasks` → `/sdd-apply` 变成 spec、设计、任务和可验证的页面 | 单个静态页面上完成两轮增量需求（工单登记 + 唯一工单编号） | [中文](sdd/sdd_readme.zh-CN.md) | [11 分 09 秒](https://github.com/hhuang37/codearts-agent-demos/releases/download/v0.2.0/sdd_demo.mp4) | 已完成 |
| AI 前端开发 | AI 辅助前端开发：浏览器里直接预览页面效果，按所见迭代修改代码 | 待跑 | 待补 | 待录制 | 计划中 |
| 自定义智能体 | 主/子智能体协作：主智能体规划并依次调度联网研究、事实核查、报告撰写三个子智能体 | 一道事实题跑通四角色流水线，产出含 Summary/Findings/Insights/Citations 与来源链接的短报告 | [中文](customagent/docs/deep-research-custom-agent-demo.zh-CN.md) | [2 分 37 秒](https://github.com/hhuang37/codearts-agent-demos/releases/download/v0.4.0/customagent-demo.mp4) | 已完成 |
| CLI Serve | `codearts serve` / `codearts attach` 远程会话接力：主机1跑日志分析任务并把会话暴露在本机端口，主机2在另一终端接续同一会话 | 第二终端沿用原会话上下文，完成后续追问并产出整理结果 | [中文](serveattach/cli_serve_attach.zh-CN.md) | [3 分 52 秒](https://github.com/hhuang37/codearts-agent-demos/releases/download/v0.5.0/cli_serve_demo.mp4) | 已完成 |
| 经验固化 Skill | 把华为开发经验固化成 skill，用于代码异常分析 | 待跑 | 待补 | 待录制 | 计划中 |
| 华为云端到端 | 端到端使用华为云产品开发的最佳实践 | 待跑 | 待补 | 待录制 | 计划中 |

## 说明

本仓内容为个人实践记录，非华为云官方文档；转载请注明出处。
