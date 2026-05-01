import type { Event } from '@xolvio/message-bus';
import type { Response } from 'express';
export declare class SSEManager {
    private clients;
    addClient(id: string, response: Response, correlationIdFilter?: string): void;
    removeClient(id: string): void;
    broadcast(event: Event): void;
    private shouldSendToClient;
    closeAll(): void;
}
//# sourceMappingURL=sse-manager.d.ts.map