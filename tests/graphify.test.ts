import assert from "node:assert/strict";
import { test } from "node:test";
import {
	CLI_INSTALL_MESSAGE,
	formatCommandResult,
	getCliInfo,
	hasGraph,
	hooksNeedInstall,
	reconcileGitHooks,
	graphFirstGuidance,
	runCommand,
	type CommandResult,
} from "../extensions/graphify.js";

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
			"post-commit: installed\npost-checkout: installed\nmerge driver: registered\n",
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
