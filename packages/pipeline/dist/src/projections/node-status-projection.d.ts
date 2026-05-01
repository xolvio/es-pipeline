import type { NodeStatus } from '../graph/types';
export interface NodeStatusDocument {
    [key: string]: unknown;
    correlationId: string;
    commandName: string;
    status: NodeStatus;
    pendingCount: number;
    endedCount: number;
    lastDurationMs?: number;
}
export interface NodeStatusChangedEvent {
    type: 'NodeStatusChanged';
    data: {
        correlationId: string;
        commandName: string;
        nodeId: string;
        status: NodeStatus;
        previousStatus: NodeStatus;
        pendingCount: number;
        endedCount: number;
        lastDurationMs?: number;
    };
}
export declare function evolve(document: NodeStatusDocument | null, event: NodeStatusChangedEvent): NodeStatusDocument;
//# sourceMappingURL=node-status-projection.d.ts.map