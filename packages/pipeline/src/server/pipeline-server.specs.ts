import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { dumbo } from '@event-driven-io/dumbo';
import { sqlite3DumboDriver } from '@event-driven-io/dumbo/sqlite3';
import { readMessagesBatch } from '@event-driven-io/emmett-sqlite';
import { nanoid } from 'nanoid';
import { define } from '../builder/define';
import { PipelineServer } from './pipeline-server';

interface HealthResponse {
  status: string;
}

interface CommandMetadata {
  id: string;
  name: string;
  alias: string;
  description: string;
  fields: Record<string, unknown>;
  examples: unknown[];
}

interface RegistryResponse {
  eventHandlers: string[];
  commandHandlers: string[];
  commandsWithMetadata: CommandMetadata[];
  folds: string[];
}

interface GraphNode {
  id: string;
  type: string;
  label: string;
  status?: string;
  pendingCount?: number;
  endedCount?: number;
  lastDurationMs?: number;
}

interface PipelineResponse {
  nodes: GraphNode[];
  edges: Array<{ from: string; to: string; backLink?: boolean }>;
  latestRun?: string;
}

interface GraphResponse {
  nodes: GraphNode[];
  edges: Array<{ from: string; to: string }>;
}

interface CommandResponse {
  status: string;
}

interface StoredMessage {
  message: { type: string };
}

interface StatsResponse {
  totalMessages: number;
}

interface RunStatsResponse {
  pipelineStatus: string;
  correlationId: string;
  items: { total: number; running: number; success: number; error: number; retried: number };
  nodes: { total: number; running: number; success: number; error: number };
}

async function fetchAs<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  return res.json() as Promise<T>;
}

async function fetchWithStatus(
  url: string,
  options?: RequestInit,
): Promise<{ status: number; json: <T>() => Promise<T> }> {
  const res = await fetch(url, options);
  return {
    status: res.status,
    json: <T>() => res.json() as Promise<T>,
  };
}

