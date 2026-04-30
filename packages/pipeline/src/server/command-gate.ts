export interface ConcurrencyConfig {
  strategy: 'cancel-in-progress' | 'queue';
  groupKey?: (data: unknown) => string;
}

interface RunningEntry {
  controller: AbortController;
  generation: number;
  promise: Promise<void>;
}

interface QueuedItem {
  executeFn: (signal: AbortSignal) => Promise<void>;
  resolve: () => void;
  reject: (error: unknown) => void;
}

export function createCommandGate() {
  const configs = new Map<string, ConcurrencyConfig>();
  const running = new Map<string, RunningEntry>();
  const queues = new Map<string, QueuedItem[]>();
  const queueRunning = new Map<string, boolean>();

  function resolveGroupKey(commandType: string, data: unknown): string {
    const config = configs.get(commandType);
    if (config?.groupKey) {
      return `${commandType}:${config.groupKey(data)}`;
    }
    return commandType;
  }

  function drain(groupKey: string): void {
    const queue = queues.get(groupKey);
    if (!queue || queue.length === 0) {
      queueRunning.delete(groupKey);
      return;
    }

    const next = queue.shift()!;
    const controller = new AbortController();
    next
      .executeFn(controller.signal)
      .then(() => next.resolve())
      .catch((error: unknown) => next.reject(error))
      .finally(() => drain(groupKey));
  }

  return {
    register(commandType: string, config: ConcurrencyConfig): void {
      configs.set(commandType, config);
    },

    async run(commandType: string, data: unknown, executeFn: (signal: AbortSignal) => Promise<void>): Promise<void> {
      const config = configs.get(commandType);
      if (!config) {
        const controller = new AbortController();
        await executeFn(controller.signal);
        return;
      }

      if (config.strategy === 'cancel-in-progress') {
        const groupKey = resolveGroupKey(commandType, data);
        const existing = running.get(groupKey);
        const generation = (existing?.generation ?? 0) + 1;

        if (existing) {
          existing.controller.abort();
        }

        const controller = new AbortController();
        const promise = executeFn(controller.signal).finally(() => {
          const current = running.get(groupKey);
          if (current?.generation === generation) {
            running.delete(groupKey);
          }
        });

        running.set(groupKey, { controller, generation, promise });
        await promise;
        return;
      }

      const groupKey = resolveGroupKey(commandType, data);

      if (!queueRunning.get(groupKey)) {
        queueRunning.set(groupKey, true);
        const controller = new AbortController();
        await executeFn(controller.signal).finally(() => drain(groupKey));
        return;
      }

      return new Promise<void>((resolve, reject) => {
        const queue = queues.get(groupKey) ?? [];
        queue.push({ executeFn, resolve, reject });
        queues.set(groupKey, queue);
      });
    },
  };
}
