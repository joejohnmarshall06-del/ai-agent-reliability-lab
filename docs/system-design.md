# System Design

## Goal

Build the reliability layer around an AI agent. Mainstream AI products rarely ship a raw prompt directly to users; they add retrieval, tools, policies, traces, evals, and deployment gates.

## Request Flow

1. User input enters the agent runtime.
2. Input guardrails reject requests for secrets or hidden instructions.
3. Retriever selects knowledge chunks from the local knowledge base.
4. Tool planner calls deterministic tools when the question needs structured data.
5. Answer synthesis combines retrieved context and tool outputs.
6. Output guardrails check whether operational claims have citations.
7. Trace recorder stores each step for debugging.
8. Evals score the whole flow against golden cases.

## Why This Matters

AI bugs often come from interaction effects:

- Retrieval returned the wrong document.
- The prompt ignored good context.
- A tool call accepted invalid input.
- The model made an unsupported claim.
- A safety policy blocked the wrong thing.
- A prompt change improved one case and regressed another.

This project makes those failures visible and testable.

## Production Extensions

- Replace deterministic synthesis with a real LLM provider.
- Store traces in OpenTelemetry.
- Add human preference evals.
- Add prompt versioning.
- Add semantic embeddings.
- Add red-team datasets.
- Add CI quality gates.
- Add live dashboards for eval trends.

