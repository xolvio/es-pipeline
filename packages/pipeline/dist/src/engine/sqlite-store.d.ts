import { type SQLiteEventStore } from '@event-driven-io/emmett-sqlite';
export interface PipelineStore {
    eventStore: SQLiteEventStore;
    fileName: string;
    close: () => Promise<void>;
}
export declare function createPipelineStore(options?: {
    fileName?: string;
}): Promise<PipelineStore>;
//# sourceMappingURL=sqlite-store.d.ts.map