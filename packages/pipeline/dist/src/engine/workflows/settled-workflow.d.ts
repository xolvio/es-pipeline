export type SettledInput = {
    type: 'StartSettled';
    data: {
        correlationId: string;
        commandTypes: string[];
    };
} | {
    type: 'CommandCompleted';
    data: {
        commandType: string;
        result: 'success' | 'failure';
        event: Record<string, unknown>;
    };
};
export type SettledOutput = {
    type: 'AllSettled';
    data: {
        results: Record<string, {
            result: 'success' | 'failure';
            event: Record<string, unknown>;
        }>;
    };
} | {
    type: 'SettledFailed';
    data: {
        results: Record<string, {
            result: 'success' | 'failure';
            event: Record<string, unknown>;
        }>;
        failures: string[];
    };
} | {
    type: 'RetryCommands';
    kind: 'Command';
    data: {
        commandTypes: string[];
    };
};
export type SettledState = {
    status: 'idle' | 'waiting' | 'done';
    commandTypes: string[];
    completions: Record<string, {
        result: 'success' | 'failure';
        event: Record<string, unknown>;
    }>;
    retryCount: number;
    maxRetries: number;
};
type SettledEvent = SettledInput | SettledOutput;
export declare function initialState(): SettledState;
export declare function evolve(state: SettledState, event: SettledEvent): SettledState;
export declare function decide(_input: SettledInput, state: SettledState): SettledOutput | SettledOutput[];
export declare function createSettledWorkflow(config: {
    commandTypes: string[];
    maxRetries?: number;
}): {
    decide: typeof decide;
    evolve: typeof evolve;
    initialState: () => SettledState;
};
export {};
//# sourceMappingURL=settled-workflow.d.ts.map