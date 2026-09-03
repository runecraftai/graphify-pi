// @runecraft/graphify-pi — Minimal graphify CLI wrapper for Pi.
//
// The upstream graphify CLI owns extraction, output formats, and Git hooks.
// This extension only exposes those operations to Pi and adds diagnostics.
//
// Config (env only):
//   GRAPHIFY_BIN            — binary path (default "graphify")
//   GRAPHIFY_BUDGET         — default query token cap (default 2000)
//   GRAPHIFY_STALE_COMMITS  — drift threshold before notifying (default 1)
//   GRAPHIFY_MAX_OUTPUT     — max bytes from CLI stdout+stderr (default 1 MiB)
//   GRAPHIFY_BACKEND        — default semantic backend for graphify_build
import { execFileSync } from "node:child_process";
import { statSync } from "node:fs";
import { join, resolve } from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import {
	CLI_BUILD_TIMEOUT_MS,
	GRAPH_REPORT_CHARS,
	GRAPH_WIKI_CHARS,
	MIN_CLI_VERSION,
	buildGraphArgs,
	buildSessionInjection,
	queryArgs,
	readGraphStats,
	readSnippet,
	utf8Prefix,
	versionBelow,
} from "./core/graphify-core.js";

const CLI_TIMEOUT_MS = 60_000;
const MIN_EXEC_BUFFER_BYTES = 1024;
const TRUNCATION_MARKER = "\n[output truncated at limit]";

export const DEFAULT_MAX_OUTPUT = 1 * 1024 * 1024; // 1 MiB
export const CLI_INSTALL_MESSAGE =
	"graphify-pi requires graphify CLI. Install with: uv tool install graphifyy";

export interface CommandResult {
	stdout: string;
	stderr: string;
	code: number;
	timedOut: boolean;
	error?: string;
}

export type CommandRunner = (
	command: string,
	args: string[],
	cwd: string,
	maxOutputBytes?: number,
) => CommandResult;

export function truncateOutput(text: string, limit: number): string {
	if (limit <= 0) return "";
	const bytes = Buffer.byteLength(text, "utf8");
	if (bytes <= limit) return text;

	const markerBytes = Buffer.byteLength(TRUNCATION_MARKER, "utf8");
	if (limit <= markerBytes) {
		return utf8Prefix(TRUNCATION_MARKER, limit);
	}

	const truncated = utf8Prefix(text, limit - markerBytes);
	const lastNewline = truncated.lastIndexOf("\n");
	const cleanCut = lastNewline > 0 ? truncated.slice(0, lastNewline) : truncated;
	return cleanCut + TRUNCATION_MARKER;
}

function textValue(value: unknown): string {
	if (typeof value === "string") return value;
	if (value instanceof Buffer) return value.toString("utf8");
	return value == null ? "" : String(value);
}

export function runCommand(
	command: string,
	args: string[],
	cwd: string,
	maxOutputBytes = DEFAULT_MAX_OUTPUT,
	timeoutMs = CLI_TIMEOUT_MS,
): CommandResult {
	try {
		const result = execFileSync(command, args, {
			cwd,
			encoding: "utf8",
			timeout: timeoutMs,
			stdio: ["pipe", "pipe", "pipe"],
			maxBuffer: Math.max(maxOutputBytes * 2, MIN_EXEC_BUFFER_BYTES),
		});
		return {
			stdout: truncateOutput(textValue(result), maxOutputBytes),
			stderr: "",
			code: 0,
			timedOut: false,
		};
	} catch (error: unknown) {
		const err = error as {
			stdout?: unknown;
			stderr?: unknown;
			status?: number | null;
			signal?: string | null;
			code?: string | number;
			message?: string;
		};
		const stdout = textValue(err.stdout);
		const stderr = textValue(err.stderr);
		const combined = [stdout, stderr].filter(Boolean).join("\n");
		return {
			stdout: truncateOutput(combined, maxOutputBytes),
			stderr: "",
			code: typeof err.status === "number" ? err.status : 1,
			timedOut: err.signal === "SIGTERM",
			error: err.code != null ? String(err.code) : err.message,
		};
	}
}

