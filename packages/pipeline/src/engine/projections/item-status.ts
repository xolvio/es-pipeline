import { evolve, type ItemStatusChangedEvent, type ItemStatusDocument } from '../../projections/item-status-projection';

export { evolve, type ItemStatusChangedEvent, type ItemStatusDocument };

export const itemStatusProjection = {
  name: 'item-status',
  canHandle: ['ItemStatusChanged'] as const,
  evolve,
  getDocumentId: (event: ItemStatusChangedEvent) =>
    `${event.data.correlationId}-${event.data.commandType}-${event.data.itemKey}`,
};
