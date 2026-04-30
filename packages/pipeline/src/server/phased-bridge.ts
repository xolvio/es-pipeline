import type { Event } from '@xolvio/message-bus';
import type { ForEachPhasedDescriptor } from '../core/descriptors.js';
import type { CommandDispatch } from '../core/types.js';
import type { PhasedInput, PhasedOutput, PhasedState } from '../engine/workflows/phased-workflow.js';
import { decide, evolve, initialState } from '../engine/workflows/phased-workflow.js';

interface PhasedBridgeConfig {
  onDispatch: (commandType: string, data: unknown, correlationId: string) => void;
  onPhasedComplete: (event: Event, correlationId: string) => void;
}

interface PhasedExecution {
  correlationId: string;
  handler: ForEachPhasedDescriptor;
  triggerEvent: Event;
  items: Array<{ key: string; phase: string; original: unknown }>;
  state: PhasedState;
}

function resolveData(dispatch: CommandDispatch, event: Event): Record<string, unknown> {
  if (typeof dispatch.data === 'function') {
    return dispatch.data(event);
  }
  return dispatch.data;
}

function processInput(execution: PhasedExecution, input: PhasedInput): PhasedOutput[] {
  let state = evolve(execution.state, input);
  const result = decide(input, state);
  const outputs = Array.isArray(result) ? result : [result];
  for (const output of outputs) {
    state = evolve(state, output);
  }
  execution.state = state;
  return outputs;
}

export function createPhasedBridge(config: PhasedBridgeConfig) {
  const descriptors = new Map<string, ForEachPhasedDescriptor>();
  const executions = new Map<string, PhasedExecution>();
  const itemToExecution = new Map<string, string>();

  function handleOutputs(outputs: PhasedOutput[], execution: PhasedExecution): void {
    for (const output of outputs) {
      if (output.type === 'DispatchItem') {
        const itemKey = output.data.itemKey;
        const phase = output.data.phase;
        const itemRecord = execution.items.find((i) => i.key === itemKey);
        if (itemRecord) {
          const command = execution.handler.emitFactory(itemRecord.original, phase, execution.triggerEvent);
          const data = resolveData(command, execution.triggerEvent);
          config.onDispatch(command.commandType, data, execution.correlationId);
        }
      } else if (output.type === 'PhasedCompleted') {
        const completionEvent: Event = {
          type: execution.handler.completion.successEvent.name,
          correlationId: execution.correlationId,
          data: { results: output.data.completedItems, itemCount: execution.items.length },
        };
        config.onPhasedComplete(completionEvent, execution.correlationId);
      } else if (output.type === 'PhasedFailed') {
        const failureEvent: Event = {
          type: execution.handler.completion.failureEvent.name,
          correlationId: execution.correlationId,
          data: { failures: output.data.failedItems, completedItems: output.data.completedItems },
        };
        config.onPhasedComplete(failureEvent, execution.correlationId);
      }
    }
  }

  return {
    registerPhased(descriptor: ForEachPhasedDescriptor): void {
      const handlerId = `phased-handler-${descriptor.eventType}`;
      descriptors.set(handlerId, descriptor);
    },

    startPhased(handler: ForEachPhasedDescriptor, event: Event, correlationId: string): void {
      const items = handler.itemsSelector(event);
      const itemRecords: PhasedExecution['items'] = [];

      for (const item of items) {
        const data: Record<string, unknown> = Object(item);
        const key = handler.completion.itemKey({ type: event.type, data });
        const phase = handler.classifier(item);
        itemRecords.push({ key, phase, original: item });
        itemToExecution.set(key, `${correlationId}|${handler.eventType}`);
      }

      const execution: PhasedExecution = {
        correlationId,
        handler,
        triggerEvent: event,
        items: itemRecords,
        state: initialState(),
      };
      executions.set(`${correlationId}|${handler.eventType}`, execution);

      const startInput: PhasedInput = {
        type: 'StartPhased',
        data: {
          correlationId,
          items: itemRecords.map((i) => ({ key: i.key, phase: i.phase })),
          phases: [...handler.phases],
          stopOnFailure: handler.stopOnFailure,
        },
      };

      const outputs = processInput(execution, startInput);
      handleOutputs(outputs, execution);
    },

    onPhasedItemEvent(event: Event, itemKey: string): void {
      const executionKey = itemToExecution.get(itemKey);
      if (!executionKey) return;

      const execution = executions.get(executionKey);
      if (!execution) return;

      const isFailure = event.type === execution.handler.completion.failureEvent.name;

      const input: PhasedInput = isFailure
        ? { type: 'ItemFailed', data: { itemKey, error: event.data } }
        : { type: 'ItemCompleted', data: { itemKey, result: event.data } };

      const outputs = processInput(execution, input);
      handleOutputs(outputs, execution);
    },
  };
}
