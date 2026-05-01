import type { GraphIR } from '../graph/types';
type EmitRegistration = {
    type: 'emit';
    eventType: string;
    commands: Array<{
        commandType: string;
        data: Record<string, unknown> | ((event: Record<string, unknown>) => Record<string, unknown>);
    }>;
};
type CustomHandlerRegistration = {
    type: 'custom';
    eventType: string;
    handler: (event: {
        type: string;
        data: Record<string, unknown>;
    }) => Array<{
        type: string;
        data: Record<string, unknown>;
    }> | Promise<Array<{
        type: string;
        data: Record<string, unknown>;
    }>>;
};
export type SettledRegistration = {
    type: 'settled';
    commandTypes: string[];
    maxRetries?: number;
};
export type PhasedRegistration = {
    type: 'phased';
    eventType: string;
    phases: string[];
    stopOnFailure: boolean;
};
export type AwaitRegistration = {
    type: 'await';
    eventType: string;
    keys: string[];
};
type Registration = EmitRegistration | CustomHandlerRegistration | SettledRegistration | PhasedRegistration | AwaitRegistration;
export type PipelineV2 = {
    name: string;
    registrations: Registration[];
};
type EmitChain = {
    emit(commandType: string, data: Record<string, unknown> | ((event: Record<string, unknown>) => Record<string, unknown>)): EmitChain;
    on(eventType: string): TriggerBuilder;
    build(): PipelineV2;
};
type HandleChain = {
    on(eventType: string): TriggerBuilder;
    build(): PipelineV2;
};
type ProcessChain = {
    stopOnFailure(): ProcessChain;
    on(eventType: string): TriggerBuilder;
    build(): PipelineV2;
};
type GroupIntoChain = {
    process(): ProcessChain;
};
type ForEachChain = {
    groupInto(phases: string[]): GroupIntoChain;
};
type AwaitAllChain = {
    on(eventType: string): TriggerBuilder;
    build(): PipelineV2;
};
type RunChain = {
    awaitAll(): AwaitAllChain;
};
type TriggerBuilder = {
    emit(commandType: string, data: Record<string, unknown> | ((event: Record<string, unknown>) => Record<string, unknown>)): EmitChain;
    handle(handler: (event: {
        type: string;
        data: Record<string, unknown>;
    }) => Array<{
        type: string;
        data: Record<string, unknown>;
    }> | Promise<Array<{
        type: string;
        data: Record<string, unknown>;
    }>>): HandleChain;
    forEach(): ForEachChain;
    run(keys: string[]): RunChain;
};
type SettledChain = {
    maxRetries(n: number): SettledChain;
    on(eventType: string): TriggerBuilder;
    settled(commandTypes: string[]): SettledChain;
    build(): PipelineV2;
};
type PipelineV2Builder = {
    on(eventType: string): TriggerBuilder;
    settled(commandTypes: string[]): SettledChain;
    build(): PipelineV2;
};
export declare function defineV2(name: string): PipelineV2Builder;
export declare function toGraph(pipeline: PipelineV2): GraphIR;
export {};
//# sourceMappingURL=define-v2.d.ts.map