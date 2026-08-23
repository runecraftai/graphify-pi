<div align="center">

<a href="README.pt-BR.md">🇧🇷 Português</a>

</div>

<div align="center">

<svg viewBox="0 0 1200 280" width="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#58a6ff" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#3fb950" stop-opacity="0.08"/>
    </linearGradient>
    <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#58a6ff" stop-opacity="0"/>
      <stop offset="50%" stop-color="#58a6ff" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#3fb950" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="280" rx="16" fill="#0d1117"/>
  <rect width="1200" height="280" rx="16" fill="url(#glow)"/>
  <!-- graph nodes -->
  <circle cx="920" cy="80" r="6" fill="#58a6ff" opacity="0.7"/>
  <circle cx="960" cy="120" r="4" fill="#3fb950" opacity="0.6"/>
  <circle cx="1000" cy="70" r="5" fill="#58a6ff" opacity="0.5"/>
  <circle cx="1040" cy="130" r="7" fill="#3fb950" opacity="0.7"/>
  <circle cx="1080" cy="90" r="4" fill="#58a6ff" opacity="0.6"/>
  <circle cx="1100" cy="140" r="5" fill="#3fb950" opacity="0.5"/>
  <circle cx="950" cy="160" r="3" fill="#58a6ff" opacity="0.4"/>
  <circle cx="1060" cy="50" r="3" fill="#3fb950" opacity="0.4"/>
  <!-- graph edges -->
  <line x1="920" y1="80" x2="960" y2="120" stroke="#58a6ff" stroke-width="1" opacity="0.3"/>
  <line x1="960" y1="120" x2="1040" y2="130" stroke="#3fb950" stroke-width="1" opacity="0.3"/>
  <line x1="1000" y1="70" x2="1040" y2="130" stroke="#58a6ff" stroke-width="1" opacity="0.25"/>
  <line x1="1040" y1="130" x2="1080" y2="90" stroke="#3fb950" stroke-width="1" opacity="0.3"/>
  <line x1="1080" y1="90" x2="1100" y2="140" stroke="#58a6ff" stroke-width="1" opacity="0.25"/>
  <line x1="920" y1="80" x2="1000" y2="70" stroke="#58a6ff" stroke-width="1" opacity="0.2"/>
  <line x1="1060" y1="50" x2="1000" y2="70" stroke="#3fb950" stroke-width="1" opacity="0.2"/>
  <line x1="950" y1="160" x2="960" y2="120" stroke="#58a6ff" stroke-width="1" opacity="0.2"/>
  <!-- title -->
  <text x="60" y="105" fill="#e6edf3" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="56" font-weight="700">graphify-pi</text>
  <!-- subtitle -->
  <text x="60" y="150" fill="#8b949e" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="22" font-weight="400">Minimal knowledge-graph extension for Pi</text>
  <!-- badges row -->
  <rect x="60" y="175" width="90" height="28" rx="14" fill="#238636" opacity="0.9"/>
  <text x="105" y="194" fill="#ffffff" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="13" font-weight="600" text-anchor="middle">MIT</text>
  <rect x="162" y="175" width="120" height="28" rx="14" fill="#1f6feb" opacity="0.9"/>
  <text x="222" y="194" fill="#ffffff" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="13" font-weight="600" text-anchor="middle">pi-extension</text>
  <rect x="294" y="175" width="140" height="28" rx="14" fill="#30363d" opacity="0.9"/>
  <text x="364" y="194" fill="#8b949e" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="13" font-weight="500" text-anchor="middle">~190 lines</text>
  <!-- stat callout -->
  <rect x="60" y="220" width="260" height="36" rx="8" fill="#161b22" stroke="#30363d" stroke-width="1"/>
  <text x="76" y="244" fill="#3fb950" font-family="SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace" font-size="15" font-weight="600">83.2%</text>
  <text x="148" y="244" fill="#8b949e" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="14">median token reduction</text>
</svg>

</div>

<br>

> Query your codebase's knowledge graph from inside Pi — four tools, zero config, 83% fewer tokens.

---

## What it does

`@runecraft/graphify-pi` wraps the [graphify](https://github.com/graphify/graphify) CLI as a Pi extension. It registers four tools that let your coding agent query, traverse, and explain a codebase knowledge graph instead of grepping raw files.

| Tool | What it does |
|------|-------------|
| `graphify_query` | BFS subgraph around concepts matching a natural-language question |
| `graphify_path` | Shortest path between two nodes (fuzzy match) |
| `graphify_explain` | Plain-language explanation of one node and its neighbors |
| `graphify_update` | Incrementally re-extract changed files (AST-only, no LLM cost) |

## Why minimal

This extension is deliberately small (~190 lines). Every design choice reduces footprint:

- **Lazy registration** — tools only appear when `graphify-out/graph.json` exists, keeping the system prompt clean for repos without a graph.
- **Git-based staleness** — `git rev-list --count HEAD --since=<graph-mtime>` checks drift in ~8ms. No file walks, no extra state files.
- **Bounded exec** — stdout+stderr capped at 1 MiB (configurable) to prevent OOM on large graphs. Truncates at newline boundaries for clean output.
- **Zero config** — env vars only. No settings files, no auth, no coordinator initialization.

## Install

```bash
pi install npm:@runecraft/graphify-pi
```

## Requirements

- **[graphify](https://github.com/graphify/graphify)** CLI on `PATH` (or set `GRAPHIFY_BIN`)
- **Node.js** ≥ 20
- **Pi** with extension support

## Configuration

All configuration via environment variables — no config files:

| Variable | Default | Description |
|----------|---------|-------------|
| `GRAPHIFY_BIN` | `graphify` | Path to the graphify binary |
| `GRAPHIFY_BUDGET` | `2000` | Default token cap for `graphify_query` results |
| `GRAPHIFY_STALE_COMMITS` | `1` | Commits newer than graph before staleness notification |
| `GRAPHIFY_MAX_OUTPUT` | `1048576` (1 MiB) | Max bytes from CLI stdout+stderr before truncation |

## How it works

```
session_start
  ├─ graphify-out/graph.json exists?
  │   ├─ yes → register 4 tools + check staleness
  │   └─ no  → silent no-op (zero footprint)
  └─ staleness check: git rev-list --count HEAD --since=<mtime>
       └─ count > threshold → notify "graph is N commits stale"
```

Tools shell out to the `graphify` CLI with a 60s timeout and bounded output capture. No extraction logic is reimplemented — every call delegates to the pinned binary.

## Pilot results

Measured on the Squad codebase (~25K nodes):

| Metric | Value |
|--------|-------|
| Median token reduction | **83.2%** |
| Staleness check latency | **8.3 ms** |
| Accuracy (3 benchmark tasks) | **3/3 on 2 of 3 tasks** |

## License

[MIT](LICENSE) — © 2026 Runecraft AI

---

<div align="center">

<a href="README.pt-BR.md">🇧🇷 Leia em Português</a>

</div>
