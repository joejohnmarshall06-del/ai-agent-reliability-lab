import test from "node:test";
import assert from "node:assert/strict";
import { runEvals } from "../src/evals/runner.js";

test("golden evals pass", async () => {
  const report = await runEvals();
  assert.equal(report.score, 100);
});

