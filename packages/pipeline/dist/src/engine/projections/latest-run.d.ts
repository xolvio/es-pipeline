import { evolve, type LatestRunDocument } from '../../projections/latest-run-projection';
export { evolve, type LatestRunDocument };
export declare const latestRunProjection: {
    name: string;
    canHandle: readonly ["PipelineRunStarted"];
    evolve: typeof evolve;
    getDocumentId: () => string;
};
//# sourceMappingURL=latest-run.d.ts.map