export function formatCommandResult(
	result: CommandResult,
	command: string,
	maxOutputBytes = DEFAULT_MAX_OUTPUT,
): string {
	const output = truncateOutput(
		[result.stdout, result.stderr].filter(Boolean).join("\n"),
		maxOutputBytes,
	);
	if (output) return output;

	const reason = result.timedOut
		? "timed out"
		: result.error ?? `exit code ${result.code}`;
	return truncateOutput(`Error running ${command}: ${reason}`, maxOutputBytes);
}

export function graphFilePath(cwd: string): string {
	return join(cwd, "graphify-out", "graph.json");
}

export type FileStat = (path: string) => { mtimeMs: number };

export function graphMtimeMs(
	cwd: string,
	stat: FileStat = statSync,
): number | undefined {
	try {
		return stat(graphFilePath(cwd)).mtimeMs;
	} catch {
		return undefined;
	}
}

export function hasGraph(cwd: string, stat: FileStat = statSync): boolean {
	return graphMtimeMs(cwd, stat) !== undefined;
}

export interface Staleness {
	commits: number | undefined;
	error?: string;
}

export function getStaleness(
	cwd: string,
	mtimeMs: number,
	runner: CommandRunner = runCommand,
): Staleness {
	const since = new Date(mtimeMs).toISOString();
	const result = runner("git", ["rev-list", "--count", "HEAD", `--since=${since}`], cwd);
	if (result.code !== 0) {
		return {
			commits: undefined,
			error: formatCommandResult(result, "git rev-list"),
		};
	}

	const count = Number.parseInt(result.stdout.trim(), 10);
	return Number.isFinite(count)
		? { commits: count }
		: { commits: undefined, error: "git returned an invalid commit count" };
}

export interface CliInfo {
	available: boolean;
	version?: string;
	error?: string;
}

export function getCliInfo(
	bin: string,
	cwd: string,
	runner: CommandRunner = runCommand,
): CliInfo {
	const result = runner(bin, ["--version"], cwd);
	if (result.code !== 0) {
		return {
			available: false,
			error: formatCommandResult(result, `${bin} --version`),
		};
	}

	const version = [result.stdout, result.stderr]
		.join("\n")
		.trim()
		.split(/\r?\n/, 1)[0];
	return { available: true, version: version || "version unknown" };
}

export function isGitRepository(
	cwd: string,
	runner: CommandRunner = runCommand,
): boolean {
	const result = runner("git", ["rev-parse", "--is-inside-work-tree"], cwd);
	return result.code === 0 && result.stdout.trim() === "true";
}

export function hooksNeedInstall(statusOutput: string): boolean {
	const installed = new Set<string>();
	for (const line of statusOutput.split(/\r?\n/)) {
		const trimmed = line.trim();
		const hook = /^(post-commit|post-checkout):\s+installed(?:\s.*)?$/.exec(trimmed);
		if (hook) installed.add(hook[1]);
		if (/^merge driver:\s+registered(?:\s.*)?$/.test(trimmed)) {
			installed.add("merge-driver");
		}
	}
	return installed.size !== 3;
}

export interface HookReconciliation {
	attempted: boolean;
	installed: boolean;
	error?: string;
}

export function reconcileGitHooks(
	cwd: string,
	bin: string,
	runner: CommandRunner = runCommand,
): HookReconciliation {
	if (!isGitRepository(cwd, runner)) {
		return { attempted: false, installed: false };
	}

	const status = runner(bin, ["hook", "status"], cwd);
	if (status.code !== 0) {
		return {
			attempted: true,
			installed: false,
			error: formatCommandResult(status, `${bin} hook status`),
		};
	}
	if (!hooksNeedInstall(status.stdout)) {
		return { attempted: true, installed: true };
	}

	const install = runner(bin, ["hook", "install"], cwd);
	if (install.code !== 0) {
		return {
			attempted: true,
			installed: false,
			error: formatCommandResult(install, `${bin} hook install`),
		};
	}

	const verification = runner(bin, ["hook", "status"], cwd);
	if (verification.code !== 0) {
		return {
			attempted: true,
			installed: false,
			error: formatCommandResult(verification, `${bin} hook status`),
		};
	}
	if (hooksNeedInstall(verification.stdout)) {
		return {
			attempted: true,
			installed: false,
			error: `graphify hook install incomplete: ${formatCommandResult(
				verification,
				`${bin} hook status`,
			)}`,
		};
	}
	return { attempted: true, installed: true };
}

