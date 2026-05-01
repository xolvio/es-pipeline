import type { NodeStatus } from '../graph/types';
export interface MessageLogDocument {
    [key: string]: unknown;
    correlationId: string;
    requestId: string;
    messageType: 'command' | 'event';
    messageName: string;
    messageData: Record<string, unknown>;
    timestamp: Date;
}
export interface CommandDispatchedEvent {
    type: 'CommandDispatched';
    data: {
        correlationId: string;
        requestId: string;
        commandType: string;
        commandData: Record<string, unknown>;
        timestamp: Date;
    };
}
export interface DomainEventEmittedEvent {
    type: 'DomainEventEmitted';
    data: {
        correlationId: string;
        requestId: string;
        eventType: string;
        eventData: Record<string, unknown>;
        timestamp: Date;
    };
}
export interface PipelineRunStartedLogEvent {
    type: 'PipelineRunStarted';
    data: {
        correlationId: string;
        triggerCommand: string;
    };
}
export interface NodeStatusChangedLogEvent {
    type: 'NodeStatusChanged';
    data: {
        correlationId: string;
        commandName: string;
        status: NodeStatus;
        previousStatus: NodeStatus;
        pendingCount: number;
        endedCount: number;
        lastDurationMs?: number;
    };
}
export type MessageLogEvent = CommandDispatchedEvent | DomainEventEmittedEvent | PipelineRunStartedLogEvent | NodeStatusChangedLogEvent;
export declare function evolve(_document: MessageLogDocument | null, event: MessageLogEvent): MessageLogDocument;
//# sourceMappingURL=message-log-projection.d.ts.map