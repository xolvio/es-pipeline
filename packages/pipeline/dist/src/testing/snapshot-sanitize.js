export function sanitizeEvent(event) {
    return {
        type: event.type,
        data: event.data,
    };
}
export function sanitizeEvents(events) {
    return events.map(sanitizeEvent);
}
//# sourceMappingURL=snapshot-sanitize.js.map