import type { Pipeline } from '../builder/define';
import type { CommandHandlerWithMetadata } from '../server/pipeline-server';
export interface PipelineConfig {
    plugins: string[];
    pipeline: Pipeline;
}
export interface LoadedPipelineConfig {
    handlers: CommandHandlerWithMetadata[];
    pipeline: Pipeline;
}
export declare function pipelineConfig(config: PipelineConfig): PipelineConfig;
export declare function loadPipelineConfig(config: PipelineConfig, workspaceRoot?: string): Promise<LoadedPipelineConfig>;
//# sourceMappingURL=pipeline-config.d.ts.map