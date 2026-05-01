type Event = {
    type: string;
    data: Record<string, unknown>;
};
type WorkflowDef = {
    decide: (input: Event, state: unknown) => Event | Event[];
    evolve: (state: unknown, event: Event) => unknown;
    initialState: () => unknown;
};
export type WorkflowRegistration = {
    id: string;
    workflow: WorkflowDef;
    inputEvents: string[];
};
export declare function createWorkflowProcessor(): {
    register(registration: WorkflowRegistration): void;
    process(event: Event): Event[];
    processKeyed(event: Event, instanceKey: string): Event[];
    getState(workflowId: string, instanceKey: string): unknown;
    resetInstance(workflowId: string, instanceKey: string): void;
};
export {};
//# sourceMappingURL=workflow-processor.d.ts.map