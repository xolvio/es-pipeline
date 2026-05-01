import type { CommandHandler, EventDefinition } from '@xolvio/message-bus';
export type { EventDefinition };
interface CommandHandlerWithEvents extends CommandHandler {
    events?: readonly EventDefinition[];
}
export declare class EventCommandMapper {
    private eventToCommand;
    private commandToEvents;
    constructor(handlers: CommandHandlerWithEvents[]);
    addHandler(handler: CommandHandlerWithEvents): void;
    getSourceCommand(eventType: string): string | undefined;
    getEventsForCommand(commandType: string): string[];
    isEventFromCommand(eventType: string, commandType: string): boolean;
}
//# sourceMappingURL=event-command-map.d.ts.map