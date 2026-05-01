export function evolve(document, event) {
    const current = document ?? { totalMessages: 0, totalCommands: 0, totalEvents: 0 };
    if (event.type === 'CommandDispatched') {
        return {
            totalMessages: current.totalMessages + 1,
            totalCommands: current.totalCommands + 1,
            totalEvents: current.totalEvents,
        };
    }
    return {
        totalMessages: current.totalMessages + 1,
        totalCommands: current.totalCommands,
        totalEvents: current.totalEvents + 1,
    };
}
//# sourceMappingURL=stats-projection.js.map