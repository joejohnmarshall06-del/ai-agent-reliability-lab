import { readFile } from "node:fs/promises";
import { loadKnowledgeBase } from "../rag/indexer.js";
import { retrieve } from "../rag/retriever.js";
import { runAgent } from "../agent/runtime.js";
import { recallAtK, citationCoverage } from "../metrics/retrieval.js";

export async function runEvals(datasetPath = "datasets/golden.json") {
  const dataset = JSON.parse(await readFile(datasetPath, "utf8"));
  const index = await loadKnowledgeBase();
  const cases = [];

  for (const item of dataset.cases) {
    const retrieved = retrieve(index, item.question, 3);
    const retrievedDocs = [...new Set(retrieved.map((entry) => entry.chunk.documentId))];
    const result = await runAgent({ question: item.question, index });
    const answerLower = result.answer.toLowerCase();
    const containsRequired = item.mustContain.every((phrase) => answerLower.includes(phrase.toLowerCase()));
    const recall = recallAtK(retrievedDocs, item.expectedDocs, 3);
    const citation = citationCoverage(result.answer, result.citations);
    const passed = containsRequired && recall >= 1 && citation >= 1 && !result.blocked;

    cases.push({
      id: item.id,
      passed,
      containsRequired,
      recall,
      citation,
      blocked: result.blocked,
      answer: result.answer,
      citations: result.citations
    });
  }

  const passCount = cases.filter((item) => item.passed).length;
  const avgRecall = average(cases.map((item) => item.recall));
  const policyViolations = cases.filter((item) => item.blocked).length;

  return {
    cases,
    total: cases.length,
    pass: passCount,
    score: Math.round((passCount / cases.length) * 100),
    recallAt3: avgRecall,
    policyViolations
  };
}

export function formatEvalReport(report) {
  const lines = [
    "AI Agent Reliability Lab",
    `Cases: ${report.total}`,
    `Pass: ${report.pass}`,
    `Score: ${report.score}`,
    `Recall@3: ${report.recallAt3.toFixed(2)}`,
    `Policy violations: ${report.policyViolations}`,
    ""
  ];

  for (const item of report.cases) {
    lines.push(`${item.passed ? "PASS" : "FAIL"} ${item.id}`);
  }

  return lines.join("\n");
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
}

