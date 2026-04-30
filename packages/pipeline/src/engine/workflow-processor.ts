type Event = { type: string; data: Record<string, unknown> };

type WorkflowDef = {
  decide: (input: Event, state: unknown) => Event | Event[];
  evolve: (state: unknown, event: Event) => unknown;
  initialState: () => unknown;
};

export type WorkflowRegistration = {
  id: string;
  workflow: WorkflowDef;
  inputEvents: string[];
};

export function createWorkflowProcessor() {
  const registrations = new Map<string, WorkflowRegistration>();
  const eventsByWorkflow = new Map<string, Event[]>();
  const keyedEvents = new Map<string, Map<string, Event[]>>();

  function rebuildState(reg: WorkflowRegistration, events: Event[]): unknown {
    let state = reg.workflow.initialState();
    for (const event of events) {
      state = reg.workflow.evolve(state, event);
    }
    return state;
  }

  function getKeyedHistory(workflowId: string, instanceKey: string): Event[] {
    let instances = keyedEvents.get(workflowId);
    if (!instances) {
      instances = new Map();
      keyedEvents.set(workflowId, instances);
    }
    let history = instances.get(instanceKey);
    if (!history) {
      history = [];
      instances.set(instanceKey, history);
    }
    return history;
  }

  function processWithHistory(reg: WorkflowRegistration, event: Event, history: Event[]): Event[] {
    const outputs: Event[] = [];
    history.push(event);
    const state = rebuildState(reg, history);
    const result = reg.workflow.decide(event, state);
    const resultEvents = Array.isArray(result) ? result : [result];
    for (const outputEvent of resultEvents) {
      history.push(outputEvent);
      outputs.push(outputEvent);
    }
    return outputs;
  }

  return {
    register(registration: WorkflowRegistration): void {
      registrations.set(registration.id, registration);
      eventsByWorkflow.set(registration.id, []);
    },

    process(event: Event): Event[] {
      const outputs: Event[] = [];

      for (const [id, reg] of registrations) {
        if (!reg.inputEvents.includes(event.type)) {
          continue;
        }
        const history = eventsByWorkflow.get(id)!;
        outputs.push(...processWithHistory(reg, event, history));
      }

      return outputs;
    },

    processKeyed(event: Event, instanceKey: string): Event[] {
      const outputs: Event[] = [];

      for (const [id, reg] of registrations) {
        if (!reg.inputEvents.includes(event.type)) {
          continue;
        }
        const history = getKeyedHistory(id, instanceKey);
        outputs.push(...processWithHistory(reg, event, history));
      }

      return outputs;
    },

    getState(workflowId: string, instanceKey: string): unknown {
      const reg = registrations.get(workflowId);
      if (!reg) return undefined;
      const history = getKeyedHistory(workflowId, instanceKey);
      return rebuildState(reg, history);
    },

    resetInstance(workflowId: string, instanceKey: string): void {
      const instances = keyedEvents.get(workflowId);
      if (instances) {
        instances.delete(instanceKey);
      }
    },
  };
}
