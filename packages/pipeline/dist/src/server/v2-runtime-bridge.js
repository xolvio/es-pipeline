import createDebug from 'debug';
import { decide, evolve, initialState } from '../engine/workflows/settled-workflow.js';
const debug = createDebug('auto:pipeline:settled-bridge');
function rebuildState(events, maxRetries) {
    let state = { ...initialState(), maxRetries };
    for (const event of events) {
        state = evolve(state, event);
    }
    return state;
}
function processInput(input, history, maxRetries) {
    history.push(input);
    const state = rebuildState(history, maxRetries);
    const result = decide(input, state);
    const outputs = Array.isArray(result) ? result : [result];
    for (const output of outputs) {
        history.push(output);
    }
    return outputs;
}
export function createV2RuntimeBridge(options) {
    const registrations = new Map();
    const commandToTemplateIds = new Map();
    const eventBuffer = new Map();
    const settledCounts = new Map();
    const keyedHistories = new Map();
    function bufferKey(templateId, correlationId, commandType) {
        return `${templateId}-${correlationId}-${commandType}`;
    }
    function compositeKey(templateId, correlationId) {
        return `${templateId}-${correlationId}`;
    }
    function isValidId(id) {
        return id !== undefined && id !== null && id !== '';
    }
    function ensureBuffer(templateId, correlationId, commandType) {
        const key = bufferKey(templateId, correlationId, commandType);
        let events = eventBuffer.get(key);
        if (!events) {
            events = [];
            eventBuffer.set(key, events);
        }
        return events;
    }
    function collectBufferedEvents(templateId, correlationId, commandTypes) {
        const result = {};
        for (const ct of commandTypes) {
            result[ct] = ensureBuffer(templateId, correlationId, ct);
        }
        return result;
    }
    function clearBuffer(templateId, correlationId, commandTypes) {
        for (const ct of commandTypes) {
            eventBuffer.delete(bufferKey(templateId, correlationId, ct));
        }
    }
    function getHistory(templateId, correlationId) {
        const key = compositeKey(templateId, correlationId);
        let history = keyedHistories.get(key);
        if (!history) {
            history = [];
            keyedHistories.set(key, history);
        }
        return history;
    }
    function resetHistory(templateId, correlationId) {
        keyedHistories.delete(compositeKey(templateId, correlationId));
    }
    function handleOutputs(outputs, registration, correlationId) {
        debug('handleOutputs: templateId=%s, correlationId=%s, outputs=%o', registration.templateId, correlationId, outputs.map((o) => o.type));
        for (const output of outputs) {
            if (output.type === 'AllSettled' || output.type === 'SettledFailed') {
                debug('  %s triggered for %s', output.type, registration.templateId);
                const events = collectBufferedEvents(registration.templateId, correlationId, registration.commandTypes);
                debug('  collected events: %o', Object.keys(events).map((k) => `${k}:${events[k].length}`));
                const send = (commandType, data) => {
                    debug('  dispatching %s with data keys: %o', commandType, Object.keys(data));
                    options.onDispatch(commandType, data, correlationId);
                };
                const emit = (eventType, data, emitCorrelationId) => {
                    debug('  emitting %s', eventType);
                    options.onEmit?.(eventType, data, emitCorrelationId ?? correlationId);
                };
                const handlerResult = registration.descriptor.handler(events, send, emit);
                debug('  handler returned: %o', handlerResult);
                const persist = handlerResult !== null &&
                    handlerResult !== undefined &&
                    typeof handlerResult === 'object' &&
                    'persist' in handlerResult &&
                    handlerResult.persist === true;
                const countKey = compositeKey(registration.templateId, correlationId);
                settledCounts.set(countKey, (settledCounts.get(countKey) ?? 0) + 1);
                if (persist) {
                    resetHistory(registration.templateId, correlationId);
                    clearBuffer(registration.templateId, correlationId, registration.commandTypes);
                }
            }
            if (output.type === 'RetryCommands') {
                debug('  RetryCommands: %o', output.data.commandTypes);
                for (const ct of output.data.commandTypes) {
                    options.onDispatch(ct, {}, correlationId);
                    eventBuffer.delete(bufferKey(registration.templateId, correlationId, ct));
                }
            }
        }
    }
    return {
        registerSettled(descriptor, config) {
            const commandTypes = descriptor.commandTypes;
            const templateId = descriptor.settledId
                ? `template-${descriptor.settledId}`
                : `template-${commandTypes.join(',')}`;
            const registration = {
                templateId,
                descriptor,
                commandTypes,
                maxRetries: descriptor.maxRetries ?? config?.maxRetries ?? 3,
                sourceEventTypes: descriptor.sourceEventTypes,
            };
            debug('registerSettled: templateId=%s, commandTypes=%o, sourceEventTypes=%o, label=%s', templateId, commandTypes, descriptor.sourceEventTypes, descriptor.label);
            registrations.set(templateId, registration);
            for (const ct of commandTypes) {
                const existing = commandToTemplateIds.get(ct) ?? new Set();
                existing.add(templateId);
                commandToTemplateIds.set(ct, existing);
            }
        },
        onCommandStarted(command, sessionCorrelationId, sourceEventType) {
            const { type: commandType, correlationId, requestId } = command;
            debug('onCommandStarted: command=%s, sourceEventType=%s, sessionCorrelationId=%s', commandType, sourceEventType, sessionCorrelationId);
            if (!isValidId(correlationId) || !isValidId(requestId)) {
                debug('  skipping: invalid correlationId or requestId');
                return;
            }
            const keyCorrelationId = sessionCorrelationId ?? correlationId;
            const templateIds = commandToTemplateIds.get(commandType);
            if (!templateIds) {
                debug('  skipping: no templateIds for command type');
                return;
            }
            debug('  found %d templateIds: %o', templateIds.size, [...templateIds]);
            for (const templateId of templateIds) {
                const registration = registrations.get(templateId);
                if (registration) {
                    debug('  checking registration %s, sourceEventTypes=%o', templateId, registration.sourceEventTypes);
                    if (sourceEventType &&
                        registration.sourceEventTypes &&
                        registration.sourceEventTypes.length > 0 &&
                        !registration.sourceEventTypes.includes(sourceEventType)) {
                        debug('    filtered out: sourceEventType %s not in %o', sourceEventType, registration.sourceEventTypes);
                        continue;
                    }
                    debug('    processing StartSettled for %s', templateId);
                    const history = getHistory(templateId, keyCorrelationId);
                    const input = {
                        type: 'StartSettled',
                        data: { correlationId: keyCorrelationId, commandTypes: [...registration.commandTypes] },
                    };
                    processInput(input, history, registration.maxRetries);
                }
            }
        },
        onEventReceived(event, sourceCommandType, result = 'success', sessionCorrelationId, sourceEventType) {
            const correlationId = event.correlationId;
            debug('onEventReceived: event=%s, sourceCommand=%s, result=%s, sourceEventType=%s', event.type, sourceCommandType, result, sourceEventType);
            if (!isValidId(correlationId)) {
                debug('  skipping: invalid correlationId');
                return;
            }
            const keyCorrelationId = sessionCorrelationId ?? correlationId;
            const templateIds = commandToTemplateIds.get(sourceCommandType);
            if (!templateIds) {
                debug('  skipping: no templateIds for sourceCommand');
                return;
            }
            debug('  found %d templateIds: %o', templateIds.size, [...templateIds]);
            for (const templateId of templateIds) {
                const registration = registrations.get(templateId);
                debug('  checking registration %s, sourceEventTypes=%o', templateId, registration.sourceEventTypes);
                if (sourceEventType &&
                    registration.sourceEventTypes &&
                    registration.sourceEventTypes.length > 0 &&
                    !registration.sourceEventTypes.includes(sourceEventType)) {
                    debug('    filtered out: sourceEventType %s not in %o', sourceEventType, registration.sourceEventTypes);
                    continue;
                }
                const existing = ensureBuffer(templateId, keyCorrelationId, sourceCommandType);
                existing.push(event);
                const history = getHistory(templateId, keyCorrelationId);
                debug('    processing CommandCompleted for %s, history length=%d', templateId, history.length);
                const input = {
                    type: 'CommandCompleted',
                    data: {
                        commandType: sourceCommandType,
                        result,
                        event: { ...event.data },
                    },
                };
                const outputs = processInput(input, history, registration.maxRetries);
                debug('    outputs: %o', outputs.map((o) => o.type));
                handleOutputs(outputs, registration, keyCorrelationId);
            }
        },
        getSettledStats(correlationId, templateId) {
            const registration = registrations.get(templateId);
            if (!registration) {
                return { status: 'idle', pendingCount: 0, endedCount: 0 };
            }
            const history = getHistory(templateId, correlationId);
            const state = rebuildState(history, registration.maxRetries);
            const countKey = compositeKey(templateId, correlationId);
            const endedCount = settledCounts.get(countKey) ?? 0;
            if (state.status === 'idle') {
                return { status: 'idle', pendingCount: 0, endedCount: 0 };
            }
            if (state.status === 'waiting') {
                return { status: 'running', pendingCount: 1, endedCount };
            }
            const hasFailure = Object.values(state.completions).some((c) => c.result === 'failure');
            if (hasFailure) {
                return { status: 'error', pendingCount: 0, endedCount };
            }
            return { status: 'success', pendingCount: 0, endedCount };
        },
    };
}
//# sourceMappingURL=v2-runtime-bridge.js.map