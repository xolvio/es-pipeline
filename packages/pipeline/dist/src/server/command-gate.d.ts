export interface ConcurrencyConfig {
    strategy: 'cancel-in-progress' | 'queue';
    groupKey?: (data: unknown) => string;
}
export declare function createCommandGate(): {
    register(commandType: string, config: ConcurrencyConfig): void;
    run(commandType: string, data: unknown, executeFn: (signal: AbortSignal) => Promise<void>): Promise<void>;
};
//# sourceMappingURL=command-gate.d.ts.map