import type { Event } from '@xolvio/message-bus';

export interface SanitizedEvent {
  type: string;
  data: Record<string, unknown>;
}

export function sanitizeEvent(event: Event): SanitizedEvent {
  return {
    type: event.type,
    data: event.data,
  };
}

export function sanitizeEvents(events: Event[]): SanitizedEvent[] {
  return events.map(sanitizeEvent);
}
