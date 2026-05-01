import { nanoid } from 'nanoid';
import { evolve } from '../../projections/message-log-projection.js';
export { evolve };
export const messageLogProjection = {
    name: 'message-log',
    canHandle: ['CommandDispatched', 'DomainEventEmitted', 'PipelineRunStarted', 'NodeStatusChanged'],
    evolve,
    getDocumentId: () => nanoid(),
};
//# sourceMappingURL=message-log.js.map