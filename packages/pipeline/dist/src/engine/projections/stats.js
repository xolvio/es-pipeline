import { evolve } from '../../projections/stats-projection.js';
export { evolve };
export const statsProjection = {
    name: 'stats',
    canHandle: ['CommandDispatched', 'DomainEventEmitted'],
    evolve,
    getDocumentId: () => 'global',
};
//# sourceMappingURL=stats.js.map