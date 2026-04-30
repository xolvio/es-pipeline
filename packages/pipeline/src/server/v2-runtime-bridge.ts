import type { Command, Event } from '@xolvio/message-bus';
import createDebug from 'debug';
import type { SettledHandlerDescriptor } from '../core/descriptors.js';
import type { SettledInput, SettledOutput, SettledState } from '../engine/workflows/settled-workflow.js';
import { decide, evolve, initialState } from '../engine/workflows/settled-workflow.js';

const debug = createDebug('auto:pipeline:settled-bridge');

type NodeStatus = 'idle' | 'running' | 'success' | 'error';

export interface SettledStats {
  status: NodeStatus;
  pendingCount: number;
  endedCount: number;
}

interface V2RuntimeBridgeOptions {
  onDispatch: (commandType: string, data: unknown, correlationId: string) => void;
  onEmit?: (eventType: string, data: unknown, correlationId: string) => void;
}

interface RegisteredSettled {
  templateId: string;
  descriptor: SettledHandlerDescriptor;
  commandTypes: readonly string[];
  maxRetries: number;
  sourceEventTypes?: readonly string[];
}

type SettledEvent = SettledInput | SettledOutput;

function rebuildState(events: SettledEvent[], maxRetries: number): SettledState {
  let state: SettledState = { ...initialState(), maxRetries };
  for (const event of events) {
    state = evolve(state, event);
  }
  return state;
}

function processInput(input: SettledInput, history: SettledEvent[], maxRetries: number): SettledOutput[] {
  history.push(input);
  const state = rebuildState(history, maxRetries);
  const result = decide(input, state);
  const outputs = Array.isArray(result) ? result : [result];
  for (const output of outputs) {
    history.push(output);
  }
  return outputs;
}

