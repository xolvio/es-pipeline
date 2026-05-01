export class PipelineReadModel {
    constructor(database) {
        this.itemStatusCollection = database.collection('ItemStatus');
        this.nodeStatusCollection = database.collection('NodeStatus');
        this.messageLogCollection = database.collection('MessageLog');
        this.statsCollection = database.collection('Stats');
        this.latestRunCollection = database.collection('LatestRun');
        this.awaitTrackerCollection = database.collection('AwaitTracker');
    }
    async computeCommandStats(correlationId, commandType) {
        const items = await this.itemStatusCollection.find((doc) => doc.correlationId === correlationId && doc.commandType === commandType);
        if (items.length === 0) {
            return { pendingCount: 0, endedCount: 0, aggregateStatus: 'idle' };
        }
        const latestBatchId = items.reduce((latest, item) => {
            if (item.batchId === undefined)
                return latest;
            if (latest === undefined || item.batchId > latest)
                return item.batchId;
            return latest;
        }, undefined);
        const currentItems = latestBatchId !== undefined ? items.filter((item) => item.batchId === latestBatchId) : items;
        let pendingCount = 0;
        let endedCount = 0;
        let hasError = false;
        for (const item of currentItems) {
            if (item.status === 'running') {
                pendingCount++;
            }
            else {
                endedCount++;
                if (item.status === 'error') {
                    hasError = true;
                }
            }
        }
        let aggregateStatus;
        if (pendingCount > 0) {
            aggregateStatus = 'running';
        }
        else if (hasError) {
            aggregateStatus = 'error';
        }
        else {
            aggregateStatus = 'success';
        }
        return { pendingCount, endedCount, aggregateStatus };
    }
    async hasCorrelation(correlationId) {
        const nodes = await this.nodeStatusCollection.find((doc) => doc.correlationId === correlationId);
        return nodes.length > 0;
    }
    async getNodeStatus(correlationId, commandName) {
        const nodes = await this.nodeStatusCollection.find((doc) => doc.correlationId === correlationId && doc.commandName === commandName);
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
    async getItemStatus(correlationId, commandType, itemKey) {
        const items = await this.itemStatusCollection.find((doc) => doc.correlationId === correlationId && doc.commandType === commandType && doc.itemKey === itemKey);
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
    async getAllItemStatuses(correlationId) {
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
    async getAllNodeStatuses(correlationId) {
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
    async getRunStats(correlationId) {
        const items = await this.itemStatusCollection.find((doc) => doc.correlationId === correlationId);
        const nodes = await this.nodeStatusCollection.find((doc) => doc.correlationId === correlationId);
        const itemStats = { total: 0, running: 0, success: 0, error: 0, retried: 0 };
        for (const item of items) {
            itemStats.total++;
            if (item.status === 'running')
                itemStats.running++;
            else if (item.status === 'success')
                itemStats.success++;
            else if (item.status === 'error')
                itemStats.error++;
            if (item.attemptCount > 1)
                itemStats.retried++;
        }
        const nodeStats = { total: 0, running: 0, success: 0, error: 0 };
        for (const node of nodes) {
            nodeStats.total++;
            if (node.status === 'running')
                nodeStats.running++;
            else if (node.status === 'success')
                nodeStats.success++;
            else if (node.status === 'error')
                nodeStats.error++;
        }
        return { items: itemStats, nodes: nodeStats };
    }
    async getMessages(correlationId) {
        if (correlationId) {
            return this.messageLogCollection.find((doc) => doc.correlationId === correlationId);
        }
        return this.messageLogCollection.find(() => true);
    }
    async getStats() {
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
    async getLatestCorrelationId() {
        const docs = await this.latestRunCollection.find(() => true);
        if (docs.length === 0) {
            return undefined;
        }
        return docs[0].latestCorrelationId;
    }
    async getAwaitState(correlationId) {
        const docs = await this.awaitTrackerCollection.find((doc) => doc.correlationId === correlationId && doc.status === 'pending');
        if (docs.length === 0) {
            return null;
        }
        return docs[0];
    }
}
//# sourceMappingURL=pipeline-read-model.js.map