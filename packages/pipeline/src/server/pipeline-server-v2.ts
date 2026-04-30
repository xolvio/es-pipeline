import { createServer } from 'node:http';
import cors from 'cors';
import express from 'express';
import { createPipelineEngine } from '../engine/pipeline-engine.js';

export async function createPipelineServerV2(config?: { port?: number }): Promise<{
  engine: Awaited<ReturnType<typeof createPipelineEngine>>;
  app: ReturnType<typeof express>;
  start(): Promise<number>;
  stop(): Promise<void>;
}> {
  const engine = await createPipelineEngine();
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  const server = createServer(app);

  app.post('/command', async (req, res) => {
    const { type, data } = req.body;
    await engine.dispatch({ type, data });
    res.json({ ok: true });
  });

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  app.get('/registry', (_req, res) => {
    res.json({ commands: engine.registeredCommands() });
  });

  app.get('/events', (_req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.flushHeaders();

    let connected = true;

    const listener = (event: { type: string; data: Record<string, unknown> }) => {
      if (connected) {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      }
    };

    engine.onEvent(listener);

    res.on('close', () => {
      connected = false;
    });
  });

  return {
    engine,
    app,
    async start(): Promise<number> {
      const port = config?.port ?? 0;
      return new Promise((resolve) => {
        server.listen(port, () => {
          const addr = server.address();
          const actualPort = typeof addr === 'object' && addr ? addr.port : port;
          resolve(actualPort);
        });
      });
    },
    async stop(): Promise<void> {
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
      await engine.close();
    },
  };
}
