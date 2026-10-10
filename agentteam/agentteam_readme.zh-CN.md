# Agent Team 多智能体协作演示

> 语言：**中文** ｜ [English](agentteam_readme.md)
>
> 视频版（4 分 17 秒，1152×720，约 58 MB，点击为下载）：
> [agentteams-demo.mp4](https://github.com/hhuang37/codearts-agent-demos/releases/download/v0.3.0/agentteams-demo.mp4)

## 这个 Demo 要展示什么

- **融入华为开发方法论**：AgentTeam 是华为预置的多智能体开发模式，融入华为在软件开发实践中沉淀的方法论，可帮助团队完成较复杂的开发任务。
- **自动拆解并协同开发**：本 Demo 以电商网站开发为例，展示 AgentTeam 如何自动将开发工作拆解为多个 subtask，并由独立的 subagent 分别完成，整个过程由 AgentTeam 自动编排。

## Subagent 开发范式的优势

![聚焦的小任务有助于提升大语言模型表现的稳定性](小任务更适合大语言模型.png)

将复杂开发拆分为目标明确、范围聚焦的小任务，再交由独立的 subagent 分别处理，有助于模型更专注地完成各项工作，让结果更稳定、可预期。这正是 AgentTeam 采用 subagent 协作方式的价值之一。

> “在我看来，构建 AI 产品时最神奇的时刻，往往发生在真正接近模型能力边界的时候。”
>
> —— Usama Bin Shafqat，NotebookLM AI 工程师，[访谈片段（01:10:07）](https://www.youtube.com/watch?v=v1mOIdH9q7k&t=4207s)

每个 subagent 专注于目标清晰的小任务，让 AgentTeam 能够持续尝试，进一步探索模型能力的边界。

## 操作步骤

1. **选择模式**：在 CodeArts IDE 中切换到 **Space**，选择 **Coding**，再在输入框下方选择 **AgentTeam**。

   ![CodeArts Agent Space with AgentTeam selected](image.png)

2. **发送需求**：输入一个包含多项工作的需求，例如：

   ```text
   Build an e-commerce website homepage with a rich variety of product categories in a clean, premium style. Also write the product documentation and architecture documentation. All output must be entirely in English.
   ```

   ![Submitted English demo request and completed run](image-1.png)

3. **查看进度**：切换到可视化视图查看任务拆分，在任务列表或任务概览中查看执行进度。

   ![Agent Team task graph showing parallel roles](image-2.png)

4. **检查结果**：在 IDE 中查看生成代码和页面预览，按需接受或撤销修改。

   ![Generated homepage source in the IDE](image-3.png)

   ![Generated e-commerce homepage](image-4.png)

   ![Generated product catalog](image-5.png)

## 参考

[多任务并行（Agent Team）用户指南](https://support.huaweicloud.com/usermanual-codeartsagent/codeartsagent_ug_0022.html)
