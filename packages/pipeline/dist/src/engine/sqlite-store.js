import { getSQLiteEventStore } from '@event-driven-io/emmett-sqlite';
import { sqlite3EventStoreDriver } from '@event-driven-io/emmett-sqlite/sqlite3';
export async function createPipelineStore(options) {
    const fileName = options?.fileName ?? 'file::memory:?cache=shared';
    const eventStore = getSQLiteEventStore({
        driver: sqlite3EventStoreDriver,
        fileName,
        schema: { autoMigration: 'CreateOrUpdate' },
    });
    return {
        eventStore,
        fileName,
        close: async () => { },
    };
}
//# sourceMappingURL=sqlite-store.js.map