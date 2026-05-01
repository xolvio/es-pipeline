import type { CommandHandlerWithMetadata } from '../server/pipeline-server';
import type { CommandHandlerMetadata } from './plugin-loader';
export declare function adaptHandler(source: CommandHandlerMetadata): CommandHandlerWithMetadata;
export declare function adaptHandlers(sources: CommandHandlerMetadata[]): CommandHandlerWithMetadata[];
//# sourceMappingURL=handler-adapter.d.ts.map