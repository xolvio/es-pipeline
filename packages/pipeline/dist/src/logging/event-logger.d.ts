import type { Event } from '@xolvio/message-bus';
export interface LogEntry {
    timestamp: string;
    event: Event;
    correlationId?: string;
}
export interface EventLoggerOptions {
    onLog?: (entry: LogEntry) => void;
}
export declare class EventLogger {
    private entries;
    private readonly onLog?;
    constructor(options?: EventLoggerOptions);
    log(event: Event): void;
    getEntries(): LogEntry[];
    getEntriesByCorrelationId(correlationId: string): LogEntry[];
    getEventTypes(): string[];
    clear(): void;
    toJSON(): LogEntry[];
}
//# sourceMappingURL=event-logger.d.ts.map