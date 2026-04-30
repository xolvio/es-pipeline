export type SettledInput =
  | { type: 'StartSettled'; data: { correlationId: string; commandTypes: string[] } }
  | {
      type: 'CommandCompleted';
      data: { commandType: string; result: 'success' | 'failure'; event: Record<string, unknown> };
    };

export type SettledOutput =
  | {
      type: 'AllSettled';
      data: { results: Record<string, { result: 'success' | 'failure'; event: Record<string, unknown> }> };
    }
  | {
      type: 'SettledFailed';
      data: {
        results: Record<string, { result: 'success' | 'failure'; event: Record<string, unknown> }>;
        failures: string[];
      };
    }
  | { type: 'RetryCommands'; kind: 'Command'; data: { commandTypes: string[] } };

export type SettledState = {
  status: 'idle' | 'waiting' | 'done';
  commandTypes: string[];
  completions: Record<string, { result: 'success' | 'failure'; event: Record<string, unknown> }>;
  retryCount: number;
  maxRetries: number;
};

type SettledEvent = SettledInput | SettledOutput;

export function initialState(): SettledState {
  return {
    status: 'idle',
    commandTypes: [],
    completions: {},
    retryCount: 0,
    maxRetries: 3,
  };
}

export function evolve(state: SettledState, event: SettledEvent): SettledState {
  switch (event.type) {
    case 'StartSettled':
      return {
        ...state,
        status: 'waiting',
        commandTypes: event.data.commandTypes,
      };

    case 'CommandCompleted':
      return {
        ...state,
        completions: {
          ...state.completions,
          [event.data.commandType]: {
            result: event.data.result,
            event: event.data.event,
          },
        },
      };

    case 'AllSettled':
      return { ...state, status: 'done' };

    case 'SettledFailed':
      return { ...state, status: 'done' };

    case 'RetryCommands': {
      const retried = new Set(event.data.commandTypes);
      const completions = { ...state.completions };
      for (const ct of retried) {
        delete completions[ct];
      }
      return {
        ...state,
        completions,
        retryCount: state.retryCount + 1,
      };
    }

    default:
      return state;
  }
}

export function decide(_input: SettledInput, state: SettledState): SettledOutput | SettledOutput[] {
  if (state.status !== 'waiting') {
    return [];
  }

  const allCompleted = state.commandTypes.every((ct) => ct in state.completions);
  if (!allCompleted) {
    return [];
  }

  const failures = state.commandTypes.filter((ct) => state.completions[ct].result === 'failure');

  if (failures.length === 0) {
    return {
      type: 'AllSettled',
      data: { results: state.completions },
    };
  }

  if (state.retryCount < state.maxRetries) {
    return {
      type: 'RetryCommands',
      kind: 'Command',
      data: { commandTypes: failures },
    };
  }

  return {
    type: 'SettledFailed',
    data: {
      results: state.completions,
      failures,
    },
  };
}

export function createSettledWorkflow(config: { commandTypes: string[]; maxRetries?: number }): {
  decide: typeof decide;
  evolve: typeof evolve;
  initialState: () => SettledState;
} {
  return {
    decide,
    evolve,
    initialState: () => ({
      status: 'idle',
      commandTypes: [],
      completions: {},
      retryCount: 0,
      maxRetries: config.maxRetries ?? 3,
    }),
  };
}
