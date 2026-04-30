import type { InMemoryDatabase } from '@event-driven-io/emmett';
import type { NodeStatus } from '../graph/types';
import type { AwaitTrackerDocument } from '../projections/await-tracker-projection';
import type { ItemStatusDocument } from '../projections/item-status-projection';
import type { LatestRunDocument } from '../projections/latest-run-projection';
import type { MessageLogDocument } from '../projections/message-log-projection';
import type { NodeStatusDocument } from '../projections/node-status-projection';
import type { StatsDocument } from '../projections/stats-projection';

export interface CommandStats {
  pendingCount: number;
  endedCount: number;
  aggregateStatus: NodeStatus;
}

export interface RunStats {
  items: { total: number; running: number; success: number; error: number; retried: number };
  nodes: { total: number; running: number; success: number; error: number };
}

export interface MessageStats {
  totalMessages: number;
  totalCommands: number;
  totalEvents: number;
}

export class PipelineReadModel {
  private readonly itemStatusCollection;
  private readonly nodeStatusCollection;
  private readonly messageLogCollection;
  private readonly statsCollection;
  private readonly latestRunCollection;
  private readonly awaitTrackerCollection;

  constructor(database: InMemoryDatabase) {
    this.itemStatusCollection = database.collection<ItemStatusDocument>('ItemStatus');
    this.nodeStatusCollection = database.collection<NodeStatusDocument>('NodeStatus');
    this.messageLogCollection = database.collection<MessageLogDocument>('MessageLog');
    this.statsCollection = database.collection<StatsDocument>('Stats');
    this.latestRunCollection = database.collection<LatestRunDocument>('LatestRun');
    this.awaitTrackerCollection = database.collection<AwaitTrackerDocument>('AwaitTracker');
  }

  async computeCommandStats(correlationId: string, commandType: string): Promise<CommandStats> {
    const items = await this.itemStatusCollection.find(
      (doc) => doc.correlationId === correlationId && doc.commandType === commandType,
    );

    if (items.length === 0) {
      return { pendingCount: 0, endedCount: 0, aggregateStatus: 'idle' };
    }

    const latestBatchId = items.reduce<string | undefined>((latest, item) => {
      if (item.batchId === undefined) return latest;
      if (latest === undefined || item.batchId > latest) return item.batchId;
      return latest;
    }, undefined);
    const currentItems = latestBatchId !== undefined ? items.filter((item) => item.batchId === latestBatchId) : items;

    let pendingCount = 0;
    let endedCount = 0;
    let hasError = false;

    for (const item of currentItems) {
      if (item.status === 'running') {
        pendingCount++;
      } else {
        endedCount++;
        if (item.status === 'error') {
          hasError = true;
        }
      }
    }

    let aggregateStatus: NodeStatus;
    if (pendingCount > 0) {
      aggregateStatus = 'running';
    } else if (hasError) {
      aggregateStatus = 'error';
    } else {
      aggregateStatus = 'success';
    }

    return { pendingCount, endedCount, aggregateStatus };
  }

  async hasCorrelation(correlationId: string): Promise<boolean> {
    const nodes = await this.nodeStatusCollection.find((doc) => doc.correlationId === correlationId);
    return nodes.length > 0;
  }

  async getNodeStatus(correlationId: string, commandName: string): Promise<NodeStatusDocument | null> {
    const nodes = await this.nodeStatusCollection.find(
      (doc) => doc.correlationId === correlationId && doc.commandName === commandName,
    );
    if (nodes.length === 0) {
      return null;
    }
    const node = nodes[0];
    return {
      correlationId: node.correlationId,
      commandName: node.commandName,
      status: node.status,
      pendingCount: node.pendingCount,
      endedCount: node.endedCount,
      lastDurationMs: node.lastDurationMs,
    };
  }

  async getItemStatus(correlationId: string, commandType: string, itemKey: string): Promise<ItemStatusDocument | null> {
    const items = await this.itemStatusCollection.find(
      (doc) => doc.correlationId === correlationId && doc.commandType === commandType && doc.itemKey === itemKey,
    );
    if (items.length === 0) {
      return null;
    }
    const item = items[0];
    return {
      correlationId: item.correlationId,
      commandType: item.commandType,
      itemKey: item.itemKey,
      currentRequestId: item.currentRequestId,
      status: item.status,
      attemptCount: item.attemptCount,
      startedAt: item.startedAt,
      endedAt: item.endedAt,
      batchId: item.batchId,
    };
  }

  async getAllItemStatuses(correlationId: string): Promise<ItemStatusDocument[]> {
    const items = await this.itemStatusCollection.find((doc) => doc.correlationId === correlationId);
    return items.map((item) => ({
      correlationId: item.correlationId,
      commandType: item.commandType,
      itemKey: item.itemKey,
      currentRequestId: item.currentRequestId,
      status: item.status,
      attemptCount: item.attemptCount,
      startedAt: item.startedAt,
      endedAt: item.endedAt,
      batchId: item.batchId,
    }));
  }

  async getAllNodeStatuses(correlationId: string): Promise<NodeStatusDocument[]> {
    const nodes = await this.nodeStatusCollection.find((doc) => doc.correlationId === correlationId);
    return nodes.map((node) => ({
      correlationId: node.correlationId,
      commandName: node.commandName,
      status: node.status,
      pendingCount: node.pendingCount,
      endedCount: node.endedCount,
      lastDurationMs: node.lastDurationMs,
    }));
  }

  async getRunStats(correlationId: string): Promise<RunStats> {
    const items = await this.itemStatusCollection.find((doc) => doc.correlationId === correlationId);
    const nodes = await this.nodeStatusCollection.find((doc) => doc.correlationId === correlationId);

    const itemStats = { total: 0, running: 0, success: 0, error: 0, retried: 0 };
    for (const item of items) {
      itemStats.total++;
      if (item.status === 'running') itemStats.running++;
      else if (item.status === 'success') itemStats.success++;
      else if (item.status === 'error') itemStats.error++;
      if (item.attemptCount > 1) itemStats.retried++;
    }

    const nodeStats = { total: 0, running: 0, success: 0, error: 0 };
    for (const node of nodes) {
      nodeStats.total++;
      if (node.status === 'running') nodeStats.running++;
      else if (node.status === 'success') nodeStats.success++;
      else if (node.status === 'error') nodeStats.error++;
    }

    return { items: itemStats, nodes: nodeStats };
  }

  async getMessages(correlationId?: string): Promise<MessageLogDocument[]> {
    if (correlationId) {
      return this.messageLogCollection.find((doc) => doc.correlationId === correlationId);
    }
    return this.messageLogCollection.find(() => true);
  }

  async getStats(): Promise<MessageStats> {
    const docs = await this.statsCollection.find((doc) => doc.totalMessages !== undefined);
    if (docs.length === 0) {
      return { totalMessages: 0, totalCommands: 0, totalEvents: 0 };
    }
    const stats = docs[0];
    return {
      totalMessages: stats.totalMessages,
      totalCommands: stats.totalCommands,
      totalEvents: stats.totalEvents,
    };
  }

  async getLatestCorrelationId(): Promise<string | undefined> {
    const docs = await this.latestRunCollection.find(() => true);
    if (docs.length === 0) {
      return undefined;
    }
    return docs[0].latestCorrelationId;
  }

  async getAwaitState(correlationId: string): Promise<AwaitTrackerDocument | null> {
    const docs = await this.awaitTrackerCollection.find(
      (doc) => doc.correlationId === correlationId && doc.status === 'pending',
    );
    if (docs.length === 0) {
      return null;
    }
    return docs[0];
  }
}
