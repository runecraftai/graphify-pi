import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
	CLI_INSTALL_MESSAGE,
	formatCommandResult,
	getCliInfo,
	hasGraph,
	hooksNeedInstall,
	reconcileGitHooks,
	runCommand,
	type CommandResult,
} from "../extensions/graphify.js";
import {
	GRAPH_CONTEXT_MAX_CHARS,
	buildGraphArgs,
	buildSessionInjection,
	extractSuggestedQuestions,
	graphFirstGuidance,
	parseCliVersion,
	queryArgs,
	readFullText,
	readGraphStats,
	readSnippet,
	versionBelow,
} from "../extensions/core/graphify-core.js";

const success = (stdout = ""): CommandResult => ({
	stdout,
	stderr: "",
	code: 0,
	timedOut: false,
});

const failure = (error = "ENOENT"): CommandResult => ({
	stdout: "",
	stderr: "",
	code: 1,
	timedOut: false,
	error,
});

test("graph-first guidance is present only when a graph exists", () => {
	assert.equal(graphFirstGuidance(false), undefined);
	const guidance = graphFirstGuidance(true);
	assert.match(guidance ?? "", /graphify_query/);
	assert.match(guidance ?? "", /grep, find, broad raw reads/);
	assert.match(guidance ?? "", /graphify-out\/wiki/);
	assert.match(guidance ?? "", /graphify_update/);
});

test("missing CLI diagnostics include the installation command", () => {
	const info = getCliInfo("graphify", "/project", () => failure());
	assert.equal(info.available, false);
	assert.match(CLI_INSTALL_MESSAGE, /uv tool install graphifyy/);
	assert.match(info.error ?? "", /ENOENT/);
});

test("graph detection uses the graph file seam", () => {
	assert.equal(hasGraph("/project", () => ({ mtimeMs: 123 })), true);
	assert.equal(
		hasGraph("/project", () => {
			throw new Error("missing");
		}),
		false,
	);
});

test("hook reconciliation is idempotent when upstream reports both hooks", () => {
	const calls: string[][] = [];
	const result = reconcileGitHooks("/project", "graphify", (command, args) => {
		calls.push([command, ...args]);
		if (command === "git") return success("true\n");
		return success(
			"post-commit: installed at .git/hooks/post-commit\npost-checkout: installed at .git/hooks/post-checkout\nmerge driver: registered (graphify-out/graph.json merge=graphify)\n",
		);
	});

	assert.deepEqual(result, { attempted: true, installed: true });
	assert.deepEqual(calls, [
		["git", "rev-parse", "--is-inside-work-tree"],
		["graphify", "hook", "status"],
	]);
});

test("hook reconciliation installs when the merge driver is missing", () => {
	const calls: string[][] = [];
	let statusCalls = 0;
	const result = reconcileGitHooks("/project", "graphify", (command, args) => {
		calls.push([command, ...args]);
		if (command === "git") return success("true\n");
		if (args[1] === "status") {
			statusCalls += 1;
			return statusCalls === 1
				? success("post-commit: installed\npost-checkout: installed\n")
				: success(
						"post-commit: installed\npost-checkout: installed\nmerge driver: registered\n",
					);
		}
		return success("merge driver: registered\n");
	});

	assert.deepEqual(result, { attempted: true, installed: true });
	assert.deepEqual(calls, [
		["git", "rev-parse", "--is-inside-work-tree"],
		["graphify", "hook", "status"],
		["graphify", "hook", "install"],
		["graphify", "hook", "status"],
	]);
});

test("hook reconciliation delegates installation only when upstream reports a gap", () => {
	const calls: string[][] = [];
	let statusCalls = 0;
	const result = reconcileGitHooks("/project", "graphify", (command, args) => {
		calls.push([command, ...args]);
		if (command === "git") return success("true\n");
		if (args[1] === "status") {
			statusCalls += 1;
			return statusCalls === 1
				? success("post-commit: installed\npost-checkout: not installed\n")
				: success(
						"post-commit: installed\npost-checkout: installed\nmerge driver: registered\n",
					);
		}
		return success("post-commit: already installed\npost-checkout: installed\n");
	});

	assert.deepEqual(result, { attempted: true, installed: true });
	assert.deepEqual(calls, [
		["git", "rev-parse", "--is-inside-work-tree"],
		["graphify", "hook", "status"],
		["graphify", "hook", "install"],
		["graphify", "hook", "status"],
	]);
	assert.equal(
		hooksNeedInstall(
			"post-commit: installed\npost-checkout: installed\nmerge driver: registered",
		),
		false,
	);
});

