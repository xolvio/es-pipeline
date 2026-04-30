import type { NodeStatus } from '../graph/types';

export interface NodeStatusDocument {
  [key: string]: unknown;
  correlationId: string;
  commandName: string;
  status: NodeStatus;
  pendingCount: number;
  endedCount: number;
  lastDurationMs?: number;
}

export interface NodeStatusChangedEvent {
  type: 'NodeStatusChanged';
  data: {
    correlationId: string;
    commandName: string;
    nodeId: string;
    status: NodeStatus;
    previousStatus: NodeStatus;
    pendingCount: number;
    endedCount: number;
    lastDurationMs?: number;
  };
}

export function evolve(document: NodeStatusDocument | null, event: NodeStatusChangedEvent): NodeStatusDocument {
  return {
    correlationId: event.data.correlationId,
    commandName: event.data.commandName,
    status: event.data.status,
    pendingCount: event.data.pendingCount,
    endedCount: event.data.endedCount,
    lastDurationMs: event.data.lastDurationMs ?? document?.lastDurationMs,
  };
}
