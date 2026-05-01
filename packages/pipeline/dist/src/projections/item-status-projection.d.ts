export interface ItemStatusDocument {
    [key: string]: unknown;
    correlationId: string;
    commandType: string;
    itemKey: string;
    currentRequestId: string;
    status: 'running' | 'success' | 'error';
    attemptCount: number;
    startedAt?: string;
    endedAt?: string;
    batchId?: string;
}
export interface ItemStatusChangedEvent {
    type: 'ItemStatusChanged';
    data: {
        correlationId: string;
        commandType: string;
        itemKey: string;
        requestId: string;
        status: 'running' | 'success' | 'error';
        attemptCount: number;
        timestamp?: string;
        batchId?: string;
    };
}
export declare function evolve(document: ItemStatusDocument | null, event: ItemStatusChangedEvent): ItemStatusDocument;
//# sourceMappingURL=item-status-projection.d.ts.map