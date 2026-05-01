import type { Command, CommandHandler, Event, EventDefinition } from './types';
type CommandData<C> = C extends Command<string, infer D> ? D : never;
type CommandType<C> = C extends Command<infer T, Record<string, unknown>> ? T : never;
export interface FieldDefinition<T> {
    description: string;
    required?: T extends undefined ? false : true;
    flag?: boolean;
}
export interface PackageMetadata {
    name: string;
    version?: string;
    description?: string;
}
export interface UnifiedCommandHandler<C extends Command<string, Record<string, unknown>>> extends CommandHandler {
    alias: string;
    description: string;
    displayName?: string;
    category?: string;
    icon?: string;
    package?: PackageMetadata;
    fields: {
        [K in keyof CommandData<C>]: FieldDefinition<CommandData<C>[K]>;
    };
    examples: string[];
    events?: EventDefinition[];
    handle: (command: Command) => Promise<Event | Event[]>;
}
/**
 * Define a command handler with full type safety and metadata
 * @param config The command handler configuration
 * @returns A command handler with manifest metadata
 */
export declare function defineCommandHandler<C extends Command<string, Record<string, unknown>>, H extends (command: C) => Promise<Event<string, Record<string, unknown>> | Event<string, Record<string, unknown>>[]>>(config: {
    name: CommandType<C>;
    alias: string;
    description: string;
    displayName?: string;
    category?: string;
    icon?: string;
    package?: PackageMetadata;
    fields: {
        [K in keyof CommandData<C>]: FieldDefinition<CommandData<C>[K]>;
    };
    examples: string[];
    handle: H;
    events: EventDefinition[];
}): UnifiedCommandHandler<C>;
/**
 * Define a command handler with manual event specification (without generics)
 * @param config The command handler configuration
 * @returns A command handler with manifest metadata
 */
export declare function defineCommandHandler(config: {
    name: string;
    alias: string;
    description: string;
    displayName?: string;
    category?: string;
    icon?: string;
    package?: PackageMetadata;
    fields: Record<string, FieldDefinition<unknown>>;
    examples: string[];
    handle: (command: Command) => Promise<Event | Event[]>;
    events: EventDefinition[];
}): CommandHandler;
export {};
//# sourceMappingURL=define-command.d.ts.map