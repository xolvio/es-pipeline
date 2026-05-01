import { evolve, type NodeStatusChangedEvent, type NodeStatusDocument } from '../../projections/node-status-projection';
export { evolve, type NodeStatusChangedEvent, type NodeStatusDocument };
export declare const nodeStatusProjection: {
    name: string;
    canHandle: readonly ["NodeStatusChanged"];
    evolve: typeof evolve;
    getDocumentId: (event: NodeStatusChangedEvent) => string;
};
//# sourceMappingURL=node-status.d.ts.map