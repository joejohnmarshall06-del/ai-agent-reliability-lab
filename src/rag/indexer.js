import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { tokenize, termFrequency } from "./tokenize.js";

export async function loadKnowledgeBase(root = "knowledge") {
  const files = (await readdir(root)).filter((file) => file.endsWith(".md"));
  const documents = [];

  for (const file of files) {
    const text = await readFile(join(root, file), "utf8");
    documents.push({ id: file, text });
  }

  return buildIndex(documents);
}

export function buildIndex(documents) {
  const chunks = documents.flatMap((doc) => chunkDocument(doc));
  const documentFrequency = new Map();

  for (const chunk of chunks) {
    const unique = new Set(chunk.tokens);
    for (const token of unique) {
      documentFrequency.set(token, (documentFrequency.get(token) || 0) + 1);
    }
  }

  return {
    chunks: chunks.map((chunk) => ({
      ...chunk,
      vector: weightTerms(chunk.termFrequency, documentFrequency, chunks.length)
    })),
    documentFrequency,
    size: chunks.length
  };
}

export function chunkDocument(doc, maxTokens = 90) {
  const paragraphs = doc.text.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
  const chunks = [];
  let buffer = [];

  for (const paragraph of paragraphs) {
    const tokens = tokenize(paragraph);
    if (buffer.length && buffer.length + tokens.length > maxTokens) {
      chunks.push(makeChunk(doc.id, chunks.length, buffer.join(" ")));
      buffer = [];
    }
    buffer.push(paragraph);
  }

  if (buffer.length) {
    chunks.push(makeChunk(doc.id, chunks.length, buffer.join(" ")));
  }

  return chunks;
}

function makeChunk(documentId, index, text) {
  const tokens = tokenize(text);
  return {
    id: `${documentId}#${index}`,
    documentId,
    text,
    tokens,
    termFrequency: termFrequency(tokens)
  };
}

function weightTerms(tf, df, corpusSize) {
  const vector = new Map();
  for (const [token, count] of tf) {
    const idf = Math.log((corpusSize + 1) / ((df.get(token) || 0) + 1)) + 1;
    vector.set(token, count * idf);
  }
  return vector;
}

