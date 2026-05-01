import { evolve, type StatsDocument } from '../../projections/stats-projection';
export { evolve, type StatsDocument };
export declare const statsProjection: {
    name: string;
    canHandle: readonly ["CommandDispatched", "DomainEventEmitted"];
    evolve: typeof evolve;
    getDocumentId: () => string;
};
//# sourceMappingURL=stats.d.ts.map