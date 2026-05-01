import type { Event } from '@xolvio/message-bus';
import type { ForEachPhasedDescriptor } from '../core/descriptors.js';
interface PhasedBridgeConfig {
    onDispatch: (commandType: string, data: unknown, correlationId: string) => void;
    onPhasedComplete: (event: Event, correlationId: string) => void;
}
export declare function createPhasedBridge(config: PhasedBridgeConfig): {
    registerPhased(descriptor: ForEachPhasedDescriptor): void;
    startPhased(handler: ForEachPhasedDescriptor, event: Event, correlationId: string): void;
    onPhasedItemEvent(event: Event, itemKey: string): void;
};
export {};
//# sourceMappingURL=phased-bridge.d.ts.map