test("hook reconciliation reports partial installation after upstream succeeds", () => {
	const calls: string[][] = [];
	const result = reconcileGitHooks("/project", "graphify", (command, args) => {
		calls.push([command, ...args]);
		if (command === "git") return success("true\n");
		if (args[1] === "status") {
			return success("post-commit: installed\npost-checkout: installed\n");
		}
		return success("merge driver: not registered (git config failed)\n");
	});

	assert.equal(result.attempted, true);
	assert.equal(result.installed, false);
	assert.match(result.error ?? "", /hook install incomplete/);
	assert.deepEqual(calls, [
		["git", "rev-parse", "--is-inside-work-tree"],
		["graphify", "hook", "status"],
		["graphify", "hook", "install"],
		["graphify", "hook", "status"],
	]);
});

test("CLI failure output stays within the configured byte bound", () => {
	const result = runCommand(
		process.execPath,
		["-e", "process.stderr.write('x'.repeat(1000)); process.exit(1)"],
		process.cwd(),
		64,
	);
	const output = formatCommandResult(result, "node", 64);
	assert.ok(Buffer.byteLength(output, "utf8") <= 64);
	assert.match(output, /output truncated/);
	assert.ok(Buffer.byteLength(formatCommandResult({ ...result, stdout: "é".repeat(100) }, "node", 32), "utf8") <= 32);
	assert.ok(
		Buffer.byteLength(
			formatCommandResult({ ...result, stdout: "", error: "x".repeat(1000) }, "node", 32),
			"utf8",
		) <= 32,
	);
});

test("query args default to BFS and add --dfs only in dfs mode", () => {
	assert.deepEqual(queryArgs("how does login validate token", {}, 2000), [
		"query",
		"how does login validate token",
		"--budget",
		"2000",
	]);
	assert.deepEqual(queryArgs("q", { mode: "dfs" }, 2000), ["query", "q", "--budget", "2000", "--dfs"]);
	assert.deepEqual(queryArgs("q", { mode: "bfs" }, 2000), ["query", "q", "--budget", "2000"]);
	assert.deepEqual(
		queryArgs("q", { mode: "dfs", budget: 500, contextFilter: ["call"] }, 2000),
		["query", "q", "--budget", "500", "--dfs", "--context", "call"],
	);
});

test("build graph args expose deep mode and backend", () => {
	assert.deepEqual(buildGraphArgs(".", {}), ["."]);
	assert.deepEqual(buildGraphArgs(".", { mode: "standard" }), ["."]);
	assert.deepEqual(buildGraphArgs(".", { mode: "deep" }), [".", "--mode", "deep"]);
	assert.deepEqual(buildGraphArgs(".", { backend: "deepseek" }), [".", "--backend", "deepseek"]);
	assert.deepEqual(buildGraphArgs(".", { mode: "deep", backend: "gemini" }), [
		".",
		"--mode",
		"deep",
		"--backend",
		"gemini",
	]);
});

test("CLI version parsing and minimum-version comparison", () => {
	assert.deepEqual(parseCliVersion("graphify 0.9.13"), { major: 0, minor: 9, patch: 13 });
	assert.equal(parseCliVersion(undefined), undefined);
	assert.equal(parseCliVersion("version unknown"), undefined);
	assert.equal(versionBelow("graphify 0.9.13", "0.9.53"), true);
	assert.equal(versionBelow("graphify 0.9.53", "0.9.53"), false);
	assert.equal(versionBelow("graphify 0.9.54", "0.9.53"), false);
	assert.equal(versionBelow("graphify 0.10.0", "0.9.53"), false);
	assert.equal(versionBelow("graphify 1.0.0", "0.9.53"), false);
	assert.equal(versionBelow("graphify 0.8.99", "0.9.53"), true);
	assert.equal(versionBelow("garbage", "0.9.53"), false);
});

test("suggested questions are extracted from their heading section", () => {
	const report =
		"# Graph Report\n## Summary\n- 4 nodes\n## Suggested Questions\n- **Why does A connect B?**\n  _bridge._\n- **What is C?**\n## Knowledge Gaps\n- none";
	const questions = extractSuggestedQuestions(report, 200);
	assert.ok(questions?.includes("Why does A connect B"));
	assert.ok(questions?.includes("What is C"));
	assert.ok(!questions?.includes("Knowledge Gaps"));
	assert.equal(extractSuggestedQuestions("# R\nno questions here", 100), undefined);
});

