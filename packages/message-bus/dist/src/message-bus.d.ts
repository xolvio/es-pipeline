import type { Command, CommandHandler, Event, EventHandler, EventSubscription } from './types';
type CorrelationListener = (event: Event) => void;
export declare function createMessageBus(): {
    registerCommandHandler: <TCommand extends Command>(commandHandler: CommandHandler<TCommand>) => void;
    registerEventHandler: <TEvent extends Event>(eventHandler: EventHandler<TEvent>) => EventSubscription;
    sendCommand: <TCommand extends Command>(command: TCommand) => Promise<void>;
    publishEvent: <TEvent extends Event>(event: TEvent) => Promise<void>;
    subscribeToEvent: <TEvent extends Event>(eventType: string, handler: EventHandler<TEvent>) => EventSubscription;
    subscribeAll: <TEvent extends Event = Readonly<{
        type: string;
        data: {
            [x: string]: unknown;
        };
        timestamp?: Date;
        requestId?: string;
        correlationId?: string;
    }>>(handler: EventHandler<TEvent>) => EventSubscription;
    getCommandHandlers: () => Record<string, CommandHandler>;
    onCorrelation: (correlationId: string, listener: CorrelationListener) => EventSubscription;
    onCorrelationPrefix: (prefix: string, listener: CorrelationListener) => EventSubscription;
};
export type MessageBus = ReturnType<typeof createMessageBus>;
export {};
//# sourceMappingURL=message-bus.d.ts.map