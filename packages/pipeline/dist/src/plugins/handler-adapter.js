export function adaptHandler(source) {
    return {
        name: source.name,
        alias: source.alias,
        description: source.description,
        events: source.events,
        fields: source.fields,
        handle: async (command, context) => {
            const result = await source.handle(command, context);
            return result;
        },
    };
}
export function adaptHandlers(sources) {
    return sources.map(adaptHandler);
}
//# sourceMappingURL=handler-adapter.js.map