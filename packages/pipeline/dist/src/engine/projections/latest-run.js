import { evolve } from '../../projections/latest-run-projection.js';
export { evolve };
export const latestRunProjection = {
    name: 'latest-run',
    canHandle: ['PipelineRunStarted'],
    evolve,
    getDocumentId: () => 'latest',
};
//# sourceMappingURL=latest-run.js.map