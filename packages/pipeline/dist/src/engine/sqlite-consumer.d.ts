import type { PipelineStore } from './sqlite-store.js';
type EventHandler = (event: {
    type: string;
    data: Record<string, unknown>;
}) => void;
export declare function createConsumer(store: PipelineStore): {
    on(eventType: string, handler: EventHandler): void;
    poll(): Promise<void>;
};
export {};
//# sourceMappingURL=sqlite-consumer.d.ts.map