export interface ItemStatusDocument {
  [key: string]: unknown;
  correlationId: string;
  commandType: string;
  itemKey: string;
  currentRequestId: string;
  status: 'running' | 'success' | 'error';
  attemptCount: number;
  startedAt?: string;
  endedAt?: string;
  batchId?: string;
}

export interface ItemStatusChangedEvent {
  type: 'ItemStatusChanged';
  data: {
    correlationId: string;
    commandType: string;
    itemKey: string;
    requestId: string;
    status: 'running' | 'success' | 'error';
    attemptCount: number;
    timestamp?: string;
    batchId?: string;
  };
}

export function evolve(document: ItemStatusDocument | null, event: ItemStatusChangedEvent): ItemStatusDocument {
  const base: ItemStatusDocument = {
    correlationId: event.data.correlationId,
    commandType: event.data.commandType,
    itemKey: event.data.itemKey,
    currentRequestId: event.data.requestId,
    status: event.data.status,
    attemptCount: event.data.attemptCount,
    batchId: event.data.batchId ?? document?.batchId,
  };

  if (event.data.status === 'running') {
    base.startedAt = event.data.timestamp;
  } else {
    base.startedAt = document?.startedAt;
    base.endedAt = event.data.timestamp;
  }

  return base;
}
