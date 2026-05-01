import type { Event } from '@xolvio/message-bus';
import type { EventHandlerDescriptor, PipelineDescriptor } from '../core/descriptors';
import type { PipelineContext } from './context';
export declare class PipelineRuntime {
    readonly descriptor: PipelineDescriptor;
    private readonly handlerIndex;
    constructor(descriptor: PipelineDescriptor);
    getHandlersForEvent(eventType: string): EventHandlerDescriptor[];
    getMatchingHandlers(event: Event): EventHandlerDescriptor[];
    handleEvent(event: Event, ctx: PipelineContext): Promise<void>;
    private executeEmitHandler;
    private executeCustomHandler;
    private executeRunAwaitHandler;
    private executeForEachPhasedHandler;
    private buildHandlerIndex;
}
//# sourceMappingURL=pipeline-runtime.d.ts.map