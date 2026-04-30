import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QuiescenceTracker } from './quiescence-tracker';

describe('QuiescenceTracker', () => {
  describe('isQuiescent', () => {
    it('returns true initially when no commands dispatched', () => {
      const tracker = new QuiescenceTracker();

      expect(tracker.isQuiescent()).toBe(true);
    });

    it('returns false after increment', () => {
      const tracker = new QuiescenceTracker();

      tracker.increment();

      expect(tracker.isQuiescent()).toBe(false);
    });

    it('returns true after matching increment and decrement', () => {
      const tracker = new QuiescenceTracker();
      tracker.increment();

      tracker.decrement();

      expect(tracker.isQuiescent()).toBe(true);
    });

    it('returns false when multiple commands pending', () => {
      const tracker = new QuiescenceTracker();

      tracker.increment();
      tracker.increment();
      tracker.increment();
      tracker.decrement();

      expect(tracker.isQuiescent()).toBe(false);
    });

    it('returns true after all commands complete', () => {
      const tracker = new QuiescenceTracker();
      tracker.increment();
      tracker.increment();
      tracker.increment();

      tracker.decrement();
      tracker.decrement();
      tracker.decrement();

      expect(tracker.isQuiescent()).toBe(true);
    });

    it('remains quiescent after decrement when already at zero', () => {
      const tracker = new QuiescenceTracker();

      tracker.decrement();

      expect(tracker.isQuiescent()).toBe(true);
    });
  });

  describe('reset', () => {
    it('restores quiescent state when commands were pending', () => {
      const tracker = new QuiescenceTracker();
      tracker.increment();
      tracker.increment();

      tracker.reset();

      expect(tracker.isQuiescent()).toBe(true);
    });
  });

  describe('onQuiescent callback with debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('calls callback after debounce delay when quiescent', () => {
      const callback = vi.fn();
      const tracker = new QuiescenceTracker({ debounceMs: 100, onQuiescent: callback });
      tracker.increment();

      tracker.decrement();

      expect(callback).not.toHaveBeenCalled();
      vi.advanceTimersByTime(100);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('does not call callback before debounce delay', () => {
      const callback = vi.fn();
      const tracker = new QuiescenceTracker({ debounceMs: 100, onQuiescent: callback });
      tracker.increment();

      tracker.decrement();
      vi.advanceTimersByTime(50);

      expect(callback).not.toHaveBeenCalled();
    });

    it('resets debounce timer when new command arrives during debounce', () => {
      const callback = vi.fn();
      const tracker = new QuiescenceTracker({ debounceMs: 100, onQuiescent: callback });
      tracker.increment();
      tracker.decrement();
      vi.advanceTimersByTime(50);

      tracker.increment();

      vi.advanceTimersByTime(100);
      expect(callback).not.toHaveBeenCalled();

      tracker.decrement();
      vi.advanceTimersByTime(100);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('does not call callback when reset during debounce', () => {
      const callback = vi.fn();
      const tracker = new QuiescenceTracker({ debounceMs: 100, onQuiescent: callback });
      tracker.increment();
      tracker.decrement();
      vi.advanceTimersByTime(50);

      tracker.reset();

      vi.advanceTimersByTime(100);
      expect(callback).not.toHaveBeenCalled();
    });

    it('uses default debounce of 50ms when not specified', () => {
      const callback = vi.fn();
      const tracker = new QuiescenceTracker({ onQuiescent: callback });
      tracker.increment();

      tracker.decrement();

      vi.advanceTimersByTime(49);
      expect(callback).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});
