import type { AwaitEvent } from '../projections/await-tracker-projection';
import type { PipelineReadModel } from '../store/pipeline-read-model';
interface AwaitTrackerOptions {
    readModel: PipelineReadModel;
    onEventEmit: (event: AwaitEvent) => void | Promise<void>;
}
export declare class AwaitTracker {
    private readonly readModel;
    private readonly onEventEmit;
    constructor(options: AwaitTrackerOptions);
    startAwaiting(correlationId: string, keys: string[]): Promise<void>;
    isPending(correlationId: string): Promise<boolean>;
    getPendingKeys(correlationId: string): Promise<string[]>;
    markComplete(correlationId: string, key: string, result: unknown): Promise<void>;
    isComplete(correlationId: string): Promise<boolean>;
    getResults(correlationId: string): Promise<Record<string, unknown>>;
    private emitEvent;
}
export {};
//# sourceMappingURL=await-tracker.d.ts.map