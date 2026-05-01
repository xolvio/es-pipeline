export class EventCapture {
    constructor() {
        this.events = [];
        this.eventListeners = [];
    }
    record(event) {
        this.events.push(event);
        this.eventListeners.forEach((listener) => listener(event));
    }
    getEvents() {
        return [...this.events];
    }
    getEventTypes() {
        return this.events.map((e) => e.type);
    }
    clear() {
        this.events = [];
    }
    hasEvent(eventType) {
        return this.events.some((e) => e.type === eventType);
    }
    getEventsOfType(eventType) {
        return this.events.filter((e) => e.type === eventType);
    }
    waitForEvent(eventType, timeoutMs) {
        const existing = this.events.find((e) => e.type === eventType);
        if (existing) {
            return Promise.resolve(existing);
        }
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                const index = this.eventListeners.indexOf(listener);
                if (index !== -1) {
                    this.eventListeners.splice(index, 1);
                }
                reject(new Error(`Timeout waiting for event: ${eventType}`));
            }, timeoutMs);
            const listener = (event) => {
                if (event.type === eventType) {
                    clearTimeout(timeoutId);
                    const index = this.eventListeners.indexOf(listener);
                    if (index !== -1) {
                        this.eventListeners.splice(index, 1);
                    }
                    resolve(event);
                }
            };
            this.eventListeners.push(listener);
        });
    }
    get count() {
        return this.events.length;
    }
}
//# sourceMappingURL=event-capture.js.map