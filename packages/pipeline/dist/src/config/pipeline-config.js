import { adaptHandlers } from '../plugins/handler-adapter.js';
import { PluginLoader } from '../plugins/plugin-loader.js';
export function pipelineConfig(config) {
    return config;
}
export async function loadPipelineConfig(config, workspaceRoot) {
    const loader = new PluginLoader(workspaceRoot);
    const pluginHandlers = await loader.loadPlugins(config.plugins);
    const handlers = adaptHandlers(pluginHandlers);
    return {
        handlers,
        pipeline: config.pipeline,
    };
}
//# sourceMappingURL=pipeline-config.js.map