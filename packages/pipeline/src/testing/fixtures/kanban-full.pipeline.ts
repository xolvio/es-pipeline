import type { Event } from '@xolvio/message-bus';
import { define } from '../../builder/define';

interface Component {
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
  targetDir: string;
}

interface CheckEventData {
  targetDirectory?: string;
  errors?: string;
}

const MAX_RETRIES = 4;
const momentRetryState = new Map<string, number>();
let projectRoot = '';

function hasAnyFailures(events: Event[]): boolean {
  return events.some((e) => e.type.includes('Failed'));
}

function collectErrors(events: Event[]): string {
  return events
    .filter((e) => e.type.includes('Failed'))
    .map((e) => (e.data as CheckEventData).errors ?? '')
    .filter((s) => s.length > 0)
    .join('\n');
}

function extractMomentPath(events: Record<string, Event[]>): string {
  const firstEvent = events.CheckTests?.[0] ?? events.CheckTypes?.[0] ?? events.CheckLint?.[0];
  const data = firstEvent?.data as CheckEventData | undefined;
  return data?.targetDirectory ?? '';
}

function gatherAllCheckEvents(events: Record<string, Event[]>): Event[] {
  return [...(events.CheckTests ?? []), ...(events.CheckTypes ?? []), ...(events.CheckLint ?? [])];
}

function shouldRetry(momentPath: string): boolean {
  const attempts = momentRetryState.get(momentPath) ?? 0;
  return attempts < MAX_RETRIES;
}

function incrementRetryCount(momentPath: string): number {
  const attempts = momentRetryState.get(momentPath) ?? 0;
  momentRetryState.set(momentPath, attempts + 1);
  return attempts + 1;
}

function hasValidComponents(e: { data: ClientGeneratedData | null }): boolean {
  return e.data !== null && Array.isArray(e.data.components) && e.data.components.length > 0;
}

function hasInvalidComponents(e: { data: ClientGeneratedData | null }): boolean {
  return !hasValidComponents(e);
}

function resolvePath(relativePath: string): string {
  if (projectRoot === '') {
    return relativePath;
  }
  if (relativePath.startsWith('/')) {
    return relativePath;
  }
  if (relativePath.startsWith('./')) {
    return `${projectRoot}/${relativePath.slice(2)}`;
  }
  return `${projectRoot}/${relativePath}`;
}

export function createKanbanFullPipeline() {
  return define('kanban-full')
    .on('MomentGenerated')
    .emit('ImplementMoment', (e: { data: MomentGeneratedData }) => ({
      momentPath: resolvePath(e.data.momentPath),
      context: { previousOutputs: 'errors', attemptNumber: 0 },
      aiOptions: { maxTokens: 2000 },
    }))

    .on('MomentImplemented')
    .emit('CheckTests', (e: { data: MomentImplementedData }) => ({
      targetDirectory: e.data.momentPath,
      scope: 'slice',
    }))
    .emit('CheckTypes', (e: { data: MomentImplementedData }) => ({
      targetDirectory: e.data.momentPath,
      scope: 'slice',
    }))
    .emit('CheckLint', (e: { data: MomentImplementedData }) => ({
      targetDirectory: e.data.momentPath,
      scope: 'slice',
      fix: true,
    }))

    .settled(['CheckTests', 'CheckTypes', 'CheckLint'])
    .dispatch({ dispatches: ['ImplementMoment'] }, (events, send) => {
      const allEvents = gatherAllCheckEvents(events);

      if (!hasAnyFailures(allEvents)) {
        const momentPath = extractMomentPath(events);
        momentRetryState.delete(momentPath);
        return;
      }

      const momentPath = extractMomentPath(events);

      if (!shouldRetry(momentPath)) {
        momentRetryState.delete(momentPath);
        return;
      }

      const retryAttempt = incrementRetryCount(momentPath);
      send('ImplementMoment', {
        momentPath,
        context: { previousOutputs: collectErrors(allEvents), attemptNumber: retryAttempt },
        aiOptions: { maxTokens: 2000 },
      });
      return { persist: true };
    })

    .on('ServerGenerated')
    .emit('GenerateIA', () => ({
      modelPath: resolvePath('./.context/schema.json'),
      outputDir: resolvePath('./.context'),
    }))
    .emit('StartServer', () => ({
      serverDirectory: resolvePath('./server'),
    }))

    .on('IAGenerated')
    .emit('GenerateClient', () => ({
      targetDir: resolvePath('./client'),
      iaSchemaPath: resolvePath('./.context/auto-ia-scheme.json'),
      figmaVariablesPath: resolvePath('./.context/figma-file.json'),
    }))

    .on('ClientGenerated')
    .when(hasValidComponents)
    .emit('StartClient', () => ({
      clientDirectory: resolvePath('./client'),
    }))

    .on('ClientGenerated')
    .when(hasInvalidComponents)
    .emit('ImplementComponent', () => ({
      projectDir: resolvePath('./client'),
      iaSchemeDir: resolvePath('./.context'),
      designSystemPath: resolvePath('./.context/design-system.md'),
      componentType: 'molecule',
      filePath: resolvePath('client/src/components/molecules/Example.tsx'),
      componentName: 'Example.tsx',
      aiOptions: { maxTokens: 3000 },
    }))

    .on('ClientGenerated')
    .when(hasValidComponents)
    .forEach((e: { data: ClientGeneratedData }) => e.data.components)
    .groupInto(['molecule', 'organism', 'page'], (c) => c.type)
    .process('ImplementComponent', (c: Component) => ({
      projectDir: resolvePath('./client'),
      iaSchemeDir: resolvePath('./.context'),
      designSystemPath: resolvePath('./.context/design-system.md'),
      componentType: c.type ?? 'molecule',
      filePath: resolvePath(c.filePath ?? ''),
      componentName: (c.filePath ?? '').split('/').pop()?.replace('.tsx', '') ?? '',
      aiOptions: { maxTokens: 3000 },
    }))
    .onComplete({
      success: { name: 'AllComponentsImplemented', displayName: 'All Components Implemented' },
      failure: { name: 'ComponentsFailed', displayName: 'Components Failed' },
      itemKey: (e) => (e.data as { filePath?: string }).filePath ?? '',
    })

    .build();
}

export function resetKanbanState(): void {
  momentRetryState.clear();
  projectRoot = '';
}

export function setProjectRoot(root: string): void {
  projectRoot = root;
}

export function testResolvePath(relativePath: string): string {
  return resolvePath(relativePath);
}

export function setMomentRetryCount(momentPath: string, count: number): void {
  momentRetryState.set(momentPath, count);
}

export function testShouldRetry(momentPath: string): boolean {
  return shouldRetry(momentPath);
}
