import { evolve, type NodeStatusChangedEvent, type NodeStatusDocument } from '../../projections/node-status-projection';

export { evolve, type NodeStatusChangedEvent, type NodeStatusDocument };

export const nodeStatusProjection = {
  name: 'node-status',
  canHandle: ['NodeStatusChanged'] as const,
  evolve,
  getDocumentId: (event: NodeStatusChangedEvent) => `${event.data.correlationId}-${event.data.commandName}`,
};
