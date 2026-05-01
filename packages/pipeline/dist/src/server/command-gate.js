export function createCommandGate() {
    const configs = new Map();
    const running = new Map();
    const queues = new Map();
    const queueRunning = new Map();
    function resolveGroupKey(commandType, data) {
        const config = configs.get(commandType);
        if (config?.groupKey) {
            return `${commandType}:${config.groupKey(data)}`;
        }
        return commandType;
    }
    function drain(groupKey) {
        const queue = queues.get(groupKey);
        if (!queue || queue.length === 0) {
            queueRunning.delete(groupKey);
            return;
        }
        const next = queue.shift();
        const controller = new AbortController();
        next
            .executeFn(controller.signal)
            .then(() => next.resolve())
            .catch((error) => next.reject(error))
            .finally(() => drain(groupKey));
    }
    return {
        register(commandType, config) {
            configs.set(commandType, config);
        },
        async run(commandType, data, executeFn) {
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
            return new Promise((resolve, reject) => {
                const queue = queues.get(groupKey) ?? [];
                queue.push({ executeFn, resolve, reject });
                queues.set(groupKey, queue);
            });
        },
    };
}
//# sourceMappingURL=command-gate.js.map