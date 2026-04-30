import { evolve, type LatestRunDocument } from '../../projections/latest-run-projection';

export { evolve, type LatestRunDocument };

export const latestRunProjection = {
  name: 'latest-run',
  canHandle: ['PipelineRunStarted'] as const,
  evolve,
  getDocumentId: () => 'latest',
};
