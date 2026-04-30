import type { Event } from '@xolvio/message-bus';
import { define } from '../../builder/define';

interface Component {
  id: string;
  type: 'molecule' | 'organism' | 'page';
  filePath: string;
}

interface MomentGeneratedData {
  momentPath: string;
}

interface MomentImplementedData {
  momentPath: string;
}

interface ClientGeneratedData {
  components: Component[];
}

interface CheckEventData {
  target: string;
}

function isCheckEventData(data: unknown): data is CheckEventData {
  return typeof data === 'object' && data !== null && 'target' in data && typeof data.target === 'string';
}

const MAX_RETRIES = 3;
const retryState = new Map<string, number>();

function hasAnyFailures(events: Event[]): boolean {
  return events.some((e) => e.type.includes('Failed'));
}

function collectErrors(events: Event[]): string[] {
  return events.filter((e) => e.type.includes('Failed')).map((e) => JSON.stringify(e.data));
}

function extractMomentPath(events: Record<string, Event[]>): string {
  const firstEvent = events.CheckTests?.[0] ?? events.CheckTypes?.[0] ?? events.CheckLint?.[0];
  const data = firstEvent?.data;
  if (isCheckEventData(data)) {
    return data.target;
  }
  return 'unknown';
}

function gatherAllCheckEvents(events: Record<string, Event[]>): Event[] {
  return [...(events.CheckTests ?? []), ...(events.CheckTypes ?? []), ...(events.CheckLint ?? [])];
}

function shouldRetry(momentPath: string): boolean {
  const attempts = retryState.get(momentPath) ?? 0;
  return attempts < MAX_RETRIES;
}

function incrementRetryCount(momentPath: string): number {
  const attempts = retryState.get(momentPath) ?? 0;
  retryState.set(momentPath, attempts + 1);
  return attempts + 1;
}

export function createKanbanPipeline() {
  return define('kanban')
    .on('MomentGenerated')
    .emit('ImplementMoment', (e: { data: MomentGeneratedData }) => ({ momentPath: e.data.momentPath }))

    .on('MomentImplemented')
    .emit('CheckTests', (e: { data: MomentImplementedData }) => ({ target: e.data.momentPath }))
    .emit('CheckTypes', (e: { data: MomentImplementedData }) => ({ target: e.data.momentPath }))
    .emit('CheckLint', (e: { data: MomentImplementedData }) => ({ target: e.data.momentPath }))

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
    .emit('GenerateIA', (e: { data: { modelPath: string } }) => ({ modelPath: e.data.modelPath }))
    .emit('StartServer', {})

    .on('IAGenerated')
    .emit('GenerateClient', {})

    .on('ClientGenerated')
    .forEach((e: { data: ClientGeneratedData }) => e.data.components)
    .groupInto(['molecule', 'organism', 'page'], (c) => c.type)
    .process('ImplementComponent', (c) => ({ filePath: c.filePath }))
    .onComplete({
      success: { name: 'AllComponentsImplemented', displayName: 'All Components Implemented' },
      failure: { name: 'ComponentsFailed', displayName: 'Components Failed' },
      itemKey: (e) => (e.data as { filePath?: string }).filePath ?? '',
    })

    .build();
}

export function resetRetryState(): void {
  retryState.clear();
}

export function setRetryCount(momentPath: string, count: number): void {
  retryState.set(momentPath, count);
}

export function testShouldRetry(momentPath: string): boolean {
  return shouldRetry(momentPath);
}
