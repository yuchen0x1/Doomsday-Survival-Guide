import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';

// AIService 把 PrismaService 仅用于构造参数类型；用 mock 彻底隔离
// @prisma/client 与真实数据库，保证这是纯函数 / 可注入 mock 的单测。
vi.mock('../src/prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { AIService } from '../src/ai/ai.service';
import { describeError, forwardChat, joinUrl } from '../src/ai/openai';
import { formatSSE, SSE_DONE } from '../src/ai/sse';

function makeService(apiKey?: string): AIService {
  const config = {
    get: (key: string): string | undefined => (key === 'AI_API_KEY' ? apiKey : undefined),
  };
  const prisma = {
    // chat() 的 finally 会异步落一条 AIUsageLog，mock 掉即可（不连库）
    aIUsageLog: { create: async () => ({}) },
  };
  return new AIService(config as never, prisma as never);
}

function makeRes() {
  const writes: string[] = [];
  const res = {
    status: () => res,
    setHeader: () => res,
    flushHeaders: () => undefined,
    write: (chunk: unknown) => {
      writes.push(String(chunk));
      return true;
    },
    end: () => res,
  };
  return { res, writes };
}

const baseOpts = {
  baseUrl: 'https://mock.local/v1',
  apiKey: 'sk-test',
  model: 'mock-model',
  messages: [{ role: 'user' as const, content: 'hi' }],
  timeoutMs: 5000,
};

describe('AIService 无 API Key 降级（明确报错，绝不伪造成功）', () => {
  it('health().available === false（无 key / 空串 / 纯空白 key）', () => {
    expect(makeService(undefined).health()).toEqual({ available: false });
    expect(makeService('').health()).toEqual({ available: false });
    expect(makeService('   ').health()).toEqual({ available: false });
  });

  it('配置了 key 时 health() 返回 available=true 与默认 model', () => {
    expect(makeService('sk-test').health()).toEqual({
      available: true,
      model: 'mimo-v2.6-Flash',
    });
  });

  it('chat 未配置 key：只发 error + DONE，绝无 delta / tool_call', async () => {
    const { res, writes } = makeRes();
    await makeService(undefined).chat([{ role: 'user', content: '你好' }], res as never);

    expect(writes).toHaveLength(2);
    expect(writes[0]).toBe(
      'data: {"type":"error","error":"AI 服务未配置（服务端缺少 AI_API_KEY），已停止请求"}\n\n',
    );
    expect(writes[1]).toBe(SSE_DONE);
    const body = writes.join('');
    expect(body).not.toContain('"type":"delta"');
    expect(body).not.toContain('"type":"tool_call"');
    expect(JSON.parse(writes[0].slice(5).trim()).type).toBe('error');
  });
});

describe('forwardChat：mock fetch 把流式 delta 转成前端 SSE 事件', () => {
  function streamResponse(chunks: string[], status = 200): Response {
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
        controller.close();
      },
    });
    return new Response(body, { status });
  }

  it('上游 content delta 逐行转成 delta 事件，并可序列化为前端 SSE 帧', async () => {
    const fetchMock = vi.fn(async () =>
      streamResponse([
        'data: {"choices":[{"delta":{"content":"末日"},"finish_reason":null}]}\n\n',
        'data: {"choices":[{"delta":{"content":"生存"},"finish_reason":null}]}\n\n',
        'data: {"choices":[{"delta":{},"finish_reason":"stop"}]}\n\n',
        'data: [DONE]\n\n',
      ]),
    );

    const events = [];
    for await (const event of forwardChat({
      ...baseOpts,
      fetchImpl: fetchMock as never,
    })) {
      events.push(event);
    }

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(events).toEqual([
      { type: 'delta', text: '末日' },
      { type: 'delta', text: '生存' },
    ]);
    expect(events.map(formatSSE)).toEqual([
      'data: {"type":"delta","text":"末日"}\n\n',
      'data: {"type":"delta","text":"生存"}\n\n',
    ]);
  });

  it('请求 URL / Bearer 鉴权 / stream:true 正确', async () => {
    const fetchMock = vi.fn(async () => streamResponse(['data: [DONE]\n\n']));
    for await (const _event of forwardChat({
      ...baseOpts,
      fetchImpl: fetchMock as never,
    })) {
      /* drain */
    }
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://mock.local/v1/chat/completions');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer sk-test');
    expect(JSON.parse(init.body as string).stream).toBe(true);
  });

  it('上游非 2xx：产出 error 事件，不伪造成功', async () => {
    const fetchMock = vi.fn(async () => new Response('quota exceeded', { status: 429 }));
    const events = [];
    for await (const event of forwardChat({
      ...baseOpts,
      fetchImpl: fetchMock as never,
    })) {
      events.push(event);
    }
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('error');
    expect((events[0] as { error: string }).error).toContain('429');
  });

  it('网络异常：产出 error 事件，不伪造成功', async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error('ECONNREFUSED');
    });
    const events = [];
    for await (const event of forwardChat({
      ...baseOpts,
      fetchImpl: fetchMock as never,
    })) {
      events.push(event);
    }
    expect(events).toEqual([{ type: 'error', error: 'ECONNREFUSED' }]);
  });
});

describe('joinUrl / describeError', () => {
  it('joinUrl 去掉 base 末尾斜杠', () => {
    expect(joinUrl('https://a.com/v1/', '/chat/completions')).toBe(
      'https://a.com/v1/chat/completions',
    );
    expect(joinUrl('https://a.com/v1', '/chat/completions')).toBe(
      'https://a.com/v1/chat/completions',
    );
    expect(joinUrl('https://a.com/v1///', '/x')).toBe('https://a.com/v1/x');
  });

  it('describeError', () => {
    expect(describeError(new Error('boom'), 'fallback')).toBe('boom');
    expect(describeError('not-an-error', 'fallback')).toBe('fallback');
    const aborted = new Error('aborted');
    aborted.name = 'AbortError';
    expect(describeError(aborted, 'fallback')).toBe('AI 服务请求超时');
  });
});
