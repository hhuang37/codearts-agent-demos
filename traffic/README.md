# Repository Traffic

> Language: **English** ｜ [简体中文](README.zh-CN.md)

Views & clone stats of this repository, snapshotted daily by a scheduled GitHub Action ([`.github/workflows/traffic-stats.yml`](../.github/workflows/traffic-stats.yml)); it can also be triggered manually via the *Run workflow* button on the Actions page.

GitHub only keeps the last **14 days** of traffic data, so this folder accumulates the long-term history: every run merges the latest window into `history.json`, refreshes `summary.json` and re-renders `chart.svg`; days missed between runs are backfilled automatically. To collect manually on a local machine:

```bash
GITHUB_TOKEN=$(gh auth token) python .github/scripts/collect_traffic.py
```

[![Views (14d)](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fhhuang37%2Fcodearts-agent-demos%2Fmain%2Ftraffic%2Fsummary.json&query=%24.views_14d&label=views%20%2814d%29&color=blue&cacheSeconds=3600)](history.json)
[![Clones (14d)](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fhhuang37%2Fcodearts-agent-demos%2Fmain%2Ftraffic%2Fsummary.json&query=%24.clones_14d&label=clones%20%2814d%29&color=green&cacheSeconds=3600)](history.json)
[![Video downloads](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fhhuang37%2Fcodearts-agent-demos%2Fmain%2Ftraffic%2Fsummary.json&query=%24.downloads_total&label=video%20downloads&color=orange&cacheSeconds=3600)](https://github.com/hhuang37/codearts-agent-demos/releases)

![Repository traffic chart](chart.svg)

<!-- STATS:START -->
## Current numbers (auto-refreshed daily)

| Metric | Value | Meaning |
| --- | ---: | --- |
| Views (last 14 days) | 473 | page views over the rolling 14-day window ending today |
| View uniques (last 14 days) | 30 | deduplicated by IP/device over 24 h |
| Clones (last 14 days) | 375 | full `git clone` only; fetch/pull and Download ZIP excluded |
| Unique cloners (last 14 days) | 208 | cloner count, 24 h dedup |
| Video downloads (all-time) | 40 | cumulative release-asset downloads since publishing |

As of **2026-10-10** (GitHub's own traffic data lags 1–2 days). Daily breakdown & charts: [report.md](report.md).
<!-- STATS:END -->

📊 **Full report with tables** (daily detail, folder visits, release downloads): [English](report.md) ｜ [简体中文](report.zh-CN.md)

## Files

| File | Content |
| --- | --- |
| `report.md` / `report.zh-CN.md` | Auto-generated report: 14-day totals, daily detail, popular folders & pages, per-release downloads |
| `history.json` | Per-day views/clones merged across runs (the long-term curve), plus Top-10 popular pages and per-release download snapshots |
| `summary.json` | 14-day totals — the data source of the badges above |
| `chart.svg` | Views vs clones over the last 14 days, re-rendered on every run |
| `folders.svg` | Views by folder (aggregated from the Top-10 pages snapshot) |
| `downloads.svg` | Cumulative downloads per release asset |

## Data semantics

- `daily` dates are the UTC dates when the visits/clones happened; GitHub reports its own traffic with a 1–2 day lag.
- `popular_paths` / `release_downloads` entries carry the collection date in their `date` field: GitHub only exposes 14-day aggregates for popular pages and cumulative counts for release assets, with no per-day series.
- Clones count full `git clone` only — `git fetch`/`pull`, the web *Download ZIP* button and Actions checkout are all excluded; uniques are deduplicated by IP/device over 24 hours.
