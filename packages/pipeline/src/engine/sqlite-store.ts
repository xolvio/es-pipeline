import { getSQLiteEventStore, type SQLiteEventStore } from '@event-driven-io/emmett-sqlite';
import { sqlite3EventStoreDriver } from '@event-driven-io/emmett-sqlite/sqlite3';

export interface PipelineStore {
  eventStore: SQLiteEventStore;
  fileName: string;
  close: () => Promise<void>;
}

export async function createPipelineStore(options?: { fileName?: string }): Promise<PipelineStore> {
  const fileName = options?.fileName ?? 'file::memory:?cache=shared';
  const eventStore = getSQLiteEventStore({
    driver: sqlite3EventStoreDriver,
    fileName,
    schema: { autoMigration: 'CreateOrUpdate' },
  });

  return {
    eventStore,
    fileName,
    close: async () => {},
  };
}
