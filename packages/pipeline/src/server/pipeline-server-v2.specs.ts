import http from 'node:http';
import { createPipelineServerV2 } from './pipeline-server-v2.js';

describe('PipelineServerV2', () => {
  it('POST /command dispatches to engine', async () => {
    const server = await createPipelineServerV2();
    const calls: string[] = [];

    server.engine.registerCommandHandler('TestCommand', (cmd) => {
      calls.push(cmd.type);
      return [{ type: 'TestResult', data: {} }];
    });

    const port = await server.start();

    const response = await fetch(`http://localhost:${port}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'TestCommand', data: { key: 'value' } }),
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true });
    expect(calls).toEqual(['TestCommand']);

    await server.stop();
  });

  it('GET /health returns ok', async () => {
    const server = await createPipelineServerV2();
    const port = await server.start();

    const response = await fetch(`http://localhost:${port}/health`);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(expect.objectContaining({ status: 'ok' }));

    await server.stop();
  });

  it('GET /events returns SSE headers and streams events', async () => {
    const server = await createPipelineServerV2();

    server.engine.registerCommandHandler('Ping', () => [{ type: 'Pong', data: { value: 42 } }]);

    const port = await server.start();

    const { response, dataPromise, destroy } = await new Promise<{
      response: http.IncomingMessage;
      dataPromise: Promise<string>;
      destroy: () => void;
    }>((resolve) => {
      const req = http.get(`http://localhost:${port}/events`, (res) => {
        const chunks: string[] = [];
        const dataPromise = new Promise<string>((resolveData) => {
          res.on('data', (chunk: Buffer) => {
            chunks.push(chunk.toString());
            resolveData(chunks.join(''));
          });
        });
        resolve({ response: res, dataPromise, destroy: () => req.destroy() });
      });
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('text/event-stream');

    await fetch(`http://localhost:${port}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'Ping', data: {} }),
    });

    const text = await dataPromise;
    const parsed = JSON.parse(text.replace('data: ', '').trim());

    expect(parsed).toEqual({ type: 'Pong', data: { value: 42 } });

    destroy();
    await server.stop();
  });

  it('GET /registry returns registered handlers', async () => {
    const server = await createPipelineServerV2();
    server.engine.registerCommandHandler('A', () => []);
    server.engine.registerCommandHandler('B', () => []);

    const port = await server.start();
    const response = await fetch(`http://localhost:${port}/registry`);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.commands).toEqual(expect.arrayContaining(['A', 'B']));

    await server.stop();
  });
});
