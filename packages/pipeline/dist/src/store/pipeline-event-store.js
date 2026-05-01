import { getInMemoryDatabase, getInMemoryEventStore, inlineProjections, inMemorySingleStreamProjection, } from '@event-driven-io/emmett';
import { nanoid } from 'nanoid';
import { evolve as evolveAwaitTracker } from '../projections/await-tracker-projection.js';
import { evolve as evolveItemStatus } from '../projections/item-status-projection.js';
import { evolve as evolveLatestRun } from '../projections/latest-run-projection.js';
import { evolve as evolveMessageLog } from '../projections/message-log-projection.js';
import { evolve as evolveNodeStatus } from '../projections/node-status-projection.js';
import { evolve as evolveStats } from '../projections/stats-projection.js';
import { PipelineReadModel } from './pipeline-read-model.js';
function createProjections() {
    const itemStatusProjection = inMemorySingleStreamProjection({
        collectionName: 'ItemStatus',
        canHandle: ['ItemStatusChanged'],
        getDocumentId: (event) => `${event.data.correlationId}-${event.data.commandType}-${event.data.itemKey}`,
        evolve: (document, event) => evolveItemStatus(document, event),
    });
    const nodeStatusProjection = inMemorySingleStreamProjection({
        collectionName: 'NodeStatus',
        canHandle: ['NodeStatusChanged'],
        getDocumentId: (event) => `${event.data.correlationId}-${event.data.commandName}`,
        evolve: (document, event) => evolveNodeStatus(document, event),
    });
    const latestRunProjection = inMemorySingleStreamProjection({
        collectionName: 'LatestRun',
        canHandle: ['PipelineRunStarted'],
        getDocumentId: () => 'singleton',
        evolve: (document, event) => evolveLatestRun(document, event),
    });
    const messageLogProjection = inMemorySingleStreamProjection({
        collectionName: 'MessageLog',
        canHandle: ['CommandDispatched', 'DomainEventEmitted', 'PipelineRunStarted', 'NodeStatusChanged'],
        getDocumentId: (event) => {
            if (event.type === 'PipelineRunStarted') {
                return `prs-${event.data.correlationId}`;
            }
            if (event.type === 'NodeStatusChanged') {
                return `nsc-${nanoid()}`;
            }
            if (event.type === 'DomainEventEmitted') {
                return `dee-${event.data.requestId}-${event.data.eventType}`;
            }
            return `cmd-${event.data.requestId}`;
        },
        evolve: (document, event) => evolveMessageLog(document, event),
    });
    const statsProjection = inMemorySingleStreamProjection({
        collectionName: 'Stats',
        canHandle: ['CommandDispatched', 'DomainEventEmitted'],
        getDocumentId: () => 'global',
        evolve: (document, event) => evolveStats(document, event),
    });
    const awaitTrackerProjection = inMemorySingleStreamProjection({
        collectionName: 'AwaitTracker',
        canHandle: ['AwaitStarted', 'AwaitItemCompleted', 'AwaitCompleted'],
        getDocumentId: (event) => event.data.correlationId,
        evolve: (document, event) => evolveAwaitTracker(document, event),
    });
    return inlineProjections([
        itemStatusProjection,
        nodeStatusProjection,
        latestRunProjection,
        messageLogProjection,
        statsProjection,
        awaitTrackerProjection,
    ]);
}
export function createPipelineEventStore() {
    const database = getInMemoryDatabase();
    const eventStore = getInMemoryEventStore({
        database,
        projections: createProjections(),
    });
    const readModel = new PipelineReadModel(database);
    return {
        eventStore,
        database,
        readModel,
        close: async () => {
            // No-op for in-memory store
        },
    };
}
//# sourceMappingURL=pipeline-event-store.js.map