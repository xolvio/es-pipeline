export class PipelineRuntime {
    constructor(descriptor) {
        this.descriptor = descriptor;
        this.handlerIndex = this.buildHandlerIndex();
    }
    getHandlersForEvent(eventType) {
        return this.handlerIndex.get(eventType) ?? [];
    }
    getMatchingHandlers(event) {
        const handlers = this.getHandlersForEvent(event.type);
        return handlers.filter((handler) => {
            if (!handler.predicate)
                return true;
            return handler.predicate(event);
        });
    }
    async handleEvent(event, ctx) {
        const handlers = this.getMatchingHandlers(event);
        for (const handler of handlers) {
            switch (handler.type) {
                case 'emit':
                    await this.executeEmitHandler(handler, event, ctx);
                    break;
                case 'custom':
                    await this.executeCustomHandler(handler, event, ctx);
                    break;
                case 'run-await':
                    await this.executeRunAwaitHandler(handler, event, ctx);
                    break;
                case 'foreach-phased':
                    if (ctx.startPhased !== undefined) {
                        await ctx.startPhased(handler, event);
                    }
                    else {
                        await this.executeForEachPhasedHandler(handler, event, ctx);
                    }
                    break;
            }
        }
    }
    async executeEmitHandler(handler, event, ctx) {
        await Promise.all(handler.commands.map(async (command) => {
            const data = typeof command.data === 'function' ? command.data(event) : command.data;
            await ctx.sendCommand(command.commandType, data);
        }));
    }
    async executeCustomHandler(handler, event, ctx) {
        await handler.handler(event, ctx);
    }
    async executeRunAwaitHandler(handler, event, ctx) {
        const commands = typeof handler.commands === 'function' ? handler.commands(event) : handler.commands;
        for (const command of commands) {
            const data = typeof command.data === 'function' ? command.data(event) : command.data;
            await ctx.sendCommand(command.commandType, data);
        }
    }
    async executeForEachPhasedHandler(handler, event, ctx) {
        const items = handler.itemsSelector(event);
        const phaseGroups = {};
        for (const phase of handler.phases) {
            phaseGroups[phase] = [];
        }
        for (const item of items) {
            const phase = handler.classifier(item);
            phaseGroups[phase]?.push(item);
        }
        for (const phase of handler.phases) {
            for (const item of phaseGroups[phase]) {
                const command = handler.emitFactory(item, phase, event);
                await ctx.sendCommand(command.commandType, command.data);
            }
        }
    }
    buildHandlerIndex() {
        const index = new Map();
        for (const handler of this.descriptor.handlers) {
            if (handler.type === 'settled' || handler.type === 'accepts') {
                continue;
            }
            const existing = index.get(handler.eventType) ?? [];
            existing.push(handler);
            index.set(handler.eventType, existing);
        }
        return index;
    }
}
//# sourceMappingURL=pipeline-runtime.js.map