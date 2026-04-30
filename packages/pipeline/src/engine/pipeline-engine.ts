import { createCommandDispatcher, dispatchAndStore } from './command-dispatcher.js';
import { createEventRouter } from './event-router.js';
import { createPipelineStore } from './sqlite-store.js';
import type { WorkflowRegistration } from './workflow-processor.js';
import { createWorkflowProcessor } from './workflow-processor.js';

type Event = { type: string; data: Record<string, unknown> };

type CommandHandler = (command: {
  type: string;
  data: Record<string, unknown>;
}) =>
  | Array<{ type: string; data: Record<string, unknown> }>
  | Promise<Array<{ type: string; data: Record<string, unknown> }>>;

type EmitMapping = {
  eventType: string;
  commands: Array<{
    commandType: string;
    data: Record<string, unknown> | ((event: Event) => Record<string, unknown>);
  }>;
};

export async function createPipelineEngine() {
  const store = await createPipelineStore();
  const dispatcher = createCommandDispatcher();
  const router = createEventRouter(dispatcher);
  const workflows = createWorkflowProcessor();
  const eventListeners: Array<(event: Event) => void> = [];
  let streamCounter = 0;

  async function processEvents(events: Event[]): Promise<void> {
    for (const event of events) {
      for (const listener of eventListeners) {
        listener(event);
      }

      const routedEvents = await router.route(event);
      const workflowOutputs = workflows.process(event);

      await processEvents(routedEvents);
      await processEvents(workflowOutputs);
    }
  }

  return {
    registerCommandHandler(commandType: string, handler: CommandHandler): void {
      dispatcher.register(commandType, handler);
    },

    registerEmitMapping(mapping: EmitMapping): void {
      router.register(mapping);
    },

    registerWorkflow(registration: WorkflowRegistration): void {
      workflows.register(registration);
    },

    registeredCommands(): string[] {
      return dispatcher.registeredTypes();
    },

    onEvent(listener: (event: Event) => void): void {
      eventListeners.push(listener);
    },

    processWorkflowEvent(event: Event): Event[] {
      return workflows.process(event);
    },

    async dispatch(command: { type: string; data: Record<string, unknown> }): Promise<void> {
      streamCounter++;
      const streamName = `pipeline-${streamCounter}`;
      const results = await dispatchAndStore(dispatcher, store.eventStore, streamName, command);
      await processEvents(results);
    },

    async close(): Promise<void> {
      await store.close();
    },
  };
}
