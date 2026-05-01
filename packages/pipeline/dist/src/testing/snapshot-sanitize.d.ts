import type { Event } from '@xolvio/message-bus';
export interface SanitizedEvent {
    type: string;
    data: Record<string, unknown>;
}
export declare function sanitizeEvent(event: Event): SanitizedEvent;
export declare function sanitizeEvents(events: Event[]): SanitizedEvent[];
//# sourceMappingURL=snapshot-sanitize.d.ts.map