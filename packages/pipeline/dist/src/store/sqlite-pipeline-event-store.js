import { getInMemoryDatabase } from '@event-driven-io/emmett';
import { getSQLiteEventStore } from '@event-driven-io/emmett-sqlite';
import { sqlite3EventStoreDriver } from '@event-driven-io/emmett-sqlite/sqlite3';
import { PipelineReadModel } from './pipeline-read-model.js';
export async function createSQLitePipelineEventStore(config) {
    const database = getInMemoryDatabase();
    const eventStore = getSQLiteEventStore({
        driver: sqlite3EventStoreDriver,
        fileName: config.fileName,
        schema: { autoMigration: 'CreateOrUpdate' },
    });
    const readModel = new PipelineReadModel(database);
    return {
        eventStore,
        database,
        readModel,
        close: async () => {
            // Minimal implementation for Burst 88
        },
    };
}
//# sourceMappingURL=sqlite-pipeline-event-store.js.map