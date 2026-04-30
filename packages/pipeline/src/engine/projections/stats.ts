import { evolve, type StatsDocument } from '../../projections/stats-projection';

export { evolve, type StatsDocument };

export const statsProjection = {
  name: 'stats',
  canHandle: ['CommandDispatched', 'DomainEventEmitted'] as const,
  evolve,
  getDocumentId: () => 'global',
};
