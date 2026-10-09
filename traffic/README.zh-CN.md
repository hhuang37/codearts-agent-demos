# 仓库流量统计

> 语言：**中文** ｜ [English](README.md)

本仓库的浏览与克隆数据，由定时 GitHub Action（[`.github/workflows/traffic-stats.yml`](../.github/workflows/traffic-stats.yml)）每日快照采集；也可在 Actions 页面通过 *Run workflow* 按钮手动触发。

GitHub 官方只保留最近 **14 天**的流量数据，所以由本文件夹负责沉淀长期历史：每次运行把最新窗口按日合并进 `history.json`，刷新 `summary.json` 并重绘 `chart.svg`；漏跑的日期会被下一次成功运行自动补录。本地手动采集：

```bash
GITHUB_TOKEN=$(gh auth token) python .github/scripts/collect_traffic.py
```

[![Views (14d)](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fhhuang37%2Fcodearts-agent-demos%2Fmain%2Ftraffic%2Fsummary.json&query=%24.views_14d&label=views%20%2814d%29&color=blue&cacheSeconds=3600)](history.json)
[![Clones (14d)](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fhhuang37%2Fcodearts-agent-demos%2Fmain%2Ftraffic%2Fsummary.json&query=%24.clones_14d&label=clones%20%2814d%29&color=green&cacheSeconds=3600)](history.json)
[![Video downloads](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fhhuang37%2Fcodearts-agent-demos%2Fmain%2Ftraffic%2Fsummary.json&query=%24.downloads_total&label=video%20downloads&color=orange&cacheSeconds=3600)](https://github.com/hhuang37/codearts-agent-demos/releases)

![仓库流量趋势图](chart.svg)

<!-- STATS:START -->
## 当前统计（每日自动刷新）

| 指标 | 数值 | 口径 |
| --- | ---: | --- |
| 浏览（近 14 天） | 468 | 截至今天往前 14 天滚动窗口的页面浏览合计 |
| 浏览访客（近 14 天） | 30 | 按 IP/设备 24 小时去重 |
| 克隆（近 14 天） | 359 | 只统计完整 `git clone`；fetch/pull、Download ZIP 不算 |
| 独立克隆者（近 14 天） | 202 | 克隆人数，24 小时去重 |
| 视频下载（累计） | 39 | release 附件发布以来的累计下载次数，无 14 天限制 |

数据截至 **2026-10-09**（GitHub 流量数据本身滞后 1~2 天）。每日明细与图表见 [report.zh-CN.md](report.zh-CN.md)。
<!-- STATS:END -->

📊 **完整表格报告**（每日明细、文件夹热度、release 下载量）：[中文](report.zh-CN.md) ｜ [English](report.md)

## 文件说明

| 文件 | 内容 |
| --- | --- |
| `report.md` / `report.zh-CN.md` | 自动生成的报告：14 天汇总、每日明细、热门文件夹与页面、各 release 下载量 |
| `history.json` | 跨运行按日合并的浏览/克隆数据（长期曲线），以及 Top10 热门页面、各 release 下载量快照 |
| `summary.json` | 近 14 天汇总——上方徽章的数据源 |
| `chart.svg` | 近 14 天浏览 vs 克隆趋势图，每次运行重新生成 |
| `folders.svg` | 各文件夹浏览量柱状图（由 Top10 页面快照归并） |
| `downloads.svg` | 各 release 资产累计下载量柱状图 |

## 数据口径

- `daily` 的日期是访问/克隆发生的 UTC 日期；GitHub 自身的数据有 1~2 天滞后。
- `popular_paths` / `release_downloads` 的 `date` 字段是采集快照日：热门页面只有近 14 天聚合 Top10、release 下载量只有累计值，官方不提供分天数据。
- clone 只统计完整 `git clone`——`git fetch`/`pull`、网页 *Download ZIP*、Actions checkout 都不算；uniques 按 IP/设备做 24 小时去重。
