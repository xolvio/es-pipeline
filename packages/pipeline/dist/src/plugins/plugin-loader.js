import { existsSync as fsExistsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
function isValidHandler(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        'name' in obj &&
        typeof obj.name === 'string' &&
        'handle' in obj &&
        typeof obj.handle === 'function');
}
function isHandlerExportKey(key) {
    return key.endsWith('CommandHandler') || key.endsWith('commandHandler');
}
function isHandlerObject(value) {
    return typeof value === 'object' && value !== null && 'name' in value && 'handle' in value;
}
function hasCommandsArray(obj) {
    return 'COMMANDS' in obj && Array.isArray(obj.COMMANDS);
}
function getDefaultExport(obj) {
    if ('default' in obj && typeof obj.default === 'object' && obj.default !== null) {
        return obj.default;
    }
    return null;
}
const defaultDeps = {
    existsSync: fsExistsSync,
    importModule: (path) => import(path),
};
export class PluginLoader {
    constructor(workspaceRoot, deps) {
        const currentDir = dirname(fileURLToPath(import.meta.url));
        this.workspaceRoot = workspaceRoot ?? resolve(currentDir, '../../../../');
        this.deps = deps ?? defaultDeps;
    }
    async loadPlugin(packageName) {
        const handlers = [];
        try {
            const module = await this.tryLoadModule(packageName);
            if (module === null) {
                return [];
            }
            const commands = this.extractCommands(module);
            for (const cmd of commands) {
                if (isValidHandler(cmd)) {
                    handlers.push({
                        name: cmd.name,
                        alias: cmd.alias,
                        description: cmd.description,
                        events: cmd.events,
                        fields: cmd.fields,
                        handle: cmd.handle,
                    });
                }
            }
        }
        catch {
            return [];
        }
        return handlers;
    }
    async loadPlugins(packageNames) {
        const allHandlers = [];
        for (const packageName of packageNames) {
            const handlers = await this.loadPlugin(packageName);
            allHandlers.push(...handlers);
        }
        return allHandlers;
    }
    async tryLoadModule(packageName) {
        const shortName = packageName.replace('@xolvio/', '');
        const distPaths = ['dist', 'dist/src'];
        const entryPoints = ['index.js', 'node.js'];
        for (const distPath of distPaths) {
            for (const entry of entryPoints) {
                const workspacePath = resolve(this.workspaceRoot, 'packages', shortName, distPath, entry);
                if (this.deps.existsSync(workspacePath)) {
                    const mod = await this.deps.importModule(workspacePath);
                    if (this.hasCommands(mod)) {
                        return mod;
                    }
                }
            }
        }
        for (const distPath of distPaths) {
            for (const entry of entryPoints) {
                const nodeModulesPath = resolve(this.workspaceRoot, 'node_modules', packageName, distPath, entry);
                if (this.deps.existsSync(nodeModulesPath)) {
                    const mod = await this.deps.importModule(nodeModulesPath);
                    if (this.hasCommands(mod)) {
                        return mod;
                    }
                }
            }
        }
        try {
            return await this.deps.importModule(packageName);
        }
        catch {
            return null;
        }
    }
    hasCommands(mod) {
        if (typeof mod !== 'object' || mod === null) {
            return false;
        }
        const obj = mod;
        if (hasCommandsArray(obj)) {
            return true;
        }
        const defaultMod = getDefaultExport(obj);
        if (defaultMod !== null && hasCommandsArray(defaultMod)) {
            return true;
        }
        return this.hasNamedHandlerExports(obj);
    }
    hasNamedHandlerExports(obj) {
        for (const key of Object.keys(obj)) {
            if (isHandlerExportKey(key) && isHandlerObject(obj[key])) {
                return true;
            }
        }
        return false;
    }
    extractCommands(module) {
        if (typeof module !== 'object' || module === null) {
            return [];
        }
        const mod = module;
        if (hasCommandsArray(mod)) {
            return mod.COMMANDS;
        }
        const defaultMod = getDefaultExport(mod);
        if (defaultMod !== null && hasCommandsArray(defaultMod)) {
            return defaultMod.COMMANDS;
        }
        return this.extractNamedHandlers(mod);
    }
    extractNamedHandlers(mod) {
        const handlers = [];
        for (const [key, value] of Object.entries(mod)) {
            if (isHandlerExportKey(key) && isHandlerObject(value)) {
                handlers.push(value);
            }
        }
        return handlers;
    }
}
//# sourceMappingURL=plugin-loader.js.map