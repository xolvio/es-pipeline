const callCounts = new Map();
export function createMockHandlers(configs) {
    callCounts.clear();
    return configs.map((config) => ({
        name: config.name,
        events: config.events,
        handle: async (cmd) => {
            const currentCount = (callCounts.get(config.name) ?? 0) + 1;
            callCounts.set(config.name, currentCount);
            return config.fn(cmd, currentCount);
        },
    }));
}
export function getHandlerCallCount(handlerName) {
    return callCounts.get(handlerName) ?? 0;
}
export function resetCallCounts() {
    callCounts.clear();
}
export function createStatefulHandler(config) {
    let callCount = 0;
    return {
        name: config.name,
        events: config.events,
        handle: async (cmd) => {
            callCount++;
            if (callCount <= config.initialFails) {
                return config.failEvent(cmd);
            }
            return config.successEvent(cmd);
        },
    };
}
//# sourceMappingURL=mock-handlers.js.map