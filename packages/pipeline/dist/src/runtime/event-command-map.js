function getEventName(event) {
    return typeof event === 'string' ? event : event.name;
}
export class EventCommandMapper {
    constructor(handlers) {
        this.eventToCommand = new Map();
        this.commandToEvents = new Map();
        for (const handler of handlers) {
            this.addHandler(handler);
        }
    }
    addHandler(handler) {
        const events = handler.events ?? [];
        for (const event of events) {
            const eventType = getEventName(event);
            this.eventToCommand.set(eventType, handler.name);
        }
        this.commandToEvents.set(handler.name, events.map(getEventName));
    }
    getSourceCommand(eventType) {
        return this.eventToCommand.get(eventType);
    }
    getEventsForCommand(commandType) {
        return this.commandToEvents.get(commandType) ?? [];
    }
    isEventFromCommand(eventType, commandType) {
        return this.getSourceCommand(eventType) === commandType;
    }
}
//# sourceMappingURL=event-command-map.js.map