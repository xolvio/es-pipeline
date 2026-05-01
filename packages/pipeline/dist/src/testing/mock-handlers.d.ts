import type { Command, Event } from '@xolvio/message-bus';
import type { CommandHandlerWithMetadata } from '../server/pipeline-server';
type MockHandlerFn = (cmd: Command, attempt: number) => Event | Event[];
interface MockHandlerConfig {
    name: string;
    events: string[];
    fn: MockHandlerFn;
}
export declare function createMockHandlers(configs: MockHandlerConfig[]): CommandHandlerWithMetadata[];
export declare function getHandlerCallCount(handlerName: string): number;
export declare function resetCallCounts(): void;
interface StatefulHandlerConfig {
    name: string;
    events: string[];
    initialFails: number;
    failEvent: (cmd: Command) => Event;
    successEvent: (cmd: Command) => Event;
}
export declare function createStatefulHandler(config: StatefulHandlerConfig): CommandHandlerWithMetadata;
export {};
//# sourceMappingURL=mock-handlers.d.ts.map