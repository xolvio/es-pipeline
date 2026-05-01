export class AwaitTracker {
    constructor(options) {
        this.readModel = options.readModel;
        this.onEventEmit = options.onEventEmit;
    }
    async startAwaiting(correlationId, keys) {
        await this.emitEvent({
            type: 'AwaitStarted',
            data: { correlationId, keys },
        });
    }
    async isPending(correlationId) {
        const state = await this.readModel.getAwaitState(correlationId);
        return state !== null;
    }
    async getPendingKeys(correlationId) {
        const state = await this.readModel.getAwaitState(correlationId);
        return state ? state.pendingKeys : [];
    }
    async markComplete(correlationId, key, result) {
        await this.emitEvent({
            type: 'AwaitItemCompleted',
            data: { correlationId, key, result },
        });
    }
    async isComplete(correlationId) {
        const state = await this.readModel.getAwaitState(correlationId);
        return state !== null && state.pendingKeys.length === 0;
    }
    async getResults(correlationId) {
        const state = await this.readModel.getAwaitState(correlationId);
        if (state === null) {
            return {};
        }
        await this.emitEvent({
            type: 'AwaitCompleted',
            data: { correlationId },
        });
        return state.results;
    }
    async emitEvent(event) {
        await this.onEventEmit(event);
    }
}
//# sourceMappingURL=await-tracker.js.map