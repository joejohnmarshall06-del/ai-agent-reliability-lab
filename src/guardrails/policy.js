const blockedPatterns = [
  /ignore (all )?(previous|prior) instructions/i,
  /reveal (the )?(system|developer) prompt/i,
  /print.*secret/i,
  /(print|show|reveal|dump|exfiltrate).*(api[_ -]?key|password|token|secret)/i,
  /(api[_ -]?key|password|token|secret).*(print|show|reveal|dump|exfiltrate)/i
];

export function checkUserInput(question) {
  const violations = blockedPatterns
    .filter((pattern) => pattern.test(question))
    .map((pattern) => pattern.source);

  return {
    allowed: violations.length === 0,
    violations
  };
}

export function checkAnswerGrounding(answer, citations) {
  const claimsKnowledge = /must|should|required|policy|recommended|rotate|incident|ticket/i.test(answer);
  return {
    grounded: !claimsKnowledge || citations.length > 0,
    reason: claimsKnowledge && citations.length === 0 ? "answer makes operational claims without citations" : null
  };
}
