import type { createCommandDispatcher } from './command-dispatcher.js';

type Event = { type: string; data: Record<string, unknown> };

type EmitMapping = {
  eventType: string;
  commands: Array<{
    commandType: string;
    data: Record<string, unknown> | ((event: Event) => Record<string, unknown>);
  }>;
};

export function createEventRouter(dispatcher: ReturnType<typeof createCommandDispatcher>) {
  const mappings = new Map<string, EmitMapping['commands']>();

  return {
    register(mapping: EmitMapping): void {
      const existing = mappings.get(mapping.eventType) ?? [];
      mappings.set(mapping.eventType, [...existing, ...mapping.commands]);
    },

    async route(event: Event): Promise<Array<{ type: string; data: Record<string, unknown> }>> {
      const commands = mappings.get(event.type);
      if (!commands) {
        return [];
      }

      const commandPromises = commands.map((command) => {
        const data = typeof command.data === 'function' ? command.data(event) : command.data;
        return dispatcher.dispatch({ type: command.commandType, data });
      });
      const resultArrays = await Promise.all(commandPromises);
      return resultArrays.flat();
    },
  };
}
