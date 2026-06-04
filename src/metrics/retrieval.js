export function recallAtK(retrievedIds, expectedIds, k) {
  const top = new Set(retrievedIds.slice(0, k));
  const expected = new Set(expectedIds);
  if (!expected.size) {
    return 1;
  }
  let hits = 0;
  for (const id of expected) {
    if (top.has(id)) {
      hits += 1;
    }
  }
  return hits / expected.size;
}

export function citationCoverage(answer, citations) {
  if (!answer || answer.includes("do not have enough")) {
    return 0;
  }
  return citations.length > 0 ? 1 : 0;
}

