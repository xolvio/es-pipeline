export function initialState() {
    return {
        status: 'idle',
        pendingKeys: [],
        results: {},
    };
}
export function decide(_input, state) {
    if (state.status !== 'waiting' || state.pendingKeys.length > 0) {
        return [];
    }
    return {
        type: 'AwaitCompleted',
        data: { results: state.results },
    };
}
export function createAwaitWorkflow() {
    return { decide, evolve, initialState };
}
export function evolve(state, event) {
    switch (event.type) {
        case 'StartAwait':
            return {
                ...state,
                status: 'waiting',
                pendingKeys: event.data.keys,
                results: {},
            };
        case 'KeyCompleted': {
            if (!state.pendingKeys.includes(event.data.key)) {
                return state;
            }
            return {
                ...state,
                pendingKeys: state.pendingKeys.filter((k) => k !== event.data.key),
                results: { ...state.results, [event.data.key]: event.data.result },
            };
        }
        case 'AwaitCompleted':
            return { ...state, status: 'completed' };
        default:
            return state;
    }
}
//# sourceMappingURL=await-workflow.js.map