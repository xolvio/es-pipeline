export type AwaitInput = {
    type: 'StartAwait';
    data: {
        correlationId: string;
        keys: string[];
    };
} | {
    type: 'KeyCompleted';
    data: {
        key: string;
        result: Record<string, unknown>;
    };
};
export type AwaitOutput = {
    type: 'AwaitCompleted';
    data: {
        results: Record<string, Record<string, unknown>>;
    };
};
export type AwaitState = {
    status: 'idle' | 'waiting' | 'completed';
    pendingKeys: string[];
    results: Record<string, Record<string, unknown>>;
};
export declare function initialState(): AwaitState;
export declare function decide(_input: AwaitInput, state: AwaitState): AwaitOutput | AwaitOutput[];
export declare function createAwaitWorkflow(): {
    decide: typeof decide;
    evolve: typeof evolve;
    initialState: typeof initialState;
};
export declare function evolve(state: AwaitState, event: AwaitInput | AwaitOutput): AwaitState;
//# sourceMappingURL=await-workflow.d.ts.map