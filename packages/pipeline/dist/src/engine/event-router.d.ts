import type { createCommandDispatcher } from './command-dispatcher.js';
type Event = {
    type: string;
    data: Record<string, unknown>;
};
type EmitMapping = {
    eventType: string;
    commands: Array<{
        commandType: string;
        data: Record<string, unknown> | ((event: Event) => Record<string, unknown>);
    }>;
};
export declare function createEventRouter(dispatcher: ReturnType<typeof createCommandDispatcher>): {
    register(mapping: EmitMapping): void;
    route(event: Event): Promise<Array<{
        type: string;
        data: Record<string, unknown>;
    }>>;
};
export {};
//# sourceMappingURL=event-router.d.ts.map