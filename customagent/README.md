# Deep Research Crew：CodeArts 自定义智能体 Demo

这是一个独立的 CodeArts Agent demo，借鉴 DeepLearning.AI 的 CrewAI 深度研究流程：**研究规划 → 网页研究 → 事实核查 → 报告撰写**。它不依赖 CrewAI Python 框架，也不属于 sdd 示例。

## 目录

- **docs/deep-research-custom-agent-demo.zh-CN.md**：demo 中文分步指南——在 IDE 界面逐字段创建 4 个智能体并试跑（看 demo 从这里开始）。
- **docs/deep-research-custom-agent-demo.md**：English step-by-step demo guide — create the four agents in the IDE and run the demo (start here).
- **.codeartsdoer/agents/qa-main.md**：最小演示主智能体，自身不联网，只开 task 工具。
- **.codeartsdoer/agents/web-searcher.md**：最小演示子智能体，只开 websearch/webfetch。
- **.codeartsdoer/agents/deep-research-planner.md**：进阶主智能体，规划并按顺序调度子智能体。
- **.codeartsdoer/agents/internet-researcher.md**：搜索网页、整理带来源的研究证据。
- **.codeartsdoer/agents/fact-checker.md**：交叉核对报告中的关键事实。
- **.codeartsdoer/agents/report-writer.md**：只使用已核验材料撰写最终报告。
- **examples/qa-demo-question.md**：最小联动的试跑问题（2026年亚运会女子100米冠军）。
- **examples/demo-topic.md**：四角色深度研究的试跑主题。
- **docs/main-sub-agent-config.md**：主/子协作配置完整指南——原理、IDE 界面配置（含实测截图）、本地 Markdown 配置、命令行测试（可选）、失败排查、验证记录（先读这篇）。
- **docs/demo-design.md**：深度研究 demo 的脚本、角色映射和验收要点。
- **images/deep-research-workflow.svg / .png**：英文版原创架构图。
- **scripts/render_deep_research_workflow.py**：重新生成图的源脚本。
- **docs/en-demo-design.md**：英文版界面配置设计——4 个智能体的英文名称/描述/提示词逐字段粘贴值、MCP 与工具选择、试跑与验收（做英文 demo 用这篇）。
- **docs/research/crewai-courses-for-codearts-custom-agent.md**：课程调研与多智能体价值说明。

## 在 CodeArts 里试跑

**最小联动（2 个智能体，推荐先跑这个）**：

1. 在 CodeArts IDE 中打开本目录 customagent 作为项目根目录，等待项目级智能体生效。
2. 聊天输入框切换到主智能体 **qa-main**。
3. 发送 examples/qa-demo-question.md 里的问题："查询2026年亚运会女子100米冠军是谁？"
4. 观察 qa-main 通过 task 调用 web-searcher，最终答案带来源链接和查询日期。

**深度研究（4 个智能体）**：

1. 在 CodeArts IDE 中打开本目录 customagent 作为项目根目录。
2. 确认项目级智能体路径为 .codeartsdoer/agents/，等待配置生效；若列表没有更新，在智能体设置中刷新。
3. 在聊天输入框切换到项目级主智能体 **deep-research-planner**。
4. 复制 examples/demo-topic.md 中的试跑请求并发送。
5. 观察主智能体是否依次调用 internet-researcher、fact-checker 和 report-writer，并检查最终报告是否保留来源与不确定项。

CodeArts 文档说明项目级智能体使用 .codeartsdoer/agents 路径；Markdown 文件名需与 frontmatter 的 name 一致。子智能体不单独显示在智能体选择列表中，由主智能体调用。

![Deep Research workflow for CodeArts custom agents](images/deep-research-workflow.png)

[Editable SVG source](images/deep-research-workflow.svg)

## 这次 Demo 要展示什么

- 单个角色只负责一种工作，产出格式可检查。
- 研究员可以联网，事实核查员可以再次查证；报告撰写员不额外搜集新事实。
- 主智能体明确按顺序传递“研究计划 → 证据 → 核验结论”。
- 报告区分已支持、部分支持、冲突和未核实的主张，并附来源链接。

## 模型配置与成本

当前配置默认不写 model，让子智能体继承主智能体模型，降低首次运行的配置变量。若要试不同模型，可在单个智能体的 YAML Frontmatter 增加 model: inferhub-provider/模型ID，例如 CodeArts IDE 文档中的 inferhub-provider/GLM-5.2。请改成当前账号可用且有权限的模型 ID。CodeArts 文档说明，模型不存在或无权限时会回退到默认模型/继承主智能体模型，因此试验时先确认界面实际使用的模型。

模型路由的价值是让不同难度的任务尝试匹配不同模型；这**不等于**多 Agent 一定省 token 或省钱。多轮调用及重复上下文也会增加消耗。应使用同一主题对比单 Agent 和多 Agent 的总 token、费用、耗时、事实核查覆盖率和返工情况。

若使用企业控制台登记的自定义模型，Agent 文件的 model 字段仍是模型标识，不是直接写服务 URL 的位置。可在 CodeArts 控制台配置自定义模型 URL/API Key，再确认 IDE 中可选到的模型 ID，并用该 ID 验证本地 Agent 配置。不要把 API Key 写入本项目文件。

## 设计边界

这是 CodeArts 自定义智能体对 CrewAI 思路的轻量映射，并非 CrewAI 的 Process.sequential 或 Flow 执行引擎。顺序由主智能体的提示词和 task 调用来组织，运行时仍要确认它确实执行了各阶段。联网检索结果不保证完整或正确；事实核查能提高可检查性，但不能替代人工判断。报告仅供研究参考，不执行预订、付款、发布等外部操作。

## 参考

- [DeepLearning.AI：Design, Develop, and Deploy Multi-Agent Systems with CrewAI](https://www.deeplearning.ai/courses/design-develop-and-deploy-multi-agent-systems-with-crewai)
- [CrewAI：Crews](https://docs.crewai.com/en/concepts/crews)
- [华为云码道：自定义智能体（IDE）](https://support.huaweicloud.com/usermanual-codeartsagent/codeartsagent_ug_0051.html)
- [华为云码道：配置企业自定义模型](https://support.huaweicloud.com/intl/zh-cn/usermanual-enterprise/codeartsagent_enterprise_0009.html)