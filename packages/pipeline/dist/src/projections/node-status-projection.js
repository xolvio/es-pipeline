export function evolve(document, event) {
    return {
        correlationId: event.data.correlationId,
        commandName: event.data.commandName,
        status: event.data.status,
        pendingCount: event.data.pendingCount,
        endedCount: event.data.endedCount,
        lastDurationMs: event.data.lastDurationMs ?? document?.lastDurationMs,
    };
}
//# sourceMappingURL=node-status-projection.js.map