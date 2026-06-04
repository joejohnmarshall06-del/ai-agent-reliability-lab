export class Trace {
  constructor(id = `trace_${Date.now()}_${Math.random().toString(16).slice(2)}`) {
    this.id = id;
    this.steps = [];
  }

  add(type, payload) {
    this.steps.push({
      type,
      payload,
      at: new Date().toISOString()
    });
  }

  summary() {
    return {
      id: this.id,
      steps: this.steps
    };
  }
}

