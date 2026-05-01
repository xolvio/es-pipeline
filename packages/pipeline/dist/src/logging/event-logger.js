export class EventLogger {
    constructor(options) {
        this.entries = [];
        this.onLog = options?.onLog;
    }
    log(event) {
        const entry = {
            timestamp: new Date().toISOString(),
            event,
            correlationId: event.correlationId,
        };
        this.entries.push(entry);
        this.onLog?.(entry);
    }
    getEntries() {
        return [...this.entries];
    }
    getEntriesByCorrelationId(correlationId) {
        return this.entries.filter((e) => e.correlationId === correlationId);
    }
    getEventTypes() {
        return this.entries.map((e) => e.event.type);
    }
    clear() {
        this.entries = [];
    }
    toJSON() {
        return this.getEntries();
    }
}
//# sourceMappingURL=event-logger.js.map