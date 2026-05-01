function normalizeCompletionEvent(config) {
    if (typeof config === 'string') {
        return { name: config };
    }
    return config;
}
class PipelineBuilderImpl {
    constructor(name) {
        this.keys = new Map();
        this.handlers = [];
        this.settledCounter = 0;
        this.name = name;
    }
    nextSettledId() {
        return `settled-${this.settledCounter++}`;
    }
    version(v) {
        this.versionValue = v;
        return this;
    }
    description(d) {
        this.descriptionValue = d;
        return this;
    }
    key(name, extractor) {
        this.keys.set(name, extractor);
        return this;
    }
    declare(commandType) {
        return new DeclareBuilderImpl(this, commandType);
    }
    on(eventType) {
        return new TriggerBuilderImpl(this, eventType);
    }
    settled(commandTypes, label) {
        return new SettledBuilderImpl(this, commandTypes, undefined, label);
    }
    addHandler(handler) {
        this.handlers.push(handler);
    }
    build() {
        const descriptor = {
            name: this.name,
            version: this.versionValue,
            description: this.descriptionValue,
            keys: this.keys,
            handlers: this.handlers,
        };
        const frozenDescriptor = Object.freeze(descriptor);
        return {
            descriptor: frozenDescriptor,
            toGraph: () => extractGraph(frozenDescriptor),
        };
    }
}
class DeclareBuilderImpl {
    constructor(parent, commandType) {
        this.parent = parent;
        this.commandType = commandType;
    }
    accepts(targets) {
        this.parent.addHandler({ type: 'accepts', commandType: this.commandType, accepts: targets });
        return this.parent;
    }
}
function addNode(ctx, id, type, label) {
    if (!ctx.nodeMap.has(id)) {
        ctx.nodeMap.set(id, { id, type, label });
    }
}
function processEmitHandler(ctx, handler) {
    addNode(ctx, `evt:${handler.eventType}`, 'event', handler.eventType);
    for (const cmd of handler.commands) {
        addNode(ctx, `cmd:${cmd.commandType}`, 'command', cmd.commandType);
        ctx.edges.push({ from: `evt:${handler.eventType}`, to: `cmd:${cmd.commandType}` });
    }
}
function processRunAwaitHandler(ctx, handler) {
    addNode(ctx, `evt:${handler.eventType}`, 'event', handler.eventType);
    const commands = Array.isArray(handler.commands) ? handler.commands : [];
    for (const cmd of commands) {
        addNode(ctx, `cmd:${cmd.commandType}`, 'command', cmd.commandType);
        ctx.edges.push({ from: `evt:${handler.eventType}`, to: `cmd:${cmd.commandType}` });
    }
    if (handler.onSuccess) {
        addNode(ctx, `evt:${handler.onSuccess.eventType}`, 'event', handler.onSuccess.eventType);
    }
    if (handler.onFailure) {
        addNode(ctx, `evt:${handler.onFailure.eventType}`, 'event', handler.onFailure.eventType);
    }
}
function processForEachPhasedHandler(ctx, handler) {
    addNode(ctx, `evt:${handler.eventType}`, 'event', handler.eventType);
    const sampleCmd = handler.emitFactory({}, '', { type: '', data: {} });
    addNode(ctx, `cmd:${sampleCmd.commandType}`, 'command', sampleCmd.commandType);
    ctx.edges.push({ from: `evt:${handler.eventType}`, to: `cmd:${sampleCmd.commandType}` });
    const successEvent = handler.completion.successEvent;
    const failureEvent = handler.completion.failureEvent;
    const successLabel = successEvent.displayName ?? successEvent.name;
    const failureLabel = failureEvent.displayName ?? failureEvent.name;
    addNode(ctx, `evt:${successEvent.name}`, 'event', successLabel);
    addNode(ctx, `evt:${failureEvent.name}`, 'event', failureLabel);
    ctx.edges.push({ from: `cmd:${sampleCmd.commandType}`, to: `evt:${successEvent.name}` });
    ctx.edges.push({ from: `cmd:${sampleCmd.commandType}`, to: `evt:${failureEvent.name}` });
}
function processCustomHandler(ctx, handler) {
    addNode(ctx, `evt:${handler.eventType}`, 'event', handler.eventType);
    if (handler.declaredEmits) {
        for (const emittedEvent of handler.declaredEmits) {
            addNode(ctx, `evt:${emittedEvent}`, 'event', emittedEvent);
            ctx.edges.push({ from: `evt:${handler.eventType}`, to: `evt:${emittedEvent}` });
        }
    }
}
function processAcceptsHandler(ctx, handler) {
    addNode(ctx, `cmd:${handler.commandType}`, 'command', handler.commandType);
    for (const target of handler.accepts) {
        addNode(ctx, `cmd:${target}`, 'command', target);
        ctx.edges.push({ from: `cmd:${handler.commandType}`, to: `cmd:${target}` });
    }
}
function processSettledHandler(ctx, handler) {
    const settledKey = handler.settledId ?? handler.commandTypes.join(',');
    const settledNodeId = `settled:${settledKey}`;
    addNode(ctx, settledNodeId, 'settled', handler.label ?? 'Settled');
    for (const commandType of handler.commandTypes) {
        addNode(ctx, `cmd:${commandType}`, 'command', commandType);
        ctx.edges.push({ from: `cmd:${commandType}`, to: settledNodeId });
    }
    if (handler.dispatches) {
        for (const dispatchedCommand of handler.dispatches) {
            addNode(ctx, `cmd:${dispatchedCommand}`, 'command', dispatchedCommand);
            ctx.edges.push({ from: settledNodeId, to: `cmd:${dispatchedCommand}`, backLink: true });
        }
    }
}
function extractGraph(descriptor) {
    const ctx = {
        nodeMap: new Map(),
        edges: [],
    };
    for (const handler of descriptor.handlers) {
        switch (handler.type) {
            case 'emit':
                processEmitHandler(ctx, handler);
                break;
            case 'run-await':
                processRunAwaitHandler(ctx, handler);
                break;
            case 'foreach-phased':
                processForEachPhasedHandler(ctx, handler);
                break;
            case 'custom':
                processCustomHandler(ctx, handler);
                break;
            case 'settled':
                processSettledHandler(ctx, handler);
                break;
            case 'accepts':
                processAcceptsHandler(ctx, handler);
                break;
        }
    }
    return {
        nodes: Array.from(ctx.nodeMap.values()),
        edges: ctx.edges,
    };
}
class TriggerBuilderImpl {
    constructor(parent, eventType) {
        this.parent = parent;
        this.eventType = eventType;
    }
    when(predicate) {
        this.predicate = predicate;
        return this;
    }
    emit(commandType, data) {
        return new EmitChainImpl(this.parent, this.eventType, [{ commandType, data }], this.predicate);
    }
    run(commandsOrFactory) {
        return new RunBuilderImpl(this.parent, this.eventType, commandsOrFactory, this.predicate);
    }
    forEach(itemsSelector) {
        return new ForEachBuilderImpl(this.parent, this.eventType, itemsSelector, this.predicate);
    }
    handle(handler, options) {
        return new HandleChainImpl(this.parent, this.eventType, handler, this.predicate, options?.emits);
    }
}
class EmitChainImpl {
    constructor(parent, eventType, commands, predicate) {
        this.parent = parent;
        this.eventType = eventType;
        this.commands = commands;
        this.predicate = predicate;
    }
    emit(commandType, data) {
        return new EmitChainImpl(this.parent, this.eventType, [...this.commands, { commandType, data }], this.predicate);
    }
    declare(commandType) {
        this.finalizeHandler();
        return new DeclareBuilderImpl(this.parent, commandType);
    }
    on(eventType) {
        this.finalizeHandler();
        return new TriggerBuilderImpl(this.parent, eventType);
    }
    settled(commandTypes, label) {
        this.finalizeHandler();
        return new SettledBuilderImpl(this.parent, commandTypes, this.eventType, label);
    }
    build() {
        this.finalizeHandler();
        return this.parent.build();
    }
    finalizeHandler() {
        this.parent.addHandler({
            type: 'emit',
            eventType: this.eventType,
            predicate: this.predicate,
            commands: this.commands.map((c) => ({
                commandType: c.commandType,
                data: c.data,
            })),
        });
    }
}
class HandleChainImpl {
    constructor(parent, eventType, handler, predicate, declaredEmits) {
        this.parent = parent;
        this.eventType = eventType;
        this.handler = handler;
        this.predicate = predicate;
        this.declaredEmits = declaredEmits;
    }
    declare(commandType) {
        this.finalizeHandler();
        return new DeclareBuilderImpl(this.parent, commandType);
    }
    on(eventType) {
        this.finalizeHandler();
        return new TriggerBuilderImpl(this.parent, eventType);
    }
    settled(commandTypes, label) {
        this.finalizeHandler();
        return new SettledBuilderImpl(this.parent, commandTypes, this.eventType, label);
    }
    build() {
        this.finalizeHandler();
        return this.parent.build();
    }
    finalizeHandler() {
        this.parent.addHandler({
            type: 'custom',
            eventType: this.eventType,
            predicate: this.predicate,
            handler: this.handler,
            declaredEmits: this.declaredEmits,
        });
    }
}
class RunBuilderImpl {
    constructor(parent, eventType, commands, predicate) {
        this.parent = parent;
        this.eventType = eventType;
        this.commands = commands;
        this.predicate = predicate;
    }
    awaitAll(keyName, keyExtractor, options) {
        return new GatherBuilderImpl(this.parent, this.eventType, this.commands, this.predicate, keyName, keyExtractor, options?.timeout);
    }
}
class GatherBuilderImpl {
    constructor(parent, eventType, commands, predicate, keyName, keyExtractor, timeout) {
        this.parent = parent;
        this.eventType = eventType;
        this.commands = commands;
        this.predicate = predicate;
        this.keyName = keyName;
        this.keyExtractor = keyExtractor;
        this.timeout = timeout;
    }
    onSuccess(eventType, dataFactory) {
        this.successConfig = { eventType, dataFactory: dataFactory };
        return new GatherChainImpl(this, this.parent);
    }
    onFailure(eventType, dataFactory) {
        this.failureConfig = { eventType, dataFactory: dataFactory };
        return new GatherChainImpl(this, this.parent);
    }
    on(eventType) {
        this.finalizeHandler();
        return new TriggerBuilderImpl(this.parent, eventType);
    }
    build() {
        this.finalizeHandler();
        return this.parent.build();
    }
    setSuccessConfig(config) {
        this.successConfig = config;
    }
    setFailureConfig(config) {
        this.failureConfig = config;
    }
    finalizeHandler() {
        this.parent.addHandler({
            type: 'run-await',
            eventType: this.eventType,
            predicate: this.predicate,
            commands: this.commands,
            awaitConfig: {
                keyName: this.keyName,
                key: this.keyExtractor,
                timeout: this.timeout,
            },
            onSuccess: this.successConfig,
            onFailure: this.failureConfig,
        });
    }
}
class GatherChainImpl {
    constructor(gatherBuilder, _parent) {
        this.gatherBuilder = gatherBuilder;
        this._parent = _parent;
    }
    onSuccess(eventType, dataFactory) {
        this.gatherBuilder.setSuccessConfig({
            eventType,
            dataFactory: dataFactory,
        });
        return this;
    }
    onFailure(eventType, dataFactory) {
        this.gatherBuilder.setFailureConfig({
            eventType,
            dataFactory: dataFactory,
        });
        return this;
    }
    on(eventType) {
        return this.gatherBuilder.on(eventType);
    }
    build() {
        return this.gatherBuilder.build();
    }
}
class ForEachBuilderImpl {
    constructor(parent, eventType, itemsSelector, predicate) {
        this.parent = parent;
        this.eventType = eventType;
        this.itemsSelector = itemsSelector;
        this.predicate = predicate;
    }
    groupInto(phases, classifier) {
        return new PhasedBuilderImpl(this.parent, this.eventType, this.itemsSelector, this.predicate, phases, classifier);
    }
}
class PhasedBuilderImpl {
    constructor(parent, eventType, itemsSelector, predicate, phases, classifier) {
        this.parent = parent;
        this.eventType = eventType;
        this.itemsSelector = itemsSelector;
        this.predicate = predicate;
        this.phases = phases;
        this.classifier = classifier;
    }
    process(commandType, dataFactory) {
        return new PhasedChainImpl(this.parent, this.eventType, this.itemsSelector, this.predicate, this.phases, this.classifier, commandType, dataFactory);
    }
}
class PhasedChainImpl {
    constructor(parent, eventType, itemsSelector, predicate, phases, classifier, commandType, dataFactory) {
        this.parent = parent;
        this.eventType = eventType;
        this.itemsSelector = itemsSelector;
        this.predicate = predicate;
        this.phases = phases;
        this.classifier = classifier;
        this.commandType = commandType;
        this.dataFactory = dataFactory;
        this.stopOnFailureFlag = false;
    }
    stopOnFailure() {
        this.stopOnFailureFlag = true;
        return this;
    }
    onComplete(config) {
        this.completionConfig = {
            successEvent: normalizeCompletionEvent(config.success),
            failureEvent: normalizeCompletionEvent(config.failure),
            itemKey: config.itemKey,
        };
        return new PhasedTerminalImpl(this, this.parent);
    }
    build() {
        this.finalizeHandler();
        return this.parent.build();
    }
    finalizeHandler() {
        if (!this.completionConfig) {
            throw new Error('onComplete() must be called before build()');
        }
        this.parent.addHandler({
            type: 'foreach-phased',
            eventType: this.eventType,
            predicate: this.predicate,
            itemsSelector: this.itemsSelector,
            phases: this.phases,
            classifier: this.classifier,
            stopOnFailure: this.stopOnFailureFlag,
            emitFactory: (item, _phase, _event) => ({
                commandType: this.commandType,
                data: this.dataFactory(item),
            }),
            completion: this.completionConfig,
        });
    }
}
class PhasedTerminalImpl {
    constructor(phasedChain, parent) {
        this.phasedChain = phasedChain;
        this.parent = parent;
    }
    on(eventType) {
        this.phasedChain.finalizeHandler();
        return new TriggerBuilderImpl(this.parent, eventType);
    }
    build() {
        this.phasedChain.finalizeHandler();
        return this.parent.build();
    }
}
class SettledBuilderImpl {
    constructor(parent, commandTypes, sourceEventType, customLabel) {
        this.parent = parent;
        this.commandTypes = commandTypes;
        this.sourceEventType = sourceEventType;
        this.customLabel = customLabel;
    }
    maxRetries(n) {
        this.maxRetriesValue = n;
        return this;
    }
    dispatch(options, handler) {
        return new SettledChainImpl(this.parent, this.commandTypes, handler, options.dispatches, this.sourceEventType, this.customLabel, this.maxRetriesValue);
    }
}
class SettledChainImpl {
    constructor(parent, commandTypes, handler, dispatches, sourceEventType, customLabel, maxRetriesFromBuilder) {
        this.parent = parent;
        this.commandTypes = commandTypes;
        this.handler = handler;
        this.dispatches = dispatches;
        this.sourceEventType = sourceEventType;
        this.customLabel = customLabel;
        this.maxRetriesValue = maxRetriesFromBuilder;
    }
    declare(commandType) {
        this.finalizeHandler();
        return new DeclareBuilderImpl(this.parent, commandType);
    }
    on(eventType) {
        this.finalizeHandler();
        return new TriggerBuilderImpl(this.parent, eventType);
    }
    settled(commandTypes, label) {
        this.finalizeHandler();
        return new SettledBuilderImpl(this.parent, commandTypes, undefined, label);
    }
    maxRetries(n) {
        this.maxRetriesValue = n;
        return this;
    }
    build() {
        this.finalizeHandler();
        return this.parent.build();
    }
    finalizeHandler() {
        const autoLabel = this.dispatches && this.dispatches.length > 0 ? `${this.dispatches[0]} Settled` : undefined;
        const settledLabel = this.customLabel ?? autoLabel;
        const descriptor = {
            type: 'settled',
            commandTypes: this.commandTypes,
            handler: this.handler,
            dispatches: this.dispatches,
            settledId: this.parent.nextSettledId(),
            label: settledLabel,
            sourceEventTypes: this.sourceEventType ? [this.sourceEventType] : undefined,
            maxRetries: this.maxRetriesValue,
        };
        this.parent.addHandler(descriptor);
    }
}
export function define(name) {
    return new PipelineBuilderImpl(name);
}
//# sourceMappingURL=define.js.map