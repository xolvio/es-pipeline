import { createServer, type Server as HttpServer } from 'node:http';
import {
  type Command,
  type CommandHandler,
  createMessageBus,
  type Event,
  type MessageBus,
} from '@xolvio/message-bus';
import { dumbo } from '@event-driven-io/dumbo';
import { sqlite3DumboDriver } from '@event-driven-io/dumbo/sqlite3';
import type { EventStore } from '@event-driven-io/emmett';
import { getSQLiteEventStore, readMessagesBatch } from '@event-driven-io/emmett-sqlite';
import { sqlite3EventStoreDriver } from '@event-driven-io/emmett-sqlite/sqlite3';
import cors from 'cors';
import express from 'express';
import getPort from 'get-port';
import { nanoid } from 'nanoid';
import type { Pipeline } from '../builder/define';
import { filterGraph } from '../graph/filter-graph';
import type { FilterOptions, GraphIR, GraphNode, NodeStatus, NodeType } from '../graph/types';
import type { PipelineContext } from '../runtime/context';
import type { EventDefinition } from '../runtime/event-command-map';
import { EventCommandMapper } from '../runtime/event-command-map';
import { PipelineRuntime } from '../runtime/pipeline-runtime';
import { createPipelineEventStore, type PipelineEventStoreContext } from '../store/pipeline-event-store';
import { type ConcurrencyConfig, createCommandGate } from './command-gate';
import { createPhasedBridge } from './phased-bridge';
import { QuiescenceTracker } from './quiescence-tracker';
import { SSEManager } from './sse-manager';
import { createV2RuntimeBridge } from './v2-runtime-bridge';

export type { EventDefinition };

export interface CommandHandlerWithMetadata extends CommandHandler {
  alias?: string;
  description?: string;
  displayName?: string;
  fields?: Record<string, unknown>;
  examples?: unknown[];
  events?: EventDefinition[];
  handle: (command: Command, context?: PipelineContext) => Promise<Event | Event[]>;
}

export interface PipelineServerConfig {
  port: number;
  storeFileName?: string;
}

interface EventWithCorrelation extends Event {
  correlationId: string;
}

interface GraphNodeWithDuration extends GraphNode {
  lastDurationMs?: number;
}

export class PipelineServer {
  private app: express.Application;
  private httpServer: HttpServer;
  private messageBus: MessageBus;
  private readonly commandHandlers: Map<string, CommandHandlerWithMetadata> = new Map();
  private readonly pipelines: Map<string, Pipeline> = new Map();
  private readonly runtimes: Map<string, PipelineRuntime> = new Map();
  private actualPort: number;
  private readonly requestedPort: number;
  private readonly settledBridge: ReturnType<typeof createV2RuntimeBridge>;
  private readonly eventCommandMapper: EventCommandMapper;
  private readonly phasedBridge: ReturnType<typeof createPhasedBridge>;
  private readonly sseManager: SSEManager;
  private eventStoreContext: PipelineEventStoreContext;
  private readonly itemKeyExtractors = new Map<string, (data: unknown) => string | undefined>();
  private readonly commandGate: ReturnType<typeof createCommandGate>;
  private readonly middleware: express.RequestHandler[] = [];
  private readonly storeFileName?: string;
  private sqliteEventStore?: EventStore;
  private currentSessionId = '';
  private readonly quiescenceTracker: QuiescenceTracker;
  private readonly requestIdToSourceEvent = new Map<string, string>();
  private readonly settledRequestIds = new Set<string>();
  private readonly currentBatchIds = new Map<string, string>();
  private readonly batchPendingCounts = new Map<string, number>();

