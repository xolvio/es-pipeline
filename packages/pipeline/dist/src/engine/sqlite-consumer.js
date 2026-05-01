import { dumbo } from '@event-driven-io/dumbo';
import { sqlite3DumboDriver } from '@event-driven-io/dumbo/sqlite3';
import { readMessagesBatch } from '@event-driven-io/emmett-sqlite';
export function createConsumer(store) {
    const handlers = new Map();
    let lastPosition = 0n;
    const pool = dumbo({ driver: sqlite3DumboDriver, fileName: store.fileName });
    return {
        on(eventType, handler) {
            handlers.set(eventType, handler);
        },
        async poll() {
            const { messages, currentGlobalPosition } = await readMessagesBatch(pool.execute, {
                after: lastPosition,
                batchSize: 1000,
            });
            for (const message of messages) {
                const handler = handlers.get(message.type);
                if (handler) {
                    handler({ type: message.type, data: message.data });
                }
            }
            if (messages.length > 0) {
                lastPosition = currentGlobalPosition;
            }
        },
    };
}
//# sourceMappingURL=sqlite-consumer.js.map