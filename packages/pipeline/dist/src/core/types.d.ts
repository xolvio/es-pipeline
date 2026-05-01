import type { Event } from '@xolvio/message-bus';
export type { Command, Event } from '@xolvio/message-bus';
export type DataRecord = Record<string, unknown>;
export type DataOrFactory<D extends DataRecord = DataRecord> = D | ((event: Event) => D);
export interface CommandDispatch<D extends DataRecord = DataRecord> {
    commandType: string;
    data: DataOrFactory<D>;
}
export declare function dispatch<D extends DataRecord>(commandType: string, data: DataOrFactory<D>): CommandDispatch<D>;
export interface HandlerFailedEvent {
    type: 'HandlerFailed';
    data: {
        handlerName: string;
        command: string;
        error: string;
        stack?: string;
    };
}
//# sourceMappingURL=types.d.ts.map