  constructor(config: PipelineServerConfig) {
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

  get port(): number {
    return this.actualPort;
  }

  getHttpServer(): HttpServer {
    return this.httpServer;
  }

  getMessageBus(): MessageBus {
    return this.messageBus;
  }

  registerCommandHandlers(handlers: CommandHandlerWithMetadata[]): void {
    for (const handler of handlers) {
      this.commandHandlers.set(handler.name, handler);
      this.messageBus.registerCommandHandler(handler);
      this.eventCommandMapper.addHandler(handler);
      this.autoRegisterItemKeyExtractor(handler);
    }
  }

  private autoRegisterItemKeyExtractor(handler: CommandHandlerWithMetadata): void {
    if (this.itemKeyExtractors.has(handler.name)) return;
    if (!handler.fields) return;
    const requiredFieldNames: string[] = [];
    for (const [name, def] of Object.entries(handler.fields)) {
      if (typeof def !== 'object' || def === null) continue;
      if (!('required' in def)) continue;
      if (def.required !== true) continue;
      requiredFieldNames.push(name);
    }
    if (requiredFieldNames.length === 0) return;
    const fieldSet = new Set(requiredFieldNames);
    this.registerItemKeyExtractor(handler.name, (data: unknown) => {
      if (typeof data !== 'object' || data === null) return undefined;
      for (const [key, value] of Object.entries(data)) {
        if (fieldSet.has(key) && typeof value === 'string') return value;
      }
      return undefined;
    });
  }

  getRegisteredCommands(): string[] {
    return Array.from(this.commandHandlers.keys());
  }

  registerItemKeyExtractor(commandType: string, extractor: (data: unknown) => string | undefined): void {
    this.itemKeyExtractors.set(commandType, extractor);
  }

  registerConcurrency(commandType: string, config: ConcurrencyConfig): void {
    this.commandGate.register(commandType, config);
  }

  registerPipeline(pipeline: Pipeline): void {
    this.pipelines.set(pipeline.descriptor.name, pipeline);
    this.runtimes.set(pipeline.descriptor.name, new PipelineRuntime(pipeline.descriptor));

    for (const handler of pipeline.descriptor.handlers) {
      if (handler.type === 'settled') {
        this.settledBridge.registerSettled(handler);
      } else if (handler.type === 'foreach-phased') {
        this.phasedBridge.registerPhased(handler);
      }
    }
  }

  getPipelineNames(): string[] {
    return Array.from(this.pipelines.keys());
  }

  use(handler: express.RequestHandler): this {
    this.middleware.push(handler);
    return this;
  }

  async start(): Promise<void> {
    if (this.requestedPort === 0) {
      this.actualPort = await getPort();
    }

    for (const handler of this.middleware) {
      this.app.use(handler);
    }

    this.setupRoutes();

    await new Promise<void>((resolve) => {
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
        await this.sqliteEventStore!.appendToStream(streamName, events);
        return result;
      };
    }

    const restoredSessionId = await this.eventStoreContext.readModel.getLatestCorrelationId();
    if (restoredSessionId) {
      this.currentSessionId = restoredSessionId;
    } else {
      this.currentSessionId = `session-${nanoid()}`;
      await this.broadcastPipelineRunStarted(this.currentSessionId, 'PipelineStarted');
    }
    await this.emitPipelineStartedEvent();
  }

  private async replayEventsFromSQLite(): Promise<void> {
    const pool = dumbo({ driver: sqlite3DumboDriver, fileName: this.storeFileName! });
    let lastPosition = 0n;

    try {
      while (true) {
        const { messages, currentGlobalPosition } = await readMessagesBatch(pool.execute, {
          after: lastPosition,
          batchSize: 1000,
        });
        if (messages.length === 0) break;

        for (const message of messages) {
          const metadata: { streamName?: string } = message.metadata ?? {};
          const streamName = metadata.streamName ?? 'pipeline-replay';
          await this.eventStoreContext.eventStore.appendToStream(streamName, [
            { type: message.type, data: message.data },
          ]);
        }
        lastPosition = currentGlobalPosition;
      }
    } catch (error: unknown) {
      const isMissingTable = error instanceof Error && error.message.includes('no such table');
      if (!isMissingTable) throw error;
    } finally {
      await pool.close();
    }
  }

  async stop(): Promise<void> {
    this.sseManager.closeAll();
    await new Promise<void>((resolve) => {
      this.httpServer.close(() => resolve());
    });
  }

  async emitPipelineStartedEvent(): Promise<void> {
    const correlationId = `startup-${nanoid()}`;
    const event = {
      type: 'PipelineStarted',
      data: { timestamp: new Date().toISOString() },
      correlationId,
    };
    await this.routeEventToPipelines(event);
  }

  private setupRoutes(): void {
    this.app.get('/health', (_req, res) => {
      res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      });
    });

