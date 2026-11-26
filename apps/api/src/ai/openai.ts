import {
  type AIStreamEvent,
  formatSSE,
  OpenAITransformer,
  SSE_DONE,
  transformUpstreamLine,
} from './sse';

export interface ChatMessageLike {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ForwardOptions {
  baseUrl: string;
  apiKey: string;
  model: string;
  messages: ChatMessageLike[];
  timeoutMs: number;
  signal?: AbortSignal;
  /** 便于测试注入 */
  fetchImpl?: typeof fetch;
}

/** 去掉 base url 末尾斜杠 */
export function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, '')}${path}`;
}

export interface IdleTimer {
  touch(): void;
  clear(): void;
}

/**
 * 可重置的空闲计时器：上游每次有数据时调用 touch() 重新计时。
 * 流式响应使用空闲超时，而不是固定总时长，避免长回答被中途截断。
 */
export function createIdleTimer(timeoutMs: number, onTimeout: () => void): IdleTimer {
  let handle: ReturnType<typeof setTimeout> | undefined = setTimeout(onTimeout, timeoutMs);
  return {
    touch() {
      if (handle !== undefined) clearTimeout(handle);
      handle = setTimeout(onTimeout, timeoutMs);
    },
    clear() {
      if (handle !== undefined) clearTimeout(handle);
      handle = undefined;
    },
  };
}

/**
 * 转发 OpenAI 兼容 /chat/completions（stream:true），逐行产出前端契约事件。
 * 网络/上游错误统一转成 {type:'error'} 事件，绝不假装成功。
 */
export async function* forwardChat(
  opts: ForwardOptions,
): AsyncGenerator<AIStreamEvent, UsageSnapshotLike, undefined> {
  const doFetch = opts.fetchImpl ?? fetch;
  const controller = new AbortController();
  const idle = createIdleTimer(opts.timeoutMs, () => controller.abort());
  const onOuterAbort = () => controller.abort();
  opts.signal?.addEventListener('abort', onOuterAbort);

  const transformer = new OpenAITransformer();
  try {
    let response: Response;
    try {
      response = await doFetch(joinUrl(opts.baseUrl, '/chat/completions'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${opts.apiKey}`,
        },
        body: JSON.stringify({
          model: opts.model,
          messages: opts.messages,
          stream: true,
          stream_options: { include_usage: true },
        }),
        signal: controller.signal,
      });
    } catch (err) {
      yield {
        type: 'error',
        error: describeError(err, '无法连接 AI 服务'),
      };
      return transformer.usage;
    }

    if (!response.ok) {
      const detail = await safeText(response);
      yield {
        type: 'error',
        error: `AI 服务返回 ${response.status}${detail ? `：${detail.slice(0, 300)}` : ''}`,
      };
      return transformer.usage;
    }
    if (!response.body) {
      yield { type: 'error', error: 'AI 服务未返回流式响应体' };
      return transformer.usage;
    }
    idle.touch();

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      idle.touch();
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        for (const event of transformUpstreamLine(line, transformer)) {
          yield event;
        }
      }
    }
    if (buffer.trim()) {
      for (const event of transformUpstreamLine(buffer, transformer)) {
        yield event;
      }
    }
    for (const event of transformer.flush()) {
      yield event;
    }
    return transformer.usage;
  } finally {
    idle.clear();
    opts.signal?.removeEventListener('abort', onOuterAbort);
  }
}

export interface UsageSnapshotLike {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export function describeError(err: unknown, fallback: string): string {
  if (err instanceof Error) {
    if (err.name === 'AbortError') return 'AI 服务请求超时';
    return err.message || fallback;
  }
  return fallback;
}

async function safeText(response: Response): Promise<string> {
  try {
    return (await response.text()).slice(0, 300);
  } catch {
    return '';
  }
}

export { formatSSE, SSE_DONE };
