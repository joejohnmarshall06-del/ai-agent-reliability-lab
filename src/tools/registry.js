export class ToolRegistry {
  constructor() {
    this.tools = new Map();
  }

  register(tool) {
    this.tools.set(tool.name, tool);
  }

  async call(name, input) {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    const validation = tool.validate(input);
    if (!validation.ok) {
      throw new Error(`Invalid ${name} input: ${validation.error}`);
    }

    return tool.run(input);
  }

  list() {
    return [...this.tools.values()].map((tool) => ({
      name: tool.name,
      description: tool.description,
      schema: tool.schema
    }));
  }
}

export function defaultTools() {
  const registry = new ToolRegistry();

  registry.register({
    name: "ticket_lookup",
    description: "Find internal ticket status by ticket id.",
    schema: { ticketId: "string" },
    validate: (input) => typeof input.ticketId === "string" && input.ticketId.length > 2
      ? { ok: true }
      : { ok: false, error: "ticketId is required" },
    run: async ({ ticketId }) => ({
      ticketId,
      status: ticketId.endsWith("7") ? "blocked" : "in-progress",
      owner: "platform-team"
    })
  });

  registry.register({
    name: "policy_lookup",
    description: "Return policy metadata for a named policy.",
    schema: { policy: "string" },
    validate: (input) => typeof input.policy === "string" && input.policy.length > 1
      ? { ok: true }
      : { ok: false, error: "policy is required" },
    run: async ({ policy }) => ({
      policy,
      owner: "security",
      reviewCycleDays: 90
    })
  });

  return registry;
}

