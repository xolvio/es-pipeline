import express from 'express';
import { createPipelineEngine } from '../engine/pipeline-engine.js';
export declare function createPipelineServerV2(config?: {
    port?: number;
}): Promise<{
    engine: Awaited<ReturnType<typeof createPipelineEngine>>;
    app: ReturnType<typeof express>;
    start(): Promise<number>;
    stop(): Promise<void>;
}>;
//# sourceMappingURL=pipeline-server-v2.d.ts.map