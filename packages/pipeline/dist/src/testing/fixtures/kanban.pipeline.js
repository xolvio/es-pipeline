import { define } from '../../builder/define.js';
function isCheckEventData(data) {
    return typeof data === 'object' && data !== null && 'target' in data && typeof data.target === 'string';
}
const MAX_RETRIES = 3;
const retryState = new Map();
function hasAnyFailures(events) {
    return events.some((e) => e.type.includes('Failed'));
}
function collectErrors(events) {
    return events.filter((e) => e.type.includes('Failed')).map((e) => JSON.stringify(e.data));
}
function extractMomentPath(events) {
    const firstEvent = events.CheckTests?.[0] ?? events.CheckTypes?.[0] ?? events.CheckLint?.[0];
    const data = firstEvent?.data;
    if (isCheckEventData(data)) {
        return data.target;
    }
    return 'unknown';
}
function gatherAllCheckEvents(events) {
    return [...(events.CheckTests ?? []), ...(events.CheckTypes ?? []), ...(events.CheckLint ?? [])];
}
function shouldRetry(momentPath) {
    const attempts = retryState.get(momentPath) ?? 0;
    return attempts < MAX_RETRIES;
}
function incrementRetryCount(momentPath) {
    const attempts = retryState.get(momentPath) ?? 0;
    retryState.set(momentPath, attempts + 1);
    return attempts + 1;
}
export function createKanbanPipeline() {
    return define('kanban')
        .on('MomentGenerated')
        .emit('ImplementMoment', (e) => ({ momentPath: e.data.momentPath }))
        .on('MomentImplemented')
        .emit('CheckTests', (e) => ({ target: e.data.momentPath }))
        .emit('CheckTypes', (e) => ({ target: e.data.momentPath }))
        .emit('CheckLint', (e) => ({ target: e.data.momentPath }))
        .settled(['CheckTests', 'CheckTypes', 'CheckLint'])
        .dispatch({ dispatches: ['ImplementMoment'] }, (events, send) => {
        const allEvents = gatherAllCheckEvents(events);
        if (!hasAnyFailures(allEvents)) {
            return;
        }
        const momentPath = extractMomentPath(events);
        if (!shouldRetry(momentPath)) {
            return;
        }
        const retryAttempt = incrementRetryCount(momentPath);
        send('ImplementMoment', { momentPath, context: { errors: collectErrors(allEvents), retryAttempt } });
        return { persist: true };
    })
        .on('ServerGenerated')
        .emit('GenerateIA', (e) => ({ modelPath: e.data.modelPath }))
        .emit('StartServer', {})
        .on('IAGenerated')
        .emit('GenerateClient', {})
        .on('ClientGenerated')
        .forEach((e) => e.data.components)
        .groupInto(['molecule', 'organism', 'page'], (c) => c.type)
        .process('ImplementComponent', (c) => ({ filePath: c.filePath }))
        .onComplete({
        success: { name: 'AllComponentsImplemented', displayName: 'All Components Implemented' },
        failure: { name: 'ComponentsFailed', displayName: 'Components Failed' },
        itemKey: (e) => e.data.filePath ?? '',
    })
        .build();
}
export function resetRetryState() {
    retryState.clear();
}
export function setRetryCount(momentPath, count) {
    retryState.set(momentPath, count);
}
export function testShouldRetry(momentPath) {
    return shouldRetry(momentPath);
}
//# sourceMappingURL=kanban.pipeline.js.map