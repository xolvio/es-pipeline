export type PhasedItem = {
  key: string;
  phase: string;
  status: 'pending' | 'dispatched' | 'completed' | 'failed';
};

export type PhasedInput =
  | {
      type: 'StartPhased';
      data: {
        correlationId: string;
        items: Array<{ key: string; phase: string }>;
        phases: string[];
        stopOnFailure: boolean;
      };
    }
  | { type: 'ItemCompleted'; data: { itemKey: string; result: Record<string, unknown> } }
  | { type: 'ItemFailed'; data: { itemKey: string; error: Record<string, unknown> } };

export type PhasedOutput =
  | { type: 'DispatchItem'; kind: 'Command'; data: { itemKey: string; phase: string } }
  | { type: 'PhasedCompleted'; data: { completedItems: string[] } }
  | { type: 'PhasedFailed'; data: { failedItems: string[]; completedItems: string[] } };

export type PhasedState = {
  status: 'idle' | 'running' | 'completed' | 'failed';
  items: PhasedItem[];
  phases: string[];
  currentPhaseIndex: number;
  stopOnFailure: boolean;
};

export function initialState(): PhasedState {
  return {
    status: 'idle',
    items: [],
    phases: [],
    currentPhaseIndex: 0,
    stopOnFailure: false,
  };
}

export function decide(input: PhasedInput, state: PhasedState): PhasedOutput | PhasedOutput[] {
  switch (input.type) {
    case 'StartPhased': {
      const currentPhase = state.phases[state.currentPhaseIndex];
      return state.items
        .filter((item) => item.phase === currentPhase)
        .map((item) => ({
          type: 'DispatchItem' as const,
          kind: 'Command' as const,
          data: { itemKey: item.key, phase: item.phase },
        }));
    }
    case 'ItemCompleted': {
      const currentPhase = state.phases[state.currentPhaseIndex];
      const currentPhaseItems = state.items.filter((item) => item.phase === currentPhase);
      const allCompleted = currentPhaseItems.every((item) => item.status === 'completed');
      if (allCompleted) {
        const allItems = state.items;
        const allDone = allItems.every((item) => item.status === 'completed');
        if (allDone) {
          return {
            type: 'PhasedCompleted',
            data: { completedItems: allItems.map((item) => item.key) },
          };
        }
        const nextPhaseIndex = state.currentPhaseIndex + 1;
        if (nextPhaseIndex < state.phases.length) {
          const nextPhase = state.phases[nextPhaseIndex];
          return state.items
            .filter((item) => item.phase === nextPhase)
            .map((item) => ({
              type: 'DispatchItem' as const,
              kind: 'Command' as const,
              data: { itemKey: item.key, phase: item.phase },
            }));
        }
      }
      return [];
    }
    case 'ItemFailed': {
      if (state.stopOnFailure) {
        const failedItems = state.items.filter((item) => item.status === 'failed').map((item) => item.key);
        const completedItems = state.items.filter((item) => item.status === 'completed').map((item) => item.key);
        return {
          type: 'PhasedFailed',
          data: { failedItems, completedItems },
        };
      }
      return [];
    }
    default:
      return [];
  }
}

export function evolve(state: PhasedState, event: PhasedInput | PhasedOutput): PhasedState {
  switch (event.type) {
    case 'StartPhased':
      return {
        status: 'running',
        items: event.data.items.map((item) => ({ ...item, status: 'pending' as const })),
        phases: event.data.phases,
        currentPhaseIndex: 0,
        stopOnFailure: event.data.stopOnFailure,
      };

    case 'DispatchItem': {
      const phaseIndex = state.phases.indexOf(event.data.phase);
      return {
        ...state,
        items: state.items.map((item) =>
          item.key === event.data.itemKey ? { ...item, status: 'dispatched' as const } : item,
        ),
        currentPhaseIndex: phaseIndex > state.currentPhaseIndex ? phaseIndex : state.currentPhaseIndex,
      };
    }

    case 'ItemCompleted':
      return {
        ...state,
        items: state.items.map((item) =>
          item.key === event.data.itemKey ? { ...item, status: 'completed' as const } : item,
        ),
      };

    case 'ItemFailed':
      return {
        ...state,
        items: state.items.map((item) =>
          item.key === event.data.itemKey ? { ...item, status: 'failed' as const } : item,
        ),
      };

    case 'PhasedCompleted':
      return { ...state, status: 'completed' };

    case 'PhasedFailed':
      return { ...state, status: 'failed' };

    default:
      return state;
  }
}

export function createPhasedWorkflow(): {
  decide: typeof decide;
  evolve: typeof evolve;
  initialState: typeof initialState;
} {
  return { decide, evolve, initialState };
}
