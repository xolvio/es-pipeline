export interface QuiescenceTrackerOptions {
  debounceMs?: number;
  onQuiescent?: () => void;
}

export class QuiescenceTracker {
  private pendingCount = 0;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly debounceMs: number;
  private readonly onQuiescent?: () => void;

  constructor(options: QuiescenceTrackerOptions = {}) {
    this.debounceMs = options.debounceMs ?? 50;
    this.onQuiescent = options.onQuiescent;
  }

  increment(): void {
    this.pendingCount++;
    this.cancelDebounce();
  }

  decrement(): void {
    if (this.pendingCount > 0) {
      this.pendingCount--;
    }
    this.scheduleQuiescenceCheck();
  }

  isQuiescent(): boolean {
    return this.pendingCount === 0;
  }

  reset(): void {
    this.pendingCount = 0;
    this.cancelDebounce();
  }

  private scheduleQuiescenceCheck(): void {
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

  private cancelDebounce(): void {
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }
}
