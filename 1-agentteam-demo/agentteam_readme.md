# CodeArts Agent Team: multi-agent collaboration walkthrough

> Language: **English** | [简体中文](agentteam_readme.zh-CN.md)
>
> Status: in progress. Prep checklist, prompts, and record tables are in place; screenshots and numbers will be filled in after the run.

Agent Team is the multi-agent engine inside CodeArts Agent Space: send one requirement, a Leader plans and dispatches the subtasks, and several Teammates work in parallel like a real dev team, from requirement analysis to code delivery. Shipped in September 2026; the official claim is no manual intervention end to end.

If someone asks "isn't this just subagents running in parallel", answer with this comparison from the official docs:

| Dimension | Subagent | Agent Team |
| --- | --- | --- |
| Context | Destroyed when the single run ends | Persistent; keeps conversation and memory across tasks |
| Communication | Final result only, back to the parent | Two-way, real time |
| Task management | Statically assigned by the parent | Shared task pool; Teammates self-claim tasks, Leader reschedules |
| Lifecycle | Dies with the task | Dynamically formed; members added or removed as needed |
| Failure handling | Can only bubble errors up | Leader reassigns or backfills when a member fails |

## 1. Preparation

1. Update the CodeArts IDE to the latest version and sign in.
2. Open this folder (1-agentteam-demo) as the workspace.
3. Switch to Space mode, open the Code Development tab, and switch the mode dropdown from Agent to AgentTeam.
4. Avoid the Deepseek V3.1 model; the official docs list it as unsupported for Agent Team.
5. Enable auto-approval for conversation/agents in global settings. Without it, every sensitive action from every Teammate pops a confirmation, which ruins the hands-free demo.
6. Check the credit balance. Parallel agents burn credits in multiples, and there are 5-hour/7-day sliding-window rate limits.

(Screenshot pending: mode switch)

## 2. Send the requirement

The official example, one instruction that asks for both research and development, which naturally shows multi-role planning:

```
开发一个睡眠质量记录小程序，开发前先分析国内现有的睡眠质量记录小程序产品并总结其优缺点，然后开发一款在当前市场上有竞争力的功能性小程序。
```

(Develop a sleep-quality tracking mini program. Before coding, analyze the existing sleep-tracking mini programs in China, summarize their strengths and weaknesses, then build one that can compete in this market.)

Expect the Leader to spin up roles like market analysis, product design, and frontend development in parallel. Ballpark: 10 to 30 minutes, moderate credit cost.

## 3. Watch the split and the parallelism

- Left panel, task dispatch graph: which roles were created, who created them, who executes, and the dependencies. (screenshot pending)
- Task overview: parallel agent count, total time, token usage; all ready-made numbers for the write-up. (screenshot pending)
- Open one Teammate's task detail: files changed in real time, context water level, pause/resume. (screenshot pending)

## 4. Wrap-up

- Review the diffs in the editor; accept or revert one by one.
- Optional encore: type `/save-team` to save the current team (Roles + Scene) as a template under `.codeartsdoer/agent-team/`, then send a variant requirement (say, a bedtime-story mini program for kids) to show a second run starting in seconds.

## Alternative prompts

A frontend-backend parallel app; the clearest parallel picture and cheaper in credits:

```
做一个待办事项 Web 应用，前端用 React，后端用 Express，数据存本地文件，带单元测试，前后端可以并行开发。
```

(Build a to-do web app: React frontend, Express backend, local-file storage, unit tests, with frontend and backend developed in parallel.)

Incremental development on an existing repo (advanced; this is the positioning scenario on the product site). Copy the repo somewhere else first; don't run it inside your original clone:

```
调研本仓库 consumer rebalance 的实现，写一份设计文档，指出一个可改进点并给出原型实现。
```

(Investigate this repo's consumer-rebalance implementation, write a design doc, point out one improvement, and prototype it.)

## Results (fill after the run)

| Metric | Value |
| --- | --- |
| Total time | |
| Parallel agent count | |
| Token/credit cost | |
| Artifact location | |

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| No AgentTeam mode in the dropdown | Check you are on the Code Development tab in Space mode, with the IDE on the latest version |
| Model-unsupported error | Switch the model; Deepseek V3.1 is not supported yet |
| Confirmation popups mid-run | Enable auto-approval for conversation/agents in global settings |
| Run stalls | Retry in a new session; logs live at `%USERPROFILE%\.codeartsdoer\codearts-data\log`, grep `agent-team` for each sub-agent's state |
| Credits drain fast | Check the balance first; do a small-scale rehearsal before the real demo |

## References

- Multi-task parallel (main Agent Team doc): https://support.huaweicloud.com/usermanual-codeartsagent/codeartsagent_ug_0022.md
- Space mode overview: https://support.huaweicloud.com/usermanual-codeartsagent/codeartsagent_ug_0006.md
- Product site (Agent Team demo video): https://codearts.huaweicloud.com/
