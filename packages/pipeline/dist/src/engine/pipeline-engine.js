import { createCommandDispatcher, dispatchAndStore } from './command-dispatcher.js';
import { createEventRouter } from './event-router.js';
import { createPipelineStore } from './sqlite-store.js';
import { createWorkflowProcessor } from './workflow-processor.js';
export async function createPipelineEngine() {
    const store = await createPipelineStore();
    const dispatcher = createCommandDispatcher();
    const router = createEventRouter(dispatcher);
    const workflows = createWorkflowProcessor();
    const eventListeners = [];
    let streamCounter = 0;
    async function processEvents(events) {
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
        registerCommandHandler(commandType, handler) {
            dispatcher.register(commandType, handler);
        },
        registerEmitMapping(mapping) {
            router.register(mapping);
        },
        registerWorkflow(registration) {
            workflows.register(registration);
        },
        registeredCommands() {
            return dispatcher.registeredTypes();
        },
        onEvent(listener) {
            eventListeners.push(listener);
        },
        processWorkflowEvent(event) {
            return workflows.process(event);
        },
        async dispatch(command) {
            streamCounter++;
            const streamName = `pipeline-${streamCounter}`;
            const results = await dispatchAndStore(dispatcher, store.eventStore, streamName, command);
            await processEvents(results);
        },
        async close() {
            await store.close();
        },
    };
}
//# sourceMappingURL=pipeline-engine.js.map