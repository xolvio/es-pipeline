import { pipelineConfig } from '../../config/pipeline-config.js';
import { createKanbanFullPipeline } from './kanban-full.pipeline.js';
export default pipelineConfig({
    plugins: [
        '@xolvio/checks',
        '@xolvio/server-generator-apollo-emmett',
        '@xolvio/narrative',
        '@xolvio/generate-react-client',
        '@xolvio/server-implementer',
        '@xolvio/app-implementer',
        '@xolvio/component-implementor-react',
        '@xolvio/dev-server',
    ],
    pipeline: createKanbanFullPipeline(),
});
//# sourceMappingURL=kanban-todo.config.js.map