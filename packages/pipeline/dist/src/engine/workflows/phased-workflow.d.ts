export type PhasedItem = {
    key: string;
    phase: string;
    status: 'pending' | 'dispatched' | 'completed' | 'failed';
};
export type PhasedInput = {
    type: 'StartPhased';
    data: {
        correlationId: string;
        items: Array<{
            key: string;
            phase: string;
        }>;
        phases: string[];
        stopOnFailure: boolean;
    };
} | {
    type: 'ItemCompleted';
    data: {
        itemKey: string;
        result: Record<string, unknown>;
    };
} | {
    type: 'ItemFailed';
    data: {
        itemKey: string;
        error: Record<string, unknown>;
    };
};
export type PhasedOutput = {
    type: 'DispatchItem';
    kind: 'Command';
    data: {
        itemKey: string;
        phase: string;
    };
} | {
    type: 'PhasedCompleted';
    data: {
        completedItems: string[];
    };
} | {
    type: 'PhasedFailed';
    data: {
        failedItems: string[];
        completedItems: string[];
    };
};
export type PhasedState = {
    status: 'idle' | 'running' | 'completed' | 'failed';
    items: PhasedItem[];
    phases: string[];
    currentPhaseIndex: number;
    stopOnFailure: boolean;
};
export declare function initialState(): PhasedState;
export declare function decide(input: PhasedInput, state: PhasedState): PhasedOutput | PhasedOutput[];
export declare function evolve(state: PhasedState, event: PhasedInput | PhasedOutput): PhasedState;
export declare function createPhasedWorkflow(): {
    decide: typeof decide;
    evolve: typeof evolve;
    initialState: typeof initialState;
};
//# sourceMappingURL=phased-workflow.d.ts.map