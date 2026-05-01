import type { MessageLogEvent } from './message-log-projection';
export interface StatsDocument {
    [key: string]: unknown;
    totalMessages: number;
    totalCommands: number;
    totalEvents: number;
}
export declare function evolve(document: StatsDocument | null, event: MessageLogEvent): StatsDocument;
//# sourceMappingURL=stats-projection.d.ts.map