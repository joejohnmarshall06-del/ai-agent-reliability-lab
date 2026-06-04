import { tokenize, termFrequency } from "./tokenize.js";

export function retrieve(index, query, k = 3) {
  const queryTokens = tokenize(query);
  const queryVector = termFrequency(queryTokens);

  return index.chunks
    .map((chunk) => ({
      chunk,
      score: hybridScore(queryTokens, queryVector, chunk)
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

function hybridScore(queryTokens, queryVector, chunk) {
  const lexicalOverlap = queryTokens.filter((token) => chunk.termFrequency.has(token)).length;
  return lexicalOverlap * 2 + cosine(queryVector, chunk.vector);
}

function cosine(a, b) {
  let dot = 0;
  let aNorm = 0;
  let bNorm = 0;

  for (const [key, value] of a) {
    aNorm += value * value;
    dot += value * (b.get(key) || 0);
  }

  for (const value of b.values()) {
    bNorm += value * value;
  }

  if (!aNorm || !bNorm) {
    return 0;
  }

  return dot / (Math.sqrt(aNorm) * Math.sqrt(bNorm));
}

