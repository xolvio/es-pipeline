import type { WorkflowRegistration } from './workflow-processor.js';
type Event = {
    type: string;
    data: Record<string, unknown>;
};
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
type EmitMapping = {
    eventType: string;
    commands: Array<{
        commandType: string;
        data: Record<string, unknown> | ((event: Event) => Record<string, unknown>);
    }>;
};
export declare function createPipelineEngine(): Promise<{
    registerCommandHandler(commandType: string, handler: CommandHandler): void;
    registerEmitMapping(mapping: EmitMapping): void;
    registerWorkflow(registration: WorkflowRegistration): void;
    registeredCommands(): string[];
    onEvent(listener: (event: Event) => void): void;
    processWorkflowEvent(event: Event): Event[];
    dispatch(command: {
        type: string;
        data: Record<string, unknown>;
    }): Promise<void>;
    close(): Promise<void>;
}>;
export {};
//# sourceMappingURL=pipeline-engine.d.ts.map