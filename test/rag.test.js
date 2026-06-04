import test from "node:test";
import assert from "node:assert/strict";
import { buildIndex } from "../src/rag/indexer.js";
import { retrieve } from "../src/rag/retriever.js";

test("retrieves the most relevant document chunk", () => {
  const index = buildIndex([
    { id: "security.md", text: "API keys must be rotated every 90 days. Revoke the old key after verification." },
    { id: "cooking.md", text: "Pasta should be salted and boiled before serving." }
  ]);

  const results = retrieve(index, "How often should API keys rotate?", 1);

  assert.equal(results[0].chunk.documentId, "security.md");
});

