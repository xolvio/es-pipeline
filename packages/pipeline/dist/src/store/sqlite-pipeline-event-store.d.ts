import { type InMemoryDatabase } from '@event-driven-io/emmett';
import { type SQLiteEventStore } from '@event-driven-io/emmett-sqlite';
import { PipelineReadModel } from './pipeline-read-model';
export interface SQLitePipelineEventStoreContext {
    eventStore: SQLiteEventStore;
    database: InMemoryDatabase;
    readModel: PipelineReadModel;
    close: () => Promise<void>;
}
export interface SQLitePipelineEventStoreConfig {
    fileName: string;
}
export declare function createSQLitePipelineEventStore(config: SQLitePipelineEventStoreConfig): Promise<SQLitePipelineEventStoreContext>;
//# sourceMappingURL=sqlite-pipeline-event-store.d.ts.map