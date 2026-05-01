export function createWorkflowProcessor() {
    const registrations = new Map();
    const eventsByWorkflow = new Map();
    const keyedEvents = new Map();
    function rebuildState(reg, events) {
        let state = reg.workflow.initialState();
        for (const event of events) {
            state = reg.workflow.evolve(state, event);
        }
        return state;
    }
    function getKeyedHistory(workflowId, instanceKey) {
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
    function processWithHistory(reg, event, history) {
        const outputs = [];
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
        register(registration) {
            registrations.set(registration.id, registration);
            eventsByWorkflow.set(registration.id, []);
        },
        process(event) {
            const outputs = [];
            for (const [id, reg] of registrations) {
                if (!reg.inputEvents.includes(event.type)) {
                    continue;
                }
                const history = eventsByWorkflow.get(id);
                outputs.push(...processWithHistory(reg, event, history));
            }
            return outputs;
        },
        processKeyed(event, instanceKey) {
            const outputs = [];
            for (const [id, reg] of registrations) {
                if (!reg.inputEvents.includes(event.type)) {
                    continue;
                }
                const history = getKeyedHistory(id, instanceKey);
                outputs.push(...processWithHistory(reg, event, history));
            }
            return outputs;
        },
        getState(workflowId, instanceKey) {
            const reg = registrations.get(workflowId);
            if (!reg)
                return undefined;
            const history = getKeyedHistory(workflowId, instanceKey);
            return rebuildState(reg, history);
        },
        resetInstance(workflowId, instanceKey) {
            const instances = keyedEvents.get(workflowId);
            if (instances) {
                instances.delete(instanceKey);
            }
        },
    };
}
//# sourceMappingURL=workflow-processor.js.map