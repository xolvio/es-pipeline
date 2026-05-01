export interface AwaitTrackerDocument {
    [key: string]: unknown;
    correlationId: string;
    pendingKeys: string[];
    results: Record<string, unknown>;
    status: 'pending' | 'completed';
}
export interface AwaitStartedEvent {
    type: 'AwaitStarted';
    data: {
        correlationId: string;
        keys: string[];
    };
}
export interface AwaitItemCompletedEvent {
    type: 'AwaitItemCompleted';
    data: {
        correlationId: string;
        key: string;
        result: unknown;
    };
}
export interface AwaitCompletedEvent {
    type: 'AwaitCompleted';
    data: {
        correlationId: string;
    };
}
export type AwaitEvent = AwaitStartedEvent | AwaitItemCompletedEvent | AwaitCompletedEvent;
export declare function evolve(document: AwaitTrackerDocument | null, event: AwaitEvent): AwaitTrackerDocument;
//# sourceMappingURL=await-tracker-projection.d.ts.map