import type { Command, Event } from '@xolvio/message-bus';
import type { SettledHandlerDescriptor } from '../core/descriptors.js';
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
export declare function createV2RuntimeBridge(options: V2RuntimeBridgeOptions): {
    registerSettled(descriptor: SettledHandlerDescriptor, config?: {
        maxRetries?: number;
    }): void;
    onCommandStarted(command: Command, sessionCorrelationId?: string, sourceEventType?: string): void;
    onEventReceived(event: Event, sourceCommandType: string, result?: "success" | "failure", sessionCorrelationId?: string, sourceEventType?: string): void;
    getSettledStats(correlationId: string, templateId: string): SettledStats;
};
export {};
//# sourceMappingURL=v2-runtime-bridge.d.ts.map