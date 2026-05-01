export function evolve(document, event) {
    const base = {
        correlationId: event.data.correlationId,
        commandType: event.data.commandType,
        itemKey: event.data.itemKey,
        currentRequestId: event.data.requestId,
        status: event.data.status,
        attemptCount: event.data.attemptCount,
        batchId: event.data.batchId ?? document?.batchId,
    };
    if (event.data.status === 'running') {
        base.startedAt = event.data.timestamp;
    }
    else {
        base.startedAt = document?.startedAt;
        base.endedAt = event.data.timestamp;
    }
    return base;
}
//# sourceMappingURL=item-status-projection.js.map