export default function graphifyExtension(pi: ExtensionAPI) {
	const bin = process.env.GRAPHIFY_BIN || "graphify";
	const defaultBudget =
		Number.parseInt(process.env.GRAPHIFY_BUDGET ?? "", 10) || 2000;
	const staleCommitThreshold = Number.parseInt(
		process.env.GRAPHIFY_STALE_COMMITS ?? "",
		10,
	);
	const staleCommitsAllowed = Number.isFinite(staleCommitThreshold)
		? staleCommitThreshold
		: 1;
	const configuredMaxOutput = Number.parseInt(
		process.env.GRAPHIFY_MAX_OUTPUT ?? "",
		10,
	);
	const maxOutputBytes =
		Number.isFinite(configuredMaxOutput) && configuredMaxOutput > 0
			? configuredMaxOutput
			: DEFAULT_MAX_OUTPUT;
	const runner: CommandRunner = (command, args, cwd) =>
		runCommand(command, args, cwd, maxOutputBytes);

	let baseToolsRegistered = false;
	let graphToolsRegistered = false;

	const cliOutput = (args: string[], cwd: string, timeoutMs = CLI_TIMEOUT_MS): string => {
		const result = runCommand(bin, args, cwd, maxOutputBytes, timeoutMs);
		const output = formatCommandResult(result, `${bin} ${args.join(" ")}`, maxOutputBytes);
		if (result.error === "ENOENT") {
			return truncateOutput(`${CLI_INSTALL_MESSAGE}\n${output}`, maxOutputBytes);
		}
		return output;
	};

	function registerBaseTools(): void {
		if (baseToolsRegistered) return;
		baseToolsRegistered = true;

		pi.registerTool({
			name: "graphify_build",
			label: "Graphify Build",
			description:
				"Build or rebuild this project's knowledge graph using the upstream graphify extract flow; supports standard/deep mode and an optional semantic backend.",
			promptSnippet: "Build the codebase knowledge graph with graphify",
			promptGuidelines: [
				"Run graphify_build before graphify_query/graphify_path/graphify_explain in repos without a graph; use mode \"deep\" for richer inferred relationships on doc-heavy corpora (needs a semantic backend).",
			],
			parameters: Type.Object({
				path: Type.Optional(
					Type.String({
						description: 'Project path passed to graphify (default ".")',
					}),
				),
				mode: Type.Optional(
					Type.Union([Type.Literal("standard"), Type.Literal("deep")], {
						description: "Extraction mode: deep enables richer INFERRED-edge semantic extraction",
					}),
				),
				backend: Type.Optional(
					Type.String({
						description:
							"Semantic backend (gemini|kimi|claude|openai|deepseek|ollama); defaults to GRAPHIFY_BACKEND env",
					}),
				),
			}),
			async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
				const path = params.path ?? ".";
				const backend = params.backend ?? process.env.GRAPHIFY_BACKEND;
				const startedAt = Date.now();
				const output = cliOutput(
					buildGraphArgs(path, { mode: params.mode, backend }),
					ctx.cwd,
					CLI_BUILD_TIMEOUT_MS,
				);
				const buildMs = Date.now() - startedAt;
				const stats = readGraphStats(
					join(resolve(ctx.cwd, path), "graphify-out", "graph.json"),
				);
				const details: Record<string, unknown> = {
					path,
					mode: params.mode ?? "standard",
					buildMs,
					...(backend ? { backend } : {}),
					...(stats
						? {
								fileCount: stats.fileCount,
								nodeCount: stats.nodeCount,
								edgeCount: stats.edgeCount,
								graphSizeBytes: stats.graphSizeBytes,
						  }
						: {}),
				};
				const summary = stats
					? `Graph build complete: ${stats.nodeCount} nodes, ${stats.edgeCount} edges, ${stats.fileCount} files, ${stats.graphSizeBytes} bytes in ${buildMs} ms.`
					: undefined;
				return {
					content: [
						{ type: "text", text: summary ? `${summary}\n${output}` : output },
					],
					details,
				};
			},
		});

		pi.registerTool({
			name: "graphify_status",
			label: "Graphify Status",
			description:
				"Diagnose graph presence, graphify CLI availability/version, and graph staleness.",
			promptSnippet: "Check graphify graph, CLI, and staleness status",
			parameters: Type.Object({}),
			async execute(_toolCallId, _params, _signal, _onUpdate, ctx) {
				const mtime = graphMtimeMs(ctx.cwd);
				const cli = getCliInfo(bin, ctx.cwd, runner);
				const lines = [
					mtime === undefined
						? "Graph: not found at graphify-out/graph.json"
						: "Graph: present at graphify-out/graph.json",
					cli.available
						? `CLI: available (${cli.version})`
						: `CLI: unavailable\n${CLI_INSTALL_MESSAGE}`,
				];

				if (mtime === undefined) {
					lines.push("Staleness: unavailable (graph not present)");
				} else {
					const stale = getStaleness(ctx.cwd, mtime, runner);
					lines.push(
						stale.commits === undefined
							? `Staleness: unavailable (${stale.error ?? "unknown error"})`
							: `Staleness: ${stale.commits} commits since graph${
									stale.commits > staleCommitsAllowed
										? ` (stale; threshold ${staleCommitsAllowed})`
										: ` (within threshold ${staleCommitsAllowed})`
								}`,
					);
				}

				return { content: [{ type: "text", text: lines.join("\n") }], details: {} };
			},
		});
	}

	function registerGraphTools(): void {
		if (graphToolsRegistered) return;
		graphToolsRegistered = true;

		pi.registerTool({
			name: "graphify_query",
			label: "Graphify Query",
			description:
				"Query this codebase's knowledge graph (subgraph around concepts matching the question; BFS default, DFS for path tracing). Cheaper and more focused than grepping raw files for structural questions.",
			promptSnippet: "Query the codebase knowledge graph for a question",
			promptGuidelines: [
				"Use graphify_query when answering questions about this codebase's structure or how components relate, before falling back to grep/read.",
				"graphify query matches node labels by case-folded substring/prefix only — no synonyms, no stemming, no cross-language match. When it returns \"No matching nodes found\" or the question's vocabulary does not match node labels, expand the query against the graph's own vocabulary: open graphify-out/graph.json, pick up to 12 tokens from node labels that match the question's intent, and re-query with those tokens joined by spaces instead of the raw question.",
				"Never invent tokens; if nothing in the graph vocabulary matches, say so honestly and fall back to graphify_explain / graphify_path with symbol-level names.",
				"Mode: bfs (default) explores broad context — use for \"what is X connected to?\". dfs traces a specific chain — use for \"how does X reach Y?\".",
			],
			parameters: Type.Object({
				question: Type.String({
					description: "Natural-language question about the codebase graph",
				}),
				mode: Type.Optional(
					Type.Union([Type.Literal("bfs"), Type.Literal("dfs")], {
						description: "Traversal mode: bfs (default) or dfs (path tracing)",
					}),
				),
				budget: Type.Optional(
					Type.Number({
						description: `Token cap for the returned subgraph (default ${defaultBudget})`,
					}),
				),
				context_filter: Type.Optional(
					Type.Array(Type.String(), {
						description: "Explicit edge-context filters to restrict traversal",
					}),
				),
			}),
			async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
				const output = cliOutput(
					queryArgs(
						params.question,
						{
							budget: params.budget,
							mode: params.mode,
							contextFilter: params.context_filter,
						},
						defaultBudget,
					),
					ctx.cwd,
				);
				return {
					content: [{ type: "text", text: output }],
					details: {},
				};
			},
		});

		pi.registerTool({
			name: "graphify_path",
			label: "Graphify Path",
			description:
				'Shortest path between two nodes in the codebase knowledge graph, e.g. graphify_path "sq-send.sh" "window-state".',
			promptSnippet: "Find the shortest relationship path between two graph nodes",
			promptGuidelines: [
				"Use graphify_path to trace how one function, file, or concept reaches another in this codebase.",
			],
			parameters: Type.Object({
				from: Type.String({ description: "Source node name (fuzzy match)" }),
				to: Type.String({ description: "Target node name (fuzzy match)" }),
				undirected: Type.Optional(
					Type.Boolean({
						description:
							"Treat edges as undirected (recommended; directed misses are common)",
					}),
				),
			}),
			async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
				const args = ["path", params.from, params.to];
				if (params.undirected) args.push("--undirected");
				return {
					content: [{ type: "text", text: cliOutput(args, ctx.cwd) }],
					details: {},
				};
			},
		});

		pi.registerTool({
			name: "graphify_explain",
			label: "Graphify Explain",
			description:
				"Plain-language explanation of one node and its neighbors in the codebase knowledge graph.",
			promptSnippet: "Explain one node and its neighbors from the codebase graph",
			promptGuidelines: [
				"Use graphify_explain to get what a single file, function, or concept connects to in this codebase.",
			],
			parameters: Type.Object({
				node: Type.String({ description: "Node name to explain (fuzzy match)" }),
			}),
			async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
				return {
					content: [
						{ type: "text", text: cliOutput(["explain", params.node], ctx.cwd) },
					],
					details: {},
				};
			},
		});

		pi.registerTool({
			name: "graphify_update",
			label: "Graphify Update",
			description:
				"Incrementally re-extract changed code files into graphify-out/graph.json. AST-only, no LLM/API cost. Run after modifying code so graph answers stay accurate.",
			promptSnippet: "Refresh the codebase knowledge graph after code edits",
			promptGuidelines: [
				"After modifying code with edit/write, run graphify_update once so subsequent graphify_query/path/explain results reflect your changes.",
			],
			parameters: Type.Object({}),
			async execute(_toolCallId, _params, _signal, _onUpdate, ctx) {
				return {
					content: [{ type: "text", text: cliOutput(["update", "."], ctx.cwd) }],
					details: {},
				};
			},
		});
	}

	pi.on("before_agent_start", (event, ctx) => {
		const injection = buildSessionInjection(
			hasGraph(ctx.cwd),
			readSnippet(join(ctx.cwd, "graphify-out", "GRAPH_REPORT.md"), GRAPH_REPORT_CHARS),
			readSnippet(join(ctx.cwd, "graphify-out", "wiki", "index.md"), GRAPH_WIKI_CHARS),
		);
		if (!injection) return;
		return { systemPrompt: event.systemPrompt + injection };
	});

	pi.on("session_start", (_event, ctx) => {
		registerBaseTools();
		const cli = getCliInfo(bin, ctx.cwd, runner);
		if (cli.available && versionBelow(cli.version, MIN_CLI_VERSION)) {
			ctx.ui.notify(
				`[graphify] CLI ${cli.version} is below ${MIN_CLI_VERSION} — query fixes (truncation, at= locations, verb handling) need an upgrade: uv tool install graphifyy`,
				"warning",
			);
		}
		const mtime = graphMtimeMs(ctx.cwd);
		if (mtime === undefined) return;

		registerGraphTools();
		const stale = getStaleness(ctx.cwd, mtime, runner);
		if (
			stale.commits !== undefined &&
			stale.commits > staleCommitsAllowed
		) {
			ctx.ui.notify(
				`[graphify] graph is ${stale.commits} commits stale — run graphify_update`,
				"info",
			);
		}

		if (!cli.available) {
			ctx.ui.notify(CLI_INSTALL_MESSAGE, "error");
			return;
		}

		const hooks = reconcileGitHooks(ctx.cwd, bin, runner);
		if (hooks.error) {
			ctx.ui.notify(`[graphify] Git hook setup failed: ${hooks.error}`, "error");
		}
	});
}