export function createV2RuntimeBridge(options: V2RuntimeBridgeOptions) {
  const registrations = new Map<string, RegisteredSettled>();
  const commandToTemplateIds = new Map<string, Set<string>>();
  const eventBuffer = new Map<string, Event[]>();
  const settledCounts = new Map<string, number>();
  const keyedHistories = new Map<string, SettledEvent[]>();

  function bufferKey(templateId: string, correlationId: string, commandType: string): string {
    return `${templateId}-${correlationId}-${commandType}`;
  }

  function compositeKey(templateId: string, correlationId: string): string {
    return `${templateId}-${correlationId}`;
  }

  function isValidId(id: string | undefined): id is string {
    return id !== undefined && id !== null && id !== '';
  }

  function ensureBuffer(templateId: string, correlationId: string, commandType: string): Event[] {
    const key = bufferKey(templateId, correlationId, commandType);
    let events = eventBuffer.get(key);
    if (!events) {
      events = [];
      eventBuffer.set(key, events);
    }
    return events;
  }

  function collectBufferedEvents(
    templateId: string,
    correlationId: string,
    commandTypes: readonly string[],
  ): Record<string, Event[]> {
    const result: Record<string, Event[]> = {};
    for (const ct of commandTypes) {
      result[ct] = ensureBuffer(templateId, correlationId, ct);
    }
    return result;
  }

  function clearBuffer(templateId: string, correlationId: string, commandTypes: readonly string[]): void {
    for (const ct of commandTypes) {
      eventBuffer.delete(bufferKey(templateId, correlationId, ct));
    }
  }

  function getHistory(templateId: string, correlationId: string): SettledEvent[] {
    const key = compositeKey(templateId, correlationId);
    let history = keyedHistories.get(key);
    if (!history) {
      history = [];
      keyedHistories.set(key, history);
    }
    return history;
  }

  function resetHistory(templateId: string, correlationId: string): void {
    keyedHistories.delete(compositeKey(templateId, correlationId));
  }

  function handleOutputs(outputs: SettledOutput[], registration: RegisteredSettled, correlationId: string): void {
    debug(
      'handleOutputs: templateId=%s, correlationId=%s, outputs=%o',
      registration.templateId,
      correlationId,
      outputs.map((o) => o.type),
    );
    for (const output of outputs) {
      if (output.type === 'AllSettled' || output.type === 'SettledFailed') {
        debug('  %s triggered for %s', output.type, registration.templateId);
        const events = collectBufferedEvents(registration.templateId, correlationId, registration.commandTypes);
        debug(
          '  collected events: %o',
          Object.keys(events).map((k) => `${k}:${events[k].length}`),
        );

        const send = (commandType: string, data: unknown) => {
          debug('  dispatching %s with data keys: %o', commandType, Object.keys(data as object));
          options.onDispatch(commandType, data, correlationId);
        };

        const emit = (eventType: string, data: unknown, emitCorrelationId?: string) => {
          debug('  emitting %s', eventType);
          options.onEmit?.(eventType, data, emitCorrelationId ?? correlationId);
        };

        const handlerResult = registration.descriptor.handler(events, send, emit);
        debug('  handler returned: %o', handlerResult);
        const persist =
          handlerResult !== null &&
          handlerResult !== undefined &&
          typeof handlerResult === 'object' &&
          'persist' in handlerResult &&
          handlerResult.persist === true;

        const countKey = compositeKey(registration.templateId, correlationId);
        settledCounts.set(countKey, (settledCounts.get(countKey) ?? 0) + 1);

        if (persist) {
          resetHistory(registration.templateId, correlationId);
          clearBuffer(registration.templateId, correlationId, registration.commandTypes);
        }
      }

      if (output.type === 'RetryCommands') {
        debug('  RetryCommands: %o', output.data.commandTypes);
        for (const ct of output.data.commandTypes) {
          options.onDispatch(ct, {}, correlationId);
          eventBuffer.delete(bufferKey(registration.templateId, correlationId, ct));
        }
      }
    }
  }

  return {
    registerSettled(descriptor: SettledHandlerDescriptor, config?: { maxRetries?: number }): void {
      const commandTypes = descriptor.commandTypes;
      const templateId = descriptor.settledId
        ? `template-${descriptor.settledId}`
        : `template-${commandTypes.join(',')}`;

      const registration: RegisteredSettled = {
        templateId,
        descriptor,
        commandTypes,
        maxRetries: descriptor.maxRetries ?? config?.maxRetries ?? 3,
        sourceEventTypes: descriptor.sourceEventTypes,
      };

      debug(
        'registerSettled: templateId=%s, commandTypes=%o, sourceEventTypes=%o, label=%s',
        templateId,
        commandTypes,
        descriptor.sourceEventTypes,
        descriptor.label,
      );

      registrations.set(templateId, registration);

      for (const ct of commandTypes) {
        const existing = commandToTemplateIds.get(ct) ?? new Set<string>();
        existing.add(templateId);
        commandToTemplateIds.set(ct, existing);
      }
    },

    onCommandStarted(command: Command, sessionCorrelationId?: string, sourceEventType?: string): void {
      const { type: commandType, correlationId, requestId } = command;

      debug(
        'onCommandStarted: command=%s, sourceEventType=%s, sessionCorrelationId=%s',
        commandType,
        sourceEventType,
        sessionCorrelationId,
      );

      if (!isValidId(correlationId) || !isValidId(requestId)) {
        debug('  skipping: invalid correlationId or requestId');
        return;
      }

      const keyCorrelationId = sessionCorrelationId ?? correlationId;

      const templateIds = commandToTemplateIds.get(commandType);
      if (!templateIds) {
        debug('  skipping: no templateIds for command type');
        return;
      }

      debug('  found %d templateIds: %o', templateIds.size, [...templateIds]);

      for (const templateId of templateIds) {
        const registration = registrations.get(templateId);
        if (registration) {
          debug('  checking registration %s, sourceEventTypes=%o', templateId, registration.sourceEventTypes);
          if (
            sourceEventType &&
            registration.sourceEventTypes &&
            registration.sourceEventTypes.length > 0 &&
            !registration.sourceEventTypes.includes(sourceEventType)
          ) {
            debug('    filtered out: sourceEventType %s not in %o', sourceEventType, registration.sourceEventTypes);
            continue;
          }
          debug('    processing StartSettled for %s', templateId);
          const history = getHistory(templateId, keyCorrelationId);
          const input: SettledInput = {
            type: 'StartSettled',
            data: { correlationId: keyCorrelationId, commandTypes: [...registration.commandTypes] },
          };
          processInput(input, history, registration.maxRetries);
        }
      }
    },

    onEventReceived(
      event: Event,
      sourceCommandType: string,
      result: 'success' | 'failure' = 'success',
      sessionCorrelationId?: string,
      sourceEventType?: string,
    ): void {
      const correlationId = event.correlationId;

      debug(
        'onEventReceived: event=%s, sourceCommand=%s, result=%s, sourceEventType=%s',
        event.type,
        sourceCommandType,
        result,
        sourceEventType,
      );

      if (!isValidId(correlationId)) {
        debug('  skipping: invalid correlationId');
        return;
      }

      const keyCorrelationId = sessionCorrelationId ?? correlationId;

      const templateIds = commandToTemplateIds.get(sourceCommandType);
      if (!templateIds) {
        debug('  skipping: no templateIds for sourceCommand');
        return;
      }

      debug('  found %d templateIds: %o', templateIds.size, [...templateIds]);

      for (const templateId of templateIds) {
        const registration = registrations.get(templateId)!;
        debug('  checking registration %s, sourceEventTypes=%o', templateId, registration.sourceEventTypes);
        if (
          sourceEventType &&
          registration.sourceEventTypes &&
          registration.sourceEventTypes.length > 0 &&
          !registration.sourceEventTypes.includes(sourceEventType)
        ) {
          debug('    filtered out: sourceEventType %s not in %o', sourceEventType, registration.sourceEventTypes);
          continue;
        }
        const existing = ensureBuffer(templateId, keyCorrelationId, sourceCommandType);
        existing.push(event);

        const history = getHistory(templateId, keyCorrelationId);
        debug('    processing CommandCompleted for %s, history length=%d', templateId, history.length);
        const input: SettledInput = {
          type: 'CommandCompleted',
          data: {
            commandType: sourceCommandType,
            result,
            event: { ...event.data },
          },
        };
        const outputs = processInput(input, history, registration.maxRetries);

        debug(
          '    outputs: %o',
          outputs.map((o) => o.type),
        );
        handleOutputs(outputs, registration, keyCorrelationId);
      }
    },

    getSettledStats(correlationId: string, templateId: string): SettledStats {
      const registration = registrations.get(templateId);
      if (!registration) {
        return { status: 'idle', pendingCount: 0, endedCount: 0 };
      }

      const history = getHistory(templateId, correlationId);
      const state = rebuildState(history, registration.maxRetries);
      const countKey = compositeKey(templateId, correlationId);
      const endedCount = settledCounts.get(countKey) ?? 0;

      if (state.status === 'idle') {
        return { status: 'idle', pendingCount: 0, endedCount: 0 };
      }

      if (state.status === 'waiting') {
        return { status: 'running', pendingCount: 1, endedCount };
      }

      const hasFailure = Object.values(state.completions).some((c) => c.result === 'failure');
      if (hasFailure) {
        return { status: 'error', pendingCount: 0, endedCount };
      }
      return { status: 'success', pendingCount: 0, endedCount };
    },
  };
}
