import { evolve, type MessageLogDocument, type MessageLogEvent } from '../../projections/message-log-projection';
export { evolve, type MessageLogDocument, type MessageLogEvent };
export declare const messageLogProjection: {
    name: string;
    canHandle: readonly ["CommandDispatched", "DomainEventEmitted", "PipelineRunStarted", "NodeStatusChanged"];
    evolve: typeof evolve;
    getDocumentId: () => string;
};
//# sourceMappingURL=message-log.d.ts.map