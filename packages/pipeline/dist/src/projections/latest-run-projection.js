export function evolve(_document, event) {
    return {
        latestCorrelationId: event.data.correlationId,
        triggerCommand: event.data.triggerCommand,
    };
}
//# sourceMappingURL=latest-run-projection.js.map