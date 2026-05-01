import type { SQLiteEventStore } from '@event-driven-io/emmett-sqlite';
type CommandHandler = (command: {
    type: string;
    data: Record<string, unknown>;
}) => Array<{
    type: string;
    data: Record<string, unknown>;
}> | Promise<Array<{
    type: string;
    data: Record<string, unknown>;
}>>;
export declare function createCommandDispatcher(): {
    register(commandType: string, handler: CommandHandler): void;
    registeredTypes(): string[];
    dispatch(command: {
        type: string;
        data: Record<string, unknown>;
    }): Promise<Array<{
        type: string;
        data: Record<string, unknown>;
    }>>;
};
export declare function dispatchAndStore(dispatcher: ReturnType<typeof createCommandDispatcher>, eventStore: SQLiteEventStore, streamName: string, command: {
    type: string;
    data: Record<string, unknown>;
}): Promise<Array<{
    type: string;
    data: Record<string, unknown>;
}>>;
export {};
//# sourceMappingURL=command-dispatcher.d.ts.map