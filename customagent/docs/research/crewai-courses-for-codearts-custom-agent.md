# CrewAI 课程调研与 CodeArts Deep Research Crew Demo

调研日期：2026-09-29。用户已选择 DeepLearning.AI 的 CrewAI 课程片段与截图中的 Deep Research Crew，作为独立的 CodeArts 自定义智能体 Demo。本文记录课程参考点、设计启发、架构映射和多 Agent 的收益/成本。

## 选定的非代码例子：Deep Research Crew

流程按顺序把一个主题变成带来源的报告：

**研究规划 → 网页研究 → 事实核查 → 报告撰写**

这和用户提供的课程截图一致。它既不是代码生成，也不需要把 Demo 包装成软件开发场景。各角色能产生可见的交付物：研究计划、证据清单、核查表、最终报告。因此可以当场观察交接有没有改善结果。

当前项目示例主题为“中国公共图书馆面向儿童的阅读服务有哪些常见做法，以及有哪些可量化的评估指标”。这只是演示输入，便于展示活动案例、效果证据和来源核验的区别；主智能体也接受其他研究主题。

## DeepLearning.AI 课程里去哪里看

目标课程：[Design, Develop, and Deploy Multi-Agent Systems with CrewAI](https://www.deeplearning.ai/courses/design-develop-and-deploy-multi-agent-systems-with-crewai)。课程官方大纲列有 4 个模块、38 节视频和多项代码练习。建议按下面顺序看：

| 模块与课程章节 | 官方大纲时长 | 与本 Demo 的关联 |
|---|---:|---|
| Module 1 — **Planning multi-agent systems** | 3 分钟 | 如何判断任务是否适合拆分、定义角色边界。 |
| Module 1 — **Building multi-agent systems** | 8 分钟 | 本 Demo 的直接起点；课程截图展示 Planner、Researcher、Fact Checker、Report Writer 的顺序流程。 |
| Module 1 — **Tactics for debugging, observing, optimizing** | 7 分钟 | 观察每个环节输入/输出，发现哪一阶段带来错误或返工。 |
| Module 2 — **Controlling agents with guardrails** | 10 分钟 | 加强证据、格式和范围约束。 |
| Module 2 — **Improving a deep research crew** | 13 分钟 | 直接参考如何逐步改进深度研究 Crew。 |
| Module 2 — **Using tools in agents** | 12 分钟；**Adding tools to your deep research crew** | 11 分钟 | 决定只有研究员和核查员需要网页工具，撰写员只综合已核验材料。 |
| Module 3 — **Collaboration** / **Communication** | 6 / 8 分钟 | 角色间如何传递精简且足够的上下文。 |
| Module 3 — **Building coordination patterns** | 13 分钟 | 选择并解释多 Agent 的协作模式。 |
| Module 3 — **Orchestrating agents with flows** | 20 分钟；**Building a deep research flow** | 23 分钟 | 更严格的流程编排、状态和交接。CodeArts 提示词映射不是 CrewAI Flow 引擎。 |
| Module 3 — **Tactics for building reliable systems** / **Monitoring and observability** | 14 / 9 分钟 | 失败处理、可观测性、运行后评估。 |

用户给的 Lesson URL 是 Module 1 中 **Building multi-agent systems**。如果 DeepLearning.AI 平台要求登录或订阅，可用上方课程公开页查看完整课程大纲，课内代码/视频以用户账号可访问内容为准。

## 从 CrewAI 设计到 CodeArts 自定义智能体

CrewAI 官方把 Crews 描述为拥有明确角色、工具和目标的团队；任务按声明的流程依赖执行。DeepLearning.AI 的课程说明还指出，多 Agent 把复杂任务拆成专门化角色，通过规划、协作和逐步控制让复杂流程更可管理。

本 Demo 的对应关系：

| CrewAI 图示角色 | CodeArts Agent | 工具与边界 | 交付 |
|---|---|---|---|
| Planner | deep-research-planner 主智能体 | 仅 task；规划并顺序调度 | 研究问题、范围、证据要求 |
| Researcher | internet-researcher 子智能体 | websearch、webfetch | 带 URL、来源类型和日期的证据 |
| Fact Checker | fact-checker 子智能体 | websearch、webfetch | 已支持/部分支持/冲突/未核实的核查表 |
| Report Writer | report-writer 子智能体 | 不配置外部工具 | 附来源、范围和限制的最终报告 |

CodeArts 文档支持本地项目级 Markdown 智能体，路径为 ./.codeartsdoer/agents；用 mode: primary/subagent 定义主/子智能体；task 工具供主智能体调用子智能体；websearch、webfetch 用于网页研究。提示词要求主智能体按“研究员 → 核查员 → 撰写员”顺序逐个调用。

**重要边界：**这是把 CrewAI 的角色与顺序任务理念映射到 CodeArts，不是实际 CrewAI 代码，也不享有 CrewAI Process.sequential / Flows 的运行时保证。交接逻辑是 CodeArts 主智能体提示词驱动的；Demo 必须检查实际调用、每步输出和最终来源。

## 为什么用多 Agent

1. **职责清楚，质量门可见。** 研究员只找资料并列证据；核查员独立检查重点主张；撰写员只综合核验结果。和一个角色同时搜索、判断、写作相比，阶段产物更容易检查和定位错误。
2. **角色可以拿到不同工具与上下文。** 网页工具交给研究和核查角色，撰写员不额外搜索；这样可减少职责混淆，也能限制每个 Agent 可做的事情。
3. **可按任务试不同模型。** CodeArts IDE 自定义智能体文档支持 model: provider/model-id；子智能体默认继承调用它的主智能体模型，也可以设置自己的模型。可以尝试让简单信息整理用响应快的模型、事实核查用更强的模型，再对质量/延迟/费用进行对照。
4. **长任务可以按阶段诊断。** 若报告缺证据，可以改研究员；若来源充分但数字核查错误，可以改核查员；若报告丢了限制，可以改撰写员，而不必盲目重写一个大 Prompt。

多 Agent **不会自动保证准确性，也不会自动减少 token**。每次交接都可能增加模型调用、角色指令和重复上下文；更强的隔离/复核也会带来延迟和费用。模型分流只有在便宜模型对简单任务依然足够好、上下文交接精简、返工没有变多时才可能节约总成本。使用相同研究主题分别运行单 Agent 与 Crew，记录总 token/账单、耗时、来源覆盖率、核验状态和返工次数，才能判断收益。

## 自定义模型与每个 Agent 的模型

IDE 自定义智能体配置的 model 字段格式为 inferhub-provider/<model-id>。官方 IDE 文档列出了系统模型 ID，并说明找不到模型或无权限时会回退到默认模型/继承主智能体模型。每个 Agent 可以指定不同模型，但前提是该模型对当前账户可用。

自定义模型 URL 不应直接写进 Agent 的 model 字段。华为云 CodeArts 的企业控制台文档支持登记自定义模型及其 API URL/API Key；本地 Agent 文件仍按 CodeArts 期望的模型标识引用它。是否对目标 IDE 账号、作用域和项目级 Agent 生效，应在实际租户中确认可选模型 ID 后再试。API Key 不放进 Demo 仓库。

## 主要参考来源

- DeepLearning.AI：[Design, Develop, and Deploy Multi-Agent Systems with CrewAI（课程大纲）](https://www.deeplearning.ai/courses/design-develop-and-deploy-multi-agent-systems-with-crewai)
- CrewAI 官方文档：[Crews](https://docs.crewai.com/en/concepts/crews)、[Agents](https://docs.crewai.com/en/concepts/agents)、[Tasks](https://docs.crewai.com/en/concepts/tasks)
- 华为云：[CodeArts IDE 自定义智能体](https://support.huaweicloud.com/usermanual-codeartsagent/codeartsagent_ug_0051.html)
- 华为云：[CodeArts 控制台配置企业自定义模型](https://support.huaweicloud.com/intl/zh-cn/usermanual-enterprise/codeartsagent_enterprise_0009.html)