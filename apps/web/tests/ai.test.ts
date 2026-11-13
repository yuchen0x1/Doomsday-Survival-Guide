import { afterEach, describe, expect, it, vi } from 'vitest';
import { type ChatMessage, streamChat } from '../src/lib/ai';

const messages: ChatMessage[] = [{ role: 'user', content: 'hi' }];

function sseResponse(events: string[]): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const e of events) controller.enqueue(encoder.encode(e));
      controller.close();
    },
  });
  return new Response(stream, { status: 200 });
}

function stubFetch(events: string[]): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => sseResponse(events)),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('streamChat', () => {
  it('delta 帧触发 onDelta，结束时 onDone 返回全文', async () => {
    stubFetch([
      'data: {"type":"delta","text":"你好"}\n',
      'data: {"type":"delta","text":"世界"}\n',
      'data: [DONE]\n',
    ]);
    const deltas: string[] = [];
    let done = '';
    await streamChat(messages, {
      onDelta: (t) => deltas.push(t),
      onDone: (full) => {
        done = full;
      },
    });
    expect(deltas).toEqual(['你好', '世界']);
    expect(done).toBe('你好世界');
  });

  it('error 帧走 onError 通道而非抛错', async () => {
    stubFetch(['data: {"type":"error","error":"上游超时"}\n']);
    const errs: string[] = [];
    await streamChat(messages, {
      onDelta: () => {},
      onError: (msg) => {
        errs.push(msg);
      },
    });
    expect(errs).toEqual(['上游超时']);
  });

  it('未提供 onError 时 error 帧抛错', async () => {
    stubFetch(['data: {"type":"error","error":"boom"}\n']);
    await expect(streamChat(messages, { onDelta: () => {} })).rejects.toThrow('boom');
  });

  it('不完整帧被忽略，不影响后续帧', async () => {
    stubFetch(['data: {broken-json\n', 'data: {"type":"delta","text":"ok"}\n']);
    const deltas: string[] = [];
    await streamChat(messages, {
      onDelta: (t) => deltas.push(t),
    });
    expect(deltas).toEqual(['ok']);
  });

  it('HTTP 非 2xx 抛错', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('bad', { status: 502 })),
    );
    await expect(streamChat(messages, { onDelta: () => {} })).rejects.toThrow('502');
  });
});
