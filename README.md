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
  <text x="364" y="194" fill="#8b949e" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="13" font-weight="500" text-anchor="middle">single-file</text>
  <!-- stat callout -->
  <rect x="60" y="220" width="260" height="36" rx="8" fill="#161b22" stroke="#30363d" stroke-width="1"/>
  <text x="76" y="244" fill="#3fb950" font-family="SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace" font-size="15" font-weight="600">83.2%</text>
  <text x="148" y="244" fill="#8b949e" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="14">median token reduction</text>
</svg>

</div>

<br>

> Query and maintain your codebase's knowledge graph from inside Pi — six tools, zero config, 83% fewer tokens.

---

## What it does

`@runecraft/graphify-pi` wraps the upstream [Graphify-Labs graphify](https://github.com/Graphify-Labs/graphify) CLI as a Pi extension. It provides always-on tools for querying, building, updating, and diagnosing a codebase knowledge graph instead of grepping raw files.

| Tool | What it does |
|------|-------------|
| `graphify_build` | Runs the upstream `graphify .` build flow (or a supplied project path); `mode` standard\|deep, optional semantic `backend` |
| `graphify_status` | Reports graph presence, CLI availability/version, and Git-based staleness |
| `graphify_query` | Subgraph around concepts matching a question (BFS default, DFS for path tracing) with vocabulary-expansion guidance |
| `graphify_path` | Shortest path between two nodes (fuzzy match) |
| `graphify_explain` | Plain-language explanation of one node and its neighbors |
| `graphify_update` | Incrementally re-extract changed files (AST-only, no LLM cost) |

### Complementary Pi integrations

`graphify-pi` is not the upstream installer and does not modify Graphify-Labs' `graphify pi install` command. The two integrations are complementary:

- **graphify-pi** is the Pi-native extension: it exposes these tools, adds graph-first lifecycle guidance, reports staleness, and reconciles Git integration.
- **Upstream `graphify pi install`** (also documented upstream as `graphify install --platform pi`) installs the full graphify skill and project prompt integration. It writes the global `~/.pi/agent/skills/graphify/SKILL.md` and its `references/` files, the project `.pi/prompts/graphify.md`, and a graphify section in `AGENTS.md`.

Install the upstream integration separately when you want the complete skill/pipeline guidance. `graphify-pi` remains the installation surface for the Pi extension itself.

## Why minimal

This extension stays deliberately small and delegates graph and Git behavior upstream. Every design choice reduces footprint:

- **Graph-aware registration** — build and status are available for setup and diagnosis; query/path/explain/update are registered only when `graphify-out/graph.json` exists, keeping graph guidance out of repos without a graph.
- **Git-based staleness** — `git rev-list --count HEAD --since=<graph-mtime>` checks drift in ~8ms. No file walks, no extra state files.
- **Bounded exec** — stdout+stderr capped at 1 MiB (configurable) to prevent OOM on large graphs. Truncates at newline boundaries for clean output.
- **Zero config** — env vars only. No settings files, no auth, no coordinator initialization.

## Install

```bash
pi install npm:@runecraft/graphify-pi
```

This installs only the Pi extension. It does not install the upstream Graphify CLI or run `graphify pi install`.

## Requirements

- **[graphify](https://github.com/Graphify-Labs/graphify)** CLI on `PATH` (or set `GRAPHIFY_BIN`). Install it with:
  ```bash
  uv tool install graphifyy
  ```
- **Node.js** ≥ 20
- **Pi** with extension support

First-time setup in a project:

```bash
graphify .             # or call graphify_build from Pi
graphify hook status   # optional: inspect the upstream Git integration
```

When a graph exists, graphify-pi automatically reconciles that upstream Git integration at Pi session start. It never installs the CLI itself.

## Configuration

All configuration via environment variables — no config files:

| Variable | Default | Description |
|----------|---------|-------------|
| `GRAPHIFY_BIN` | `graphify` | Path to the graphify binary |
| `GRAPHIFY_BUDGET` | `2000` | Default token cap for `graphify_query` results |
| `GRAPHIFY_STALE_COMMITS` | `1` | Commits newer than graph before staleness notification |
| `GRAPHIFY_MAX_OUTPUT` | `1048576` (1 MiB) | Max bytes from CLI stdout+stderr before truncation |
| `GRAPHIFY_BACKEND` | unset | Default semantic backend for `graphify_build` (gemini\|kimi\|claude\|openai\|deepseek\|ollama) |

## Graph-first behavior and lifecycle

When `graphify-out/graph.json` exists, the extension adds persistent Pi system guidance: for codebase and architecture questions, use `graphify_query`, `graphify_path`, or `graphify_explain` before `grep`, `find`, broad raw reads, or other file searches. Use the graph and `graphify-out/wiki/` before reading broad reports such as `GRAPH_REPORT.md`. After code edits, run `graphify_update` before relying on graph answers. If the graph cannot answer a focused question, inspect the smallest relevant source files.

At session start it also injects a bounded snapshot (≤ 3000 chars, report first 2000 + wiki first 1000) of `graphify-out/GRAPH_REPORT.md` — including its **Suggested Questions** section when the report has one — and `graphify-out/wiki/index.md` into the system prompt, so the agent can answer natural-language questions about the codebase. The `graphify_query` tool guidance teaches the agent to expand natural-language questions into the graph's own token vocabulary (up to 12 tokens from node labels, never invented) when lexical matching returns no nodes, and to fall back to `graphify_explain`/`graphify_path` with symbol-level names.

No graph-first guidance is injected when the graph is absent. `graphify_build` and `graphify_status` remain available so the agent can create or diagnose one. When the CLI is present but older than `0.9.53` (missing truncation, `at=` location, and verb-handling query fixes), session start shows a one-line upgrade warning.

```
session_start
  ├─ register graphify_build + graphify_status
  ├─ graphify-out/graph.json exists?
  │   ├─ yes → register query/path/explain/update + guidance + check staleness
  │   └─ no  → no graph guidance or graph tools
  ├─ before_agent_start → inject GRAPH_REPORT.md + wiki snippets (≤ 3000 chars)
  ├─ CLI version below 0.9.53? → one-line upgrade warning
  ├─ graph + CLI available + Git repo?
  │   ├─ graphify hook status
  │   └─ graphify hook install only when upstream status shows the integration is incomplete
  └─ staleness: git rev-list --count HEAD --since=<mtime>
       └─ count > threshold → notify "graph is N commits stale"
```

### Upstream Git integration

The extension owns reconciliation for Pi sessions, but delegates all Git behavior to the upstream CLI. It checks `graphify hook status` and runs `graphify hook install` only when needed. This is idempotent and does not reimplement hook scripts, overwrite existing hook content, install the CLI, or bypass upstream handling of `core.hooksPath` and linked worktrees.

The upstream command installs graphify's `post-commit` and `post-checkout` rebuild hooks and registers the `graph.json` merge driver. It preserves existing user hook content and writes to the Git hook/config locations selected by upstream. Inspect or remove the upstream integration with:

```bash
graphify hook status
graphify hook uninstall
```

Because graphify-pi reconciles automatically, an uninstall is intentional only until the next Pi session with a graph and an available CLI. If setup fails, Pi reports the failure; if the CLI is missing it reports `graphify-pi requires graphify CLI. Install with: uv tool install graphifyy`.

The `graphify_build` tool uses a 5-minute timeout for `--mode deep` semantic extraction; interactive tools (`query`/`path`/`explain`/`status`/`update`) use 60s and bounded output capture. No extraction or Git hook logic is reimplemented — every operation delegates to the CLI.

## Pilot results

Measured on the Squad codebase (~25K nodes):

| Metric | Value |
|--------|-------|
| Median token reduction | **83.2%** |
| Staleness check latency | **8.3 ms** |
| Accuracy (3 benchmark tasks) | **3/3 on 2 of 3 tasks** (100% on two tasks, partial on the third) |

## License

[MIT](LICENSE) — © 2026 Runecraft AI

---

<div align="center">

<a href="README.pt-BR.md">🇧🇷 Leia em Português</a>

</div>
