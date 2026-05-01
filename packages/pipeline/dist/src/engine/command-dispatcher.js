export function createCommandDispatcher() {
    const handlers = new Map();
    return {
        register(commandType, handler) {
            handlers.set(commandType, handler);
        },
        registeredTypes() {
            return [...handlers.keys()];
        },
        async dispatch(command) {
            const handler = handlers.get(command.type);
            if (!handler) {
                throw new Error(`No handler registered for command type: ${command.type}`);
            }
            return handler(command);
        },
    };
}
export async function dispatchAndStore(dispatcher, eventStore, streamName, command) {
    const results = await dispatcher.dispatch(command);
    if (results.length > 0) {
        await eventStore.appendToStream(streamName, results);
    }
    return results;
}
//# sourceMappingURL=command-dispatcher.js.map