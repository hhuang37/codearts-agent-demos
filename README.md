# CodeArts Agent Demos

English | [简体中文](README.zh-CN.md)

Hands-on demos of CodeArts Agent features — step-by-step guides and screen recordings.

## Demos

| Feature | What it shows | Result | Guide | Video | Status |
| --- | --- | --- | --- | --- | --- |
| Codebase | How the code index (Cloud Index) toggle affects source-code Q&A | off 10 min 46 s → on 1 min 41 s (~6.4x) | [English](codebase/codebase_readme.md) | [7 min 13 s](https://github.com/hhuang37/codearts-agent-demos/releases/download/v0.1.0/codebases_demo.mp4) | Done |
| Agent Team | Multi-agent collaboration: a Leader plans and dispatches, Teammates execute one requirement in parallel | English e-commerce homepage, product documentation, and architecture documentation | [English](agentteam/agentteam_readme.md) | [4 min 17 s](https://github.com/hhuang37/codearts-agent-demos/releases/download/v0.3.0/agentteams-demo.mp4) | Done |
| SDD | Spec-driven development: one business requirement becomes a spec, a design, tasks, and a verifiable page via `/sdd-new` → `/sdd-design` → `/sdd-tasks` → `/sdd-apply` | Two rounds of incremental requirements (ticket form + unique ticket number) on one static page | [English](sdd/sdd_readme.en.md) | [11 min 9 s](https://github.com/hhuang37/codearts-agent-demos/releases/download/v0.2.0/sdd_demo.mp4) | Done |
| AI Frontend | AI-assisted front-end development: preview the page in a browser and iterate on the code from what you see | pending | pending | pending | Planned |
| Custom Agent | Custom primary/sub-agent crew: a primary agent plans, then dispatches researcher, fact-checker, and report-writer sub-agents in sequence | A factual question runs the four-agent pipeline; the short report has Summary/Findings/Insights/Citations with source URLs | [English](customagent/docs/deep-research-custom-agent-demo.md) | [2 min 37 s](https://github.com/hhuang37/codearts-agent-demos/releases/download/v0.4.0/customagent-demo.mp4) | Done |
| CLI Serve | Remote session relay with `codearts serve` / `codearts attach`: Host 1 runs a log-analysis task and exposes the session on a local port; Host 2 resumes the same session from another terminal | The following terminal continues the original session context and delivers a follow-up summary | [English](serveattach/cli_serve_attach.en-US.md) | [3 min 52 s](https://github.com/hhuang37/codearts-agent-demos/releases/download/v0.5.0/cli_serve_demo.mp4) | Done |
| Dev-experience Skill | Codify Huawei development know-how into a skill and apply it to code exception analysis | pending | pending | pending | Planned |
| Huawei Cloud E2E | End-to-end best practices for building on Huawei Cloud products | pending | pending | pending | Planned |

## Notes

This repository is a personal practice log, not official Huawei Cloud documentation. Please credit the source when reposting.
