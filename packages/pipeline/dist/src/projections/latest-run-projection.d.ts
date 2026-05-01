export interface LatestRunDocument {
    [key: string]: unknown;
    latestCorrelationId: string;
    triggerCommand: string;
}
interface PipelineRunStartedEvent {
    type: 'PipelineRunStarted';
    data: {
        correlationId: string;
        triggerCommand: string;
    };
}
export declare function evolve(_document: LatestRunDocument | null, event: PipelineRunStartedEvent): LatestRunDocument;
export {};
//# sourceMappingURL=latest-run-projection.d.ts.map