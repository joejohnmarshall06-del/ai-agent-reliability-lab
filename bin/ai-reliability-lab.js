#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { runAgent } from "../src/agent/runtime.js";
import { runEvals, formatEvalReport } from "../src/evals/runner.js";

const args = process.argv.slice(2);
const command = args[0] || "help";

async function main() {
  if (command === "help" || command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  if (command === "ask") {
    const question = args.slice(1).join(" ").trim();
    if (!question) {
      throw new Error("Usage: ai-reliability-lab ask <question>");
    }
    const result = await runAgent({ question });
    console.log(result.answer);
    console.log("");
    console.log(`citations: ${result.citations.join(", ") || "none"}`);
    console.log(`trace: ${result.trace.id}`);
    return;
  }

  if (command === "eval") {
    const report = await runEvals();
    const jsonPath = readFlag("--json");
    if (jsonPath) {
      await mkdir(resolve(jsonPath, ".."), { recursive: true });
      await writeFile(resolve(jsonPath), `${JSON.stringify(report, null, 2)}\n`, "utf8");
    }
    console.log(formatEvalReport(report));
    process.exitCode = report.score >= 85 ? 0 : 1;
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

function readFlag(name) {
  const index = args.indexOf(name);
  return index === -1 ? null : args[index + 1];
}

function printHelp() {
  console.log(`ai-reliability-lab

Usage:
  ai-reliability-lab ask <question>
  ai-reliability-lab eval [--json report.json]
`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

