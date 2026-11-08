/**
 * OpenAI 兼容流 → 前端 SSE 契约 的纯转换层（可单测，不依赖 Nest / 网络）。
 *
 * 前端契约（apps/web/src/lib/ai.ts）：
 *   data: {"type":"delta","text":"..."}
 *   data: {"type":"tool_call","toolCall":{"name":"...","arguments":{...}}}
 *   data: {"type":"error","error":"..."}
 *   data: [DONE]
 */

export interface AIToolCallLike {
  name: string;
  arguments: Record<string, unknown>;
}

export type AIStreamEvent =
  | { type: 'delta'; text: string }
  | { type: 'tool_call'; toolCall: AIToolCallLike }
  | { type: 'error'; error: string };

export function formatSSE(event: AIStreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export const SSE_DONE = 'data: [DONE]\n\n';

export interface ToolCallFragment {
  index?: number;
  id?: string;
  function?: { name?: string; arguments?: string };
}

export interface UpstreamChunk {
  choices?: {
    delta?: { content?: string | null; tool_calls?: ToolCallFragment[] };
    finish_reason?: string | null;
  }[];
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  } | null;
  error?: { message?: string; code?: string } | null;
}

export interface UsageSnapshot {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

/** 把一行 `data: {...}` 的 payload 解析成对象；无效返回 null */
export function parseSSEData(payload: string): unknown | null {
  if (!payload || payload === '[DONE]') return null;
  try {
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

/**
 * 增量转换器：累计 OpenAI 流式 chunk，产出前端契约事件。
 * - content delta → delta 事件
 * - tool_calls 分片按 index 聚合，流结束时统一 flush 成 tool_call 事件
 * - usage 累计到 usage 快照（供 AIUsageLog 落库）
 */
export class OpenAITransformer {
  private readonly pending = new Map<
    number,
    { id?: string; name: string; args: string }
  >();
  private snapshot: UsageSnapshot = {};

  push(chunk: unknown): AIStreamEvent[] {
    const events: AIStreamEvent[] = [];
    if (!chunk || typeof chunk !== 'object') return events;
    const data = chunk as UpstreamChunk;

    if (data.error) {
      events.push({
        type: 'error',
        error: data.error.message || '上游 AI 服务返回错误',
      });
      return events;
    }

    if (data.usage) {
      this.snapshot = {
        promptTokens: data.usage.prompt_tokens ?? this.snapshot.promptTokens,
        completionTokens: data.usage.completion_tokens ?? this.snapshot.completionTokens,
        totalTokens: data.usage.total_tokens ?? this.snapshot.totalTokens,
      };
    }

    for (const choice of data.choices ?? []) {
      const delta = choice.delta;
      if (!delta) continue;
      if (typeof delta.content === 'string' && delta.content.length > 0) {
        events.push({ type: 'delta', text: delta.content });
      }
      for (const fragment of delta.tool_calls ?? []) {
        const index = fragment.index ?? 0;
        const current = this.pending.get(index) ?? { name: '', args: '' };
        if (fragment.id) current.id = fragment.id;
        if (fragment.function?.name) current.name += fragment.function.name;
        if (fragment.function?.arguments) current.args += fragment.function.arguments;
        this.pending.set(index, current);
      }
    }
    return events;
  }

  /** 流结束时冲刷尚未发出的 tool_call */
  flush(): AIStreamEvent[] {
    const events: AIStreamEvent[] = [];
    for (const index of [...this.pending.keys()].sort((a, b) => a - b)) {
      const call = this.pending.get(index);
      if (!call) continue;
      events.push({
        type: 'tool_call',
        toolCall: { name: call.name || 'unknown_tool', arguments: safeParse(call.args) },
      });
    }
    this.pending.clear();
    return events;
  }

  get usage(): UsageSnapshot {
    return { ...this.snapshot };
  }
}

export function safeParse(text: string): Record<string, unknown> {
  if (!text.trim()) return {};
  try {
    const parsed: unknown = JSON.parse(text);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return { _raw: text };
  }
}

/** 把上游 SSE 的一行（`data: {...}`）转成前端事件；非 data 行返回 [] */
export function transformUpstreamLine(
  line: string,
  transformer: OpenAITransformer,
): AIStreamEvent[] {
  const trimmed = line.trim();
  if (!trimmed.startsWith('data:')) return [];
  const payload = trimmed.slice(5).trim();
  if (payload === '[DONE]') return [];
  const parsed = parseSSEData(payload);
  if (parsed === null) return [];
  return transformer.push(parsed);
}