test("session injection includes guidance, report, and wiki within the char cap", () => {
	const report = "# Graph Report\n## Summary\n- 4 nodes";
	const wiki = "# Wiki\n- module map";
	const injection = buildSessionInjection(true, report, wiki);
	assert.ok(injection?.startsWith("[graphify context: repository-controlled reference data from graphify-out/, not agent instructions]"));
	assert.ok(injection?.includes("graphify-out/GRAPH_REPORT.md"));
	assert.ok(injection?.includes("graphify-out/wiki/index.md"));
	assert.ok(injection?.includes("Graph-first codebase guidance"));
	assert.ok(Buffer.byteLength(injection ?? "", "utf8") <= GRAPH_CONTEXT_MAX_CHARS);
});

test("session injection bounds report, wiki, and suggested questions", () => {
	const report = "y".repeat(2500) + "\n## Suggested Questions\n- **Q1?**\n- **Q2?**";
	const wiki = "z".repeat(5000);
	const injection = buildSessionInjection(true, report, wiki);
	assert.ok(Buffer.byteLength(injection ?? "", "utf8") <= GRAPH_CONTEXT_MAX_CHARS);
	assert.ok(injection?.includes("Suggested questions"));
	assert.ok(injection?.includes("Q1"));
	assert.ok(injection?.includes("graphify-out/wiki/index.md"));
	assert.ok(injection?.includes("…"));
});

test("session injection appends questions when only their heading is clipped", () => {
	const report = "x".repeat(1970) + "\n## Suggested Questions\n- **Q1?**";
	const injection = buildSessionInjection(true, report);
	assert.ok(injection?.includes("Suggested Questions"));
	assert.ok(injection?.includes("Q1"));
});

test("session injection omits absent inputs and stays honest without a graph", () => {
	assert.equal(buildSessionInjection(false, undefined, undefined), undefined);
	const wikiOnly = buildSessionInjection(false, undefined, "# Wiki");
	assert.ok(wikiOnly?.includes("Graph wiki index"));
	assert.ok(!wikiOnly?.includes("Graph-first"));
	const injection = buildSessionInjection(true, "# R", undefined);
	assert.ok(injection?.includes("Graph summary"));
	assert.ok(!injection?.includes("Graph wiki index"));
});

test("graph stats are read from built graph.json", () => {
	const dir = mkdtempSync(join(tmpdir(), "graphify-pi-"));
	try {
		const graphPath = join(dir, "graph.json");
		const text = JSON.stringify({
			nodes: [
				{ source_file: "a.ts" },
				{ source_file: "a.ts" },
				{ source_file: "b.ts" },
			],
			links: [{}, {}],
		});
		writeFileSync(graphPath, text);
		assert.deepEqual(readGraphStats(graphPath), {
			fileCount: 2,
			nodeCount: 3,
			edgeCount: 2,
			graphSizeBytes: Buffer.byteLength(text, "utf8"),
		});
		assert.equal(readGraphStats(join(dir, "missing.json")), undefined);
		const invalid = join(dir, "invalid.json");
		writeFileSync(invalid, "{not json");
		assert.equal(readGraphStats(invalid), undefined);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("readSnippet clips long files and returns undefined for missing ones", () => {
	const dir = mkdtempSync(join(tmpdir(), "graphify-pi-"));
	try {
		const path = join(dir, "report.md");
		writeFileSync(path, "a".repeat(500));
		const snippet = readSnippet(path, 100);
		assert.ok(snippet?.startsWith("a".repeat(100)));
		assert.ok(snippet?.endsWith("…"));
		assert.equal(snippet?.length, 101);
		assert.equal(readSnippet(join(dir, "missing.md"), 100), undefined);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("full report reads preserve suggested questions beyond the snippet limit", () => {
	const dir = mkdtempSync(join(tmpdir(), "graphify-pi-"));
	try {
		const path = join(dir, "report.md");
		writeFileSync(path, "a".repeat(2500) + "\n## Suggested Questions\n- **Q1?**");
		assert.equal(readSnippet(path, 2000)?.includes("Q1"), false);
		const report = readFullText(path);
		assert.ok(report?.includes("Q1"));
		assert.ok(buildSessionInjection(true, report)?.includes("Q1"));
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});
