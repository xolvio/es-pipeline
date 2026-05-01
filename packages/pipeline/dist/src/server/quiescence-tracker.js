export class QuiescenceTracker {
    constructor(options = {}) {
        this.pendingCount = 0;
        this.debounceTimer = null;
        this.debounceMs = options.debounceMs ?? 50;
        this.onQuiescent = options.onQuiescent;
    }
    increment() {
        this.pendingCount++;
        this.cancelDebounce();
    }
    decrement() {
        if (this.pendingCount > 0) {
            this.pendingCount--;
        }
        this.scheduleQuiescenceCheck();
    }
    isQuiescent() {
        return this.pendingCount === 0;
    }
    reset() {
        this.pendingCount = 0;
        this.cancelDebounce();
    }
    scheduleQuiescenceCheck() {
        const callback = this.onQuiescent;
        if (!this.isQuiescent() || !callback) {
            return;
        }
        this.cancelDebounce();
        this.debounceTimer = setTimeout(() => {
            if (this.isQuiescent()) {
                callback();
            }
        }, this.debounceMs);
    }
    cancelDebounce() {
        if (this.debounceTimer !== null) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }
    }
}
//# sourceMappingURL=quiescence-tracker.js.map