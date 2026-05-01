import { decide, evolve, initialState } from '../engine/workflows/phased-workflow.js';
function resolveData(dispatch, event) {
    if (typeof dispatch.data === 'function') {
        return dispatch.data(event);
    }
    return dispatch.data;
}
function processInput(execution, input) {
    let state = evolve(execution.state, input);
    const result = decide(input, state);
    const outputs = Array.isArray(result) ? result : [result];
    for (const output of outputs) {
        state = evolve(state, output);
    }
    execution.state = state;
    return outputs;
}
export function createPhasedBridge(config) {
    const descriptors = new Map();
    const executions = new Map();
    const itemToExecution = new Map();
    function handleOutputs(outputs, execution) {
        for (const output of outputs) {
            if (output.type === 'DispatchItem') {
                const itemKey = output.data.itemKey;
                const phase = output.data.phase;
                const itemRecord = execution.items.find((i) => i.key === itemKey);
                if (itemRecord) {
                    const command = execution.handler.emitFactory(itemRecord.original, phase, execution.triggerEvent);
                    const data = resolveData(command, execution.triggerEvent);
                    config.onDispatch(command.commandType, data, execution.correlationId);
                }
            }
            else if (output.type === 'PhasedCompleted') {
                const completionEvent = {
                    type: execution.handler.completion.successEvent.name,
                    correlationId: execution.correlationId,
                    data: { results: output.data.completedItems, itemCount: execution.items.length },
                };
                config.onPhasedComplete(completionEvent, execution.correlationId);
            }
            else if (output.type === 'PhasedFailed') {
                const failureEvent = {
                    type: execution.handler.completion.failureEvent.name,
                    correlationId: execution.correlationId,
                    data: { failures: output.data.failedItems, completedItems: output.data.completedItems },
                };
                config.onPhasedComplete(failureEvent, execution.correlationId);
            }
        }
    }
    return {
        registerPhased(descriptor) {
            const handlerId = `phased-handler-${descriptor.eventType}`;
            descriptors.set(handlerId, descriptor);
        },
        startPhased(handler, event, correlationId) {
            const items = handler.itemsSelector(event);
            const itemRecords = [];
            for (const item of items) {
                const data = Object(item);
                const key = handler.completion.itemKey({ type: event.type, data });
                const phase = handler.classifier(item);
                itemRecords.push({ key, phase, original: item });
                itemToExecution.set(key, `${correlationId}|${handler.eventType}`);
            }
            const execution = {
                correlationId,
                handler,
                triggerEvent: event,
                items: itemRecords,
                state: initialState(),
            };
            executions.set(`${correlationId}|${handler.eventType}`, execution);
            const startInput = {
                type: 'StartPhased',
                data: {
                    correlationId,
                    items: itemRecords.map((i) => ({ key: i.key, phase: i.phase })),
                    phases: [...handler.phases],
                    stopOnFailure: handler.stopOnFailure,
                },
            };
            const outputs = processInput(execution, startInput);
            handleOutputs(outputs, execution);
        },
        onPhasedItemEvent(event, itemKey) {
            const executionKey = itemToExecution.get(itemKey);
            if (!executionKey)
                return;
            const execution = executions.get(executionKey);
            if (!execution)
                return;
            const isFailure = event.type === execution.handler.completion.failureEvent.name;
            const input = isFailure
                ? { type: 'ItemFailed', data: { itemKey, error: event.data } }
                : { type: 'ItemCompleted', data: { itemKey, result: event.data } };
            const outputs = processInput(execution, input);
            handleOutputs(outputs, execution);
        },
    };
}
//# sourceMappingURL=phased-bridge.js.map