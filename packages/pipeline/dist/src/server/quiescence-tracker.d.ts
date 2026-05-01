export interface QuiescenceTrackerOptions {
    debounceMs?: number;
    onQuiescent?: () => void;
}
export declare class QuiescenceTracker {
    private pendingCount;
    private debounceTimer;
    private readonly debounceMs;
    private readonly onQuiescent?;
    constructor(options?: QuiescenceTrackerOptions);
    increment(): void;
    decrement(): void;
    isQuiescent(): boolean;
    reset(): void;
    private scheduleQuiescenceCheck;
    private cancelDebounce;
}
//# sourceMappingURL=quiescence-tracker.d.ts.map