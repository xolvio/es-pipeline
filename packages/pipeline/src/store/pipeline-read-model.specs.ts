import { getInMemoryDatabase, type InMemoryDatabase } from '@event-driven-io/emmett';
import { beforeEach, describe, expect, it } from 'vitest';
import type { ItemStatusDocument } from '../projections/item-status-projection';
import type { MessageLogDocument } from '../projections/message-log-projection';
import type { NodeStatusDocument } from '../projections/node-status-projection';
import type { StatsDocument } from '../projections/stats-projection';
import { PipelineReadModel } from './pipeline-read-model';

type WithId<T> = T & { _id: string; _version?: never };

describe('PipelineReadModel', () => {
  let database: InMemoryDatabase;
  let readModel: PipelineReadModel;

  beforeEach(() => {
    database = getInMemoryDatabase();
    readModel = new PipelineReadModel(database);
  });

  describe('computeCommandStats', () => {
    it('should return idle stats when no items exist', async () => {
      const result = await readModel.computeCommandStats('c1', 'Cmd');

      expect(result).toEqual({
        pendingCount: 0,
        endedCount: 0,
        aggregateStatus: 'idle',
      });
    });

    it('should count running items as pending', async () => {
      const collection = database.collection<WithId<ItemStatusDocument>>('ItemStatus');
      await collection.insertOne({
        _id: 'c1-Cmd-a',
        correlationId: 'c1',
        commandType: 'Cmd',
        itemKey: 'a',
        currentRequestId: 'r1',
        status: 'running',
        attemptCount: 1,
      });

      const result = await readModel.computeCommandStats('c1', 'Cmd');

      expect(result).toEqual({
        pendingCount: 1,
        endedCount: 0,
        aggregateStatus: 'running',
      });
    });

    it('should count success items as ended', async () => {
      const collection = database.collection<WithId<ItemStatusDocument>>('ItemStatus');
      await collection.insertOne({
        _id: 'c1-Cmd-a',
        correlationId: 'c1',
        commandType: 'Cmd',
        itemKey: 'a',
        currentRequestId: 'r1',
        status: 'success',
        attemptCount: 1,
      });

      const result = await readModel.computeCommandStats('c1', 'Cmd');

      expect(result).toEqual({
        pendingCount: 0,
        endedCount: 1,
        aggregateStatus: 'success',
      });
    });

    it('should count error items as ended with error status', async () => {
      const collection = database.collection<WithId<ItemStatusDocument>>('ItemStatus');
      await collection.insertOne({
        _id: 'c1-Cmd-a',
        correlationId: 'c1',
        commandType: 'Cmd',
        itemKey: 'a',
        currentRequestId: 'r1',
        status: 'error',
        attemptCount: 1,
      });

      const result = await readModel.computeCommandStats('c1', 'Cmd');

      expect(result).toEqual({
        pendingCount: 0,
        endedCount: 1,
        aggregateStatus: 'error',
      });
    });

    it('should aggregate multiple items correctly', async () => {
      const collection = database.collection<WithId<ItemStatusDocument>>('ItemStatus');
      await collection.insertOne({
        _id: 'c1-Cmd-a',
        correlationId: 'c1',
        commandType: 'Cmd',
        itemKey: 'a',
        currentRequestId: 'r1',
        status: 'running',
        attemptCount: 1,
      });
      await collection.insertOne({
        _id: 'c1-Cmd-b',
        correlationId: 'c1',
        commandType: 'Cmd',
        itemKey: 'b',
        currentRequestId: 'r2',
        status: 'running',
        attemptCount: 1,
      });
      await collection.insertOne({
        _id: 'c1-Cmd-c',
        correlationId: 'c1',
        commandType: 'Cmd',
        itemKey: 'c',
        currentRequestId: 'r3',
        status: 'success',
        attemptCount: 1,
      });

      const result = await readModel.computeCommandStats('c1', 'Cmd');

      expect(result).toEqual({
        pendingCount: 2,
        endedCount: 1,
        aggregateStatus: 'running',
      });
    });

    it('should return error status when any item has error and none running', async () => {
      const collection = database.collection<WithId<ItemStatusDocument>>('ItemStatus');
      await collection.insertOne({
        _id: 'c1-Cmd-a',
        correlationId: 'c1',
        commandType: 'Cmd',
        itemKey: 'a',
        currentRequestId: 'r1',
        status: 'success',
        attemptCount: 1,
      });
      await collection.insertOne({
        _id: 'c1-Cmd-b',
        correlationId: 'c1',
        commandType: 'Cmd',
        itemKey: 'b',
        currentRequestId: 'r2',
        status: 'error',
        attemptCount: 1,
      });

      const result = await readModel.computeCommandStats('c1', 'Cmd');

      expect(result).toEqual({
        pendingCount: 0,
        endedCount: 2,
        aggregateStatus: 'error',
      });
    });

    it('should filter by correlationId', async () => {
      const collection = database.collection<WithId<ItemStatusDocument>>('ItemStatus');
      await collection.insertOne({
        _id: 'c1-Cmd-a',
        correlationId: 'c1',
        commandType: 'Cmd',
        itemKey: 'a',
        currentRequestId: 'r1',
        status: 'running',
        attemptCount: 1,
      });
      await collection.insertOne({
        _id: 'c2-Cmd-a',
        correlationId: 'c2',
        commandType: 'Cmd',
        itemKey: 'a',
        currentRequestId: 'r2',
        status: 'success',
        attemptCount: 1,
      });

      const result = await readModel.computeCommandStats('c1', 'Cmd');

      expect(result).toEqual({
        pendingCount: 1,
        endedCount: 0,
        aggregateStatus: 'running',
      });
    });

    it('should filter by commandType', async () => {
      const collection = database.collection<WithId<ItemStatusDocument>>('ItemStatus');
      await collection.insertOne({
        _id: 'c1-CmdA-a',
        correlationId: 'c1',
        commandType: 'CmdA',
        itemKey: 'a',
        currentRequestId: 'r1',
        status: 'running',
        attemptCount: 1,
      });
      await collection.insertOne({
        _id: 'c1-CmdB-a',
        correlationId: 'c1',
        commandType: 'CmdB',
        itemKey: 'a',
        currentRequestId: 'r2',
        status: 'success',
        attemptCount: 1,
      });

      const result = await readModel.computeCommandStats('c1', 'CmdA');

      expect(result).toEqual({
        pendingCount: 1,
        endedCount: 0,
        aggregateStatus: 'running',
      });
    });

    it('should return success status when item that initially failed is now success after retry (BUG: CheckTypes showing error)', async () => {
      const collection = database.collection<WithId<ItemStatusDocument>>('ItemStatus');
      await collection.insertOne({
        _id: 'c1-CheckTypes-slice1',
        correlationId: 'c1',
        commandType: 'CheckTypes',
        itemKey: 'slice1',
        currentRequestId: 'r1',
        status: 'success',
        attemptCount: 1,
      });
      await collection.insertOne({
        _id: 'c1-CheckTypes-slice2',
        correlationId: 'c1',
        commandType: 'CheckTypes',
        itemKey: 'slice2',
        currentRequestId: 'r2',
        status: 'success',
        attemptCount: 1,
      });
      await collection.insertOne({
        _id: 'c1-CheckTypes-slice3',
        correlationId: 'c1',
        commandType: 'CheckTypes',
        itemKey: 'slice3',
        currentRequestId: 'r3',
        status: 'success',
        attemptCount: 1,
      });
      await collection.insertOne({
        _id: 'c1-CheckTypes-slice4',
        correlationId: 'c1',
        commandType: 'CheckTypes',
        itemKey: 'slice4',
        currentRequestId: 'r4',
        status: 'success',
        attemptCount: 1,
      });
      await collection.insertOne({
        _id: 'c1-CheckTypes-slice5',
        correlationId: 'c1',
        commandType: 'CheckTypes',
        itemKey: 'slice5',
        currentRequestId: 'r6',
        status: 'success',
        attemptCount: 2,
      });

      const result = await readModel.computeCommandStats('c1', 'CheckTypes');

      expect(result).toEqual({
        pendingCount: 0,
        endedCount: 5,
        aggregateStatus: 'success',
      });
    });

    it('should scope to latest batch and ignore stale errors from previous batches', async () => {
      const collection = database.collection<WithId<ItemStatusDocument>>('ItemStatus');
      await collection.insertOne({
        _id: 'c1-Cmd-old-a',
        correlationId: 'c1',
        commandType: 'Cmd',
        itemKey: 'old-a',
        currentRequestId: 'r1',
        status: 'error',
        attemptCount: 1,
        batchId: '2025-01-01T00:00:00.000Z',
      });
      await collection.insertOne({
        _id: 'c1-Cmd-old-b',
        correlationId: 'c1',
        commandType: 'Cmd',
        itemKey: 'old-b',
        currentRequestId: 'r2',
        status: 'error',
        attemptCount: 1,
        batchId: '2025-01-01T00:00:00.000Z',
      });
      await collection.insertOne({
        _id: 'c1-Cmd-new-a',
        correlationId: 'c1',
        commandType: 'Cmd',
        itemKey: 'new-a',
        currentRequestId: 'r3',
        status: 'success',
        attemptCount: 1,
        batchId: '2025-01-01T00:01:00.000Z',
      });
      await collection.insertOne({
        _id: 'c1-Cmd-new-b',
        correlationId: 'c1',
        commandType: 'Cmd',
        itemKey: 'new-b',
        currentRequestId: 'r4',
        status: 'success',
        attemptCount: 1,
        batchId: '2025-01-01T00:01:00.000Z',
      });

      const result = await readModel.computeCommandStats('c1', 'Cmd');

      expect(result).toEqual({
        pendingCount: 0,
        endedCount: 2,
        aggregateStatus: 'success',
      });
    });

    it('should use all items when no batchId exists for backward compatibility', async () => {
      const collection = database.collection<WithId<ItemStatusDocument>>('ItemStatus');
      await collection.insertOne({
        _id: 'c1-Cmd-a',
        correlationId: 'c1',
        commandType: 'Cmd',
        itemKey: 'a',
        currentRequestId: 'r1',
        status: 'success',
        attemptCount: 1,
      });
      await collection.insertOne({
        _id: 'c1-Cmd-b',
        correlationId: 'c1',
        commandType: 'Cmd',
        itemKey: 'b',
        currentRequestId: 'r2',
        status: 'error',
        attemptCount: 1,
      });

      const result = await readModel.computeCommandStats('c1', 'Cmd');

      expect(result).toEqual({
        pendingCount: 0,
        endedCount: 2,
        aggregateStatus: 'error',
      });
    });

    it('documents behavior: returns error when stale error items exist (BUG: requestId-based itemKey needs proper extractor)', async () => {
      const collection = database.collection<WithId<ItemStatusDocument>>('ItemStatus');
      await collection.insertOne({
        _id: 'c1-CheckTypes-r1',
        correlationId: 'c1',
        commandType: 'CheckTypes',
        itemKey: 'r1',
        currentRequestId: 'r1',
        status: 'success',
        attemptCount: 1,
      });
      await collection.insertOne({
        _id: 'c1-CheckTypes-r2',
        correlationId: 'c1',
        commandType: 'CheckTypes',
        itemKey: 'r2',
        currentRequestId: 'r2',
        status: 'success',
        attemptCount: 1,
      });
      await collection.insertOne({
        _id: 'c1-CheckTypes-r5',
        correlationId: 'c1',
        commandType: 'CheckTypes',
        itemKey: 'r5',
        currentRequestId: 'r5',
        status: 'error',
        attemptCount: 1,
      });
      await collection.insertOne({
        _id: 'c1-CheckTypes-r6',
        correlationId: 'c1',
        commandType: 'CheckTypes',
        itemKey: 'r6',
        currentRequestId: 'r6',
        status: 'success',
        attemptCount: 1,
      });

      const result = await readModel.computeCommandStats('c1', 'CheckTypes');

      expect(result).toEqual({
        pendingCount: 0,
        endedCount: 4,
        aggregateStatus: 'error',
      });
    });
  });

  describe('hasCorrelation', () => {
    it('should return false when no node status exists', async () => {
      const result = await readModel.hasCorrelation('c1');

      expect(result).toBe(false);
    });

    it('should return true when node status exists for correlation', async () => {
      const collection = database.collection<WithId<NodeStatusDocument>>('NodeStatus');
      await collection.insertOne({
        _id: 'c1-Cmd',
        correlationId: 'c1',
        commandName: 'Cmd',
        status: 'running',
        pendingCount: 1,
        endedCount: 0,
      });

      const result = await readModel.hasCorrelation('c1');

      expect(result).toBe(true);
    });

    it('should return false for different correlationId', async () => {
      const collection = database.collection<WithId<NodeStatusDocument>>('NodeStatus');
      await collection.insertOne({
        _id: 'c1-Cmd',
        correlationId: 'c1',
        commandName: 'Cmd',
        status: 'running',
        pendingCount: 1,
        endedCount: 0,
      });

      const result = await readModel.hasCorrelation('c2');

      expect(result).toBe(false);
    });
  });

  describe('getMessages', () => {
    it('should return empty array when no messages exist', async () => {
      const result = await readModel.getMessages();

      expect(result).toEqual([]);
    });

    it('should return all messages from MessageLog collection', async () => {
      const collection = database.collection<WithId<MessageLogDocument>>('MessageLog');
      const timestamp = new Date('2025-01-01T00:00:00Z');
      await collection.insertOne({
        _id: 'r1',
        correlationId: 'c1',
        requestId: 'r1',
        messageType: 'command',
        messageName: 'CreateUser',
        messageData: { name: 'Alice' },
        timestamp,
      });

      const result = await readModel.getMessages();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        correlationId: 'c1',
        requestId: 'r1',
        messageType: 'command',
        messageName: 'CreateUser',
      });
    });

    it('should return messages filtered by correlationId', async () => {
      const collection = database.collection<WithId<MessageLogDocument>>('MessageLog');
      const timestamp = new Date('2025-01-01T00:00:00Z');
      await collection.insertOne({
        _id: 'r1',
        correlationId: 'c1',
        requestId: 'r1',
        messageType: 'command',
        messageName: 'CreateUser',
        messageData: {},
        timestamp,
      });
      await collection.insertOne({
        _id: 'r2',
        correlationId: 'c2',
        requestId: 'r2',
        messageType: 'command',
        messageName: 'DeleteUser',
        messageData: {},
        timestamp,
      });

      const result = await readModel.getMessages('c1');

      expect(result).toHaveLength(1);
      expect(result[0].correlationId).toBe('c1');
    });
  });

  describe('getItemStatus', () => {
    it('should return null when no item status exists', async () => {
      const result = await readModel.getItemStatus('c1', 'CreateUser', 'item1');

      expect(result).toBeNull();
    });

    it('should return item status from ItemStatus collection', async () => {
      const collection = database.collection<WithId<ItemStatusDocument>>('ItemStatus');
      await collection.insertOne({
        _id: 'c1-CreateUser-item1',
        correlationId: 'c1',
        commandType: 'CreateUser',
        itemKey: 'item1',
        currentRequestId: 'r1',
        status: 'running',
        attemptCount: 1,
      });

      const result = await readModel.getItemStatus('c1', 'CreateUser', 'item1');

      expect(result).toMatchObject({
        correlationId: 'c1',
        commandType: 'CreateUser',
        itemKey: 'item1',
        currentRequestId: 'r1',
        status: 'running',
        attemptCount: 1,
      });
    });

    it('should return null for different correlationId', async () => {
      const collection = database.collection<WithId<ItemStatusDocument>>('ItemStatus');
      await collection.insertOne({
        _id: 'c1-CreateUser-item1',
        correlationId: 'c1',
        commandType: 'CreateUser',
        itemKey: 'item1',
        currentRequestId: 'r1',
        status: 'running',
        attemptCount: 1,
      });

      const result = await readModel.getItemStatus('c2', 'CreateUser', 'item1');

      expect(result).toBeNull();
    });

    it('should return null for different commandType', async () => {
      const collection = database.collection<WithId<ItemStatusDocument>>('ItemStatus');
      await collection.insertOne({
        _id: 'c1-CreateUser-item1',
        correlationId: 'c1',
        commandType: 'CreateUser',
        itemKey: 'item1',
        currentRequestId: 'r1',
        status: 'running',
        attemptCount: 1,
      });

      const result = await readModel.getItemStatus('c1', 'DeleteUser', 'item1');

      expect(result).toBeNull();
    });

    it('should return null for different itemKey', async () => {
      const collection = database.collection<WithId<ItemStatusDocument>>('ItemStatus');
      await collection.insertOne({
        _id: 'c1-CreateUser-item1',
        correlationId: 'c1',
        commandType: 'CreateUser',
        itemKey: 'item1',
        currentRequestId: 'r1',
        status: 'running',
        attemptCount: 1,
      });

      const result = await readModel.getItemStatus('c1', 'CreateUser', 'item2');

      expect(result).toBeNull();
    });
  });

  describe('getNodeStatus', () => {
    it('should return null when no node status exists', async () => {
      const result = await readModel.getNodeStatus('c1', 'CreateUser');

      expect(result).toBeNull();
    });

    it('should return node status from NodeStatus collection', async () => {
      const collection = database.collection<WithId<NodeStatusDocument>>('NodeStatus');
      await collection.insertOne({
        _id: 'c1-CreateUser',
        correlationId: 'c1',
        commandName: 'CreateUser',
        status: 'running',
        pendingCount: 1,
        endedCount: 0,
      });

      const result = await readModel.getNodeStatus('c1', 'CreateUser');

      expect(result).toEqual({
        correlationId: 'c1',
        commandName: 'CreateUser',
        status: 'running',
        pendingCount: 1,
        endedCount: 0,
      });
    });

    it('should return null for different correlationId', async () => {
      const collection = database.collection<WithId<NodeStatusDocument>>('NodeStatus');
      await collection.insertOne({
        _id: 'c1-CreateUser',
        correlationId: 'c1',
        commandName: 'CreateUser',
        status: 'running',
        pendingCount: 1,
        endedCount: 0,
      });

      const result = await readModel.getNodeStatus('c2', 'CreateUser');

      expect(result).toBeNull();
    });

    it('should return null for different commandName', async () => {
      const collection = database.collection<WithId<NodeStatusDocument>>('NodeStatus');
      await collection.insertOne({
        _id: 'c1-CreateUser',
        correlationId: 'c1',
        commandName: 'CreateUser',
        status: 'running',
        pendingCount: 1,
        endedCount: 0,
      });

      const result = await readModel.getNodeStatus('c1', 'DeleteUser');

      expect(result).toBeNull();
    });
  });

  describe('getAllItemStatuses', () => {
    it('should return empty array when no items exist', async () => {
      const result = await readModel.getAllItemStatuses('c1');

      expect(result).toEqual([]);
    });

    it('should return all items for correlationId', async () => {
      const collection = database.collection<WithId<ItemStatusDocument>>('ItemStatus');
      await collection.insertOne({
        _id: 'c1-Cmd-a',
        correlationId: 'c1',
        commandType: 'Cmd',
        itemKey: 'a',
        currentRequestId: 'r1',
        status: 'running',
        attemptCount: 1,
      });
      await collection.insertOne({
        _id: 'c1-Cmd-b',
        correlationId: 'c1',
        commandType: 'Cmd',
        itemKey: 'b',
        currentRequestId: 'r2',
        status: 'success',
        attemptCount: 1,
      });

      const result = await readModel.getAllItemStatuses('c1');

      expect(result).toEqual([
        {
          correlationId: 'c1',
          commandType: 'Cmd',
          itemKey: 'a',
          currentRequestId: 'r1',
          status: 'running',
          attemptCount: 1,
        },
        {
          correlationId: 'c1',
          commandType: 'Cmd',
          itemKey: 'b',
          currentRequestId: 'r2',
          status: 'success',
          attemptCount: 1,
        },
      ]);
    });

    it('should filter by correlationId', async () => {
      const collection = database.collection<WithId<ItemStatusDocument>>('ItemStatus');
      await collection.insertOne({
        _id: 'c1-Cmd-a',
        correlationId: 'c1',
        commandType: 'Cmd',
        itemKey: 'a',
        currentRequestId: 'r1',
        status: 'running',
        attemptCount: 1,
      });
      await collection.insertOne({
        _id: 'c2-Cmd-a',
        correlationId: 'c2',
        commandType: 'Cmd',
        itemKey: 'a',
        currentRequestId: 'r2',
        status: 'success',
        attemptCount: 1,
      });

      const result = await readModel.getAllItemStatuses('c1');

      expect(result).toEqual([
        {
          correlationId: 'c1',
          commandType: 'Cmd',
          itemKey: 'a',
          currentRequestId: 'r1',
          status: 'running',
          attemptCount: 1,
        },
      ]);
    });
  });

  describe('getAllNodeStatuses', () => {
    it('should return empty array when no nodes exist', async () => {
      const result = await readModel.getAllNodeStatuses('c1');

      expect(result).toEqual([]);
    });

    it('should return all nodes for correlationId', async () => {
      const collection = database.collection<WithId<NodeStatusDocument>>('NodeStatus');
      await collection.insertOne({
        _id: 'c1-CmdA',
        correlationId: 'c1',
        commandName: 'CmdA',
        status: 'running',
        pendingCount: 1,
        endedCount: 0,
      });
      await collection.insertOne({
        _id: 'c1-CmdB',
        correlationId: 'c1',
        commandName: 'CmdB',
        status: 'success',
        pendingCount: 0,
        endedCount: 2,
      });

      const result = await readModel.getAllNodeStatuses('c1');

      expect(result).toEqual([
        {
          correlationId: 'c1',
          commandName: 'CmdA',
          status: 'running',
          pendingCount: 1,
          endedCount: 0,
        },
        {
          correlationId: 'c1',
          commandName: 'CmdB',
          status: 'success',
          pendingCount: 0,
          endedCount: 2,
        },
      ]);
    });

    it('should filter by correlationId', async () => {
      const collection = database.collection<WithId<NodeStatusDocument>>('NodeStatus');
      await collection.insertOne({
        _id: 'c1-Cmd',
        correlationId: 'c1',
        commandName: 'Cmd',
        status: 'running',
        pendingCount: 1,
        endedCount: 0,
      });
      await collection.insertOne({
        _id: 'c2-Cmd',
        correlationId: 'c2',
        commandName: 'Cmd',
        status: 'success',
        pendingCount: 0,
        endedCount: 1,
      });

      const result = await readModel.getAllNodeStatuses('c1');

      expect(result).toEqual([
        {
          correlationId: 'c1',
          commandName: 'Cmd',
          status: 'running',
          pendingCount: 1,
          endedCount: 0,
        },
      ]);
    });
  });

  describe('getRunStats', () => {
    it('should return zero counts when no data exists', async () => {
      const result = await readModel.getRunStats('c1');

      expect(result).toEqual({
        items: { total: 0, running: 0, success: 0, error: 0, retried: 0 },
        nodes: { total: 0, running: 0, success: 0, error: 0 },
      });
    });

    it('should count items by status', async () => {
      const collection = database.collection<WithId<ItemStatusDocument>>('ItemStatus');
      await collection.insertOne({
        _id: 'c1-Cmd-a',
        correlationId: 'c1',
        commandType: 'Cmd',
        itemKey: 'a',
        currentRequestId: 'r1',
        status: 'running',
        attemptCount: 1,
      });
      await collection.insertOne({
        _id: 'c1-Cmd-b',
        correlationId: 'c1',
        commandType: 'Cmd',
        itemKey: 'b',
        currentRequestId: 'r2',
        status: 'success',
        attemptCount: 1,
      });
      await collection.insertOne({
        _id: 'c1-Cmd-c',
        correlationId: 'c1',
        commandType: 'Cmd',
        itemKey: 'c',
        currentRequestId: 'r3',
        status: 'error',
        attemptCount: 1,
      });

      const result = await readModel.getRunStats('c1');

      expect(result.items).toEqual({
        total: 3,
        running: 1,
        success: 1,
        error: 1,
        retried: 0,
      });
    });

    it('should count retried items with attemptCount > 1', async () => {
      const collection = database.collection<WithId<ItemStatusDocument>>('ItemStatus');
      await collection.insertOne({
        _id: 'c1-Cmd-a',
        correlationId: 'c1',
        commandType: 'Cmd',
        itemKey: 'a',
        currentRequestId: 'r1',
        status: 'success',
        attemptCount: 2,
      });
      await collection.insertOne({
        _id: 'c1-Cmd-b',
        correlationId: 'c1',
        commandType: 'Cmd',
        itemKey: 'b',
        currentRequestId: 'r2',
        status: 'success',
        attemptCount: 1,
      });

      const result = await readModel.getRunStats('c1');

      expect(result.items).toEqual({
        total: 2,
        running: 0,
        success: 2,
        error: 0,
        retried: 1,
      });
    });

    it('should count nodes by status', async () => {
      const collection = database.collection<WithId<NodeStatusDocument>>('NodeStatus');
      await collection.insertOne({
        _id: 'c1-CmdA',
        correlationId: 'c1',
        commandName: 'CmdA',
        status: 'running',
        pendingCount: 1,
        endedCount: 0,
      });
      await collection.insertOne({
        _id: 'c1-CmdB',
        correlationId: 'c1',
        commandName: 'CmdB',
        status: 'success',
        pendingCount: 0,
        endedCount: 2,
      });
      await collection.insertOne({
        _id: 'c1-CmdC',
        correlationId: 'c1',
        commandName: 'CmdC',
        status: 'error',
        pendingCount: 0,
        endedCount: 1,
      });

      const result = await readModel.getRunStats('c1');

      expect(result.nodes).toEqual({
        total: 3,
        running: 1,
        success: 1,
        error: 1,
      });
    });

    it('should filter by correlationId', async () => {
      const itemCollection = database.collection<WithId<ItemStatusDocument>>('ItemStatus');
      await itemCollection.insertOne({
        _id: 'c1-Cmd-a',
        correlationId: 'c1',
        commandType: 'Cmd',
        itemKey: 'a',
        currentRequestId: 'r1',
        status: 'running',
        attemptCount: 1,
      });
      await itemCollection.insertOne({
        _id: 'c2-Cmd-a',
        correlationId: 'c2',
        commandType: 'Cmd',
        itemKey: 'a',
        currentRequestId: 'r2',
        status: 'success',
        attemptCount: 1,
      });
      const nodeCollection = database.collection<WithId<NodeStatusDocument>>('NodeStatus');
      await nodeCollection.insertOne({
        _id: 'c1-Cmd',
        correlationId: 'c1',
        commandName: 'Cmd',
        status: 'running',
        pendingCount: 1,
        endedCount: 0,
      });
      await nodeCollection.insertOne({
        _id: 'c2-Cmd',
        correlationId: 'c2',
        commandName: 'Cmd',
        status: 'success',
        pendingCount: 0,
        endedCount: 1,
      });

      const result = await readModel.getRunStats('c1');

      expect(result).toEqual({
        items: { total: 1, running: 1, success: 0, error: 0, retried: 0 },
        nodes: { total: 1, running: 1, success: 0, error: 0 },
      });
    });

    it('should count idle nodes', async () => {
      const collection = database.collection<WithId<NodeStatusDocument>>('NodeStatus');
      await collection.insertOne({
        _id: 'c1-CmdA',
        correlationId: 'c1',
        commandName: 'CmdA',
        status: 'idle',
        pendingCount: 0,
        endedCount: 0,
      });
      await collection.insertOne({
        _id: 'c1-CmdB',
        correlationId: 'c1',
        commandName: 'CmdB',
        status: 'running',
        pendingCount: 1,
        endedCount: 0,
      });

      const result = await readModel.getRunStats('c1');

      expect(result.nodes).toEqual({
        total: 2,
        running: 1,
        success: 0,
        error: 0,
      });
    });
  });

  describe('getStats', () => {
    it('should return zero stats when no messages exist', async () => {
      const result = await readModel.getStats();

      expect(result).toEqual({
        totalMessages: 0,
        totalCommands: 0,
        totalEvents: 0,
      });
    });

    it('should return stats from Stats collection', async () => {
      const collection = database.collection<WithId<StatsDocument>>('Stats');
      await collection.insertOne({
        _id: 'global',
        totalMessages: 10,
        totalCommands: 6,
        totalEvents: 4,
      });

      const result = await readModel.getStats();

      expect(result).toEqual({
        totalMessages: 10,
        totalCommands: 6,
        totalEvents: 4,
      });
    });
  });
});
