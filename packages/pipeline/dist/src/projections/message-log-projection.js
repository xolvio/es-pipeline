import { nanoid } from 'nanoid';
export function evolve(_document, event) {
    if (event.type === 'CommandDispatched') {
        return {
            correlationId: event.data.correlationId,
            requestId: event.data.requestId,
            messageType: 'command',
            messageName: event.data.commandType,
            messageData: event.data.commandData,
            timestamp: event.data.timestamp,
        };
    }
    if (event.type === 'DomainEventEmitted') {
        return {
            correlationId: event.data.correlationId,
            requestId: event.data.requestId,
            messageType: 'event',
            messageName: event.data.eventType,
            messageData: event.data.eventData,
            timestamp: event.data.timestamp,
        };
    }
    if (event.type === 'PipelineRunStarted') {
        return {
            correlationId: event.data.correlationId,
            requestId: event.data.correlationId,
            messageType: 'event',
            messageName: 'PipelineRunStarted',
            messageData: {
                correlationId: event.data.correlationId,
                triggerCommand: event.data.triggerCommand,
            },
            timestamp: new Date(),
        };
    }
    return {
        correlationId: event.data.correlationId,
        requestId: nanoid(),
        messageType: 'event',
        messageName: 'NodeStatusChanged',
        messageData: {
            nodeId: `cmd:${event.data.commandName}`,
            status: event.data.status,
            previousStatus: event.data.previousStatus,
            pendingCount: event.data.pendingCount,
            endedCount: event.data.endedCount,
            lastDurationMs: event.data.lastDurationMs,
        },
        timestamp: new Date(),
    };
}
//# sourceMappingURL=message-log-projection.js.map