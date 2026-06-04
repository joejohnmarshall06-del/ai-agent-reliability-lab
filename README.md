# AI Agent Reliability Lab

A production-style reliability harness for AI applications: RAG retrieval, tool calling, policy guardrails, traces, regression evals, and quality scorecards.

This is not a chatbot wrapper. It models the engineering layer mainstream AI software teams build around LLMs before shipping agents to users.

## Why This Project Is Harder

- It evaluates AI behavior instead of only generating text.
- It separates retrieval, tools, policies, traces, and scoring.
- It has deterministic tests, so changes can be reviewed safely.
- It simulates the architecture used by AI copilots, support agents, internal knowledge assistants, and workflow agents.
- It does not require an API key to run the core demo.

## Architecture

```text
bin/                  CLI entrypoint
src/
  agent/              Agent runtime and tool orchestration
  evals/              Dataset runner and scoring
  guardrails/         Policy and safety checks
  rag/                Chunking, indexing, vector search
  tools/              Typed tool registry
  tracing/            Structured trace recorder
  metrics/            Retrieval and answer metrics
datasets/             Golden eval cases
knowledge/            Example knowledge base
docs/                 System design notes
test/                 Regression tests
```

## Commands

Run the demo agent:

```bash
node bin/ai-reliability-lab.js ask "How do I rotate an API key?"
```

Run evals:

```bash
node bin/ai-reliability-lab.js eval
```

Write a JSON eval report:

```bash
node bin/ai-reliability-lab.js eval --json report.json
```

Run tests:

```bash
npm test
```

## What It Demonstrates

- **RAG pipeline**: document loading, chunking, lexical-vector hybrid retrieval.
- **Agent runtime**: retrieval context, tool decisioning, final answer synthesis.
- **Tool calling**: typed tool registry with validation.
- **Guardrails**: detects unsafe requests, secret exfiltration attempts, and unsupported claims.
- **Tracing**: records retrieval, tool use, policy checks, and final response.
- **Evaluation**: golden dataset with pass/fail checks and aggregate score.
- **Metrics**: recall@k, citation coverage, policy violation rate, and answer quality heuristics.

## Example Eval Output

```text
AI Agent Reliability Lab
Cases: 5
Pass: 5
Score: 100
Recall@3: 1.00
Policy violations: 0
```

## Interview Talking Points

- Why production AI apps need evals before prompt changes.
- How RAG reduces hallucination but introduces retrieval quality problems.
- Why tool calls need schemas and validation.
- How traces help debug prompt, retrieval, and policy failures.
- What offline evals can and cannot prove.
- How this could connect to real LLM APIs later.

