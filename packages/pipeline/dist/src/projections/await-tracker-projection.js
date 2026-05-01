export function evolve(document, event) {
    switch (event.type) {
        case 'AwaitStarted': {
            const { correlationId, keys } = event.data;
            return {
                correlationId,
                pendingKeys: [...keys],
                results: {},
                status: 'pending',
            };
        }
        case 'AwaitItemCompleted': {
            if (document === null) {
                throw new Error('Cannot apply AwaitItemCompleted to null document');
            }
            const { key, result } = event.data;
            const newPendingKeys = document.pendingKeys.filter((k) => k !== key);
            return {
                ...document,
                pendingKeys: newPendingKeys,
                results: { ...document.results, [key]: result },
            };
        }
        case 'AwaitCompleted': {
            if (document === null) {
                throw new Error('Cannot apply AwaitCompleted to null document');
            }
            return {
                ...document,
                status: 'completed',
            };
        }
    }
}
//# sourceMappingURL=await-tracker-projection.js.map