import type { Event, MessageBus } from '@xolvio/message-bus';
import type { InMemoryEventStore } from '@event-driven-io/emmett';
import type { ForEachPhasedDescriptor } from '../core/descriptors';
export interface PipelineContext {
    emit: (type: string, data: unknown) => Promise<void>;
    sendCommand: (type: string, data: unknown, correlationId?: string) => Promise<void>;
    correlationId: string;
    signal?: AbortSignal;
    startPhased?: (handler: ForEachPhasedDescriptor, event: Event) => Promise<void>;
    eventStore?: InMemoryEventStore;
    messageBus?: MessageBus;
    clearMessages?: () => Promise<void>;
}
export interface RuntimeConfig {
    defaultTimeout?: number;
}
//# sourceMappingURL=context.d.ts.map