    this.app.get('/registry', (_req, res) => {
      const eventHandlers: string[] = [];
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
        const correlationId = (req.query.correlationId as string | undefined) ?? this.currentSessionId;
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
        const command = req.body as Command;

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
            const originalAppend = this.eventStoreContext.eventStore.appendToStream.bind(
              this.eventStoreContext.eventStore,
            );
            this.eventStoreContext.eventStore.appendToStream = async (streamName, events, options) => {
              const result = await originalAppend(streamName, events, options);
              await this.sqliteEventStore!.appendToStream(streamName, events);
              return result;
            };
          }

          // 2. New session
          this.currentSessionId = `session-${nanoid()}`;

          // 3. Broadcast PipelineRunStarted (persists event + SSE to UI)
          await this.broadcastPipelineRunStarted(this.currentSessionId, 'Reset');

          // 4. Run Clean command synchronously to remove generated files before restarting
          const cleanRequestId = `req-${nanoid()}`;
          const cleanCommand: Command & { correlationId: string; requestId: string } = {
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
        const commandWithIds: Command & { correlationId: string; requestId: string } = {
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
        const correlationId = (req.query.correlationId as string) || this.currentSessionId;
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

        let pipelineStatus: 'idle' | 'active' | 'completed';
        if (!isQuiescent) {
          pipelineStatus = 'active';
        } else if (hasActivity) {
          pipelineStatus = 'completed';
        } else {
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
      const correlationIdFilter = req.query.correlationId as string | undefined;
      this.sseManager.addClient(clientId, res, correlationIdFilter);
    });

    this.app.post('/execute', (req, res) => {
      void (async () => {
        const { command, payload } = req.body as {
          command: string;
          payload: Record<string, unknown>;
        };

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
        } catch (error) {
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

  private buildCombinedGraph(): GraphIR {
    const combinedGraph: GraphIR = { nodes: [], edges: [] };
    const nodeSet = new Set<string>();

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

  private buildFullGraph(): GraphIR {
    const commandToEvents = this.buildCommandToEvents();
    const rawGraph = this.buildCombinedGraph();
    const pipelineEvents = this.extractPipelineEvents(rawGraph, commandToEvents);
    const graphWithEvents = this.addCommandEventEdgesToGraph(rawGraph, commandToEvents, pipelineEvents);
    const graphWithEnrichedCommands = this.enrichCommandLabels(graphWithEvents);
    const graphWithEnrichedEvents = this.enrichEventLabels(graphWithEnrichedCommands);
    return this.markBackLinks(graphWithEnrichedEvents);
  }

  private enrichCommandLabels(graph: GraphIR): GraphIR {
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

  private enrichEventLabels(graph: GraphIR): GraphIR {
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

  private async addStatusToCommandNodes(graph: GraphIR, correlationId?: string): Promise<GraphIR> {
    const nodesWithStatus = await Promise.all(
      graph.nodes.map(async (node) => {
        if (node.type === 'command') {
          return this.addStatusToCommandNode(node, correlationId);
        }
        if (node.type === 'settled') {
          return this.addStatusToSettledNode(node, correlationId);
        }
        return node;
      }),
    );
    return {
      nodes: nodesWithStatus,
      edges: graph.edges,
    };
  }

  private async addStatusToCommandNode(node: GraphNode, correlationId?: string): Promise<GraphNodeWithDuration> {
    const commandName = node.id.replace(/^cmd:/, '');
    if (correlationId === undefined) {
      return { ...node, status: 'idle' as NodeStatus, pendingCount: 0, endedCount: 0 };
    }
    const stats = await this.computeCommandStats(correlationId, commandName);
    const nodeStatus = await this.eventStoreContext.readModel.getNodeStatus(correlationId, commandName);

    let status: NodeStatus;
    if (stats.pendingCount > 0) {
      status = 'running';
    } else if (!this.itemKeyExtractors.has(commandName) && nodeStatus !== null) {
      status = nodeStatus.status;
    } else {
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

  private addStatusToSettledNode(node: GraphNode, correlationId?: string): GraphNode {
    if (correlationId === undefined) {
      return { ...node, status: 'idle' as NodeStatus, pendingCount: 0, endedCount: 0 };
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

  private async emitItemStatusChanged(
    correlationId: string,
    commandType: string,
    itemKey: string,
    requestId: string,
    status: 'running' | 'success' | 'error',
    attemptCount: number,
    batchId?: string,
  ): Promise<void> {
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

  private async emitNodeStatusChanged(
    correlationId: string,
    commandName: string,
    status: NodeStatus,
    previousStatus: NodeStatus,
    lastDurationMs?: number,
  ): Promise<void> {
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

  private async emitCommandDispatched(
    correlationId: string,
    requestId: string,
    commandType: string,
    commandData: Record<string, unknown>,
  ): Promise<void> {
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

  private async emitDomainEventEmitted(
    correlationId: string,
    requestId: string,
    eventType: string,
    eventData: Record<string, unknown>,
  ): Promise<void> {
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

  private async emitPipelineRunStarted(correlationId: string, triggerCommand: string): Promise<void> {
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

  private async emitPipelineRunCompleted(): Promise<void> {
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
    const event: Event & { correlationId: string } = {
      type: 'PipelineRunCompleted',
      data: { correlationId, timestamp: new Date().toISOString() },
      correlationId,
    };
    this.sseManager.broadcast(event);
  }

  private async updateNodeStatus(
    correlationId: string,
    commandName: string,
    status: NodeStatus,
    lastDurationMs?: number,
  ): Promise<void> {
    const existing = await this.eventStoreContext.readModel.getNodeStatus(correlationId, commandName);
    const previousStatus: NodeStatus = existing?.status ?? 'idle';
    await this.emitNodeStatusChanged(correlationId, commandName, status, previousStatus, lastDurationMs);
    await this.broadcastNodeStatusChanged(correlationId, commandName, status, previousStatus, lastDurationMs);
  }

  private async broadcastNodeStatusChanged(
    correlationId: string,
    commandName: string,
    status: NodeStatus,
    previousStatus: NodeStatus,
    lastDurationMs?: number,
  ): Promise<void> {
    const stats = await this.computeCommandStats(correlationId, commandName);
    const event: Event & { correlationId: string } = {
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

  private async broadcastPipelineRunStarted(correlationId: string, triggerCommand: string): Promise<void> {
    await this.emitPipelineRunStarted(correlationId, triggerCommand);
    const event: Event & { correlationId: string } = {
      type: 'PipelineRunStarted',
      data: { correlationId, triggerCommand },
      correlationId,
    };
    this.sseManager.broadcast(event);
  }

  private resolveBatchId(correlationId: string, commandType: string, requestId: string): string {
    const key = `${correlationId}:${commandType}`;
    const isFromSettled = this.settledRequestIds.delete(requestId);

    if (isFromSettled) {
      const existing = this.currentBatchIds.get(key);
      if (existing) return existing;
    } else {
      const pending = this.batchPendingCounts.get(key) ?? 0;
      if (pending === 0) {
        const batchId = new Date().toISOString();
        this.currentBatchIds.set(key, batchId);
        return batchId;
      }
    }

    const existing = this.currentBatchIds.get(key);
    if (existing) return existing;

    const batchId = new Date().toISOString();
    this.currentBatchIds.set(key, batchId);
    return batchId;
  }

  private extractItemKey(commandType: string, data: unknown, requestId: string): string {
    const extractor = this.itemKeyExtractors.get(commandType);
    if (extractor !== undefined) {
      const key = extractor(data);
      if (key !== undefined) return key;
    }
    return requestId;
  }

  private async getOrCreateItemStatus(
    correlationId: string,
    commandType: string,
    itemKey: string,
    requestId: string,
    batchId?: string,
  ): Promise<{ attemptCount: number }> {
    const existing = await this.eventStoreContext.readModel.getItemStatus(correlationId, commandType, itemKey);
    const attemptCount = (existing?.attemptCount ?? 0) + 1;

    await this.emitItemStatusChanged(correlationId, commandType, itemKey, requestId, 'running', attemptCount, batchId);

    return { attemptCount };
  }

  private async updateItemStatus(
    correlationId: string,
    commandType: string,
    itemKey: string,
    status: 'running' | 'success' | 'error',
  ): Promise<void> {
    const existing = await this.eventStoreContext.readModel.getItemStatus(correlationId, commandType, itemKey);
    if (existing !== null) {
      await this.emitItemStatusChanged(
        correlationId,
        commandType,
        itemKey,
        existing.currentRequestId,
        status,
        existing.attemptCount,
      );
    }
  }

  private async computeCommandStats(
    correlationId: string,
    commandType: string,
  ): Promise<{ pendingCount: number; endedCount: number; aggregateStatus: NodeStatus }> {
    return this.eventStoreContext.readModel.computeCommandStats(correlationId, commandType);
  }

  private getEventName(event: EventDefinition): string {
    return typeof event === 'string' ? event : event.name;
  }

  private buildCommandToEvents(): Record<string, string[]> {
    const commandToEvents: Record<string, string[]> = {};
    for (const [name, handler] of this.commandHandlers.entries()) {
      if (handler.events !== undefined && Array.isArray(handler.events)) {
        commandToEvents[name] = handler.events.map((e) => this.getEventName(e));
      }
    }
    return commandToEvents;
  }

  private buildEventDisplayNames(): Map<string, string> {
    const eventDisplayNames = new Map<string, string>();
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

  private parseFilterOptions(query: Record<string, unknown>): FilterOptions {
    const excludeTypesParam = query.excludeTypes;
    const maintainEdgesParam = query.maintainEdges;

    const excludeTypes: NodeType[] = [];
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

  private buildMermaidDiagram(filterOptions: FilterOptions): string {
    const completeGraph = this.buildFullGraph();
    const graph = filterGraph(completeGraph, filterOptions);
    const lines: string[] = ['flowchart LR'];

    const eventNodes = new Set<string>();
    const commandNodes = new Set<string>();
    const settledNodes = new Set<string>();
    const edgeContext = { index: 0, backLinkIndices: [] as number[] };

    this.addGraphNodesToMermaid(graph, lines, eventNodes, commandNodes, settledNodes);
    this.addGraphEdgesToMermaid(graph, lines, edgeContext);
    this.addMermaidStyles(lines, eventNodes, commandNodes, settledNodes, edgeContext.backLinkIndices);

    return lines.join('\n');
  }

  private addCommandEventEdgesToGraph(
    graph: GraphIR,
    commandToEvents: Record<string, string[]>,
    pipelineEvents: Set<string>,
  ): GraphIR {
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

  private markBackLinks(graph: GraphIR): GraphIR {
    const outgoingEdgesWithBackLink = new Map<string, Array<{ to: string; isBackLink: boolean }>>();
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

  private hasPathToExcludingBackLinks(
    from: string,
    target: string,
    outgoingEdges: Map<string, Array<{ to: string; isBackLink: boolean }>>,
  ): boolean {
    const visited = new Set<string>();
    const queue = [from];

    while (queue.length > 0) {
      const current = queue.shift()!;
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

  private settledCommandTypes(graph: GraphIR, settledNodeId: string): string[] {
    return graph.edges
      .filter((e) => e.to === settledNodeId && e.from.startsWith('cmd:'))
      .map((e) => e.from.replace('cmd:', ''));
  }

  private extractPipelineEvents(graph: GraphIR, commandToEvents: Record<string, string[]>): Set<string> {
    const pipelineEvents = new Set<string>();

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

  private addGraphNodesToMermaid(
    graph: GraphIR,
    lines: string[],
    eventNodes: Set<string>,
    commandNodes: Set<string>,
    settledNodes: Set<string>,
  ): void {
    for (const node of graph.nodes) {
      if (node.id.startsWith('evt:')) {
        const eventName = node.id.replace('evt:', '');
        const safeId = `evt_${eventName}`;
        eventNodes.add(safeId);
        lines.push(`  ${safeId}([${node.label}])`);
      } else if (node.id.startsWith('cmd:')) {
        const commandName = node.id.replace('cmd:', '');
        commandNodes.add(commandName);
        lines.push(`  ${commandName}[${node.label}]`);
      } else if (node.id.startsWith('settled:')) {
        const commandTypes = this.settledCommandTypes(graph, node.id);
        const safeId = `settled_${node.id.replace('settled:', '')}`;
        settledNodes.add(safeId);
        lines.push(`  ${safeId}{{${commandTypes.join(', ')}}}`);
      }
    }
  }

  private addGraphEdgesToMermaid(
    graph: GraphIR,
    lines: string[],
    edgeContext: { index: number; backLinkIndices: number[] },
  ): void {
    for (const edge of graph.edges) {
      const from = this.normalizeNodeId(edge.from);
      const to = this.normalizeNodeId(edge.to);
      if (edge.backLink === true) {
        lines.push(`  ${from} -.->|retry| ${to}`);
        edgeContext.backLinkIndices.push(edgeContext.index);
      } else {
        lines.push(`  ${from} --> ${to}`);
      }
      edgeContext.index++;
    }
  }

  private normalizeNodeId(nodeId: string): string {
    if (nodeId.startsWith('evt:')) {
      return `evt_${nodeId.replace('evt:', '')}`;
    }
    if (nodeId.startsWith('cmd:')) {
      return nodeId.replace('cmd:', '');
    }
    return `settled_${nodeId.replace('settled:', '')}`;
  }

  private addMermaidStyles(
    lines: string[],
    eventNodes: Set<string>,
    commandNodes: Set<string>,
    settledNodes: Set<string>,
    backLinkIndices: number[],
  ): void {
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

  private async processCommand(command: Command & { correlationId: string; requestId: string }): Promise<void> {
    const handler = this.commandHandlers.get(command.type);
    if (!handler) return;

    await this.commandGate.run(command.type, command.data, async (signal) => {
      await this.executeCommand(command, handler, signal);
    });
  }

  private async executeCommand(
    command: Command & { correlationId: string; requestId: string },
    handler: CommandHandlerWithMetadata,
    signal: AbortSignal,
  ): Promise<void> {
    this.quiescenceTracker.increment();
    try {
      await this.executeCommandInner(command, handler, signal);
    } finally {
      this.quiescenceTracker.decrement();
    }
  }

  private async executeCommandInner(
    command: Command & { correlationId: string; requestId: string },
    handler: CommandHandlerWithMetadata,
    signal: AbortSignal,
  ): Promise<void> {
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
    let events: Event[];
    try {
      const resultEvent = await handler.handle(command, ctx);
      events = Array.isArray(resultEvent) ? resultEvent : [resultEvent];
    } catch (error) {
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
    const completedItem = await this.eventStoreContext.readModel.getItemStatus(
      this.currentSessionId,
      command.type,
      itemKey,
    );
    let durationMs: number | undefined;
    if (completedItem?.startedAt && completedItem?.endedAt) {
      durationMs = new Date(completedItem.endedAt).getTime() - new Date(completedItem.startedAt).getTime();
    }
    await this.updateNodeStatus(this.currentSessionId, command.type, finalStatus, durationMs);

    const eventsWithIds: EventWithCorrelation[] = events.map((event) => ({
      ...event,
      correlationId: command.correlationId,
      requestId: command.requestId,
    }));

    await Promise.all(
      eventsWithIds.map((e) =>
        this.emitDomainEventEmitted(e.correlationId, command.requestId, e.type, e.data as Record<string, unknown>),
      ),
    );

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

  private getStatusFromEvents(events: Event[]): 'success' | 'error' {
    for (const event of events) {
      if (event.type.includes('Failed')) {
        return 'error';
      }
    }
    return 'success';
  }

  /* v8 ignore next 12 - integration callback tested via v2-runtime-bridge.specs.ts */
  private async dispatchFromSettled(commandType: string, data: unknown, correlationId: string): Promise<void> {
    const requestId = `req-${nanoid()}`;
    this.settledRequestIds.add(requestId);
    const command: Command & { correlationId: string; requestId: string } = {
      type: commandType,
      data: data as Record<string, unknown>,
      correlationId,
      requestId,
    };
    await this.emitCommandDispatched(correlationId, requestId, commandType, data as Record<string, unknown>);
    await this.processCommand(command);
  }

  /* v8 ignore next 10 - integration callback tested via v2-runtime-bridge.specs.ts */
  private async emitFromSettled(eventType: string, data: unknown, correlationId: string): Promise<void> {
    const requestId = `req-${nanoid()}`;
    const eventWithIds: EventWithCorrelation = {
      type: eventType,
      data: data as Record<string, unknown>,
      correlationId,
    };
    await this.emitDomainEventEmitted(correlationId, requestId, eventType, data as Record<string, unknown>);
    this.sseManager.broadcast(eventWithIds);
    await this.messageBus.publishEvent(eventWithIds);
    await this.routeEventToPipelines(eventWithIds);
  }

  /* v8 ignore next 10 - integration callback tested via phased-bridge.specs.ts */
  private async handlePhasedComplete(event: Event, correlationId: string): Promise<void> {
    const requestId = `req-${nanoid()}`;
    const eventWithIds: EventWithCorrelation = {
      ...event,
      correlationId,
    };
    await this.emitDomainEventEmitted(correlationId, requestId, event.type, event.data as Record<string, unknown>);
    this.sseManager.broadcast(eventWithIds);
    await this.routeEventToPipelines(eventWithIds);
  }

  private async routeEventToPipelines(event: EventWithCorrelation): Promise<void> {
    const ctx = this.createContext(event.correlationId, undefined, event.type);
    const runtimes = Array.from(this.runtimes.values());
    await Promise.all(runtimes.map((runtime) => runtime.handleEvent(event, ctx)));
  }

  private createContext(correlationId: string, signal?: AbortSignal, sourceEventType?: string): PipelineContext {
    return {
      correlationId,
      signal,
      emit: async (type: string, data: unknown) => {
        const requestId = `req-${nanoid()}`;
        const event: EventWithCorrelation = {
          type,
          data: data as Record<string, unknown>,
          correlationId,
        };
        await this.emitDomainEventEmitted(correlationId, requestId, type, data as Record<string, unknown>);
        this.sseManager.broadcast(event);
        await this.routeEventToPipelines(event);
      },
      sendCommand: async (type: string, data: unknown, overrideCorrelationId?: string) => {
        const requestId = `req-${nanoid()}`;
        const effectiveCorrelationId = overrideCorrelationId ?? correlationId;
        const command: Command & { correlationId: string; requestId: string } = {
          type,
          data: data as Record<string, unknown>,
          correlationId: effectiveCorrelationId,
          requestId,
        };
        if (sourceEventType) {
          this.requestIdToSourceEvent.set(requestId, sourceEventType);
        }
        await this.emitCommandDispatched(effectiveCorrelationId, requestId, type, data as Record<string, unknown>);
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

  private clearEventStore(): void {
    this.eventStoreContext = createPipelineEventStore();
  }

  private routeEventToPhasedExecutor(event: EventWithCorrelation): void {
    for (const pipeline of this.pipelines.values()) {
      for (const handler of pipeline.descriptor.handlers) {
        if (handler.type === 'foreach-phased') {
          const itemKey = handler.completion.itemKey(event);
          this.phasedBridge.onPhasedItemEvent(event, itemKey);
        }
      }
    }
  }

  private buildDiagramHtml(mermaidDefinition: string): string {
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
