import { type InMemoryDatabase, type InMemoryEventStore } from '@event-driven-io/emmett';
import { PipelineReadModel } from './pipeline-read-model';
export interface PipelineEventStoreContext {
    eventStore: InMemoryEventStore;
    database: InMemoryDatabase;
    readModel: PipelineReadModel;
    close: () => Promise<void>;
}
export declare function createPipelineEventStore(): PipelineEventStoreContext;
//# sourceMappingURL=pipeline-event-store.d.ts.map