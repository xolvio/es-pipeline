import type { Event } from '@xolvio/message-bus';
export declare class EventCapture {
    private events;
    private eventListeners;
    record(event: Event): void;
    getEvents(): Event[];
    getEventTypes(): string[];
    clear(): void;
    hasEvent(eventType: string): boolean;
    getEventsOfType(eventType: string): Event[];
    waitForEvent(eventType: string, timeoutMs: number): Promise<Event>;
    get count(): number;
}
//# sourceMappingURL=event-capture.d.ts.map