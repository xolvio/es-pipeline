import { evolve } from '../../projections/node-status-projection.js';
export { evolve };
export const nodeStatusProjection = {
    name: 'node-status',
    canHandle: ['NodeStatusChanged'],
    evolve,
    getDocumentId: (event) => `${event.data.correlationId}-${event.data.commandName}`,
};
//# sourceMappingURL=node-status.js.map