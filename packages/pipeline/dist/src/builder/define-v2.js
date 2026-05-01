export function defineV2(name) {
    const registrations = [];
    function createEmitChain(registration) {
        return {
            emit(commandType, data) {
                registration.commands.push({ commandType, data });
                return createEmitChain(registration);
            },
            on(eventType) {
                return createTriggerBuilder(eventType);
            },
            build() {
                return { name, registrations };
            },
        };
    }
    function createHandleChain() {
        return {
            on(eventType) {
                return createTriggerBuilder(eventType);
            },
            build() {
                return { name, registrations };
            },
        };
    }
    function createProcessChain(registration) {
        return {
            stopOnFailure() {
                registration.stopOnFailure = true;
                return createProcessChain(registration);
            },
            on(eventType) {
                return createTriggerBuilder(eventType);
            },
            build() {
                return { name, registrations };
            },
        };
    }
    function createForEachChain(eventType) {
        return {
            groupInto(phases) {
                return {
                    process() {
                        const registration = {
                            type: 'phased',
                            eventType,
                            phases,
                            stopOnFailure: false,
                        };
                        registrations.push(registration);
                        return createProcessChain(registration);
                    },
                };
            },
        };
    }
    function createAwaitAllChain() {
        return {
            on(eventType) {
                return createTriggerBuilder(eventType);
            },
            build() {
                return { name, registrations };
            },
        };
    }
    function createRunChain(eventType, keys) {
        return {
            awaitAll() {
                const registration = {
                    type: 'await',
                    eventType,
                    keys,
                };
                registrations.push(registration);
                return createAwaitAllChain();
            },
        };
    }
    function createTriggerBuilder(eventType) {
        return {
            emit(commandType, data) {
                const registration = {
                    type: 'emit',
                    eventType,
                    commands: [{ commandType, data }],
                };
                registrations.push(registration);
                return createEmitChain(registration);
            },
            handle(handler) {
                const registration = {
                    type: 'custom',
                    eventType,
                    handler,
                };
                registrations.push(registration);
                return createHandleChain();
            },
            forEach() {
                return createForEachChain(eventType);
            },
            run(keys) {
                return createRunChain(eventType, keys);
            },
        };
    }
    function createSettledChain(registration) {
        return {
            maxRetries(n) {
                registration.maxRetries = n;
                return createSettledChain(registration);
            },
            on(eventType) {
                return createTriggerBuilder(eventType);
            },
            settled(commandTypes) {
                const reg = { type: 'settled', commandTypes };
                registrations.push(reg);
                return createSettledChain(reg);
            },
            build() {
                return { name, registrations };
            },
        };
    }
    return {
        on(eventType) {
            return createTriggerBuilder(eventType);
        },
        settled(commandTypes) {
            const registration = { type: 'settled', commandTypes };
            registrations.push(registration);
            return createSettledChain(registration);
        },
        build() {
            return { name, registrations };
        },
    };
}
function addNode(ctx, id, type, label) {
    if (!ctx.nodeMap.has(id)) {
        ctx.nodeMap.set(id, { id, type, label });
    }
}
function processEmitRegistration(ctx, reg) {
    addNode(ctx, `evt:${reg.eventType}`, 'event', reg.eventType);
    for (const cmd of reg.commands) {
        addNode(ctx, `cmd:${cmd.commandType}`, 'command', cmd.commandType);
        ctx.edges.push({ from: `evt:${reg.eventType}`, to: `cmd:${cmd.commandType}` });
    }
}
function processCustomRegistration(ctx, reg) {
    addNode(ctx, `evt:${reg.eventType}`, 'event', reg.eventType);
    addNode(ctx, `handler:${reg.eventType}`, 'command', `${reg.eventType} handler`);
    ctx.edges.push({ from: `evt:${reg.eventType}`, to: `handler:${reg.eventType}` });
}
function processSettledRegistration(ctx, reg) {
    const settledNodeId = `settled:${reg.commandTypes.join(',')}`;
    addNode(ctx, settledNodeId, 'settled', 'Settled');
    for (const commandType of reg.commandTypes) {
        addNode(ctx, `cmd:${commandType}`, 'command', commandType);
        ctx.edges.push({ from: `cmd:${commandType}`, to: settledNodeId });
    }
}
function processPhasedRegistration(ctx, reg) {
    addNode(ctx, `evt:${reg.eventType}`, 'event', reg.eventType);
    const phasedNodeId = `phased:${reg.phases.join(',')}`;
    addNode(ctx, phasedNodeId, 'phased', reg.phases.join(' → '));
    ctx.edges.push({ from: `evt:${reg.eventType}`, to: phasedNodeId });
}
function processAwaitRegistration(ctx, reg) {
    addNode(ctx, `evt:${reg.eventType}`, 'event', reg.eventType);
    const awaitNodeId = `await:${reg.keys.join(',')}`;
    addNode(ctx, awaitNodeId, 'await', reg.keys.join(', '));
    ctx.edges.push({ from: `evt:${reg.eventType}`, to: awaitNodeId });
}
export function toGraph(pipeline) {
    const ctx = {
        nodeMap: new Map(),
        edges: [],
    };
    for (const reg of pipeline.registrations) {
        switch (reg.type) {
            case 'emit':
                processEmitRegistration(ctx, reg);
                break;
            case 'custom':
                processCustomRegistration(ctx, reg);
                break;
            case 'settled':
                processSettledRegistration(ctx, reg);
                break;
            case 'phased':
                processPhasedRegistration(ctx, reg);
                break;
            case 'await':
                processAwaitRegistration(ctx, reg);
                break;
        }
    }
    return {
        nodes: Array.from(ctx.nodeMap.values()),
        edges: ctx.edges,
    };
}
//# sourceMappingURL=define-v2.js.map