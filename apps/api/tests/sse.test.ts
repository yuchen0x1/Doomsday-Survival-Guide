import { describe, expect, it } from 'vitest';
import {
  OpenAITransformer,
  SSE_DONE,
  formatSSE,
  parseSSEData,
  safeParse,
  transformUpstreamLine,
  type AIStreamEvent,
} from '../src/ai/sse';

/**
 * 前端契约（apps/web/src/lib/ai.ts）：
 *   data: {"type":"delta","text":"..."}
 *   data: {"type":"tool_call","toolCall":{...}}
 *   data: {"type":"error","error":"..."}
 *   data: [DONE]
 */
describe('SSE 前端事件契约', () => {
  it('delta 事件', () => {
    expect(formatSSE({ type: 'delta', text: '你好' })).toBe(
      'data: {"type":"delta","text":"你好"}\n\n',
    );
  });

  it('tool_call 事件（含 name / arguments）', () => {
    const out = formatSSE({
      type: 'tool_call',
      toolCall: { name: 'search', arguments: { q: '净水', limit: 3 } },
    });
    expect(out).toBe(
      'data: {"type":"tool_call","toolCall":{"name":"search","arguments":{"q":"净水","limit":3}}}\n\n',
    );
    const obj = JSON.parse(out.slice(5).trim()) as {
      type: string;
      toolCall: { name: string; arguments: Record<string, unknown> };
    };
    expect(obj.type).toBe('tool_call');
    expect(obj.toolCall.name).toBe('search');
    expect(obj.toolCall.arguments).toEqual({ q: '净水', limit: 3 });
  });

  it('error 事件', () => {
    const out = formatSSE({ type: 'error', error: 'AI 服务未配置' });
    expect(out).toBe('data: {"type":"error","error":"AI 服务未配置"}\n\n');
    expect(JSON.parse(out.slice(5).trim()).type).toBe('error');
  });

  it('SSE_DONE 结束帧', () => {
    expect(SSE_DONE).toBe('data: [DONE]\n\n');
  });

  it('所有事件帧都以 data: 开头、以两个换行结尾，且可被 JSON.parse', () => {
    const events: AIStreamEvent[] = [
      { type: 'delta', text: 'A' },
      { type: 'tool_call', toolCall: { name: 't', arguments: {} } },
      { type: 'error', error: 'E' },
    ];
    for (const event of events) {
      const out = formatSSE(event);
      expect(out.startsWith('data: ')).toBe(true);
      expect(out.endsWith('\n\n')).toBe(true);
      expect(out.split('\n').length).toBe(3); // "data: ...", "", ""
      expect(JSON.parse(out.slice(5).trim())).toBeTruthy();
    }
  });
});

describe('OpenAITransformer（上游 chunk → 前端事件）', () => {
  it('content delta 逐块转成 delta 事件', () => {
    const tr = new OpenAITransformer();
    expect(tr.push({ choices: [{ delta: { content: '末日' } }] })).toEqual([
      { type: 'delta', text: '末日' },
    ]);
    expect(tr.push({ choices: [{ delta: { content: '生存' } }] })).toEqual([
      { type: 'delta', text: '生存' },
    ]);
    expect(tr.flush()).toEqual([]);
  });

  it('空 content / null / 非 data 行 / 无效 JSON / [DONE] 全部忽略', () => {
    const tr = new OpenAITransformer();
    expect(tr.push({ choices: [{ delta: { content: null } }] })).toEqual([]);
    expect(tr.push({ choices: [{ delta: { content: '' } }] })).toEqual([]);
    expect(tr.push(null)).toEqual([]);
    expect(tr.push('garbage')).toEqual([]);
    expect(transformUpstreamLine('event: ping', tr)).toEqual([]);
    expect(transformUpstreamLine('data: [DONE]', tr)).toEqual([]);
    expect(transformUpstreamLine('', tr)).toEqual([]);
    expect(transformUpstreamLine('data: {not json', tr)).toEqual([]);
  });

  it('tool_calls 分片按 index 聚合，flush 输出一个 tool_call 事件', () => {
    const tr = new OpenAITransformer();
    tr.push({
      choices: [
        {
          delta: {
            tool_calls: [
              { index: 0, id: 'call_1', function: { name: 'search', arguments: '{"q":' } },
            ],
          },
        },
      ],
    });
    tr.push({
      choices: [
        {
          delta: {
            tool_calls: [{ index: 0, function: { arguments: '"净水"}' } }],
          },
        },
      ],
    });
    expect(tr.flush()).toEqual([
      { type: 'tool_call', toolCall: { name: 'search', arguments: { q: '净水' } } },
    ]);
    // flush 后清空，不重复产出
    expect(tr.flush()).toEqual([]);
  });

  it('上游 error 对象转成 error 事件（不伪造成功）', () => {
    const tr = new OpenAITransformer();
    expect(tr.push({ error: { message: '额度不足' } })).toEqual([
      { type: 'error', error: '额度不足' },
    ]);
  });

  it('usage 累计成快照', () => {
    const tr = new OpenAITransformer();
    tr.push({ usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 } });
    expect(tr.usage).toEqual({
      promptTokens: 10,
      completionTokens: 5,
      totalTokens: 15,
    });
  });

  it('transformUpstreamLine 产出的 delta 可直接 formatSSE 成契约帧', () => {
    const tr = new OpenAITransformer();
    const events = transformUpstreamLine(
      'data: {"choices":[{"delta":{"content":"A"}}]}',
      tr,
    );
    expect(events).toEqual([{ type: 'delta', text: 'A' }]);
    expect(formatSSE(events[0])).toBe('data: {"type":"delta","text":"A"}\n\n');
  });

  it('完整一轮：delta 事件 + flush 的 tool_call + formatSSE', () => {
    const tr = new OpenAITransformer();
    const events: AIStreamEvent[] = [];
    for (const line of [
      'data: {"choices":[{"delta":{"content":"检索中"}}]}',
      'data: {"choices":[{"delta":{"tool_calls":[{"index":0,"function":{"name":"kb","arguments":"{}"}}]}}]}',
      'data: [DONE]',
    ]) {
      events.push(...transformUpstreamLine(line, tr));
    }
    events.push(...tr.flush());
    expect(events).toEqual([
      { type: 'delta', text: '检索中' },
      { type: 'tool_call', toolCall: { name: 'kb', arguments: {} } },
    ]);
    expect(events.map(formatSSE)).toEqual([
      'data: {"type":"delta","text":"检索中"}\n\n',
      'data: {"type":"tool_call","toolCall":{"name":"kb","arguments":{}}}\n\n',
    ]);
  });
});

describe('parseSSEData / safeParse', () => {
  it('parseSSEData', () => {
    expect(parseSSEData('{"a":1}')).toEqual({ a: 1 });
    expect(parseSSEData('[DONE]')).toBeNull();
    expect(parseSSEData('')).toBeNull();
    expect(parseSSEData('broken')).toBeNull();
  });

  it('safeParse', () => {
    expect(safeParse('{"x":1}')).toEqual({ x: 1 });
    expect(safeParse('   ')).toEqual({});
    expect(safeParse('[1,2]')).toEqual({});
    expect(safeParse('null')).toEqual({});
    expect(safeParse('not-json')).toEqual({ _raw: 'not-json' });
  });
});
