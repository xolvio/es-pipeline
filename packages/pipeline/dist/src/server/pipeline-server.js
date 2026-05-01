import { createServer } from 'node:http';
import { createMessageBus, } from '@xolvio/message-bus';
import { dumbo } from '@event-driven-io/dumbo';
import { sqlite3DumboDriver } from '@event-driven-io/dumbo/sqlite3';
import { getSQLiteEventStore, readMessagesBatch } from '@event-driven-io/emmett-sqlite';
import { sqlite3EventStoreDriver } from '@event-driven-io/emmett-sqlite/sqlite3';
import cors from 'cors';
import express from 'express';
import getPort from 'get-port';
import { nanoid } from 'nanoid';
import { filterGraph } from '../graph/filter-graph.js';
import { EventCommandMapper } from '../runtime/event-command-map.js';
import { PipelineRuntime } from '../runtime/pipeline-runtime.js';
import { createPipelineEventStore } from '../store/pipeline-event-store.js';
import { createCommandGate } from './command-gate.js';
import { createPhasedBridge } from './phased-bridge.js';
import { QuiescenceTracker } from './quiescence-tracker.js';
import { SSEManager } from './sse-manager.js';
import { createV2RuntimeBridge } from './v2-runtime-bridge.js';
export class PipelineServer {
    constructor(config) {
        this.commandHandlers = new Map();
        this.pipelines = new Map();
        this.runtimes = new Map();
        this.itemKeyExtractors = new Map();
        this.middleware = [];
        this.currentSessionId = '';
        this.requestIdToSourceEvent = new Map();
        this.settledRequestIds = new Set();
        this.currentBatchIds = new Map();
        this.batchPendingCounts = new Map();
        this.storeFileName = config.storeFileName;
        this.requestedPort = config.port;
        this.actualPort = config.port;
        this.app = express();
        this.app.use(cors());
        this.app.use(express.json({ limit: '10mb' }));
        this.httpServer = createServer(this.app);
        this.messageBus = createMessageBus();
        this.eventStoreContext = createPipelineEventStore();
        this.eventCommandMapper = new EventCommandMapper([]);
        this.settledBridge = createV2RuntimeBridge({
            onDispatch: (commandType, data, correlationId) => {
                void this.dispatchFromSettled(commandType, data, correlationId);
            },
            onEmit: (eventType, data, correlationId) => {
                void this.emitFromSettled(eventType, data, correlationId);
            },
        });
        this.phasedBridge = createPhasedBridge({
            onDispatch: (commandType, data, correlationId) => {
                void this.dispatchFromSettled(commandType, data, correlationId);
            },
            onPhasedComplete: (event, correlationId) => {
                void this.handlePhasedComplete(event, correlationId);
            },
        });
        this.sseManager = new SSEManager();
        this.commandGate = createCommandGate();
        this.quiescenceTracker = new QuiescenceTracker({
            debounceMs: 50,
            onQuiescent: () => {
                void this.emitPipelineRunCompleted();
            },
        });
    }
    get port() {
        return this.actualPort;
    }
    getHttpServer() {
        return this.httpServer;
    }
    getMessageBus() {
        return this.messageBus;
    }
    registerCommandHandlers(handlers) {
        for (const handler of handlers) {
            this.commandHandlers.set(handler.name, handler);
            this.messageBus.registerCommandHandler(handler);
            this.eventCommandMapper.addHandler(handler);
            this.autoRegisterItemKeyExtractor(handler);
        }
    }
    autoRegisterItemKeyExtractor(handler) {
        if (this.itemKeyExtractors.has(handler.name))
            return;
        if (!handler.fields)
            return;
        const requiredFieldNames = [];
        for (const [name, def] of Object.entries(handler.fields)) {
            if (typeof def !== 'object' || def === null)
                continue;
            if (!('required' in def))
                continue;
            if (def.required !== true)
                continue;
            requiredFieldNames.push(name);
        }
        if (requiredFieldNames.length === 0)
            return;
        const fieldSet = new Set(requiredFieldNames);
        this.registerItemKeyExtractor(handler.name, (data) => {
            if (typeof data !== 'object' || data === null)
                return undefined;
            for (const [key, value] of Object.entries(data)) {
                if (fieldSet.has(key) && typeof value === 'string')
                    return value;
            }
            return undefined;
        });
    }
    getRegisteredCommands() {
        return Array.from(this.commandHandlers.keys());
    }
    registerItemKeyExtractor(commandType, extractor) {
        this.itemKeyExtractors.set(commandType, extractor);
    }
    registerConcurrency(commandType, config) {
        this.commandGate.register(commandType, config);
    }
    registerPipeline(pipeline) {
        this.pipelines.set(pipeline.descriptor.name, pipeline);
        this.runtimes.set(pipeline.descriptor.name, new PipelineRuntime(pipeline.descriptor));
        for (const handler of pipeline.descriptor.handlers) {
            if (handler.type === 'settled') {
                this.settledBridge.registerSettled(handler);
            }
            else if (handler.type === 'foreach-phased') {
                this.phasedBridge.registerPhased(handler);
            }
        }
    }
    getPipelineNames() {
        return Array.from(this.pipelines.keys());
    }
    use(handler) {
        this.middleware.push(handler);
        return this;
    }
    async start() {
        if (this.requestedPort === 0) {
            this.actualPort = await getPort();
        }
        for (const handler of this.middleware) {
            this.app.use(handler);
        }
        this.setupRoutes();
        await new Promise((resolve) => {
            this.httpServer.listen(this.actualPort, () => {
                resolve();
            });
        });
        if (this.storeFileName) {
            this.sqliteEventStore = getSQLiteEventStore({
                driver: sqlite3EventStoreDriver,
                fileName: this.storeFileName,
                schema: { autoMigration: 'CreateOrUpdate' },
            });
            await this.replayEventsFromSQLite();
            const originalAppend = this.eventStoreContext.eventStore.appendToStream.bind(this.eventStoreContext.eventStore);
            this.eventStoreContext.eventStore.appendToStream = async (streamName, events, options) => {
                const result = await originalAppend(streamName, events, options);
                await this.sqliteEventStore.appendToStream(streamName, events);
                return result;
            };
        }
        const restoredSessionId = await this.eventStoreContext.readModel.getLatestCorrelationId();
        if (restoredSessionId) {
            this.currentSessionId = restoredSessionId;
        }
        else {
            this.currentSessionId = `session-${nanoid()}`;
            await this.broadcastPipelineRunStarted(this.currentSessionId, 'PipelineStarted');
        }
        await this.emitPipelineStartedEvent();
    }
    async replayEventsFromSQLite() {
        const pool = dumbo({ driver: sqlite3DumboDriver, fileName: this.storeFileName });
        let lastPosition = 0n;
        try {
            while (true) {
                const { messages, currentGlobalPosition } = await readMessagesBatch(pool.execute, {
                    after: lastPosition,
                    batchSize: 1000,
                });
                if (messages.length === 0)
                    break;
                for (const message of messages) {
                    const metadata = message.metadata ?? {};
                    const streamName = metadata.streamName ?? 'pipeline-replay';
                    await this.eventStoreContext.eventStore.appendToStream(streamName, [
                        { type: message.type, data: message.data },
                    ]);
                }
                lastPosition = currentGlobalPosition;
            }
        }
        catch (error) {
            const isMissingTable = error instanceof Error && error.message.includes('no such table');
            if (!isMissingTable)
                throw error;
        }
        finally {
            await pool.close();
        }
    }
    async stop() {
        this.sseManager.closeAll();
        await new Promise((resolve) => {
            this.httpServer.close(() => resolve());
        });
    }
    async emitPipelineStartedEvent() {
        const correlationId = `startup-${nanoid()}`;
        const event = {
            type: 'PipelineStarted',
            data: { timestamp: new Date().toISOString() },
            correlationId,
        };
        await this.routeEventToPipelines(event);
    }
    setupRoutes() {
        this.app.get('/health', (_req, res) => {
            res.json({
                status: 'healthy',
                uptime: process.uptime(),
                timestamp: new Date().toISOString(),
            });
        });
        this.app.get('/registry', (_req, res) => {
            const eventHandlers = [];
            for (const pipeline of this.pipelines.values()) {
                for (const handler of pipeline.descriptor.handlers) {
                    if (handler.type === 'settled' || handler.type === 'accepts') {
                        continue;
                    }
                    if (!eventHandlers.includes(handler.eventType)) {
                        eventHandlers.push(handler.eventType);
                    }
                }
            }
            const commandsWithMetadata = Array.from(this.commandHandlers.entries()).map(([name, handler]) => {
                const alias = handler.alias ?? name;
                const description = handler.description ?? '';
                const fields = handler.fields ?? {};
                const examples = handler.examples ?? [];
                return { id: alias, name, alias, description, fields, examples };
            });
            res.json({
                eventHandlers,
                commandHandlers: Array.from(this.commandHandlers.keys()),
                commandsWithMetadata,
                folds: [],
            });
        });
        this.app.get('/pipeline', (req, res) => {
            void (async () => {
                const completeGraph = this.buildFullGraph();
                const filterOptions = this.parseFilterOptions(req.query);
                const filteredGraph = filterGraph(completeGraph, filterOptions);
                const correlationId = req.query.correlationId ?? this.currentSessionId;
                const graphWithStatus = await this.addStatusToCommandNodes(filteredGraph, correlationId);
                const latestRun = await this.eventStoreContext.readModel.getLatestCorrelationId();
                res.json({
                    nodes: graphWithStatus.nodes,
                    edges: graphWithStatus.edges,
                    latestRun,
                });
            })();
        });
        this.app.get('/pipeline/mermaid', (req, res) => {
            const filterOptions = this.parseFilterOptions(req.query);
            const mermaid = this.buildMermaidDiagram(filterOptions);
            res.type('text/plain').send(mermaid);
        });
        this.app.get('/pipeline/diagram', (req, res) => {
            const filterOptions = this.parseFilterOptions(req.query);
            const mermaidDefinition = this.buildMermaidDiagram(filterOptions);
            const html = this.buildDiagramHtml(mermaidDefinition);
            res.type('text/html').send(html);
        });
        this.app.post('/command', (req, res) => {
            void (async () => {
                const command = req.body;
                if (command.type === 'RestartPipeline') {
                    const previousSessionId = this.currentSessionId;
                    this.currentSessionId = `session-${nanoid()}`;
                    const requestId = `req-${nanoid()}`;
                    await this.broadcastPipelineRunStarted(this.currentSessionId, 'RestartPipeline');
                    await this.emitDomainEventEmitted(this.currentSessionId, requestId, 'PipelineRestarted', {
                        correlationId: this.currentSessionId,
                        previousSessionId,
                    });
                    res.json({ status: 'ack', sessionId: this.currentSessionId });
                    return;
                }
                if (command.type === 'Reset') {
                    // 1. Clear event store (in-memory)
                    this.clearEventStore();
                    // Re-apply SQLite sync wrapper on the fresh event store
                    if (this.sqliteEventStore) {
                        const originalAppend = this.eventStoreContext.eventStore.appendToStream.bind(this.eventStoreContext.eventStore);
                        this.eventStoreContext.eventStore.appendToStream = async (streamName, events, options) => {
                            const result = await originalAppend(streamName, events, options);
                            await this.sqliteEventStore.appendToStream(streamName, events);
                            return result;
                        };
                    }
                    // 2. New session
                    this.currentSessionId = `session-${nanoid()}`;
                    // 3. Broadcast PipelineRunStarted (persists event + SSE to UI)
                    await this.broadcastPipelineRunStarted(this.currentSessionId, 'Reset');
                    // 4. Run Clean command synchronously to remove generated files before restarting
                    const cleanRequestId = `req-${nanoid()}`;
                    const cleanCommand = {
                        type: 'Clean',
                        data: {},
                        correlationId: this.currentSessionId,
                        requestId: cleanRequestId,
                    };
                    if (this.commandHandlers.has('Clean')) {
                        await this.emitCommandDispatched(this.currentSessionId, cleanRequestId, 'Clean', {});
                        await this.processCommand(cleanCommand);
                    }
                    // 5. Emit PipelineStarted to trigger pipeline handlers (kicks off fresh run)
                    await this.emitPipelineStartedEvent();
                    res.json({ status: 'ack', sessionId: this.currentSessionId });
                    return;
                }
                if (!this.commandHandlers.has(command.type)) {
                    res.status(404).json({
                        status: 'nack',
                        error: `Command handler not found: ${command.type}`,
                    });
                    return;
                }
                const requestId = command.requestId ?? `req-${nanoid()}`;
                const correlationId = command.correlationId ?? `corr-${nanoid()}`;
                const commandWithIds = {
                    ...command,
                    requestId,
                    correlationId,
                };
                await this.emitCommandDispatched(correlationId, requestId, commandWithIds.type, commandWithIds.data);
                void this.processCommand(commandWithIds);
                res.json({
                    status: 'ack',
                    commandId: commandWithIds.requestId,
                    correlationId: commandWithIds.correlationId,
                    timestamp: new Date().toISOString(),
                });
            })();
        });
        this.app.get('/messages', (_req, res) => {
            void (async () => {
                const messages = await this.eventStoreContext.readModel.getMessages();
                const serialized = messages.map((m, index) => ({
                    message: {
                        type: m.messageName,
                        data: m.messageData,
                        correlationId: m.correlationId,
                        requestId: m.requestId,
                    },
                    messageType: m.messageType,
                    revision: String(index),
                    position: String(index),
                    timestamp: m.timestamp,
                }));
                res.json(serialized);
            })();
        });
        this.app.get('/stats', (_req, res) => {
            void (async () => {
                const stats = await this.eventStoreContext.readModel.getStats();
                res.json(stats);
            })();
        });
        this.app.get('/run-stats', (req, res) => {
            void (async () => {
                const correlationId = req.query.correlationId || this.currentSessionId;
                if (!correlationId) {
                    res.json({
                        pipelineStatus: 'idle',
                        correlationId: '',
                        items: { total: 0, running: 0, success: 0, error: 0, retried: 0 },
                        nodes: { total: 0, running: 0, success: 0, error: 0 },
                    });
                    return;
                }
                const runStats = await this.eventStoreContext.readModel.getRunStats(correlationId);
                const hasActivity = runStats.items.total > 0 || runStats.nodes.total > 0;
                const isQuiescent = this.quiescenceTracker.isQuiescent();
                let pipelineStatus;
                if (!isQuiescent) {
                    pipelineStatus = 'active';
                }
                else if (hasActivity) {
                    pipelineStatus = 'completed';
                }
                else {
                    pipelineStatus = 'idle';
                }
                res.json({
                    pipelineStatus,
                    correlationId,
                    ...runStats,
                });
            })();
        });
        this.app.get('/events', (req, res) => {
            const clientId = `sse-${nanoid()}`;
            const correlationIdFilter = req.query.correlationId;
            this.sseManager.addClient(clientId, res, correlationIdFilter);
        });
        this.app.post('/execute', (req, res) => {
            void (async () => {
                const { command, payload } = req.body;
                const handler = this.commandHandlers.get(command);
                if (!handler) {
                    res.status(400).json({ error: `Unknown command: ${command}` });
                    return;
                }
                try {
                    const resultEvent = await handler.handle({ type: command, data: payload });
                    const events = Array.isArray(resultEvent) ? resultEvent : [resultEvent];
                    const firstEvent = events[0];
                    res.json({ event: firstEvent.type, data: firstEvent.data });
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    const stack = error instanceof Error ? error.stack : undefined;
                    res.json({
                        event: 'HandlerFailed',
                        data: {
                            handlerName: handler.name,
                            command,
                            error: errorMessage,
                            stack,
                        },
                    });
                }
            })();
        });
    }
    buildCombinedGraph() {
        const combinedGraph = { nodes: [], edges: [] };
        const nodeSet = new Set();
        for (const pipeline of this.pipelines.values()) {
            const graph = pipeline.toGraph();
            for (const node of graph.nodes) {
                if (!nodeSet.has(node.id)) {
                    nodeSet.add(node.id);
                    combinedGraph.nodes.push(node);
                }
            }
            combinedGraph.edges.push(...graph.edges);
        }
        return combinedGraph;
    }
    buildFullGraph() {
        const commandToEvents = this.buildCommandToEvents();
        const rawGraph = this.buildCombinedGraph();
        const pipelineEvents = this.extractPipelineEvents(rawGraph, commandToEvents);
        const graphWithEvents = this.addCommandEventEdgesToGraph(rawGraph, commandToEvents, pipelineEvents);
        const graphWithEnrichedCommands = this.enrichCommandLabels(graphWithEvents);
        const graphWithEnrichedEvents = this.enrichEventLabels(graphWithEnrichedCommands);
        return this.markBackLinks(graphWithEnrichedEvents);
    }
    enrichCommandLabels(graph) {
        return {
            nodes: graph.nodes.map((node) => {
                if (node.type !== 'command') {
                    return node;
                }
                const handler = this.commandHandlers.get(node.id.replace('cmd:', ''));
                if (handler?.displayName === undefined) {
                    return node;
                }
                return { ...node, label: handler.displayName };
            }),
            edges: graph.edges,
        };
    }
    enrichEventLabels(graph) {
        const eventDisplayNames = this.buildEventDisplayNames();
        return {
            nodes: graph.nodes.map((node) => {
                if (node.type !== 'event') {
                    return node;
                }
                const displayName = eventDisplayNames.get(node.id.replace('evt:', ''));
                if (displayName === undefined) {
                    return node;
                }
                return { ...node, label: displayName };
            }),
            edges: graph.edges,
        };
    }
    async addStatusToCommandNodes(graph, correlationId) {
        const nodesWithStatus = await Promise.all(graph.nodes.map(async (node) => {
            if (node.type === 'command') {
                return this.addStatusToCommandNode(node, correlationId);
            }
            if (node.type === 'settled') {
                return this.addStatusToSettledNode(node, correlationId);
            }
            return node;
        }));
        return {
            nodes: nodesWithStatus,
            edges: graph.edges,
        };
    }
    async addStatusToCommandNode(node, correlationId) {
        const commandName = node.id.replace(/^cmd:/, '');
        if (correlationId === undefined) {
            return { ...node, status: 'idle', pendingCount: 0, endedCount: 0 };
        }
        const stats = await this.computeCommandStats(correlationId, commandName);
        const nodeStatus = await this.eventStoreContext.readModel.getNodeStatus(correlationId, commandName);
        let status;
        if (stats.pendingCount > 0) {
            status = 'running';
        }
        else if (!this.itemKeyExtractors.has(commandName) && nodeStatus !== null) {
            status = nodeStatus.status;
        }
        else {
            status = stats.aggregateStatus;
        }
        return {
            ...node,
            status,
            pendingCount: stats.pendingCount,
            endedCount: stats.endedCount,
            lastDurationMs: nodeStatus?.lastDurationMs,
        };
    }
    addStatusToSettledNode(node, correlationId) {
        if (correlationId === undefined) {
            return { ...node, status: 'idle', pendingCount: 0, endedCount: 0 };
        }
        const commandTypes = node.id.replace(/^settled:/, '');
        const templateId = `template-${commandTypes}`;
        const stats = this.settledBridge.getSettledStats(correlationId, templateId);
        return {
            ...node,
            status: stats.status,
            pendingCount: stats.pendingCount,
            endedCount: stats.endedCount,
        };
    }
    async emitItemStatusChanged(correlationId, commandType, itemKey, requestId, status, attemptCount, batchId) {
        await this.eventStoreContext.eventStore.appendToStream(`pipeline-${correlationId}`, [
            {
                type: 'ItemStatusChanged',
                data: {
                    correlationId,
                    commandType,
                    itemKey,
                    requestId,
                    status,
                    attemptCount,
                    timestamp: new Date().toISOString(),
                    ...(batchId !== undefined && { batchId }),
                },
            },
        ]);
    }
    async emitNodeStatusChanged(correlationId, commandName, status, previousStatus, lastDurationMs) {
        const stats = await this.computeCommandStats(correlationId, commandName);
        await this.eventStoreContext.eventStore.appendToStream(`pipeline-${correlationId}`, [
            {
                type: 'NodeStatusChanged',
                data: {
                    correlationId,
                    commandName,
                    nodeId: `cmd:${commandName}`,
                    status,
                    previousStatus,
                    pendingCount: stats.pendingCount,
                    endedCount: stats.endedCount,
                    lastDurationMs,
                },
            },
        ]);
    }
    async emitCommandDispatched(correlationId, requestId, commandType, commandData) {
        await this.eventStoreContext.eventStore.appendToStream(`pipeline-${correlationId}`, [
            {
                type: 'CommandDispatched',
                data: {
                    correlationId,
                    requestId,
                    commandType,
                    commandData,
                    timestamp: new Date(),
                },
            },
        ]);
    }
    async emitDomainEventEmitted(correlationId, requestId, eventType, eventData) {
        await this.eventStoreContext.eventStore.appendToStream(`pipeline-${correlationId}`, [
            {
                type: 'DomainEventEmitted',
                data: {
                    correlationId,
                    requestId,
                    eventType,
                    eventData,
                    timestamp: new Date(),
                },
            },
        ]);
    }
    async emitPipelineRunStarted(correlationId, triggerCommand) {
        await this.eventStoreContext.eventStore.appendToStream(`pipeline-${correlationId}`, [
            {
                type: 'PipelineRunStarted',
                data: {
                    correlationId,
                    triggerCommand,
                },
            },
        ]);
    }
    async emitPipelineRunCompleted() {
        const correlationId = this.currentSessionId;
        const requestId = `req-${nanoid()}`;
        await this.eventStoreContext.eventStore.appendToStream(`pipeline-${correlationId}`, [
            {
                type: 'DomainEventEmitted',
                data: {
                    correlationId,
                    requestId,
                    eventType: 'PipelineRunCompleted',
                    eventData: { correlationId, timestamp: new Date().toISOString() },
                    timestamp: new Date(),
                },
            },
        ]);
        const event = {
            type: 'PipelineRunCompleted',
            data: { correlationId, timestamp: new Date().toISOString() },
            correlationId,
        };
        this.sseManager.broadcast(event);
    }
    async updateNodeStatus(correlationId, commandName, status, lastDurationMs) {
        const existing = await this.eventStoreContext.readModel.getNodeStatus(correlationId, commandName);
        const previousStatus = existing?.status ?? 'idle';
        await this.emitNodeStatusChanged(correlationId, commandName, status, previousStatus, lastDurationMs);
        await this.broadcastNodeStatusChanged(correlationId, commandName, status, previousStatus, lastDurationMs);
    }
    async broadcastNodeStatusChanged(correlationId, commandName, status, previousStatus, lastDurationMs) {
        const stats = await this.computeCommandStats(correlationId, commandName);
        const event = {
            type: 'NodeStatusChanged',
            data: {
                nodeId: `cmd:${commandName}`,
                status,
                previousStatus,
                pendingCount: stats.pendingCount,
                endedCount: stats.endedCount,
                lastDurationMs,
            },
            correlationId,
        };
        this.sseManager.broadcast(event);
    }
    async broadcastPipelineRunStarted(correlationId, triggerCommand) {
        await this.emitPipelineRunStarted(correlationId, triggerCommand);
        const event = {
            type: 'PipelineRunStarted',
            data: { correlationId, triggerCommand },
            correlationId,
        };
        this.sseManager.broadcast(event);
    }
    resolveBatchId(correlationId, commandType, requestId) {
        const key = `${correlationId}:${commandType}`;
        const isFromSettled = this.settledRequestIds.delete(requestId);
        if (isFromSettled) {
            const existing = this.currentBatchIds.get(key);
            if (existing)
                return existing;
        }
        else {
            const pending = this.batchPendingCounts.get(key) ?? 0;
            if (pending === 0) {
                const batchId = new Date().toISOString();
                this.currentBatchIds.set(key, batchId);
                return batchId;
            }
        }
        const existing = this.currentBatchIds.get(key);
        if (existing)
            return existing;
        const batchId = new Date().toISOString();
        this.currentBatchIds.set(key, batchId);
        return batchId;
    }
    extractItemKey(commandType, data, requestId) {
        const extractor = this.itemKeyExtractors.get(commandType);
        if (extractor !== undefined) {
            const key = extractor(data);
            if (key !== undefined)
                return key;
        }
        return requestId;
    }
    async getOrCreateItemStatus(correlationId, commandType, itemKey, requestId, batchId) {
        const existing = await this.eventStoreContext.readModel.getItemStatus(correlationId, commandType, itemKey);
        const attemptCount = (existing?.attemptCount ?? 0) + 1;
        await this.emitItemStatusChanged(correlationId, commandType, itemKey, requestId, 'running', attemptCount, batchId);
        return { attemptCount };
    }
    async updateItemStatus(correlationId, commandType, itemKey, status) {
        const existing = await this.eventStoreContext.readModel.getItemStatus(correlationId, commandType, itemKey);
        if (existing !== null) {
            await this.emitItemStatusChanged(correlationId, commandType, itemKey, existing.currentRequestId, status, existing.attemptCount);
        }
    }
    async computeCommandStats(correlationId, commandType) {
        return this.eventStoreContext.readModel.computeCommandStats(correlationId, commandType);
    }
    getEventName(event) {
        return typeof event === 'string' ? event : event.name;
    }
    buildCommandToEvents() {
        const commandToEvents = {};
        for (const [name, handler] of this.commandHandlers.entries()) {
            if (handler.events !== undefined && Array.isArray(handler.events)) {
                commandToEvents[name] = handler.events.map((e) => this.getEventName(e));
            }
        }
        return commandToEvents;
    }
    buildEventDisplayNames() {
        const eventDisplayNames = new Map();
        for (const handler of this.commandHandlers.values()) {
            if (handler.events === undefined) {
                continue;
            }
            for (const event of handler.events) {
                if (typeof event !== 'string' && event.displayName !== undefined) {
                    eventDisplayNames.set(event.name, event.displayName);
                }
            }
        }
        return eventDisplayNames;
    }
    parseFilterOptions(query) {
        const excludeTypesParam = query.excludeTypes;
        const maintainEdgesParam = query.maintainEdges;
        const excludeTypes = [];
        if (typeof excludeTypesParam === 'string' && excludeTypesParam.length > 0) {
            const types = excludeTypesParam.split(',');
            for (const t of types) {
                if (t === 'event' || t === 'command' || t === 'settled') {
                    excludeTypes.push(t);
                }
            }
        }
        const maintainEdges = maintainEdgesParam === 'true';
        return { excludeTypes, maintainEdges };
    }
    buildMermaidDiagram(filterOptions) {
        const completeGraph = this.buildFullGraph();
        const graph = filterGraph(completeGraph, filterOptions);
        const lines = ['flowchart LR'];
        const eventNodes = new Set();
        const commandNodes = new Set();
        const settledNodes = new Set();
        const edgeContext = { index: 0, backLinkIndices: [] };
        this.addGraphNodesToMermaid(graph, lines, eventNodes, commandNodes, settledNodes);
        this.addGraphEdgesToMermaid(graph, lines, edgeContext);
        this.addMermaidStyles(lines, eventNodes, commandNodes, settledNodes, edgeContext.backLinkIndices);
        return lines.join('\n');
    }
    addCommandEventEdgesToGraph(graph, commandToEvents, pipelineEvents) {
        const commandNodes = new Set(graph.nodes.filter((n) => n.type === 'command').map((n) => n.id.replace('cmd:', '')));
        const existingEventIds = new Set(graph.nodes.filter((n) => n.type === 'event').map((n) => n.id));
        const newNodes = [...graph.nodes];
        const newEdges = [...graph.edges];
        for (const [commandName, events] of Object.entries(commandToEvents)) {
            const relevantEvents = events.filter((e) => pipelineEvents.has(e));
            if (relevantEvents.length === 0) {
                continue;
            }
            if (!commandNodes.has(commandName)) {
                newNodes.push({ id: `cmd:${commandName}`, type: 'command', label: commandName });
                commandNodes.add(commandName);
            }
            for (const eventName of relevantEvents) {
                const eventId = `evt:${eventName}`;
                if (!existingEventIds.has(eventId)) {
                    newNodes.push({ id: eventId, type: 'event', label: eventName });
                    existingEventIds.add(eventId);
                }
                newEdges.push({ from: `cmd:${commandName}`, to: eventId });
            }
        }
        return { nodes: newNodes, edges: newEdges };
    }
    markBackLinks(graph) {
        const outgoingEdgesWithBackLink = new Map();
        for (const edge of graph.edges) {
            const existing = outgoingEdgesWithBackLink.get(edge.from) ?? [];
            existing.push({ to: edge.to, isBackLink: edge.backLink === true });
            outgoingEdgesWithBackLink.set(edge.from, existing);
        }
        const markedEdges = graph.edges.map((edge) => {
            if (edge.backLink === true) {
                return edge;
            }
            if (edge.from.startsWith('evt:') && edge.to.startsWith('cmd:')) {
                const createsBackLink = this.hasPathToExcludingBackLinks(edge.to, edge.from, outgoingEdgesWithBackLink);
                if (createsBackLink) {
                    return { ...edge, backLink: true };
                }
            }
            return edge;
        });
        return { nodes: graph.nodes, edges: markedEdges };
    }
    hasPathToExcludingBackLinks(from, target, outgoingEdges) {
        const visited = new Set();
        const queue = [from];
        while (queue.length > 0) {
            const current = queue.shift();
            if (current === target) {
                return true;
            }
            if (visited.has(current)) {
                continue;
            }
            visited.add(current);
            const neighbors = outgoingEdges.get(current) ?? [];
            for (const neighbor of neighbors) {
                if (!neighbor.isBackLink && !visited.has(neighbor.to)) {
                    queue.push(neighbor.to);
                }
            }
        }
        return false;
    }
    settledCommandTypes(graph, settledNodeId) {
        return graph.edges
            .filter((e) => e.to === settledNodeId && e.from.startsWith('cmd:'))
            .map((e) => e.from.replace('cmd:', ''));
    }
    extractPipelineEvents(graph, commandToEvents) {
        const pipelineEvents = new Set();
        for (const node of graph.nodes) {
            if (node.id.startsWith('evt:')) {
                pipelineEvents.add(node.id.replace('evt:', ''));
            }
            if (node.id.startsWith('settled:')) {
                for (const commandType of this.settledCommandTypes(graph, node.id)) {
                    const events = commandToEvents[commandType];
                    if (events !== undefined) {
                        for (const eventName of events) {
                            pipelineEvents.add(eventName);
                        }
                    }
                }
            }
        }
        return pipelineEvents;
    }
    addGraphNodesToMermaid(graph, lines, eventNodes, commandNodes, settledNodes) {
        for (const node of graph.nodes) {
            if (node.id.startsWith('evt:')) {
                const eventName = node.id.replace('evt:', '');
                const safeId = `evt_${eventName}`;
                eventNodes.add(safeId);
                lines.push(`  ${safeId}([${node.label}])`);
            }
            else if (node.id.startsWith('cmd:')) {
                const commandName = node.id.replace('cmd:', '');
                commandNodes.add(commandName);
                lines.push(`  ${commandName}[${node.label}]`);
            }
            else if (node.id.startsWith('settled:')) {
                const commandTypes = this.settledCommandTypes(graph, node.id);
                const safeId = `settled_${node.id.replace('settled:', '')}`;
                settledNodes.add(safeId);
                lines.push(`  ${safeId}{{${commandTypes.join(', ')}}}`);
            }
        }
    }
    addGraphEdgesToMermaid(graph, lines, edgeContext) {
        for (const edge of graph.edges) {
            const from = this.normalizeNodeId(edge.from);
            const to = this.normalizeNodeId(edge.to);
            if (edge.backLink === true) {
                lines.push(`  ${from} -.->|retry| ${to}`);
                edgeContext.backLinkIndices.push(edgeContext.index);
            }
            else {
                lines.push(`  ${from} --> ${to}`);
            }
            edgeContext.index++;
        }
    }
    normalizeNodeId(nodeId) {
        if (nodeId.startsWith('evt:')) {
            return `evt_${nodeId.replace('evt:', '')}`;
        }
        if (nodeId.startsWith('cmd:')) {
            return nodeId.replace('cmd:', '');
        }
        return `settled_${nodeId.replace('settled:', '')}`;
    }
    addMermaidStyles(lines, eventNodes, commandNodes, settledNodes, backLinkIndices) {
        const failedEvents = [...eventNodes].filter((id) => id.toLowerCase().includes('failed'));
        const normalEvents = [...eventNodes].filter((id) => !id.toLowerCase().includes('failed'));
        lines.push('');
        lines.push('  classDef event fill:#fff3e0,stroke:#e65100');
        lines.push('  classDef eventFailed fill:#fff3e0,stroke:#e65100,color:#d32f2f');
        lines.push('  classDef command fill:#e3f2fd,stroke:#1565c0');
        lines.push('  classDef settled fill:#f3e5f5,stroke:#7b1fa2');
        if (normalEvents.length > 0) {
            lines.push(`  class ${normalEvents.join(',')} event`);
        }
        if (failedEvents.length > 0) {
            lines.push(`  class ${failedEvents.join(',')} eventFailed`);
        }
        if (commandNodes.size > 0) {
            lines.push(`  class ${[...commandNodes].join(',')} command`);
        }
        if (settledNodes.size > 0) {
            lines.push(`  class ${[...settledNodes].join(',')} settled`);
        }
        if (backLinkIndices.length > 0) {
            lines.push(`  linkStyle ${backLinkIndices.join(',')} stroke:#d32f2f,stroke-width:2px`);
        }
    }
    async processCommand(command) {
        const handler = this.commandHandlers.get(command.type);
        if (!handler)
            return;
        await this.commandGate.run(command.type, command.data, async (signal) => {
            await this.executeCommand(command, handler, signal);
        });
    }
    async executeCommand(command, handler, signal) {
        this.quiescenceTracker.increment();
        try {
            await this.executeCommandInner(command, handler, signal);
        }
        finally {
            this.quiescenceTracker.decrement();
        }
    }
    async executeCommandInner(command, handler, signal) {
        const batchKey = `${this.currentSessionId}:${command.type}`;
        const batchId = this.resolveBatchId(this.currentSessionId, command.type, command.requestId);
        this.batchPendingCounts.set(batchKey, (this.batchPendingCounts.get(batchKey) ?? 0) + 1);
        const itemKey = this.extractItemKey(command.type, command.data, command.requestId);
        await this.getOrCreateItemStatus(this.currentSessionId, command.type, itemKey, command.requestId, batchId);
        await this.updateNodeStatus(this.currentSessionId, command.type, 'running');
        const sourceEventType = this.requestIdToSourceEvent.get(command.requestId);
        this.requestIdToSourceEvent.delete(command.requestId);
        const settledCorrelationId = this.currentSessionId;
        this.settledBridge.onCommandStarted(command, settledCorrelationId, sourceEventType);
        const ctx = this.createContext(command.correlationId, signal);
        let events;
        try {
            const resultEvent = await handler.handle(command, ctx);
            events = Array.isArray(resultEvent) ? resultEvent : [resultEvent];
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const stack = error instanceof Error ? error.stack : undefined;
            events = [
                {
                    type: 'HandlerFailed',
                    data: {
                        handlerName: handler.name,
                        command: command.type,
                        error: errorMessage,
                        stack,
                    },
                },
            ];
        }
        if (signal.aborted) {
            this.batchPendingCounts.set(batchKey, (this.batchPendingCounts.get(batchKey) ?? 1) - 1);
            return;
        }
        const finalStatus = this.getStatusFromEvents(events);
        await this.updateItemStatus(this.currentSessionId, command.type, itemKey, finalStatus);
        this.batchPendingCounts.set(batchKey, (this.batchPendingCounts.get(batchKey) ?? 1) - 1);
        const completedItem = await this.eventStoreContext.readModel.getItemStatus(this.currentSessionId, command.type, itemKey);
        let durationMs;
        if (completedItem?.startedAt && completedItem?.endedAt) {
            durationMs = new Date(completedItem.endedAt).getTime() - new Date(completedItem.startedAt).getTime();
        }
        await this.updateNodeStatus(this.currentSessionId, command.type, finalStatus, durationMs);
        const eventsWithIds = events.map((event) => ({
            ...event,
            correlationId: command.correlationId,
            requestId: command.requestId,
        }));
        await Promise.all(eventsWithIds.map((e) => this.emitDomainEventEmitted(e.correlationId, command.requestId, e.type, e.data)));
        for (const eventWithIds of eventsWithIds) {
            this.sseManager.broadcast(eventWithIds);
            await this.messageBus.publishEvent(eventWithIds);
            const sourceCommand = this.eventCommandMapper.getSourceCommand(eventWithIds.type);
            if (sourceCommand !== undefined) {
                const result = eventWithIds.type.includes('Failed') ? 'failure' : 'success';
                const settledCorrelationId = this.currentSessionId;
                this.settledBridge.onEventReceived(eventWithIds, sourceCommand, result, settledCorrelationId, sourceEventType);
            }
            this.routeEventToPhasedExecutor(eventWithIds);
        }
        await Promise.all(eventsWithIds.map((e) => this.routeEventToPipelines(e)));
    }
    getStatusFromEvents(events) {
        for (const event of events) {
            if (event.type.includes('Failed')) {
                return 'error';
            }
        }
        return 'success';
    }
    /* v8 ignore next 12 - integration callback tested via v2-runtime-bridge.specs.ts */
    async dispatchFromSettled(commandType, data, correlationId) {
        const requestId = `req-${nanoid()}`;
        this.settledRequestIds.add(requestId);
        const command = {
            type: commandType,
            data: data,
            correlationId,
            requestId,
        };
        await this.emitCommandDispatched(correlationId, requestId, commandType, data);
        await this.processCommand(command);
    }
    /* v8 ignore next 10 - integration callback tested via v2-runtime-bridge.specs.ts */
    async emitFromSettled(eventType, data, correlationId) {
        const requestId = `req-${nanoid()}`;
        const eventWithIds = {
            type: eventType,
            data: data,
            correlationId,
        };
        await this.emitDomainEventEmitted(correlationId, requestId, eventType, data);
        this.sseManager.broadcast(eventWithIds);
        await this.messageBus.publishEvent(eventWithIds);
        await this.routeEventToPipelines(eventWithIds);
    }
    /* v8 ignore next 10 - integration callback tested via phased-bridge.specs.ts */
    async handlePhasedComplete(event, correlationId) {
        const requestId = `req-${nanoid()}`;
        const eventWithIds = {
            ...event,
            correlationId,
        };
        await this.emitDomainEventEmitted(correlationId, requestId, event.type, event.data);
        this.sseManager.broadcast(eventWithIds);
        await this.routeEventToPipelines(eventWithIds);
    }
    async routeEventToPipelines(event) {
        const ctx = this.createContext(event.correlationId, undefined, event.type);
        const runtimes = Array.from(this.runtimes.values());
        await Promise.all(runtimes.map((runtime) => runtime.handleEvent(event, ctx)));
    }
    createContext(correlationId, signal, sourceEventType) {
        return {
            correlationId,
            signal,
            emit: async (type, data) => {
                const requestId = `req-${nanoid()}`;
                const event = {
                    type,
                    data: data,
                    correlationId,
                };
                await this.emitDomainEventEmitted(correlationId, requestId, type, data);
                this.sseManager.broadcast(event);
                await this.routeEventToPipelines(event);
            },
            sendCommand: async (type, data, overrideCorrelationId) => {
                const requestId = `req-${nanoid()}`;
                const effectiveCorrelationId = overrideCorrelationId ?? correlationId;
                const command = {
                    type,
                    data: data,
                    correlationId: effectiveCorrelationId,
                    requestId,
                };
                if (sourceEventType) {
                    this.requestIdToSourceEvent.set(requestId, sourceEventType);
                }
                await this.emitCommandDispatched(effectiveCorrelationId, requestId, type, data);
                void this.processCommand(command);
            },
            startPhased: async (handler, event) => {
                this.phasedBridge.startPhased(handler, event, correlationId);
            },
            eventStore: this.eventStoreContext.eventStore,
            messageBus: this.messageBus,
            clearMessages: async () => {
                this.clearEventStore();
            },
        };
    }
    clearEventStore() {
        this.eventStoreContext = createPipelineEventStore();
    }
    routeEventToPhasedExecutor(event) {
        for (const pipeline of this.pipelines.values()) {
            for (const handler of pipeline.descriptor.handlers) {
                if (handler.type === 'foreach-phased') {
                    const itemKey = handler.completion.itemKey(event);
                    this.phasedBridge.onPhasedItemEvent(event, itemKey);
                }
            }
        }
    }
    buildDiagramHtml(mermaidDefinition) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pipeline Diagram</title>
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ startOnLoad: true, theme: 'default' });
  </script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      margin-top: 0;
      color: #333;
    }
    .mermaid {
      display: flex;
      justify-content: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Pipeline Diagram</h1>
    <div class="mermaid">
${mermaidDefinition}
    </div>
  </div>
</body>
</html>`;
    }
}
//# sourceMappingURL=pipeline-server.js.map