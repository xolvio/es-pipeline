import { evolve } from '../../projections/item-status-projection.js';
export { evolve };
export const itemStatusProjection = {
    name: 'item-status',
    canHandle: ['ItemStatusChanged'],
    evolve,
    getDocumentId: (event) => `${event.data.correlationId}-${event.data.commandType}-${event.data.itemKey}`,
};
//# sourceMappingURL=item-status.js.map