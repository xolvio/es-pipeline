import type { SQLiteEventStore } from '@event-driven-io/emmett-sqlite';

type CommandHandler = (command: {
  type: string;
  data: Record<string, unknown>;
}) =>
  | Array<{ type: string; data: Record<string, unknown> }>
  | Promise<Array<{ type: string; data: Record<string, unknown> }>>;

export function createCommandDispatcher() {
  const handlers = new Map<string, CommandHandler>();

  return {
    register(commandType: string, handler: CommandHandler): void {
      handlers.set(commandType, handler);
    },

    registeredTypes(): string[] {
      return [...handlers.keys()];
    },

    async dispatch(command: {
      type: string;
      data: Record<string, unknown>;
    }): Promise<Array<{ type: string; data: Record<string, unknown> }>> {
      const handler = handlers.get(command.type);
      if (!handler) {
        throw new Error(`No handler registered for command type: ${command.type}`);
      }
      return handler(command);
    },
  };
}

export async function dispatchAndStore(
  dispatcher: ReturnType<typeof createCommandDispatcher>,
  eventStore: SQLiteEventStore,
  streamName: string,
  command: { type: string; data: Record<string, unknown> },
): Promise<Array<{ type: string; data: Record<string, unknown> }>> {
  const results = await dispatcher.dispatch(command);
  if (results.length > 0) {
    await eventStore.appendToStream(streamName, results);
  }
  return results;
}