describe('PipelineServer', () => {
  describe('getHttpServer', () => {
    it('should return the underlying HTTP server', async () => {
      const server = new PipelineServer({ port: 0 });
      const httpServer = server.getHttpServer();
      expect(httpServer.listen).toBeTypeOf('function');
      expect(httpServer.close).toBeTypeOf('function');
    });
  });

  describe('getMessageBus', () => {
    it('should return the message bus with registered command handlers', () => {
      const handler = {
        name: 'BusTestCmd',
        handle: async () => ({ type: 'BusTestDone', data: {} }),
      };
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);

      const messageBus = server.getMessageBus();
      const registeredHandlers = messageBus.getCommandHandlers();

      expect(registeredHandlers.BusTestCmd).toEqual(handler);
    });

    it('should publish events to message bus when command handler emits events', async () => {
      const handler = {
        name: 'PublishTestCmd',
        handle: async () => ({ type: 'PublishTestDone', data: { value: 42 } }),
      };
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      await server.start();

      const receivedEvents: Array<{ type: string }> = [];
      server.getMessageBus().subscribeAll({
        name: 'TestSubscriber',
        handle: async (event) => {
          receivedEvents.push({ type: event.type });
        },
      });

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'PublishTestCmd', data: {} }),
      });

      await new Promise((r) => setTimeout(r, 100));
      await server.stop();

      expect(receivedEvents).toContainEqual({ type: 'PublishTestDone' });
    });
  });

  describe('middleware', () => {
    it('should apply middleware before routes on start', async () => {
      const server = new PipelineServer({ port: 0 });
      server.use((_req, res, next) => {
        res.setHeader('X-Custom-Header', 'middleware-applied');
        next();
      });
      await server.start();
      const response = await fetch(`http://localhost:${server.port}/health`);
      expect(response.headers.get('X-Custom-Header')).toBe('middleware-applied');
      await server.stop();
    });

    it('should allow chaining use() calls', async () => {
      const server = new PipelineServer({ port: 0 });
      server
        .use((_req, res, next) => {
          res.setHeader('X-First', 'first');
          next();
        })
        .use((_req, res, next) => {
          res.setHeader('X-Second', 'second');
          next();
        });
      await server.start();
      const response = await fetch(`http://localhost:${server.port}/health`);
      expect(response.headers.get('X-First')).toBe('first');
      expect(response.headers.get('X-Second')).toBe('second');
      await server.stop();
    });
  });

  describe('health endpoint', () => {
    it('should respond to /health', async () => {
      const server = new PipelineServer({ port: 0 });
      await server.start();
      const data = await fetchAs<HealthResponse>(`http://localhost:${server.port}/health`);
      expect(data.status).toBe('healthy');
      await server.stop();
    });
  });

  describe('command handlers', () => {
    it('should register command handlers', () => {
      const handler = {
        name: 'Cmd',
        handle: async () => ({ type: 'Done', data: {} }),
      };
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      expect(server.getRegisteredCommands()).toContain('Cmd');
    });
  });

  describe('pipeline registration', () => {
    it('should register pipeline', () => {
      const pipeline = define('test').on('A').emit('B', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerPipeline(pipeline);
      expect(server.getPipelineNames()).toContain('test');
    });
  });

  describe('registerConcurrency', () => {
    it('registers concurrency config for a command type', async () => {
      const server = new PipelineServer({ port: 0 });
      const handler = {
        name: 'SlowCmd',
        handle: async () => {
          await new Promise((r) => setTimeout(r, 50));
          return { type: 'SlowDone', data: {} };
        },
      };
      server.registerCommandHandlers([handler]);
      server.registerConcurrency('SlowCmd', { strategy: 'cancel-in-progress' });
      await server.start();

      const res1 = await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'SlowCmd', data: {} }),
      });

      expect(res1.status).toBe(200);
      await server.stop();
    });
  });

  describe('GET /registry', () => {
    it('should return registry with event handlers', async () => {
      const pipeline = define('test').on('Start').emit('Cmd', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerPipeline(pipeline);
      await server.start();
      const data = await fetchAs<RegistryResponse>(`http://localhost:${server.port}/registry`);
      expect(data.eventHandlers).toContain('Start');
      await server.stop();
    });

    it('should return registry with command metadata defaults', async () => {
      const handler = {
        name: 'MinimalCmd',
        handle: async () => ({ type: 'Done', data: {} }),
      };
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      await server.start();
      const data = await fetchAs<RegistryResponse>(`http://localhost:${server.port}/registry`);
      const metadata = data.commandsWithMetadata[0];
      expect(metadata.alias).toBe('MinimalCmd');
      expect(metadata.description).toBe('');
      expect(metadata.fields).toEqual({});
      expect(metadata.examples).toEqual([]);
      await server.stop();
    });

    it('should return registry with command metadata', async () => {
      const handler = {
        name: 'Cmd',
        alias: 'cmd',
        description: 'Test',
        fields: { x: 1 },
        examples: ['ex'],
        handle: async () => ({ type: 'Done', data: {} }),
      };
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      await server.start();
      const data = await fetchAs<RegistryResponse>(`http://localhost:${server.port}/registry`);
      const metadata = data.commandsWithMetadata[0];
      expect(metadata.alias).toBe('cmd');
      expect(metadata.description).toBe('Test');
      expect(metadata.fields).toEqual({ x: 1 });
      expect(metadata.examples).toEqual(['ex']);
      await server.stop();
    });

    it('should return registry with folds array', async () => {
      const server = new PipelineServer({ port: 0 });
      await server.start();
      const data = await fetchAs<RegistryResponse>(`http://localhost:${server.port}/registry`);
      expect(data.folds).toEqual([]);
      await server.stop();
    });

    it('should exclude settled handlers from eventHandlers list', async () => {
      const handler = {
        name: 'CheckTests',
        events: ['TestsPassed'],
        handle: async () => ({ type: 'TestsPassed', data: {} }),
      };
      const pipeline = define('test')
        .on('Start')
        .emit('CheckTests', {})
        .settled(['CheckTests'])
        .dispatch({ dispatches: [] }, () => {})
        .build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      await server.start();
      const data = await fetchAs<RegistryResponse>(`http://localhost:${server.port}/registry`);
      expect(data.eventHandlers).toContain('Start');
      expect(data.eventHandlers).not.toContain('settled:CheckTests');
      await server.stop();
    });
  });

  describe('GET /pipeline', () => {
    it('should return pipeline graph', async () => {
      const pipeline = define('test').on('Start').emit('Cmd', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerPipeline(pipeline);
      await server.start();
      const data = await fetchAs<GraphResponse>(`http://localhost:${server.port}/pipeline`);
      expect(data.nodes.some((n) => n.id === 'evt:Start')).toBe(true);
      await server.stop();
    });

    it('should use displayName as label for command graph nodes', async () => {
      const handler = {
        name: 'Cmd',
        displayName: 'My Command',
        handle: async () => ({ type: 'Done', data: {} }),
      };
      const pipeline = define('test').on('Start').emit('Cmd', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      await server.start();
      const data = await fetchAs<GraphResponse>(`http://localhost:${server.port}/pipeline`);
      const cmdNode = data.nodes.find((n) => n.id === 'cmd:Cmd');
      expect(cmdNode?.label).toBe('My Command');
      await server.stop();
    });

    it('should use command name as graph node label when displayName not provided', async () => {
      const handler = {
        name: 'SimpleCmd',
        handle: async () => ({ type: 'Done', data: {} }),
      };
      const pipeline = define('test').on('Start').emit('SimpleCmd', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      await server.start();
      const data = await fetchAs<GraphResponse>(`http://localhost:${server.port}/pipeline`);
      const cmdNode = data.nodes.find((n) => n.id === 'cmd:SimpleCmd');
      expect(cmdNode?.label).toBe('SimpleCmd');
      await server.stop();
    });

    it('should use displayName for dynamically-added command nodes', async () => {
      const handler = {
        name: 'DynamicCmd',
        displayName: 'Dynamic Command',
        events: ['DynamicDone'],
        handle: async () => ({ type: 'DynamicDone', data: {} }),
      };
      const pipeline = define('test').on('DynamicDone').emit('NextCmd', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      await server.start();
      const data = await fetchAs<GraphResponse>(`http://localhost:${server.port}/pipeline`);
      const cmdNode = data.nodes.find((n) => n.id === 'cmd:DynamicCmd');
      expect(cmdNode?.label).toBe('Dynamic Command');
      await server.stop();
    });

    it('should filter out event nodes when excludeTypes=event', async () => {
      const pipeline = define('test').on('Start').emit('Cmd', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerPipeline(pipeline);
      await server.start();
      const data = await fetchAs<GraphResponse>(`http://localhost:${server.port}/pipeline?excludeTypes=event`);
      expect(data.nodes.every((n) => n.type !== 'event')).toBe(true);
      await server.stop();
    });

    it('should reconnect edges when maintainEdges=true and filter commands', async () => {
      const pipeline = define('test').on('Start').emit('Process', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerPipeline(pipeline);
      await server.start();
      const data = await fetchAs<GraphResponse>(
        `http://localhost:${server.port}/pipeline?excludeTypes=command&maintainEdges=true`,
      );
      expect(data.nodes.every((n) => n.type !== 'command')).toBe(true);
      expect(data.edges).toHaveLength(0);
      await server.stop();
    });

    it('should filter multiple node types', async () => {
      const pipeline = define('test')
        .on('Start')
        .emit('CheckA', {})
        .emit('CheckB', {})
        .settled(['CheckA', 'CheckB'])
        .dispatch({ dispatches: [] }, () => {})
        .build();
      const server = new PipelineServer({ port: 0 });
      server.registerPipeline(pipeline);
      await server.start();
      const data = await fetchAs<GraphResponse>(`http://localhost:${server.port}/pipeline?excludeTypes=event,settled`);
      expect(data.nodes.every((n) => n.type !== 'event' && n.type !== 'settled')).toBe(true);
      await server.stop();
    });

    it('should reconnect commands through events when filtering events with maintainEdges=true', async () => {
      const generateHandler = {
        name: 'Generate',
        events: ['Generated'],
        handle: async () => ({ type: 'Generated', data: {} }),
      };
      const pipeline = define('test').on('Start').emit('Generate', {}).on('Generated').emit('Process', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([generateHandler]);
      server.registerPipeline(pipeline);
      await server.start();
      const data = await fetchAs<GraphResponse>(
        `http://localhost:${server.port}/pipeline?excludeTypes=event&maintainEdges=true`,
      );
      expect(data.nodes.every((n) => n.type !== 'event')).toBe(true);
      expect(data.edges.some((e) => e.from === 'cmd:Generate' && e.to === 'cmd:Process')).toBe(true);
      await server.stop();
    });

    it('should have status idle on command nodes by default', async () => {
      const handler = {
        name: 'Cmd',
        events: ['Done'],
        handle: async () => ({ type: 'Done', data: {} }),
      };
      const pipeline = define('test').on('Start').emit('Cmd', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      await server.start();
      const data = await fetchAs<PipelineResponse>(`http://localhost:${server.port}/pipeline`);
      const cmdNode = data.nodes.find((n) => n.id === 'cmd:Cmd');
      expect(cmdNode?.status).toBe('idle');
      await server.stop();
    });

    it('should not have status on event nodes', async () => {
      const handler = {
        name: 'Cmd',
        events: ['Done'],
        handle: async () => ({ type: 'Done', data: {} }),
      };
      const pipeline = define('test').on('Start').emit('Cmd', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      await server.start();
      const data = await fetchAs<PipelineResponse>(`http://localhost:${server.port}/pipeline`);
      const eventNode = data.nodes.find((n) => n.id === 'evt:Start');
      expect(eventNode?.status).toBeUndefined();
      await server.stop();
    });

    it('should have idle status on settled nodes when no correlationId provided', async () => {
      const handler = {
        name: 'CheckTests',
        events: ['TestsPassed'],
        handle: async () => ({ type: 'TestsPassed', data: {} }),
      };
      const pipeline = define('test')
        .on('Start')
        .emit('CheckTests', {})
        .settled(['CheckTests'])
        .dispatch({ dispatches: [] }, () => {})
        .build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      await server.start();
      const data = await fetchAs<PipelineResponse>(`http://localhost:${server.port}/pipeline`);
      const settledNode = data.nodes.find((n) => n.id === 'settled:settled-0');
      expect(settledNode?.status).toBe('idle');
      expect(settledNode?.pendingCount).toBe(0);
      expect(settledNode?.endedCount).toBe(0);
      await server.stop();
    });

    it('should have status from computeSettledStats on settled nodes in current session', async () => {
      const handler = {
        name: 'CheckTests',
        events: ['TestsPassed'],
        handle: async () => ({ type: 'TestsPassed', data: {} }),
      };
      const pipeline = define('test')
        .on('Start')
        .emit('CheckTests', {})
        .settled(['CheckTests'])
        .dispatch({ dispatches: [] }, () => {})
        .build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      await server.start();

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'CheckTests', data: {} }),
      });

      await new Promise((r) => setTimeout(r, 100));

      const data = await fetchAs<PipelineResponse>(`http://localhost:${server.port}/pipeline`);
      const settledNode = data.nodes.find((n) => n.id === 'settled:settled-0');
      expect(settledNode?.status).toBeDefined();
      expect(settledNode?.pendingCount).toBeDefined();
      expect(settledNode?.endedCount).toBeDefined();
      await server.stop();
    });

    it('should show settled node success after command dispatched via /command completes', async () => {
      const handler = {
        name: 'CheckTests',
        events: ['TestsPassed'],
        handle: async () => ({ type: 'TestsPassed', data: {} }),
      };
      const pipeline = define('test')
        .on('Start')
        .emit('CheckTests', {})
        .settled(['CheckTests'])
        .dispatch({ dispatches: [] }, () => {})
        .build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      await server.start();

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'CheckTests', data: {} }),
      });

      await new Promise((r) => setTimeout(r, 100));

      const data = await fetchAs<PipelineResponse>(`http://localhost:${server.port}/pipeline`);
      const settledNode = data.nodes.find((n) => n.id === 'settled:settled-0');
      expect(settledNode).toEqual({
        id: 'settled:settled-0',
        type: 'settled',
        label: 'Settled',
        status: 'success',
        pendingCount: 0,
        endedCount: 1,
      });
      await server.stop();
    });

    it('should show running status for command being executed', async () => {
      let resolveHandler: () => void = () => {};
      const handlerPromise = new Promise<void>((resolve) => {
        resolveHandler = resolve;
      });
      const handler = {
        name: 'SlowCmd',
        events: ['Done'],
        handle: async () => {
          await handlerPromise;
          return { type: 'Done', data: {} };
        },
      };
      const pipeline = define('test').on('Start').emit('SlowCmd', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      await server.start();

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'SlowCmd', data: {} }),
      });

      await new Promise((r) => setTimeout(r, 50));

      const data = await fetchAs<PipelineResponse>(`http://localhost:${server.port}/pipeline`);
      const cmdNode = data.nodes.find((n) => n.id === 'cmd:SlowCmd');
      expect(cmdNode?.status).toBe('running');

      resolveHandler();
      await server.stop();
    });

    it('should show success status after command completes with success event', async () => {
      const handler = {
        name: 'SuccessCmd',
        events: ['CmdCompleted'],
        handle: async () => ({ type: 'CmdCompleted', data: {} }),
      };
      const pipeline = define('test').on('Start').emit('SuccessCmd', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      await server.start();

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'SuccessCmd', data: {} }),
      });

      await new Promise((r) => setTimeout(r, 100));

      const data = await fetchAs<PipelineResponse>(`http://localhost:${server.port}/pipeline`);
      const cmdNode = data.nodes.find((n) => n.id === 'cmd:SuccessCmd');
      expect(cmdNode?.status).toBe('success');
      await server.stop();
    });

    it('should show error status after command completes with failed event', async () => {
      const handler = {
        name: 'FailCmd',
        events: ['CmdFailed'],
        handle: async () => ({ type: 'CmdFailed', data: { error: 'Something went wrong' } }),
      };
      const pipeline = define('test').on('Start').emit('FailCmd', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      await server.start();

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'FailCmd', data: {} }),
      });

      await new Promise((r) => setTimeout(r, 100));

      const data = await fetchAs<PipelineResponse>(`http://localhost:${server.port}/pipeline`);
      const cmdNode = data.nodes.find((n) => n.id === 'cmd:FailCmd');
      expect(cmdNode?.status).toBe('error');
      await server.stop();
    });

    it('should broadcast PipelineRunStarted event once per session on server start', async () => {
      const handler = {
        name: 'StartCmd',
        events: ['Started'],
        handle: async () => ({ type: 'Started', data: {} }),
      };
      const pipeline = define('test').on('Trigger').emit('StartCmd', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      await server.start();

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'StartCmd', data: {} }),
      });

      await new Promise((r) => setTimeout(r, 100));

      const msgs = await fetchAs<StoredMessage[]>(`http://localhost:${server.port}/messages`);
      const pipelineRunStarted = msgs.find((m) => m.message.type === 'PipelineRunStarted');
      expect(pipelineRunStarted).toBeDefined();
      const prsMessage = pipelineRunStarted?.message as { correlationId?: string; data?: { triggerCommand?: string } };
      expect(prsMessage.correlationId).toMatch(/^session-/);
      expect(prsMessage.data?.triggerCommand).toBe('PipelineStarted');
      await server.stop();
    });

    it('should emit PipelineRunStarted only once when multiple pipelines react to the same event', async () => {
      const handlerA = {
        name: 'CmdA',
        events: ['DoneA'],
        handle: async () => ({ type: 'DoneA', data: {} }),
      };
      const handlerB = {
        name: 'CmdB',
        events: ['DoneB'],
        handle: async () => ({ type: 'DoneB', data: {} }),
      };
      const pipelineA = define('pipeA').on('PipelineStarted').emit('CmdA', {}).build();
      const pipelineB = define('pipeB').on('PipelineStarted').emit('CmdB', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handlerA, handlerB]);
      server.registerPipeline(pipelineA);
      server.registerPipeline(pipelineB);
      await server.start();

      await new Promise((r) => setTimeout(r, 200));

      const msgs = await fetchAs<StoredMessage[]>(`http://localhost:${server.port}/messages`);
      const pipelineRunStarted = msgs.filter((m) => m.message.type === 'PipelineRunStarted');
      expect(pipelineRunStarted).toHaveLength(1);
      await server.stop();
    });

    it('should broadcast NodeStatusChanged event when command starts running', async () => {
      const handler = {
        name: 'RunCmd',
        events: ['RunDone'],
        handle: async () => ({ type: 'RunDone', data: {} }),
      };
      const pipeline = define('test').on('Trigger').emit('RunCmd', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      await server.start();

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'RunCmd', data: {} }),
      });

      await new Promise((r) => setTimeout(r, 100));

      const msgs = await fetchAs<StoredMessage[]>(`http://localhost:${server.port}/messages`);
      type NodeStatusChangedMessage = {
        type: string;
        correlationId?: string;
        data?: { nodeId?: string; status?: string; previousStatus?: string };
      };
      const nodeStatusChanged = msgs.filter((m) => m.message.type === 'NodeStatusChanged');
      const runningEvent = nodeStatusChanged.find(
        (m) => (m.message as NodeStatusChangedMessage).data?.status === 'running',
      );
      expect(runningEvent).toBeDefined();
      expect((runningEvent?.message as NodeStatusChangedMessage).data?.nodeId).toBe('cmd:RunCmd');
      expect((runningEvent?.message as NodeStatusChangedMessage).data?.previousStatus).toBe('idle');
      expect((runningEvent?.message as NodeStatusChangedMessage).correlationId).toMatch(/^session-/);
      await server.stop();
    });

    it('should broadcast NodeStatusChanged event when command completes', async () => {
      const handler = {
        name: 'CompleteCmd',
        events: ['CompleteDone'],
        handle: async () => ({ type: 'CompleteDone', data: {} }),
      };
      const pipeline = define('test').on('Trigger').emit('CompleteCmd', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      await server.start();

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'CompleteCmd', data: {} }),
      });

      await new Promise((r) => setTimeout(r, 100));

      const msgs = await fetchAs<StoredMessage[]>(`http://localhost:${server.port}/messages`);
      type NodeStatusChangedMessage = {
        type: string;
        correlationId?: string;
        data?: { nodeId?: string; status?: string; previousStatus?: string };
      };
      const nodeStatusChanged = msgs.filter((m) => m.message.type === 'NodeStatusChanged');
      const successEvent = nodeStatusChanged.find(
        (m) => (m.message as NodeStatusChangedMessage).data?.status === 'success',
      );
      expect(successEvent).toBeDefined();
      expect((successEvent?.message as NodeStatusChangedMessage).data?.nodeId).toBe('cmd:CompleteCmd');
      expect((successEvent?.message as NodeStatusChangedMessage).data?.previousStatus).toBe('running');
      expect((successEvent?.message as NodeStatusChangedMessage).correlationId).toMatch(/^session-/);
      await server.stop();
    });

    it('should persist status across multiple /pipeline calls', async () => {
      const handler = {
        name: 'PersistCmd',
        events: ['PersistDone'],
        handle: async () => ({ type: 'PersistDone', data: {} }),
      };
      const pipeline = define('test').on('Trigger').emit('PersistCmd', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      await server.start();

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'PersistCmd', data: {} }),
      });

      await new Promise((r) => setTimeout(r, 100));

      const firstCall = await fetchAs<PipelineResponse>(`http://localhost:${server.port}/pipeline`);
      expect(firstCall.nodes.find((n) => n.id === 'cmd:PersistCmd')?.status).toBe('success');

      const secondCall = await fetchAs<PipelineResponse>(`http://localhost:${server.port}/pipeline`);
      expect(secondCall.nodes.find((n) => n.id === 'cmd:PersistCmd')?.status).toBe('success');

      await server.stop();
    });

    it('should track all commands under the same session', async () => {
      const handler = {
        name: 'IndependentCmd',
        events: ['IndependentDone'],
        handle: async () => ({ type: 'IndependentDone', data: {} }),
      };
      const pipeline = define('test').on('Trigger').emit('IndependentCmd', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      server.registerItemKeyExtractor('IndependentCmd', (_d) => undefined);
      await server.start();

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'IndependentCmd', data: {} }),
      });

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'IndependentCmd', data: {} }),
      });

      await new Promise((r) => setTimeout(r, 100));

      const data = await fetchAs<PipelineResponse>(`http://localhost:${server.port}/pipeline`);
      const cmdNode = data.nodes.find((n) => n.id === 'cmd:IndependentCmd');
      expect(cmdNode?.status).toBe('success');
      expect(cmdNode?.endedCount).toBe(1);

      await server.stop();
    });

    it('should show session status when no correlationId query param provided', async () => {
      const handler = {
        name: 'IdleCmd',
        events: ['IdleDone'],
        handle: async () => ({ type: 'IdleDone', data: {} }),
      };
      const pipeline = define('test').on('Trigger').emit('IdleCmd', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      await server.start();

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'IdleCmd', data: {} }),
      });

      await new Promise((r) => setTimeout(r, 100));

      const data = await fetchAs<PipelineResponse>(`http://localhost:${server.port}/pipeline`);
      const cmdNode = data.nodes.find((n) => n.id === 'cmd:IdleCmd');
      expect(cmdNode?.status).toBe('success');

      await server.stop();
    });

    it('should return latestRun as the session id', async () => {
      const handler = {
        name: 'LatestCmd',
        events: ['LatestDone'],
        handle: async () => ({ type: 'LatestDone', data: {} }),
      };
      const pipeline = define('test').on('Trigger').emit('LatestCmd', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      await server.start();

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'LatestCmd', data: {} }),
      });

      await new Promise((r) => setTimeout(r, 50));

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'LatestCmd', data: {} }),
      });

      await new Promise((r) => setTimeout(r, 50));

      const data = await fetchAs<PipelineResponse>(`http://localhost:${server.port}/pipeline`);
      expect(data.latestRun).toMatch(/^session-/);

      await server.stop();
    });
  });

  describe('POST /command', () => {
    it('should accept command', async () => {
      const handler = {
        name: 'Cmd',
        handle: async () => ({ type: 'Done', data: {} }),
      };
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      await server.start();
      const data = await fetchAs<CommandResponse>(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'Cmd', data: {} }),
      });
      expect(data.status).toBe('ack');
      await server.stop();
    });

    it('should return 404 for unknown command', async () => {
      const server = new PipelineServer({ port: 0 });
      await server.start();
      const res = await fetchWithStatus(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'UnknownCmd', data: {} }),
      });
      expect(res.status).toBe(404);
      const data = await res.json<CommandResponse>();
      expect(data.status).toBe('nack');
      await server.stop();
    });

    it('should handle command that returns multiple events', async () => {
      const handler = {
        name: 'Multi',
        handle: async () => [
          { type: 'EventA', data: { a: 1 } },
          { type: 'EventB', data: { b: 2 } },
        ],
      };
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      await server.start();
      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'Multi', data: {} }),
      });
      await new Promise((r) => setTimeout(r, 100));
      const msgs = await fetchAs<StoredMessage[]>(`http://localhost:${server.port}/messages`);
      expect(msgs.some((m) => m.message.type === 'EventA')).toBe(true);
      expect(msgs.some((m) => m.message.type === 'EventB')).toBe(true);
      await server.stop();
    });
  });

  describe('GET /messages', () => {
    it('should return messages', async () => {
      const server = new PipelineServer({ port: 0 });
      await server.start();
      const data = await fetchAs<StoredMessage[]>(`http://localhost:${server.port}/messages`);
      expect(Array.isArray(data)).toBe(true);
      await server.stop();
    });
  });

  describe('GET /stats', () => {
    it('should return stats', async () => {
      const server = new PipelineServer({ port: 0 });
      await server.start();
      const data = await fetchAs<StatsResponse>(`http://localhost:${server.port}/stats`);
      expect(data.totalMessages).toBeDefined();
      await server.stop();
    });
  });

  describe('GET /run-stats', () => {
    it('should return idle status when no activity exists', async () => {
      const server = new PipelineServer({ port: 0 });
      await server.start();

      const data = await fetchAs<RunStatsResponse>(`http://localhost:${server.port}/run-stats`);

      expect(data.pipelineStatus).toBe('idle');
      expect(data.correlationId).toBeDefined();
      expect(data.items).toEqual({ total: 0, running: 0, success: 0, error: 0, retried: 0 });
      expect(data.nodes).toEqual({ total: 0, running: 0, success: 0, error: 0 });
      await server.stop();
    });

    it('should return active status when pipeline is processing', async () => {
      const handler = {
        name: 'SlowCmd',
        handle: async () => {
          await new Promise((r) => setTimeout(r, 500));
          return { type: 'SlowDone', data: {} };
        },
      };
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      await server.start();

      void fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'SlowCmd', data: {} }),
      });
      await new Promise((r) => setTimeout(r, 50));

      const data = await fetchAs<RunStatsResponse>(`http://localhost:${server.port}/run-stats`);

      expect(data.pipelineStatus).toBe('active');
      await server.stop();
    });

    it('should return completed status after pipeline finishes', async () => {
      const handler = {
        name: 'QuickCmd',
        handle: async () => ({ type: 'QuickDone', data: {} }),
      };
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      await server.start();

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'QuickCmd', data: {} }),
      });
      await new Promise((r) => setTimeout(r, 200));

      const data = await fetchAs<RunStatsResponse>(`http://localhost:${server.port}/run-stats`);

      expect(data.pipelineStatus).toBe('completed');
      expect(data.items.total).toBeGreaterThanOrEqual(1);
      await server.stop();
    });
  });

  describe('event routing', () => {
    it('should route events through pipeline', async () => {
      const handler = {
        name: 'Init',
        handle: async () => ({ type: 'Ready', data: {} }),
      };
      const pipeline = define('test').on('Ready').emit('Next', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      await server.start();
      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'Init', data: {} }),
      });
      await new Promise((r) => setTimeout(r, 100));
      const msgs = await fetchAs<StoredMessage[]>(`http://localhost:${server.port}/messages`);
      expect(msgs.some((m) => m.message.type === 'Next')).toBe(true);
      await server.stop();
    });

    it('should handle custom handler that emits events', async () => {
      const handler = {
        name: 'Start',
        handle: async () => ({ type: 'Started', data: {} }),
      };
      const pipeline = define('test')
        .on('Started')
        .handle(async (_e, ctx) => {
          await ctx.emit('CustomEvent', { emitted: true });
        })
        .build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      await server.start();
      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'Start', data: {} }),
      });
      await new Promise((r) => setTimeout(r, 100));
      const msgs = await fetchAs<StoredMessage[]>(`http://localhost:${server.port}/messages`);
      expect(msgs.some((m) => m.message.type === 'CustomEvent')).toBe(true);
      await server.stop();
    });
  });

  describe('GET /pipeline/mermaid', () => {
    it('should return mermaid diagram as text', async () => {
      const pipeline = define('test').on('Start').emit('Process', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerPipeline(pipeline);
      await server.start();
      const res = await fetch(`http://localhost:${server.port}/pipeline/mermaid`);
      expect(res.headers.get('content-type')).toContain('text/plain');
      const mermaid = await res.text();
      expect(mermaid).toContain('flowchart LR');
      await server.stop();
    });

    it('should filter out event nodes when excludeTypes=event', async () => {
      const pipeline = define('test').on('Start').emit('Process', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerPipeline(pipeline);
      await server.start();
      const res = await fetch(`http://localhost:${server.port}/pipeline/mermaid?excludeTypes=event`);
      const mermaid = await res.text();
      expect(mermaid).not.toContain('evt_Start');
      expect(mermaid).toContain('Process[Process]');
      await server.stop();
    });

    it('should filter out settled nodes when excludeTypes=settled', async () => {
      const checkAHandler = {
        name: 'CheckA',
        events: ['CheckAPassed', 'CheckAFailed'],
        handle: async () => ({ type: 'CheckAPassed', data: {} }),
      };
      const pipeline = define('test')
        .on('Start')
        .emit('CheckA', {})
        .settled(['CheckA'])
        .dispatch({ dispatches: [] }, () => {})
        .build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([checkAHandler]);
      server.registerPipeline(pipeline);
      await server.start();
      const res = await fetch(`http://localhost:${server.port}/pipeline/mermaid?excludeTypes=settled`);
      const mermaid = await res.text();
      expect(mermaid).not.toContain('settled_');
      expect(mermaid).toContain('CheckA');
      await server.stop();
    });

    it('should use displayName as label for command nodes in mermaid diagram', async () => {
      const handler = {
        name: 'Cmd',
        displayName: 'My Command',
        handle: async () => ({ type: 'Done', data: {} }),
      };
      const pipeline = define('test').on('Start').emit('Cmd', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      await server.start();
      const res = await fetch(`http://localhost:${server.port}/pipeline/mermaid`);
      const mermaid = await res.text();
      expect(mermaid).toContain('Cmd[My Command]');
      await server.stop();
    });

    it('should include event nodes in mermaid diagram', async () => {
      const pipeline = define('test').on('Start').emit('Process', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerPipeline(pipeline);
      await server.start();
      const res = await fetch(`http://localhost:${server.port}/pipeline/mermaid`);
      const mermaid = await res.text();
      expect(mermaid).toContain('evt_Start');
      await server.stop();
    });

    it('should use displayName as label for event nodes in mermaid diagram', async () => {
      const handler = {
        name: 'Cmd',
        events: [{ name: 'CmdCompleted', displayName: 'Command Completed' }],
        handle: async () => ({ type: 'CmdCompleted', data: {} }),
      };
      const nextHandler = {
        name: 'NextCmd',
        handle: async () => ({ type: 'Done', data: {} }),
      };
      const pipeline = define('test').on('Start').emit('Cmd', {}).on('CmdCompleted').emit('NextCmd', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler, nextHandler]);
      server.registerPipeline(pipeline);
      await server.start();
      const res = await fetch(`http://localhost:${server.port}/pipeline/mermaid`);
      const mermaid = await res.text();
      expect(mermaid).toContain('evt_CmdCompleted([Command Completed])');
      await server.stop();
    });

    it('should include command nodes in mermaid diagram', async () => {
      const pipeline = define('test').on('Start').emit('Process', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerPipeline(pipeline);
      await server.start();
      const res = await fetch(`http://localhost:${server.port}/pipeline/mermaid`);
      const mermaid = await res.text();
      expect(mermaid).toContain('Process[Process]');
      await server.stop();
    });

    it('should include edges in mermaid diagram', async () => {
      const pipeline = define('test').on('Start').emit('Process', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerPipeline(pipeline);
      await server.start();
      const res = await fetch(`http://localhost:${server.port}/pipeline/mermaid`);
      const mermaid = await res.text();
      expect(mermaid).toContain('-->');
      await server.stop();
    });

    it('should style commands as blue and events as orange', async () => {
      const pipeline = define('test').on('Start').emit('Process', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerPipeline(pipeline);
      await server.start();
      const res = await fetch(`http://localhost:${server.port}/pipeline/mermaid`);
      const mermaid = await res.text();
      expect(mermaid).toContain('classDef event fill:#fff3e0,stroke:#e65100');
      expect(mermaid).toContain('classDef command fill:#e3f2fd,stroke:#1565c0');
      await server.stop();
    });

    it('should style failed events with red text', async () => {
      const handler = {
        name: 'Gen',
        events: ['GenDone', 'GenFailed'],
        handle: async () => ({ type: 'GenDone', data: {} }),
      };
      const retryHandler = {
        name: 'Retry',
        events: ['RetryDone'],
        handle: async () => ({ type: 'RetryDone', data: {} }),
      };
      const pipeline = define('test').on('Start').emit('Gen', {}).on('GenFailed').emit('Retry', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler, retryHandler]);
      server.registerPipeline(pipeline);
      await server.start();
      const res = await fetch(`http://localhost:${server.port}/pipeline/mermaid`);
      const mermaid = await res.text();
      expect(mermaid).toContain('classDef eventFailed fill:#fff3e0,stroke:#e65100,color:#d32f2f');
      expect(mermaid).toContain('class evt_GenFailed eventFailed');
      await server.stop();
    });

    it('should include edges from commands to their pipeline events only', async () => {
      const handler = {
        name: 'Gen',
        events: ['GenDone', 'GenFailed'],
        handle: async () => ({ type: 'GenDone', data: {} }),
      };
      const nextHandler = {
        name: 'Next',
        events: ['NextDone'],
        handle: async () => ({ type: 'NextDone', data: {} }),
      };
      const pipeline = define('test').on('Start').emit('Gen', {}).on('GenDone').emit('Next', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler, nextHandler]);
      server.registerPipeline(pipeline);
      await server.start();
      const res = await fetch(`http://localhost:${server.port}/pipeline/mermaid`);
      const mermaid = await res.text();
      expect(mermaid).toContain('Gen --> evt_GenDone');
      expect(mermaid).not.toContain('GenFailed');
      await server.stop();
    });

    it('should show complete flow from event to command with command events', async () => {
      const genHandler = {
        name: 'GenerateServer',
        events: ['ServerGenerated', 'MomentGenerated'],
        handle: async () => ({ type: 'ServerGenerated', data: {} }),
      };
      const iaHandler = {
        name: 'GenerateIA',
        events: ['IAGenerated'],
        handle: async () => ({ type: 'IAGenerated', data: {} }),
      };
      const implHandler = {
        name: 'ImplementMoment',
        events: ['MomentImplemented'],
        handle: async () => ({ type: 'MomentImplemented', data: {} }),
      };
      const pipeline = define('test')
        .on('ServerGenerated')
        .emit('GenerateIA', {})
        .on('IAGenerated')
        .emit('ImplementMoment', {})
        .build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([genHandler, iaHandler, implHandler]);
      server.registerPipeline(pipeline);
      await server.start();
      const res = await fetch(`http://localhost:${server.port}/pipeline/mermaid`);
      const mermaid = await res.text();
      expect(mermaid).toContain('evt_ServerGenerated --> GenerateIA');
      expect(mermaid).toContain('evt_IAGenerated --> ImplementMoment');
      await server.stop();
    });

    it('should only show commands and events that are used in the pipeline', async () => {
      const usedHandler = {
        name: 'UsedCommand',
        events: ['UsedEvent'],
        handle: async () => ({ type: 'UsedEvent', data: {} }),
      };
      const unusedHandler = {
        name: 'UnusedCommand',
        events: ['UnusedEvent', 'AnotherUnusedEvent'],
        handle: async () => ({ type: 'UnusedEvent', data: {} }),
      };
      const nextHandler = {
        name: 'NextCommand',
        events: ['NextDone'],
        handle: async () => ({ type: 'NextDone', data: {} }),
      };
      const pipeline = define('test')
        .on('TriggerEvent')
        .emit('UsedCommand', {})
        .on('UsedEvent')
        .emit('NextCommand', {})
        .build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([usedHandler, unusedHandler, nextHandler]);
      server.registerPipeline(pipeline);
      await server.start();
      const res = await fetch(`http://localhost:${server.port}/pipeline/mermaid`);
      const mermaid = await res.text();
      expect(mermaid).toContain('evt_TriggerEvent');
      expect(mermaid).toContain('UsedCommand');
      expect(mermaid).toContain('evt_UsedEvent');
      expect(mermaid).not.toContain('UnusedCommand');
      expect(mermaid).not.toContain('UnusedEvent');
      expect(mermaid).not.toContain('AnotherUnusedEvent');
      await server.stop();
    });

    it('should only show events that have handlers in the pipeline, not unhandled command events', async () => {
      const startHandler = {
        name: 'StartServer',
        events: ['ServerStarted', 'ServerStartFailed'],
        handle: async () => ({ type: 'ServerStarted', data: {} }),
      };
      const processHandler = {
        name: 'ProcessRequest',
        events: ['RequestProcessed'],
        handle: async () => ({ type: 'RequestProcessed', data: {} }),
      };
      const pipeline = define('test')
        .on('TriggerEvent')
        .emit('StartServer', {})
        .on('ServerStarted')
        .emit('ProcessRequest', {})
        .build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([startHandler, processHandler]);
      server.registerPipeline(pipeline);
      await server.start();
      const res = await fetch(`http://localhost:${server.port}/pipeline/mermaid`);
      const mermaid = await res.text();
      expect(mermaid).toContain('evt_ServerStarted');
      expect(mermaid).toContain('StartServer --> evt_ServerStarted');
      expect(mermaid).not.toContain('ServerStartFailed');
      await server.stop();
    });

    it('should show source commands whose events are listened to by the pipeline', async () => {
      const sourceHandler = {
        name: 'SourceCmd',
        events: ['SourceEvent'],
        handle: async () => ({ type: 'SourceEvent', data: {} }),
      };
      const nextHandler = {
        name: 'NextCmd',
        events: ['NextDone'],
        handle: async () => ({ type: 'NextDone', data: {} }),
      };
      const pipeline = define('test').on('SourceEvent').emit('NextCmd', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([sourceHandler, nextHandler]);
      server.registerPipeline(pipeline);
      await server.start();
      const res = await fetch(`http://localhost:${server.port}/pipeline/mermaid`);
      const mermaid = await res.text();
      expect(mermaid).toEqual(
        [
          'flowchart LR',
          '  evt_SourceEvent([SourceEvent])',
          '  NextCmd[NextCmd]',
          '  SourceCmd[SourceCmd]',
          '  evt_SourceEvent --> NextCmd',
          '  SourceCmd --> evt_SourceEvent',
          '',
          '  classDef event fill:#fff3e0,stroke:#e65100',
          '  classDef eventFailed fill:#fff3e0,stroke:#e65100,color:#d32f2f',
          '  classDef command fill:#e3f2fd,stroke:#1565c0',
          '  classDef settled fill:#f3e5f5,stroke:#7b1fa2',
          '  class evt_SourceEvent event',
          '  class NextCmd,SourceCmd command',
        ].join('\n'),
      );
      await server.stop();
    });

    it('should show edges from commands to settled node', async () => {
      const checkAHandler = {
        name: 'CheckA',
        events: ['CheckAPassed', 'CheckAFailed'],
        handle: async () => ({ type: 'CheckAPassed', data: {} }),
      };
      const checkBHandler = {
        name: 'CheckB',
        events: ['CheckBPassed', 'CheckBFailed'],
        handle: async () => ({ type: 'CheckBPassed', data: {} }),
      };
      const pipeline = define('test')
        .on('Start')
        .emit('CheckA', {})
        .emit('CheckB', {})
        .settled(['CheckA', 'CheckB'])
        .dispatch({ dispatches: [] }, () => {})
        .build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([checkAHandler, checkBHandler]);
      server.registerPipeline(pipeline);
      await server.start();
      const res = await fetch(`http://localhost:${server.port}/pipeline/mermaid`);
      const mermaid = await res.text();
      expect(mermaid).toContain('CheckA --> settled_settled-0');
      expect(mermaid).toContain('CheckB --> settled_settled-0');
      await server.stop();
    });

    it('should show edges from settled node to dispatched commands', async () => {
      const checkHandler = {
        name: 'CheckA',
        events: ['CheckAPassed', 'CheckAFailed'],
        handle: async () => ({ type: 'CheckAPassed', data: {} }),
      };
      const retryHandler = {
        name: 'RetryCommand',
        events: ['RetryDone'],
        handle: async () => ({ type: 'RetryDone', data: {} }),
      };
      const pipeline = define('test')
        .on('Start')
        .emit('CheckA', {})
        .settled(['CheckA'])
        .dispatch({ dispatches: ['RetryCommand'] }, () => {})
        .build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([checkHandler, retryHandler]);
      server.registerPipeline(pipeline);
      await server.start();
      const res = await fetch(`http://localhost:${server.port}/pipeline/mermaid`);
      const mermaid = await res.text();
      expect(mermaid).toContain('settled_settled-0 -.->|retry| RetryCommand');
      await server.stop();
    });

    it('should style backLink edges in red', async () => {
      const checkHandler = {
        name: 'CheckA',
        events: ['CheckAPassed', 'CheckAFailed'],
        handle: async () => ({ type: 'CheckAPassed', data: {} }),
      };
      const retryHandler = {
        name: 'RetryCommand',
        events: ['RetryDone'],
        handle: async () => ({ type: 'RetryDone', data: {} }),
      };
      const pipeline = define('test')
        .on('Start')
        .emit('CheckA', {})
        .settled(['CheckA'])
        .dispatch({ dispatches: ['RetryCommand'] }, () => {})
        .build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([checkHandler, retryHandler]);
      server.registerPipeline(pipeline);
      await server.start();
      const res = await fetch(`http://localhost:${server.port}/pipeline/mermaid`);
      const mermaid = await res.text();
      expect(mermaid).toContain('linkStyle');
      expect(mermaid).toMatch(/stroke:#[a-fA-F0-9]{6}|stroke:red/);
      await server.stop();
    });

    it('should mark event-to-command edges as backLink when they create cycles', async () => {
      const generateHandler = {
        name: 'GenerateIA',
        events: ['IAGenerated', 'IAValidationFailed'],
        handle: async () => ({ type: 'IAGenerated', data: {} }),
      };
      const pipeline = define('test')
        .on('Start')
        .emit('GenerateIA', {})
        .on('IAValidationFailed')
        .emit('GenerateIA', {})
        .build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([generateHandler]);
      server.registerPipeline(pipeline);
      await server.start();
      const data = await fetchAs<PipelineResponse>(`http://localhost:${server.port}/pipeline`);
      const backLinkEdge = data.edges.find((e) => e.from === 'evt:IAValidationFailed' && e.to === 'cmd:GenerateIA');
      expect(backLinkEdge).toBeDefined();
      expect(backLinkEdge?.backLink).toBe(true);
      await server.stop();
    });

    it('should NOT mark forward edges as backLink when cycle is broken by settled dispatch', async () => {
      const implHandler = {
        name: 'ImplementMoment',
        events: ['MomentImplemented'],
        handle: async () => ({ type: 'MomentImplemented', data: {} }),
      };
      const checkHandler = {
        name: 'CheckTests',
        events: ['TestsCheckPassed', 'TestsCheckFailed'],
        handle: async () => ({ type: 'TestsCheckPassed', data: {} }),
      };
      const pipeline = define('test')
        .on('Start')
        .emit('ImplementMoment', {})
        .on('MomentImplemented')
        .emit('CheckTests', {})
        .settled(['CheckTests'])
        .dispatch({ dispatches: ['ImplementMoment'] }, () => {})
        .build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([implHandler, checkHandler]);
      server.registerPipeline(pipeline);
      await server.start();
      const data = await fetchAs<PipelineResponse>(`http://localhost:${server.port}/pipeline`);
      const forwardEdge = data.edges.find((e) => e.from === 'evt:MomentImplemented' && e.to === 'cmd:CheckTests');
      expect(forwardEdge).toBeDefined();
      expect(forwardEdge?.backLink).toBeUndefined();
      await server.stop();
    });

    it('should handle diamond graph patterns when detecting backlinks', async () => {
      const cmdAHandler = {
        name: 'CmdA',
        events: ['EventA'],
        handle: async () => ({ type: 'EventA', data: {} }),
      };
      const cmdBHandler = {
        name: 'CmdB',
        events: ['EventB'],
        handle: async () => ({ type: 'EventB', data: {} }),
      };
      const cmdCHandler = {
        name: 'CmdC',
        events: ['EventC'],
        handle: async () => ({ type: 'EventC', data: {} }),
      };
      const cmdDHandler = {
        name: 'CmdD',
        events: ['EventD'],
        handle: async () => ({ type: 'EventD', data: {} }),
      };
      const pipeline = define('test')
        .on('Start')
        .emit('CmdA', {})
        .on('EventA')
        .emit('CmdB', {})
        .on('EventA')
        .emit('CmdC', {})
        .on('EventB')
        .emit('CmdD', {})
        .on('EventC')
        .emit('CmdD', {})
        .on('EventD')
        .emit('CmdA', {})
        .build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([cmdAHandler, cmdBHandler, cmdCHandler, cmdDHandler]);
      server.registerPipeline(pipeline);
      await server.start();
      const data = await fetchAs<PipelineResponse>(`http://localhost:${server.port}/pipeline`);
      const backLinkEdge = data.edges.find((e) => e.from === 'evt:EventD' && e.to === 'cmd:CmdA');
      expect(backLinkEdge).toBeDefined();
      expect(backLinkEdge?.backLink).toBe(true);
      await server.stop();
    });

    it('should add event nodes from settled handler commandToEvents when not already added', async () => {
      const checkAHandler = {
        name: 'CheckA',
        events: ['CheckAPassed', 'CheckAFailed'],
        handle: async () => ({ type: 'CheckAPassed', data: {} }),
      };
      const checkBHandler = {
        name: 'CheckB',
        events: ['CheckBPassed', 'CheckBFailed'],
        handle: async () => ({ type: 'CheckBPassed', data: {} }),
      };
      const pipeline = define('test')
        .on('Start')
        .emit('CheckA', {})
        .emit('CheckB', {})
        .settled(['CheckA', 'CheckB'])
        .dispatch({ dispatches: [] }, () => {})
        .build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([checkAHandler, checkBHandler]);
      server.registerPipeline(pipeline);
      await server.start();
      const res = await fetch(`http://localhost:${server.port}/pipeline/mermaid`);
      const mermaid = await res.text();
      expect(mermaid).toContain('evt_CheckAPassed');
      expect(mermaid).toContain('evt_CheckAFailed');
      expect(mermaid).toContain('evt_CheckBPassed');
      expect(mermaid).toContain('evt_CheckBFailed');
      await server.stop();
    });
  });

  describe('GET /pipeline/diagram', () => {
    it('should return HTML content type', async () => {
      const pipeline = define('test').on('Start').emit('Process', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerPipeline(pipeline);
      await server.start();
      const res = await fetch(`http://localhost:${server.port}/pipeline/diagram`);
      expect(res.headers.get('content-type')).toContain('text/html');
      await server.stop();
    });

    it('should filter nodes when excludeTypes is provided', async () => {
      const pipeline = define('test').on('Start').emit('Process', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerPipeline(pipeline);
      await server.start();
      const res = await fetch(`http://localhost:${server.port}/pipeline/diagram?excludeTypes=event`);
      const html = await res.text();
      expect(html).not.toContain('evt_Start');
      expect(html).toContain('Process');
      await server.stop();
    });

    it('should include mermaid.js script', async () => {
      const pipeline = define('test').on('Start').emit('Process', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerPipeline(pipeline);
      await server.start();
      const res = await fetch(`http://localhost:${server.port}/pipeline/diagram`);
      const html = await res.text();
      expect(html).toContain('mermaid');
      await server.stop();
    });

    it('should include the pipeline mermaid definition', async () => {
      const pipeline = define('test').on('Start').emit('Process', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerPipeline(pipeline);
      await server.start();
      const res = await fetch(`http://localhost:${server.port}/pipeline/diagram`);
      const html = await res.text();
      expect(html).toContain('flowchart LR');
      expect(html).toContain('evt_Start');
      await server.stop();
    });

    it('should have a valid HTML structure', async () => {
      const pipeline = define('test').on('Start').emit('Process', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerPipeline(pipeline);
      await server.start();
      const res = await fetch(`http://localhost:${server.port}/pipeline/diagram`);
      const html = await res.text();
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html');
      expect(html).toContain('</html>');
      await server.stop();
    });
  });

  describe('item-level tracking', () => {
    it('should extract itemKey from command data using registered extractor', async () => {
      const handler = {
        name: 'ImplementMoment',
        events: ['MomentImplemented'],
        handle: async () => ({ type: 'MomentImplemented', data: {} }),
      };
      const pipeline = define('test').on('Trigger').emit('ImplementMoment', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      server.registerItemKeyExtractor('ImplementMoment', (d) => (d as { momentPath?: string }).momentPath);
      await server.start();

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'ImplementMoment', data: { momentPath: '/server/slice-1' } }),
      });

      await new Promise((r) => setTimeout(r, 100));

      const data = await fetchAs<PipelineResponse>(`http://localhost:${server.port}/pipeline`);
      const cmdNode = data.nodes.find((n) => n.id === 'cmd:ImplementMoment');
      expect(cmdNode?.pendingCount).toBe(0);
      expect(cmdNode?.endedCount).toBe(1);

      await server.stop();
    });

    it('should count multiple parallel items correctly', async () => {
      const resolvers: Array<() => void> = [];
      const handler = {
        name: 'ImplementMoment',
        events: ['MomentImplemented'],
        handle: async () => {
          await new Promise<void>((resolve) => {
            resolvers.push(resolve);
          });
          return { type: 'MomentImplemented', data: {} };
        },
      };
      const pipeline = define('test').on('Trigger').emit('ImplementMoment', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      server.registerItemKeyExtractor('ImplementMoment', (d) => (d as { momentPath?: string }).momentPath);
      await server.start();

      void fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'ImplementMoment', data: { momentPath: '/server/slice-1' } }),
      });
      void fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'ImplementMoment', data: { momentPath: '/server/slice-2' } }),
      });
      void fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'ImplementMoment', data: { momentPath: '/server/slice-3' } }),
      });

      while (resolvers.length < 3) {
        await new Promise((r) => setTimeout(r, 10));
      }
      resolvers.forEach((r) => r());
      await new Promise((r) => setTimeout(r, 100));

      const data = await fetchAs<PipelineResponse>(`http://localhost:${server.port}/pipeline`);
      const cmdNode = data.nodes.find((n) => n.id === 'cmd:ImplementMoment');
      expect(cmdNode?.pendingCount).toBe(0);
      expect(cmdNode?.endedCount).toBe(3);

      await server.stop();
    });

    it('should show pending count while commands are running', async () => {
      const resolveHandlers: Array<() => void> = [];
      const handler = {
        name: 'SlowMoment',
        events: ['SlowMomentDone'],
        handle: async () => {
          await new Promise<void>((resolve) => {
            resolveHandlers.push(resolve);
          });
          return { type: 'SlowMomentDone', data: {} };
        },
      };
      const pipeline = define('test').on('Trigger').emit('SlowMoment', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      server.registerItemKeyExtractor('SlowMoment', (d) => (d as { id?: string }).id);
      await server.start();

      void fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'SlowMoment', data: { id: 'item-1' } }),
      });
      void fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'SlowMoment', data: { id: 'item-2' } }),
      });
      void fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'SlowMoment', data: { id: 'item-3' } }),
      });

      while (resolveHandlers.length < 3) {
        await new Promise((r) => setTimeout(r, 10));
      }

      const midwayData = await fetchAs<PipelineResponse>(`http://localhost:${server.port}/pipeline`);
      const midwayNode = midwayData.nodes.find((n) => n.id === 'cmd:SlowMoment');
      expect(midwayNode?.pendingCount).toBe(3);
      expect(midwayNode?.endedCount).toBe(0);
      expect(midwayNode?.status).toBe('running');

      resolveHandlers.forEach((r) => r());
      await new Promise((r) => setTimeout(r, 50));

      const finalData = await fetchAs<PipelineResponse>(`http://localhost:${server.port}/pipeline`);
      const finalNode = finalData.nodes.find((n) => n.id === 'cmd:SlowMoment');
      expect(finalNode?.pendingCount).toBe(0);
      expect(finalNode?.endedCount).toBe(3);
      expect(finalNode?.status).toBe('success');

      await server.stop();
    });

    it('should show error status when any item fails', async () => {
      const resolvers: Array<() => void> = [];
      const handler = {
        name: 'MixedMoment',
        events: ['MixedMomentDone', 'MixedMomentFailed'],
        handle: async (cmd: { data: { shouldFail?: boolean } }) => {
          await new Promise<void>((resolve) => {
            resolvers.push(resolve);
          });
          if (cmd.data.shouldFail === true) {
            return { type: 'MixedMomentFailed', data: {} };
          }
          return { type: 'MixedMomentDone', data: {} };
        },
      };
      const pipeline = define('test').on('Trigger').emit('MixedMoment', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      server.registerItemKeyExtractor('MixedMoment', (d) => (d as { id?: string }).id);
      await server.start();

      void fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'MixedMoment', data: { id: 'pass-1' } }),
      });
      void fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'MixedMoment', data: { id: 'fail-1', shouldFail: true } }),
      });
      void fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'MixedMoment', data: { id: 'pass-2' } }),
      });

      while (resolvers.length < 3) {
        await new Promise((r) => setTimeout(r, 10));
      }
      resolvers.forEach((r) => r());
      await new Promise((r) => setTimeout(r, 100));

      const data = await fetchAs<PipelineResponse>(`http://localhost:${server.port}/pipeline`);
      const cmdNode = data.nodes.find((n) => n.id === 'cmd:MixedMoment');
      expect(cmdNode?.pendingCount).toBe(0);
      expect(cmdNode?.endedCount).toBe(3);
      expect(cmdNode?.status).toBe('error');

      await server.stop();
    });

    it('should reset item to running when retry command arrives for same itemKey', async () => {
      let attemptCount = 0;
      const handler = {
        name: 'RetryMoment',
        events: ['RetryMomentDone', 'RetryMomentFailed'],
        handle: async () => {
          attemptCount++;
          if (attemptCount === 1) {
            return { type: 'RetryMomentFailed', data: {} };
          }
          return { type: 'RetryMomentDone', data: {} };
        },
      };
      const pipeline = define('test').on('Trigger').emit('RetryMoment', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      server.registerItemKeyExtractor('RetryMoment', (d) => (d as { momentPath?: string }).momentPath);
      await server.start();

      const momentPath = '/server/retry-slice';

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'RetryMoment', data: { momentPath } }),
      });
      await new Promise((r) => setTimeout(r, 50));

      const afterFailure = await fetchAs<PipelineResponse>(`http://localhost:${server.port}/pipeline`);
      expect(afterFailure.nodes.find((n) => n.id === 'cmd:RetryMoment')?.status).toBe('error');

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'RetryMoment', data: { momentPath } }),
      });
      await new Promise((r) => setTimeout(r, 50));

      const afterRetry = await fetchAs<PipelineResponse>(`http://localhost:${server.port}/pipeline`);
      const node = afterRetry.nodes.find((n) => n.id === 'cmd:RetryMoment');
      expect(node?.status).toBe('success');
      expect(node?.pendingCount).toBe(0);
      expect(node?.endedCount).toBe(1);

      await server.stop();
    });

    it('should include pendingCount and endedCount in NodeStatusChanged events', async () => {
      const handler = {
        name: 'CountMoment',
        events: ['CountMomentDone'],
        handle: async () => ({ type: 'CountMomentDone', data: {} }),
      };
      const pipeline = define('test').on('Trigger').emit('CountMoment', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      server.registerItemKeyExtractor('CountMoment', (d) => (d as { id?: string }).id);
      await server.start();

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'CountMoment', data: { id: 'item-1' } }),
      });

      await new Promise((r) => setTimeout(r, 100));

      const msgs = await fetchAs<StoredMessage[]>(`http://localhost:${server.port}/messages`);
      type NodeStatusChangedMessage = {
        type: string;
        correlationId?: string;
        data?: {
          nodeId?: string;
          status?: string;
          previousStatus?: string;
          pendingCount?: number;
          endedCount?: number;
        };
      };
      const nodeStatusChanged = msgs.filter((m) => m.message.type === 'NodeStatusChanged');
      const successEvent = nodeStatusChanged.find(
        (m) => (m.message as NodeStatusChangedMessage).data?.status === 'success',
      );
      expect(successEvent).toBeDefined();
      expect((successEvent?.message as NodeStatusChangedMessage).data?.pendingCount).toBe(0);
      expect((successEvent?.message as NodeStatusChangedMessage).data?.endedCount).toBe(1);

      await server.stop();
    });

    it('should include lastDurationMs in pipeline graph after command completes', async () => {
      const handler = {
        name: 'DurationCmd',
        events: ['DurationDone'],
        handle: async () => {
          await new Promise((r) => setTimeout(r, 10));
          return { type: 'DurationDone', data: {} };
        },
      };
      const pipeline = define('test').on('Trigger').emit('DurationCmd', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      server.registerItemKeyExtractor('DurationCmd', (d) => (d as { id?: string }).id);
      await server.start();

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'DurationCmd', data: { id: 'item-1' } }),
      });

      await new Promise((r) => setTimeout(r, 200));

      const data = await fetchAs<PipelineResponse>(`http://localhost:${server.port}/pipeline`);
      const cmdNode = data.nodes.find((n) => n.id === 'cmd:DurationCmd');
      expect(cmdNode).toBeDefined();
      expect(cmdNode?.lastDurationMs).toBeTypeOf('number');
      expect(cmdNode?.lastDurationMs).toBeGreaterThanOrEqual(0);

      await server.stop();
    });

    it('should include lastDurationMs in NodeStatusChanged events on completion', async () => {
      const handler = {
        name: 'DurationEvtCmd',
        events: ['DurationEvtDone'],
        handle: async () => {
          await new Promise((r) => setTimeout(r, 10));
          return { type: 'DurationEvtDone', data: {} };
        },
      };
      const pipeline = define('test').on('Trigger').emit('DurationEvtCmd', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      server.registerItemKeyExtractor('DurationEvtCmd', (d) => (d as { id?: string }).id);
      await server.start();

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'DurationEvtCmd', data: { id: 'item-1' } }),
      });

      await new Promise((r) => setTimeout(r, 200));

      const msgs = await fetchAs<StoredMessage[]>(`http://localhost:${server.port}/messages`);
      type NodeStatusChangedMessage = {
        type: string;
        data?: {
          status?: string;
          lastDurationMs?: number;
        };
      };
      const nodeStatusChanged = msgs.filter((m) => m.message.type === 'NodeStatusChanged');
      const successEvent = nodeStatusChanged.find(
        (m) => (m.message as NodeStatusChangedMessage).data?.status === 'success',
      );
      expect(successEvent).toBeDefined();
      expect((successEvent?.message as NodeStatusChangedMessage).data?.lastDurationMs).toBeTypeOf('number');

      await server.stop();
    });

    it('should use requestId as fallback when no itemKey extractor is registered', async () => {
      const handler = {
        name: 'NoExtractorCmd',
        events: ['NoExtractorDone'],
        handle: async () => ({ type: 'NoExtractorDone', data: {} }),
      };
      const pipeline = define('test').on('Trigger').emit('NoExtractorCmd', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      await server.start();

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'NoExtractorCmd', data: {} }),
      });

      await new Promise((r) => setTimeout(r, 100));

      const data = await fetchAs<PipelineResponse>(`http://localhost:${server.port}/pipeline`);
      const cmdNode = data.nodes.find((n) => n.id === 'cmd:NoExtractorCmd');
      expect(cmdNode?.pendingCount).toBe(0);
      expect(cmdNode?.endedCount).toBe(1);
      expect(cmdNode?.status).toBe('success');

      await server.stop();
    });

    it('should show zero counts for commands not yet executed in session', async () => {
      const handler = {
        name: 'IdleCountCmd',
        events: ['IdleCountDone'],
        handle: async () => ({ type: 'IdleCountDone', data: {} }),
      };
      const pipeline = define('test').on('Trigger').emit('IdleCountCmd', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      await server.start();

      const data = await fetchAs<PipelineResponse>(`http://localhost:${server.port}/pipeline`);
      const cmdNode = data.nodes.find((n) => n.id === 'cmd:IdleCountCmd');
      expect(cmdNode?.pendingCount).toBe(0);
      expect(cmdNode?.endedCount).toBe(0);

      await server.stop();
    });

    it('should show success status after retry succeeds even without itemKey extractor', async () => {
      let callCount = 0;
      const handler = {
        name: 'RetryNoExtractor',
        events: ['RetryNoExtractorDone', 'RetryNoExtractorFailed'],
        handle: async () => {
          callCount++;
          if (callCount === 1) {
            return { type: 'RetryNoExtractorFailed', data: {} };
          }
          return { type: 'RetryNoExtractorDone', data: {} };
        },
      };
      const pipeline = define('test').on('Trigger').emit('RetryNoExtractor', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      await server.start();

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'RetryNoExtractor', data: { targetDir: '/slice1' } }),
      });
      await new Promise((r) => setTimeout(r, 50));

      const afterFailure = await fetchAs<PipelineResponse>(`http://localhost:${server.port}/pipeline`);
      const failNode = afterFailure.nodes.find((n) => n.id === 'cmd:RetryNoExtractor');
      expect(failNode).toEqual({
        id: 'cmd:RetryNoExtractor',
        type: 'command',
        label: 'RetryNoExtractor',
        status: 'error',
        pendingCount: 0,
        endedCount: 1,
        lastDurationMs: expect.any(Number),
      });

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'RetryNoExtractor', data: { targetDir: '/slice1' } }),
      });
      await new Promise((r) => setTimeout(r, 50));

      const afterRetry = await fetchAs<PipelineResponse>(`http://localhost:${server.port}/pipeline`);
      const retryNode = afterRetry.nodes.find((n) => n.id === 'cmd:RetryNoExtractor');
      expect(retryNode).toEqual({
        id: 'cmd:RetryNoExtractor',
        type: 'command',
        label: 'RetryNoExtractor',
        status: 'success',
        pendingCount: 0,
        endedCount: 1,
        lastDurationMs: expect.any(Number),
      });

      await server.stop();
    });

    it('should show running status via nodeStatus fallback when command is in-flight without extractor', async () => {
      let resolveHandler: () => void = () => {};
      const handlerPromise = new Promise<void>((resolve) => {
        resolveHandler = resolve;
      });
      const handler = {
        name: 'SlowNoExtractor',
        events: ['SlowNoExtractorDone'],
        handle: async () => {
          await handlerPromise;
          return { type: 'SlowNoExtractorDone', data: {} };
        },
      };
      const pipeline = define('test').on('Trigger').emit('SlowNoExtractor', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      await server.start();

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'SlowNoExtractor', data: {} }),
      });

      await new Promise((r) => setTimeout(r, 50));

      const data = await fetchAs<PipelineResponse>(`http://localhost:${server.port}/pipeline`);
      const cmdNode = data.nodes.find((n) => n.id === 'cmd:SlowNoExtractor');
      expect(cmdNode).toEqual({
        id: 'cmd:SlowNoExtractor',
        type: 'command',
        label: 'SlowNoExtractor',
        status: 'running',
        pendingCount: 1,
        endedCount: 0,
      });

      resolveHandler();
      await server.stop();
    });

    it('should not let stale error items from a previous batch contaminate status', async () => {
      let callCount = 0;
      const resolvers: Array<() => void> = [];
      const handler = {
        name: 'BatchCmd',
        events: ['BatchDone', 'BatchFailed'],
        handle: async () => {
          callCount++;
          const thisCall = callCount;
          await new Promise<void>((resolve) => {
            resolvers.push(resolve);
          });
          if (thisCall <= 2) {
            return { type: 'BatchFailed', data: {} };
          }
          return { type: 'BatchDone', data: {} };
        },
      };
      const pipeline = define('test').on('Trigger').emit('BatchCmd', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      server.registerItemKeyExtractor('BatchCmd', (d) => (d as { id?: string }).id);
      await server.start();

      void fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'BatchCmd', data: { id: 'item-a' } }),
      });
      void fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'BatchCmd', data: { id: 'item-b' } }),
      });

      while (resolvers.length < 2) {
        await new Promise((r) => setTimeout(r, 10));
      }
      resolvers.forEach((r) => r());
      await new Promise((r) => setTimeout(r, 100));

      const firstBatch = await fetchAs<PipelineResponse>(`http://localhost:${server.port}/pipeline`);
      const firstNode = firstBatch.nodes.find((n) => n.id === 'cmd:BatchCmd');
      expect(firstNode?.status).toBe('error');
      expect(firstNode?.endedCount).toBe(2);

      void fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'BatchCmd', data: { id: 'item-c' } }),
      });
      void fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'BatchCmd', data: { id: 'item-d' } }),
      });

      while (resolvers.length < 4) {
        await new Promise((r) => setTimeout(r, 10));
      }
      resolvers.slice(2).forEach((r) => r());
      await new Promise((r) => setTimeout(r, 100));

      const secondBatch = await fetchAs<PipelineResponse>(`http://localhost:${server.port}/pipeline`);
      const secondNode = secondBatch.nodes.find((n) => n.id === 'cmd:BatchCmd');
      expect(secondNode?.status).toBe('success');
      expect(secondNode?.endedCount).toBe(2);

      await server.stop();
    });
  });

  describe('auto-derived item key extractors', () => {
    it('should deduplicate retried items via auto-derived extractor showing success after retry', async () => {
      let callCount = 0;
      const handler = {
        name: 'AutoKeyCmd',
        events: ['AutoKeyDone', 'AutoKeyFailed'],
        fields: {
          targetDirectory: { type: 'string', required: true },
        },
        handle: async () => {
          callCount++;
          if (callCount === 1) {
            return { type: 'AutoKeyFailed', data: {} };
          }
          return { type: 'AutoKeyDone', data: {} };
        },
      };
      const pipeline = define('test').on('Trigger').emit('AutoKeyCmd', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      await server.start();

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'AutoKeyCmd', data: { targetDirectory: '/slice1' } }),
      });
      await new Promise((r) => setTimeout(r, 50));

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'AutoKeyCmd', data: { targetDirectory: '/slice1' } }),
      });
      await new Promise((r) => setTimeout(r, 50));

      const data = await fetchAs<PipelineResponse>(`http://localhost:${server.port}/pipeline`);
      const node = data.nodes.find((n) => n.id === 'cmd:AutoKeyCmd');
      expect(node).toEqual({
        id: 'cmd:AutoKeyCmd',
        type: 'command',
        label: 'AutoKeyCmd',
        status: 'success',
        pendingCount: 0,
        endedCount: 1,
        lastDurationMs: expect.any(Number),
      });

      await server.stop();
    });

    it('should preserve manual extractor when handler also has fields', async () => {
      let callCount = 0;
      const handler = {
        name: 'ManualKeyCmd',
        events: ['ManualKeyDone', 'ManualKeyFailed'],
        fields: {
          targetDirectory: { type: 'string', required: true },
          customId: { type: 'string', required: false },
        },
        handle: async () => {
          callCount++;
          if (callCount === 1) {
            return { type: 'ManualKeyFailed', data: {} };
          }
          return { type: 'ManualKeyDone', data: {} };
        },
      };
      const pipeline = define('test').on('Trigger').emit('ManualKeyCmd', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerItemKeyExtractor('ManualKeyCmd', (d) => {
        const data = d as Record<string, string>;
        return data.customId;
      });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      await server.start();

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ManualKeyCmd',
          data: { targetDirectory: '/a', customId: 'my-key' },
        }),
      });
      await new Promise((r) => setTimeout(r, 50));

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ManualKeyCmd',
          data: { targetDirectory: '/b', customId: 'my-key' },
        }),
      });
      await new Promise((r) => setTimeout(r, 50));

      const data = await fetchAs<PipelineResponse>(`http://localhost:${server.port}/pipeline`);
      const node = data.nodes.find((n) => n.id === 'cmd:ManualKeyCmd');
      expect(node).toEqual({
        id: 'cmd:ManualKeyCmd',
        type: 'command',
        label: 'ManualKeyCmd',
        status: 'success',
        pendingCount: 0,
        endedCount: 1,
        lastDurationMs: expect.any(Number),
      });

      await server.stop();
    });
  });

  describe('integration', () => {
    it('should execute complete workflow', async () => {
      const handler = {
        name: 'Gen',
        alias: 'gen',
        description: '',
        fields: {},
        examples: [],
        events: ['Done'],
        handle: async () => ({ type: 'Done', data: { id: '1' } }),
      };
      const pipeline = define('wf')
        .on('Done')
        .emit('Process', (e: { data: { id: string } }) => ({ x: e.data.id }))
        .build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      await server.start();
      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'Gen', data: {} }),
      });
      await new Promise((r) => setTimeout(r, 200));
      const msgs = await fetchAs<StoredMessage[]>(`http://localhost:${server.port}/messages`);
      expect(msgs.some((m) => m.message.type === 'Process')).toBe(true);
      await server.stop();
    });
  });

  describe('GET /events', () => {
    it('should accept SSE connections', async () => {
      const server = new PipelineServer({ port: 0 });
      await server.start();

      const controller = new AbortController();
      const responsePromise = fetch(`http://localhost:${server.port}/events`, {
        signal: controller.signal,
      });

      await new Promise((r) => setTimeout(r, 50));
      controller.abort();

      try {
        await responsePromise;
      } catch {
        // AbortError expected
      }

      await server.stop();
    });

    it('should accept SSE connections with correlationId filter', async () => {
      const server = new PipelineServer({ port: 0 });
      await server.start();

      const controller = new AbortController();
      const responsePromise = fetch(`http://localhost:${server.port}/events?correlationId=test-123`, {
        signal: controller.signal,
      });

      await new Promise((r) => setTimeout(r, 50));
      controller.abort();

      try {
        await responsePromise;
      } catch {
        // AbortError expected
      }

      await server.stop();
    });
  });

  describe('phased execution', () => {
    it('should emit phased execution events when foreach-phased handler runs', async () => {
      type Component = { path: string; priority: 'high' | 'medium' | 'low' };
      type ComponentEvent = { data: { components: Component[] } };
      type ResultEvent = { data: { componentPath: string } };

      const generateHandler = {
        name: 'GenerateComponents',
        events: ['ComponentsGenerated'],
        handle: async () => ({
          type: 'ComponentsGenerated',
          data: { components: [{ path: '/comp/a.tsx', priority: 'high' }] },
        }),
      };

      const implementHandler = {
        name: 'ImplementComponent',
        events: ['ComponentImplemented'],
        handle: async (cmd: { data: { componentPath: string } }) => ({
          type: 'ComponentImplemented',
          data: { componentPath: cmd.data.componentPath },
        }),
      };

      const pipeline = define('test')
        .on('ComponentsGenerated')
        .forEach((e: ComponentEvent) => e.data.components)
        .groupInto(['high', 'medium', 'low'], (c: Component) => c.priority)
        .process('ImplementComponent', (c: Component) => ({ componentPath: c.path }))
        .onComplete({
          success: 'AllComponentsImplemented',
          failure: 'ComponentImplementationFailed',
          itemKey: (e: ResultEvent) => e.data.componentPath,
        })
        .build();

      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([generateHandler, implementHandler]);
      server.registerPipeline(pipeline);
      await server.start();

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'GenerateComponents', data: {} }),
      });

      await new Promise((r) => setTimeout(r, 300));
      await server.stop();
    });

    it('should complete phased execution and emit AllComponentsImplemented', async () => {
      type Component = { path: string; priority: 'high' | 'medium' | 'low' };
      type ComponentEvent = { data: { components: Component[] } };
      type ItemOrResult = { data: { componentPath?: string; path?: string } };

      const generateHandler = {
        name: 'GenerateComponents',
        events: ['ComponentsGenerated'],
        handle: async () => ({
          type: 'ComponentsGenerated',
          data: { components: [{ path: '/comp/a.tsx', priority: 'high' }] },
        }),
      };

      const implementHandler = {
        name: 'ImplementComponent',
        events: ['ComponentImplemented'],
        handle: async (cmd: { data: { componentPath: string } }) => ({
          type: 'ComponentImplemented',
          data: { componentPath: cmd.data.componentPath },
        }),
      };

      const pipeline = define('test')
        .on('ComponentsGenerated')
        .forEach((e: ComponentEvent) => e.data.components)
        .groupInto(['high', 'medium', 'low'], (c: Component) => c.priority)
        .process('ImplementComponent', (c: Component) => ({ componentPath: c.path }))
        .onComplete({
          success: 'AllComponentsImplemented',
          failure: 'ComponentImplementationFailed',
          itemKey: (e: ItemOrResult) => e.data.componentPath ?? e.data.path ?? '',
        })
        .build();

      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([generateHandler, implementHandler]);
      server.registerPipeline(pipeline);
      await server.start();

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'GenerateComponents', data: {} }),
      });

      await new Promise((r) => setTimeout(r, 500));

      const msgs = await fetchAs<StoredMessage[]>(`http://localhost:${server.port}/messages`);

      expect(msgs.some((m) => m.message.type === 'AllComponentsImplemented')).toBe(true);

      await server.stop();
    });
  });

  describe('POST /execute', () => {
    it('should call handler and return event directly', async () => {
      const handler = {
        name: 'TestCmd',
        handle: async () => ({ type: 'TestDone', data: { result: 'success' } }),
      };
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      await server.start();

      const response = await fetch(`http://localhost:${server.port}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'TestCmd', payload: { input: 'test' } }),
      });

      const data = (await response.json()) as { event: string; data: Record<string, unknown> };
      expect(response.status).toBe(200);
      expect(data).toEqual({ event: 'TestDone', data: { result: 'success' } });

      await server.stop();
    });

    it('should return 400 for unknown command', async () => {
      const server = new PipelineServer({ port: 0 });
      await server.start();

      const response = await fetch(`http://localhost:${server.port}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'NonExistentCmd', payload: {} }),
      });

      const data = (await response.json()) as { error: string };
      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Unknown command: NonExistentCmd' });

      await server.stop();
    });

    it('should return first event when handler returns array', async () => {
      const handler = {
        name: 'MultiEventCmd',
        handle: async () => [
          { type: 'FirstEvent', data: { order: 1 } },
          { type: 'SecondEvent', data: { order: 2 } },
        ],
      };
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      await server.start();

      const response = await fetch(`http://localhost:${server.port}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'MultiEventCmd', payload: {} }),
      });

      const data = (await response.json()) as { event: string; data: Record<string, unknown> };
      expect(response.status).toBe(200);
      expect(data).toEqual({ event: 'FirstEvent', data: { order: 1 } });

      await server.stop();
    });
  });

  describe('PipelineStarted event', () => {
    it('should emit PipelineStarted event automatically on server start', async () => {
      const pipeline = define('test').on('PipelineStarted').emit('OnStartup', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerPipeline(pipeline);
      await server.start();
      await new Promise((r) => setTimeout(r, 100));
      const msgs = await fetchAs<StoredMessage[]>(`http://localhost:${server.port}/messages`);
      expect(msgs.some((m) => m.message.type === 'OnStartup')).toBe(true);
      await server.stop();
    });
  });

  describe('SQLite persistence', () => {
    it('should persist events to SQLite when storeFileName is set', async () => {
      const tmpFile = path.join(os.tmpdir(), `pipeline-test-${nanoid()}.db`);
      const handler = {
        name: 'TestCmd',
        events: ['TestDone'],
        handle: async () => ({ type: 'TestDone', data: {} }),
      };
      const pipeline = define('test').on('Trigger').emit('TestCmd', {}).build();
      const server = new PipelineServer({ port: 0, storeFileName: tmpFile });
      server.registerCommandHandlers([handler]);
      server.registerPipeline(pipeline);
      await server.start();

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'TestCmd', data: {} }),
      });

      await new Promise((r) => setTimeout(r, 200));
      await server.stop();

      const pool = dumbo({ driver: sqlite3DumboDriver, fileName: tmpFile });
      const { messages } = await readMessagesBatch(pool.execute, {
        after: 0n,
        batchSize: 1000,
      });
      await pool.close();

      const types = messages.map((m) => m.type);
      expect(types).toEqual(expect.arrayContaining(['CommandDispatched', 'PipelineRunStarted']));

      fs.unlinkSync(tmpFile);
    });

    it('should restore pipeline state after server restart', async () => {
      const tmpFile = path.join(os.tmpdir(), `pipeline-test-${nanoid()}.db`);
      const handler = {
        name: 'RestartCmd',
        events: ['RestartDone'],
        handle: async () => ({ type: 'RestartDone', data: {} }),
      };
      const pipeline = define('test').on('Trigger').emit('RestartCmd', {}).build();

      const server1 = new PipelineServer({ port: 0, storeFileName: tmpFile });
      server1.registerCommandHandlers([handler]);
      server1.registerPipeline(pipeline);
      await server1.start();

      const beforeRestart = await fetchAs<PipelineResponse>(`http://localhost:${server1.port}/pipeline`);
      const session1 = beforeRestart.latestRun!;

      await fetch(`http://localhost:${server1.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'RestartCmd', data: {} }),
      });
      await new Promise((r) => setTimeout(r, 200));

      const beforeStop = await fetchAs<PipelineResponse>(`http://localhost:${server1.port}/pipeline`);
      expect(beforeStop.nodes.find((n) => n.id === 'cmd:RestartCmd')?.status).toBe('success');

      await server1.stop();

      const server2 = new PipelineServer({ port: 0, storeFileName: tmpFile });
      server2.registerCommandHandlers([handler]);
      server2.registerPipeline(pipeline);
      await server2.start();

      const afterRestart = await fetchAs<PipelineResponse>(
        `http://localhost:${server2.port}/pipeline?correlationId=${session1}`,
      );
      expect(afterRestart.nodes.find((n) => n.id === 'cmd:RestartCmd')?.status).toBe('success');
      expect(afterRestart.nodes.find((n) => n.id === 'cmd:RestartCmd')?.endedCount).toBe(1);

      await server2.stop();
      fs.unlinkSync(tmpFile);
    });

    it('should create new session on restart while old session remains queryable', async () => {
      const tmpFile = path.join(os.tmpdir(), `pipeline-test-${nanoid()}.db`);
      const handler = {
        name: 'SessionCmd',
        events: ['SessionDone'],
        handle: async () => ({ type: 'SessionDone', data: {} }),
      };
      const pipeline = define('test').on('Trigger').emit('SessionCmd', {}).build();

      const server1 = new PipelineServer({ port: 0, storeFileName: tmpFile });
      server1.registerCommandHandlers([handler]);
      server1.registerPipeline(pipeline);
      await server1.start();

      const initial = await fetchAs<PipelineResponse>(`http://localhost:${server1.port}/pipeline`);
      const session1 = initial.latestRun!;

      await fetch(`http://localhost:${server1.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'SessionCmd', data: {} }),
      });
      await new Promise((r) => setTimeout(r, 200));

      await server1.stop();

      const server2 = new PipelineServer({ port: 0, storeFileName: tmpFile });
      server2.registerCommandHandlers([handler]);
      server2.registerPipeline(pipeline);
      await server2.start();

      const restored = await fetchAs<PipelineResponse>(`http://localhost:${server2.port}/pipeline`);
      expect(restored.latestRun).toBe(session1);

      await fetch(`http://localhost:${server2.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'RestartPipeline', data: {} }),
      });
      await new Promise((r) => setTimeout(r, 100));

      const afterNewSession = await fetchAs<PipelineResponse>(`http://localhost:${server2.port}/pipeline`);
      const session2 = afterNewSession.latestRun!;
      expect(session2).not.toBe(session1);

      const oldSessionData = await fetchAs<PipelineResponse>(
        `http://localhost:${server2.port}/pipeline?correlationId=${session1}`,
      );
      expect(oldSessionData.nodes.find((n) => n.id === 'cmd:SessionCmd')?.status).toBe('success');

      const newSessionData = await fetchAs<PipelineResponse>(
        `http://localhost:${server2.port}/pipeline?correlationId=${session2}`,
      );
      expect(newSessionData.nodes.find((n) => n.id === 'cmd:SessionCmd')?.status).toBe('idle');

      await server2.stop();
      fs.unlinkSync(tmpFile);
    });
  });

  describe('RestartPipeline command', () => {
    it('should emit PipelineRestarted event when RestartPipeline command is sent', async () => {
      const server = new PipelineServer({ port: 0 });
      await server.start();

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'RestartPipeline', data: {} }),
      });

      await new Promise((r) => setTimeout(r, 100));

      const msgs = await fetchAs<StoredMessage[]>(`http://localhost:${server.port}/messages`);
      const restartedEvent = msgs.find((m) => m.message.type === 'PipelineRestarted');
      expect(restartedEvent).toBeDefined();

      await server.stop();
    });
  });

  describe('session-based status tracking', () => {
    it('should not overwrite session status when sub-commands use different correlationIds', async () => {
      const parentHandler = {
        name: 'ParentCmd',
        events: ['ParentDone'],
        handle: async (
          _cmd: { data: Record<string, unknown> },
          ctx?: { sendCommand: (type: string, data: unknown, correlationId?: string) => Promise<void> },
        ) => {
          if (ctx !== undefined) {
            await ctx.sendCommand('ChildCmd', { index: 0 }, 'sub-0');
            await ctx.sendCommand('ChildCmd', { index: 1 }, 'sub-1');
            await ctx.sendCommand('ChildCmd', { index: 2 }, 'sub-2');
          }
          return { type: 'ParentDone', data: {} };
        },
      };
      const childHandler = {
        name: 'ChildCmd',
        events: ['ChildDone'],
        handle: async () => ({ type: 'ChildDone', data: {} }),
      };
      const pipeline = define('test').on('Trigger').emit('ParentCmd', {}).build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([parentHandler, childHandler]);
      server.registerPipeline(pipeline);
      await server.start();

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'ParentCmd', data: {} }),
      });

      await new Promise((r) => setTimeout(r, 200));

      const data = await fetchAs<PipelineResponse>(`http://localhost:${server.port}/pipeline`);
      expect(data.latestRun).not.toBe('sub-0');
      expect(data.latestRun).not.toBe('sub-1');
      expect(data.latestRun).not.toBe('sub-2');
      const parentNode = data.nodes.find((n) => n.id === 'cmd:ParentCmd');
      expect(parentNode?.status).toBe('success');

      await server.stop();
    });

    it('should count sub-command items under unified session view', async () => {
      const parentHandler = {
        name: 'ParentCmd',
        events: ['ParentDone'],
        handle: async (
          _cmd: { data: Record<string, unknown> },
          ctx?: { sendCommand: (type: string, data: unknown, correlationId?: string) => Promise<void> },
        ) => {
          if (ctx !== undefined) {
            await ctx.sendCommand('ChildCmd', { index: 0 }, 'sub-0');
            await ctx.sendCommand('ChildCmd', { index: 1 }, 'sub-1');
            await ctx.sendCommand('ChildCmd', { index: 2 }, 'sub-2');
          }
          return { type: 'ParentDone', data: {} };
        },
      };
      const childHandler = {
        name: 'ChildCmd',
        events: ['ChildDone'],
        handle: async () => ({ type: 'ChildDone', data: {} }),
      };
      const pipeline = define('test')
        .on('Trigger')
        .emit('ParentCmd', {})
        .on('ChildDone')
        .handle(async () => {})
        .build();
      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([parentHandler, childHandler]);
      server.registerPipeline(pipeline);
      server.registerItemKeyExtractor('ChildCmd', (d) => String((d as { index: number }).index));
      await server.start();

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'ParentCmd', data: {} }),
      });

      await new Promise((r) => setTimeout(r, 200));

      const data = await fetchAs<PipelineResponse>(`http://localhost:${server.port}/pipeline`);
      const childNode = data.nodes.find((n) => n.id === 'cmd:ChildCmd');
      expect(childNode?.endedCount).toBe(3);

      await server.stop();
    });
  });

  describe('emit-before-broadcast ordering', () => {
    it('should write to event store before broadcasting PipelineRunStarted via SSE', async () => {
      const server = new PipelineServer({ port: 0 });

      const serverAny = server as unknown as {
        eventStoreContext: {
          eventStore: {
            appendToStream: (
              streamName: string,
              events: Array<{ type: string; data: unknown }>,
              options?: unknown,
            ) => Promise<unknown>;
          };
        };
        sseManager: {
          broadcast: (event: unknown) => void;
        };
      };

      await server.start();

      const callOrder: string[] = [];

      const originalAppend = serverAny.eventStoreContext.eventStore.appendToStream.bind(
        serverAny.eventStoreContext.eventStore,
      );
      serverAny.eventStoreContext.eventStore.appendToStream = async (streamName, events, options) => {
        const result = await originalAppend(streamName, events, options);
        if (events.some((e) => e.type === 'PipelineRunStarted')) {
          callOrder.push('emit');
        }
        return result;
      };

      const originalBroadcast = serverAny.sseManager.broadcast.bind(serverAny.sseManager);
      serverAny.sseManager.broadcast = (event: { type?: string }) => {
        if (event.type === 'PipelineRunStarted') {
          callOrder.push('broadcast');
        }
        originalBroadcast(event);
      };

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'RestartPipeline', data: {} }),
      });

      await new Promise((r) => setTimeout(r, 50));

      expect(callOrder).toEqual(['emit', 'broadcast']);

      await server.stop();
    });
  });

  describe('cancel-in-progress concurrency', () => {
    it('aborts first handler signal when same command fires twice', async () => {
      const signals: AbortSignal[] = [];
      let resolveFirst: (() => void) | undefined;
      const firstBlocks = new Promise<void>((r) => {
        resolveFirst = r;
      });

      const handler = {
        name: 'SlowGenerate',
        handle: async (_cmd: unknown, ctx?: { signal?: AbortSignal }) => {
          signals.push(ctx!.signal!);
          if (signals.length === 1) {
            await firstBlocks;
          }
          return { type: 'GenerateDone', data: {} };
        },
      };

      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerConcurrency('SlowGenerate', { strategy: 'cancel-in-progress' });
      await server.start();

      fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'SlowGenerate', data: {} }),
      });

      await new Promise((r) => setTimeout(r, 20));

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'SlowGenerate', data: {} }),
      });

      await new Promise((r) => setTimeout(r, 50));
      resolveFirst!();
      await new Promise((r) => setTimeout(r, 50));

      expect(signals).toHaveLength(2);
      expect(signals[0].aborted).toBe(true);
      expect(signals[1].aborted).toBe(false);

      await server.stop();
    });

    it('suppresses post-handler events for cancelled command', async () => {
      let resolveFirst: (() => void) | undefined;
      const firstBlocks = new Promise<void>((r) => {
        resolveFirst = r;
      });
      let callCount = 0;

      const handler = {
        name: 'CancelableCmd',
        events: [{ name: 'CancelableDone' }],
        handle: async () => {
          callCount++;
          if (callCount === 1) {
            await firstBlocks;
          }
          return { type: 'CancelableDone', data: { callNumber: callCount } };
        },
      };

      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerConcurrency('CancelableCmd', { strategy: 'cancel-in-progress' });

      const broadcastedEvents: string[] = [];
      const serverAny = server as unknown as { sseManager: { broadcast: (e: { type: string }) => void } };
      const originalBroadcast = serverAny.sseManager.broadcast.bind(serverAny.sseManager);
      serverAny.sseManager.broadcast = (event: { type: string }) => {
        if (event.type === 'CancelableDone') {
          broadcastedEvents.push(event.type);
        }
        originalBroadcast(event);
      };

      await server.start();

      fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'CancelableCmd', data: {} }),
      });

      await new Promise((r) => setTimeout(r, 20));

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'CancelableCmd', data: {} }),
      });

      await new Promise((r) => setTimeout(r, 50));
      resolveFirst!();
      await new Promise((r) => setTimeout(r, 100));

      expect(broadcastedEvents).toEqual(['CancelableDone']);

      await server.stop();
    });
  });

  describe('queue concurrency', () => {
    it('executes queued commands in FIFO order', async () => {
      const executionOrder: number[] = [];
      let callCount = 0;

      const handler = {
        name: 'QueuedCmd',
        handle: async () => {
          callCount++;
          const n = callCount;
          await new Promise((r) => setTimeout(r, 30));
          executionOrder.push(n);
          return { type: 'QueuedDone', data: { n } };
        },
      };

      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      server.registerConcurrency('QueuedCmd', { strategy: 'queue' });
      await server.start();

      fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'QueuedCmd', data: {} }),
      });
      fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'QueuedCmd', data: {} }),
      });
      fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'QueuedCmd', data: {} }),
      });

      await new Promise((r) => setTimeout(r, 200));

      expect(executionOrder).toEqual([1, 2, 3]);

      await server.stop();
    });

    it('sendCommand path respects the gate', async () => {
      const executionOrder: string[] = [];
      let callCount = 0;
      let resolveFirst: (() => void) | undefined;
      const firstBlocks = new Promise<void>((r) => {
        resolveFirst = r;
      });

      const triggerHandler = {
        name: 'Trigger',
        handle: async (_cmd: unknown, ctx?: { sendCommand?: (type: string, data: unknown) => Promise<void> }) => {
          await ctx!.sendCommand!('QueuedWork', {});
          return { type: 'TriggerDone', data: {} };
        },
      };

      const queuedHandler = {
        name: 'QueuedWork',
        handle: async () => {
          callCount++;
          const n = callCount;
          if (n === 1) {
            await firstBlocks;
          }
          executionOrder.push(`work-${n}`);
          return { type: 'WorkDone', data: {} };
        },
      };

      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([triggerHandler, queuedHandler]);
      server.registerConcurrency('QueuedWork', { strategy: 'queue' });
      await server.start();

      fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'QueuedWork', data: {} }),
      });

      await new Promise((r) => setTimeout(r, 20));

      fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'QueuedWork', data: {} }),
      });

      await new Promise((r) => setTimeout(r, 20));
      resolveFirst!();
      await new Promise((r) => setTimeout(r, 100));

      expect(executionOrder).toEqual(['work-1', 'work-2']);

      await server.stop();
    });
  });

  describe('PipelineRunCompleted', () => {
    it('emits PipelineRunCompleted after all commands complete and debounce passes', async () => {
      const handler = {
        name: 'DoWork',
        events: ['WorkDone'],
        handle: async () => ({ type: 'WorkDone', data: {} }),
      };

      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      await server.start();

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'DoWork', data: {} }),
      });

      await new Promise((r) => setTimeout(r, 150));

      const msgs = await fetchAs<StoredMessage[]>(`http://localhost:${server.port}/messages`);
      expect(msgs.some((m) => m.message.type === 'PipelineRunCompleted')).toBe(true);

      await server.stop();
    });

    it('does not emit PipelineRunCompleted while commands are still pending', async () => {
      let resolveWork: (() => void) | undefined;
      const handler = {
        name: 'SlowWork',
        events: ['SlowWorkDone'],
        handle: async () => {
          await new Promise<void>((r) => {
            resolveWork = r;
          });
          return { type: 'SlowWorkDone', data: {} };
        },
      };

      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([handler]);
      await server.start();

      fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'SlowWork', data: {} }),
      });

      await new Promise((r) => setTimeout(r, 100));

      const msgsBeforeComplete = await fetchAs<StoredMessage[]>(`http://localhost:${server.port}/messages`);
      expect(msgsBeforeComplete.some((m) => m.message.type === 'PipelineRunCompleted')).toBe(false);

      if (resolveWork) resolveWork();
      await new Promise((r) => setTimeout(r, 150));

      const msgsAfterComplete = await fetchAs<StoredMessage[]>(`http://localhost:${server.port}/messages`);
      expect(msgsAfterComplete.some((m) => m.message.type === 'PipelineRunCompleted')).toBe(true);

      await server.stop();
    });

    it('does not emit PipelineRunCompleted while retry commands are dispatched', async () => {
      let attemptCount = 0;
      const checkHandler = {
        name: 'CheckTests',
        events: ['CheckTestsPassed', 'CheckTestsFailed'],
        handle: async () => {
          attemptCount++;
          if (attemptCount < 3) {
            return { type: 'CheckTestsFailed', data: { errors: 'fail' } };
          }
          return { type: 'CheckTestsPassed', data: {} };
        },
      };

      const pipeline = define('retry-test')
        .on('StartChecks')
        .emit('CheckTests', () => ({}))
        .settled(['CheckTests'])
        .dispatch({ dispatches: ['CheckTests'] }, (events, send) => {
          const failed = events.CheckTests?.some((e) => e.type === 'CheckTestsFailed');
          if (failed && attemptCount < 3) {
            send('CheckTests', {});
            return { persist: true };
          }
        })
        .build();

      const server = new PipelineServer({ port: 0 });
      server.registerCommandHandlers([checkHandler]);
      server.registerPipeline(pipeline);
      await server.start();

      await fetch(`http://localhost:${server.port}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'CheckTests', data: {} }),
      });

      await new Promise((r) => setTimeout(r, 500));

      const msgs = await fetchAs<StoredMessage[]>(`http://localhost:${server.port}/messages`);
      const completedEvents = msgs.filter((m) => m.message.type === 'PipelineRunCompleted');

      expect(completedEvents.length).toBe(1);
      expect(attemptCount).toBe(3);

      await server.stop();
    });
  });
});
