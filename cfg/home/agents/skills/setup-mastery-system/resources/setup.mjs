#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import process from "node:process";

const LABELS = {
  "needs-triage": { color: "fbca04", description: "Maintainer needs to evaluate this issue" },
  "needs-info": { color: "d876e3", description: "Waiting on reporter for more information" },
  "ready-for-agent": { color: "0e8a16", description: "Fully specified, ready for an AFK agent" },
  "ready-for-human": { color: "5319e7", description: "Requires human implementation" },
  "wontfix": { color: "ffffff", description: "Will not be actioned" }
};

function exec(command, args, cwd) {
  return execFileSync(command, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function gh(args, cwd) {
  const value = exec("gh", ["api", ...args], cwd);
  return value ? JSON.parse(value) : null;
}

function ghPaged(path, cwd) {
  return gh(["--paginate", "--slurp", path], cwd).flat();
}

function repository(root) {
  const remote = exec("git", ["remote", "get-url", "origin"], root);
  const match = remote.match(/[/:]([^/:]+)\/([^/]+?)(?:\.git)?$/);
  if (!match) throw new Error("origin is not a GitHub repository");
  return `${match[1]}/${match[2]}`;
}

async function observe(root) {
  const repo = repository(root);
  const checks = [];
  try {
    exec("bash", ["scripts/validate.sh"], root);
    checks.push({ id: "repository-validation", status: "converged" });
  } catch (error) {
    checks.push({ id: "repository-validation", status: "failed", reason: error.stderr?.trim() || error.message });
  }
  const metadata = gh([`repos/${repo}`], root);
  checks.push({ id: "issues-enabled", status: metadata.has_issues ? "converged" : "drifted" });
  const labels = ghPaged(`repos/${repo}/labels?per_page=100`, root);
  for (const [name, desired] of Object.entries(LABELS)) {
    const actual = labels.find(label => label.name === name);
    checks.push({ id: `label:${name}`, status: actual && actual.color.toLowerCase() === desired.color && actual.description === desired.description ? "converged" : "drifted" });
  }
  try {
    gh([`repos/${repo}/contents/.github/ISSUE_TEMPLATE/learning_cycle.md?ref=${metadata.default_branch}`], root);
    checks.push({ id: "learning-cycle-template", status: "converged" });
  } catch (error) {
    checks.push({ id: "learning-cycle-template", status: "blocked", reason: "template-missing-on-default-branch" });
  }
  const permission = metadata.permissions ?? {};
  checks.push({ id: "issue-read", status: permission.pull ? "converged" : "blocked" });
  checks.push({ id: "issue-dependencies-manage", status: permission.maintain || permission.admin ? "converged" : "blocked" });
  try {
    ghPaged(`repos/${repo}/issues?state=all&per_page=100`, root);
    checks.push({ id: "complete-issue-read", status: "converged" });
  } catch (error) {
    checks.push({ id: "complete-issue-read", status: "blocked", reason: "issue-pagination-unavailable" });
  }
  const precedence = ["failed", "blocked", "drifted", "converged"];
  const status = precedence.find(value => checks.some(check => check.status === value)) ?? "converged";
  return { schema: "mastery.setup.result/v1", capability: "mastery.setup", status, mode: "check", repository: repo, checks };
}

export async function runSetup({ mode = "reconcile", root = process.cwd() } = {}) {
  try {
    if (!(["check", "reconcile"].includes(mode))) throw new Error("mode must be check or reconcile");
    const before = await observe(root);
    if (mode === "check" || before.status === "failed" || before.status === "blocked") return before;
    const repo = before.repository;
    const actions = [];
    const metadata = gh([`repos/${repo}`], root);
    if (!metadata.has_issues) {
      gh(["--method", "PATCH", `repos/${repo}`, "-F", "has_issues=true"], root);
      actions.push("issues-enabled");
    }
    const current = ghPaged(`repos/${repo}/labels?per_page=100`, root);
    for (const [name, desired] of Object.entries(LABELS)) {
      const actual = current.find(label => label.name === name);
      if (!actual) {
        gh(["--method", "POST", `repos/${repo}/labels`, "-f", `name=${name}`, "-f", `color=${desired.color}`, "-f", `description=${desired.description}`], root);
        actions.push(`label:${name}`);
      } else if (actual.color.toLowerCase() !== desired.color || actual.description !== desired.description) {
        gh(["--method", "PATCH", `repos/${repo}/labels/${encodeURIComponent(name)}`, "-f", `new_name=${name}`, "-f", `color=${desired.color}`, "-f", `description=${desired.description}`], root);
        actions.push(`label:${name}`);
      }
    }
    const after = await observe(root);
    return { ...after, mode: "reconcile", actions };
  } catch (error) {
    return {
      schema: "mastery.setup.result/v1",
      capability: "mastery.setup",
      status: "failed",
      mode,
      repository: null,
      checks: [{ id: "setup-runtime", status: "failed", reason: error.stderr?.trim() || error.message }]
    };
  }
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);
  const rootIndex = args.indexOf("--root");
  const root = rootIndex === -1 ? process.cwd() : args[rootIndex + 1];
  runSetup({ mode: args[0] ?? "reconcile", root }).then(result => {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    if (result.status !== "converged") process.exitCode = 1;
  }).catch(error => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
