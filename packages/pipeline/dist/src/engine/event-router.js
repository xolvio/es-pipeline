export function createEventRouter(dispatcher) {
    const mappings = new Map();
    return {
        register(mapping) {
            const existing = mappings.get(mapping.eventType) ?? [];
            mappings.set(mapping.eventType, [...existing, ...mapping.commands]);
        },
        async route(event) {
            const commands = mappings.get(event.type);
            if (!commands) {
                return [];
            }
            const commandPromises = commands.map((command) => {
                const data = typeof command.data === 'function' ? command.data(event) : command.data;
                return dispatcher.dispatch({ type: command.commandType, data });
            });
            const resultArrays = await Promise.all(commandPromises);
            return resultArrays.flat();
        },
    };
}
//# sourceMappingURL=event-router.js.map