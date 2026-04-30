export type AwaitInput =
  | { type: 'StartAwait'; data: { correlationId: string; keys: string[] } }
  | { type: 'KeyCompleted'; data: { key: string; result: Record<string, unknown> } };

export type AwaitOutput = {
  type: 'AwaitCompleted';
  data: { results: Record<string, Record<string, unknown>> };
};

export type AwaitState = {
  status: 'idle' | 'waiting' | 'completed';
  pendingKeys: string[];
  results: Record<string, Record<string, unknown>>;
};

export function initialState(): AwaitState {
  return {
    status: 'idle',
    pendingKeys: [],
    results: {},
  };
}

export function decide(_input: AwaitInput, state: AwaitState): AwaitOutput | AwaitOutput[] {
  if (state.status !== 'waiting' || state.pendingKeys.length > 0) {
    return [];
  }
  return {
    type: 'AwaitCompleted',
    data: { results: state.results },
  };
}

export function createAwaitWorkflow(): {
  decide: typeof decide;
  evolve: typeof evolve;
  initialState: typeof initialState;
} {
  return { decide, evolve, initialState };
}

export function evolve(state: AwaitState, event: AwaitInput | AwaitOutput): AwaitState {
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
