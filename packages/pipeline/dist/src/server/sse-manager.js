export class SSEManager {
    constructor() {
        this.clients = new Map();
    }
    addClient(id, response, correlationIdFilter) {
        response.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
            'Access-Control-Allow-Origin': '*',
        });
        response.write(':\n\n');
        this.clients.set(id, {
            id,
            response,
            correlationIdFilter,
        });
        response.on('close', () => {
            this.removeClient(id);
        });
    }
    removeClient(id) {
        const client = this.clients.get(id);
        if (client !== undefined) {
            client.response.end();
            this.clients.delete(id);
        }
    }
    broadcast(event) {
        const data = JSON.stringify(event);
        const message = `data: ${data}\n\n`;
        const failedClientIds = [];
        for (const client of this.clients.values()) {
            if (this.shouldSendToClient(client, event)) {
                try {
                    client.response.write(message);
                }
                catch {
                    failedClientIds.push(client.id);
                }
            }
        }
        for (const id of failedClientIds) {
            this.removeClient(id);
        }
    }
    shouldSendToClient(client, event) {
        if (client.correlationIdFilter === undefined) {
            return true;
        }
        return event.correlationId === client.correlationIdFilter;
    }
    closeAll() {
        for (const client of this.clients.values()) {
            client.response.end();
        }
        this.clients.clear();
    }
}
//# sourceMappingURL=sse-manager.js.map