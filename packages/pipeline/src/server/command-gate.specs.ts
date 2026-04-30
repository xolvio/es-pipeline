import { createCommandGate } from './command-gate';

describe('createCommandGate', () => {
  describe('unregistered commands', () => {
    it('calls executeFn immediately with a non-aborted signal', async () => {
      const gate = createCommandGate();
      let receivedSignal: AbortSignal | undefined;

      await gate.run('UnknownCommand', {}, async (signal) => {
        receivedSignal = signal;
      });

      expect(receivedSignal).toBeInstanceOf(AbortSignal);
      expect(receivedSignal!.aborted).toBe(false);
    });
  });

  describe('registered commands', () => {
    it('executes first-in-group immediately with a non-aborted signal', async () => {
      const gate = createCommandGate();
      gate.register('DoStuff', { strategy: 'cancel-in-progress' });
      let receivedSignal: AbortSignal | undefined;

      await gate.run('DoStuff', {}, async (signal) => {
        receivedSignal = signal;
      });

      expect(receivedSignal).toBeInstanceOf(AbortSignal);
      expect(receivedSignal!.aborted).toBe(false);
    });
  });

  describe('cancel-in-progress', () => {
    it('aborts the first signal when a second run starts', async () => {
      const gate = createCommandGate();
      gate.register('Generate', { strategy: 'cancel-in-progress' });

      let firstSignal: AbortSignal | undefined;
      let secondSignal: AbortSignal | undefined;
      let firstResolve: () => void;
      const firstBlocks = new Promise<void>((r) => {
        firstResolve = r;
      });

      const firstPromise = gate.run('Generate', {}, async (signal) => {
        firstSignal = signal;
        await firstBlocks;
      });

      const secondPromise = gate.run('Generate', {}, async (signal) => {
        secondSignal = signal;
      });

      await secondPromise;
      firstResolve!();
      await firstPromise;

      expect(firstSignal!.aborted).toBe(true);
      expect(secondSignal!.aborted).toBe(false);
    });

    it('stale cleanup is a no-op via generation counter', async () => {
      const gate = createCommandGate();
      gate.register('Generate', { strategy: 'cancel-in-progress' });

      let firstResolve: () => void;
      const firstBlocks = new Promise<void>((r) => {
        firstResolve = r;
      });
      let thirdSignal: AbortSignal | undefined;

      const firstPromise = gate.run('Generate', {}, async () => {
        await firstBlocks;
      });

      const secondPromise = gate.run('Generate', {}, async () => {});
      await secondPromise;

      firstResolve!();
      await firstPromise;

      await gate.run('Generate', {}, async (signal) => {
        thirdSignal = signal;
      });

      expect(thirdSignal!.aborted).toBe(false);
    });

    it('different group keys do not interfere', async () => {
      const gate = createCommandGate();
      gate.register('Generate', {
        strategy: 'cancel-in-progress',
        groupKey: (data) => (data as { id: string }).id,
      });

      let signalA: AbortSignal | undefined;
      let signalB: AbortSignal | undefined;
      let resolveA: () => void;
      let resolveB: () => void;
      const blocksA = new Promise<void>((r) => {
        resolveA = r;
      });
      const blocksB = new Promise<void>((r) => {
        resolveB = r;
      });

      const promiseA = gate.run('Generate', { id: 'a' }, async (signal) => {
        signalA = signal;
        await blocksA;
      });

      const promiseB = gate.run('Generate', { id: 'b' }, async (signal) => {
        signalB = signal;
        await blocksB;
      });

      resolveA!();
      resolveB!();
      await promiseA;
      await promiseB;

      expect(signalA!.aborted).toBe(false);
      expect(signalB!.aborted).toBe(false);
    });
  });

  describe('queue', () => {
    it('second run resolves only after first completes', async () => {
      const gate = createCommandGate();
      gate.register('Build', { strategy: 'queue' });
      const order: string[] = [];
      let resolveFirst: () => void;
      const firstBlocks = new Promise<void>((r) => {
        resolveFirst = r;
      });

      const firstPromise = gate.run('Build', {}, async () => {
        order.push('first-start');
        await firstBlocks;
        order.push('first-end');
      });

      const secondPromise = gate.run('Build', {}, async () => {
        order.push('second-start');
        order.push('second-end');
      });

      resolveFirst!();
      await firstPromise;
      await secondPromise;

      expect(order).toEqual(['first-start', 'first-end', 'second-start', 'second-end']);
    });

    it('drains in FIFO order for 3+ commands', async () => {
      const gate = createCommandGate();
      gate.register('Build', { strategy: 'queue' });
      const order: number[] = [];
      let resolveFirst: () => void;
      const firstBlocks = new Promise<void>((r) => {
        resolveFirst = r;
      });

      const p1 = gate.run('Build', {}, async () => {
        await firstBlocks;
        order.push(1);
      });

      const p2 = gate.run('Build', {}, async () => {
        order.push(2);
      });

      const p3 = gate.run('Build', {}, async () => {
        order.push(3);
      });

      resolveFirst!();
      await p1;
      await p2;
      await p3;

      expect(order).toEqual([1, 2, 3]);
    });

    it('error in queued command does not block queue', async () => {
      const gate = createCommandGate();
      gate.register('Build', { strategy: 'queue' });
      const order: string[] = [];
      let resolveFirst: () => void;
      const firstBlocks = new Promise<void>((r) => {
        resolveFirst = r;
      });

      const p1 = gate.run('Build', {}, async () => {
        await firstBlocks;
        order.push('first');
      });

      const p2 = gate.run('Build', {}, async () => {
        order.push('second-throws');
        throw new Error('boom');
      });

      const p3 = gate.run('Build', {}, async () => {
        order.push('third');
      });

      resolveFirst!();
      await p1;
      await expect(p2).rejects.toThrow('boom');
      await p3;

      expect(order).toEqual(['first', 'second-throws', 'third']);
    });

    it('each queued command gets its own signal when dequeued', async () => {
      const gate = createCommandGate();
      gate.register('Build', { strategy: 'queue' });
      const signals: AbortSignal[] = [];
      let resolveFirst: () => void;
      const firstBlocks = new Promise<void>((r) => {
        resolveFirst = r;
      });

      const p1 = gate.run('Build', {}, async (signal) => {
        signals.push(signal);
        await firstBlocks;
      });

      const p2 = gate.run('Build', {}, async (signal) => {
        signals.push(signal);
      });

      resolveFirst!();
      await p1;
      await p2;

      expect(signals).toHaveLength(2);
      expect(signals[0]).not.toBe(signals[1]);
      expect(signals[0].aborted).toBe(false);
      expect(signals[1].aborted).toBe(false);
    });
  });
});
