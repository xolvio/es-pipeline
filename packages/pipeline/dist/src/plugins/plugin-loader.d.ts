export interface CommandHandlerMetadata {
    name: string;
    alias?: string;
    description?: string;
    events?: string[];
    fields?: Record<string, unknown>;
    handle: (command: unknown, context?: unknown) => Promise<unknown>;
}
export interface PluginLoaderDeps {
    existsSync: (path: string) => boolean;
    importModule: (path: string) => Promise<unknown>;
}
export declare class PluginLoader {
    private readonly workspaceRoot;
    private readonly deps;
    constructor(workspaceRoot?: string, deps?: PluginLoaderDeps);
    loadPlugin(packageName: string): Promise<CommandHandlerMetadata[]>;
    loadPlugins(packageNames: string[]): Promise<CommandHandlerMetadata[]>;
    private tryLoadModule;
    private hasCommands;
    private hasNamedHandlerExports;
    private extractCommands;
    private extractNamedHandlers;
}
//# sourceMappingURL=plugin-loader.d.ts.map