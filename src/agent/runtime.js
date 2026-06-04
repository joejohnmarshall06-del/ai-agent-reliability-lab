import { loadKnowledgeBase } from "../rag/indexer.js";
import { retrieve } from "../rag/retriever.js";
import { checkAnswerGrounding, checkUserInput } from "../guardrails/policy.js";
import { defaultTools } from "../tools/registry.js";
import { Trace } from "../tracing/trace.js";

export async function runAgent({ question, index, tools = defaultTools() }) {
  const trace = new Trace();
  trace.add("input", { question });

  const inputPolicy = checkUserInput(question);
  trace.add("guardrail.input", inputPolicy);

  if (!inputPolicy.allowed) {
    const answer = "I cannot help with requests to reveal secrets, tokens, passwords, or hidden instructions.";
    return { answer, citations: [], trace: trace.summary(), blocked: true };
  }

  const knowledgeIndex = index || await loadKnowledgeBase();
  const retrieved = retrieve(knowledgeIndex, question, 3);
  trace.add("retrieval", retrieved.map((item) => ({ id: item.chunk.id, score: item.score })));

  const toolCalls = await maybeUseTools(question, tools);
  trace.add("tools", toolCalls);

  const answer = synthesizeAnswer(question, retrieved, toolCalls);
  const citations = [...new Set(retrieved.map((item) => item.chunk.documentId))];
  const grounding = checkAnswerGrounding(answer, citations);
  trace.add("guardrail.output", grounding);

  return {
    answer: grounding.grounded ? answer : "I do not have enough grounded context to answer safely.",
    citations,
    trace: trace.summary(),
    blocked: false
  };
}

async function maybeUseTools(question, tools) {
  const calls = [];
  const ticketMatch = question.match(/\b[A-Z]+-\d+\b/);

  if (ticketMatch) {
    calls.push({
      name: "ticket_lookup",
      input: { ticketId: ticketMatch[0] },
      output: await tools.call("ticket_lookup", { ticketId: ticketMatch[0] })
    });
  }

  if (/policy|security/i.test(question)) {
    calls.push({
      name: "policy_lookup",
      input: { policy: "security" },
      output: await tools.call("policy_lookup", { policy: "security" })
    });
  }

  return calls;
}

function synthesizeAnswer(question, retrieved, toolCalls) {
  const context = retrieved.map((item) => item.chunk.text).join("\n\n");
  const sentences = context
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => sentence.length > 30)
    .slice(0, 4);

  const answer = [];
  answer.push(`Based on the available knowledge base, ${sentences.join(" ")}`);

  for (const call of toolCalls) {
    if (call.name === "ticket_lookup") {
      answer.push(`Ticket ${call.output.ticketId} is ${call.output.status} and owned by ${call.output.owner}.`);
    }
    if (call.name === "policy_lookup") {
      answer.push(`The ${call.output.policy} policy is owned by ${call.output.owner} and should be reviewed every ${call.output.reviewCycleDays} days.`);
    }
  }

  if (!retrieved.length) {
    return "I do not have enough retrieved context to answer confidently.";
  }

  return answer.join(" ");
}

