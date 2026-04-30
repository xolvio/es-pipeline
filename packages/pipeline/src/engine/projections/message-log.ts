import { nanoid } from 'nanoid';
import { evolve, type MessageLogDocument, type MessageLogEvent } from '../../projections/message-log-projection';

export { evolve, type MessageLogDocument, type MessageLogEvent };

export const messageLogProjection = {
  name: 'message-log',
  canHandle: ['CommandDispatched', 'DomainEventEmitted', 'PipelineRunStarted', 'NodeStatusChanged'] as const,
  evolve,
  getDocumentId: () => nanoid(),
};
