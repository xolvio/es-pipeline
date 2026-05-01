import type { InMemoryDatabase } from '@event-driven-io/emmett';
import type { NodeStatus } from '../graph/types';
import type { AwaitTrackerDocument } from '../projections/await-tracker-projection';
import type { ItemStatusDocument } from '../projections/item-status-projection';
import type { MessageLogDocument } from '../projections/message-log-projection';
import type { NodeStatusDocument } from '../projections/node-status-projection';
export interface CommandStats {
    pendingCount: number;
    endedCount: number;
    aggregateStatus: NodeStatus;
}
export interface RunStats {
    items: {
        total: number;
        running: number;
        success: number;
        error: number;
        retried: number;
    };
    nodes: {
        total: number;
        running: number;
        success: number;
        error: number;
    };
}
export interface MessageStats {
    totalMessages: number;
    totalCommands: number;
    totalEvents: number;
}
export declare class PipelineReadModel {
    private readonly itemStatusCollection;
    private readonly nodeStatusCollection;
    private readonly messageLogCollection;
    private readonly statsCollection;
    private readonly latestRunCollection;
    private readonly awaitTrackerCollection;
    constructor(database: InMemoryDatabase);
    computeCommandStats(correlationId: string, commandType: string): Promise<CommandStats>;
    hasCorrelation(correlationId: string): Promise<boolean>;
    getNodeStatus(correlationId: string, commandName: string): Promise<NodeStatusDocument | null>;
    getItemStatus(correlationId: string, commandType: string, itemKey: string): Promise<ItemStatusDocument | null>;
    getAllItemStatuses(correlationId: string): Promise<ItemStatusDocument[]>;
    getAllNodeStatuses(correlationId: string): Promise<NodeStatusDocument[]>;
    getRunStats(correlationId: string): Promise<RunStats>;
    getMessages(correlationId?: string): Promise<MessageLogDocument[]>;
    getStats(): Promise<MessageStats>;
    getLatestCorrelationId(): Promise<string | undefined>;
    getAwaitState(correlationId: string): Promise<AwaitTrackerDocument | null>;
}
//# sourceMappingURL=pipeline-read-model.d.ts.map