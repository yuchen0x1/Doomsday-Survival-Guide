import type { AIAnswerStructure, AIToolCall } from '@apocalypse/core';
import { SearchIndex } from '@apocalypse/core';
import { searchDocuments } from './knowledge';

/**
 * AI 生存助手客户端。
 * - 在线且服务端可用：走 /api/ai/chat（SSE 流式，服务端持有 API Key）
 * - 离线或服务端不可用：自动降级为本地知识检索（不伪造 AI 输出）
 */

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface StreamHandlers {
  onDelta: (text: string) => void;
  onToolCall?: (call: AIToolCall) => void;
  onDone?: (full: string) => void;
  onError?: (message: string, degraded: boolean) => void;
}

/** 检查 AI 服务健康（服务端存在且配置了密钥） */
export async function checkAIHealth(): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch('/api/ai/health', { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return false;
    const data = (await res.json()) as { available: boolean };
    return !!data.available;
  } catch {
    return false;
  }
}

/** SSE 流式对话；失败时抛错由调用方降级 */
export async function streamChat(
  messages: ChatMessage[],
  handlers: StreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
    signal,
  });
  if (!res.ok || !res.body) {
    throw new Error(`AI 服务返回 ${res.status}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';

  const handleLine = async (line: string): Promise<boolean> => {
    if (!line.startsWith('data:')) return true;
    const payload = line.slice(5).trim();
    if (!payload || payload === '[DONE]') return true;
    let obj: { type: string; text?: string; toolCall?: AIToolCall; error?: string };
    try {
      obj = JSON.parse(payload) as typeof obj;
    } catch {
      /* 忽略不完整帧 */
      return true;
    }
    if (obj.type === 'delta' && obj.text) {
      full += obj.text;
      handlers.onDelta(obj.text);
    } else if (obj.type === 'tool_call' && obj.toolCall) {
      handlers.onToolCall?.(obj.toolCall);
    } else if (obj.type === 'error') {
      await reader.cancel().catch(() => undefined);
      if (handlers.onError) {
        handlers.onError(obj.error ?? '流式响应错误', false);
        return false;
      }
      throw new Error(obj.error ?? '流式响应错误');
    }
    return true;
  };

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!(await handleLine(line))) return;
    }
  }
  // 流结束时最后一个事件可能没有换行符，必须冲洗 decoder 与残留缓冲。
  buffer += decoder.decode();
  if (buffer.trim() && !(await handleLine(buffer))) return;
  handlers.onDone?.(full);
}

/* ---------------- 本地降级检索 ---------------- */

let localIndex: SearchIndex | null = null;

export function getLocalIndex(): SearchIndex {
  if (!localIndex) {
    localIndex = new SearchIndex().build(searchDocuments());
  }
  return localIndex;
}

/** 本地知识降级回答：明确标注来自本地知识库而非 AI */
export function localFallbackAnswer(question: string): string {
  const results = getLocalIndex().search(question, { limit: 5 });
  const lines: string[] = [
    '⚠️ **AI 服务当前不可用**（离线或服务端未配置）。以下内容来自本地离线知识库检索：',
    '',
    `**问题分析**：已就「${question.slice(0, 40)}」在本地知识库中检索。`,
  ];
  if (results.length === 0) {
    lines.push('', '**结果**：本地知识库中未找到匹配条目。请换个关键词，或联网后使用 AI 助手。');
  } else {
    lines.push('', '**检索到的相关知识**：');
    results.forEach((r, i) => {
      lines.push(`${i + 1}. **${r.document.title}**（${r.document.subtitle}）`);
    });
    lines.push(
      '',
      '**建议行动**：打开上述条目阅读完整内容；高危情况请优先远离危险源并拨打 120/119。',
      '**不确定性说明**：以上为关键词匹配结果，非 AI 分析，未做语义理解。',
    );
  }
  return lines.join('\n');
}

/* ---------------- 图片识别 ---------------- */

export interface IdentifyResult {
  ok: boolean;
  kind: 'plant' | 'animal';
  candidates: { name: string; scientificName?: string; confidence: number; matchedId?: string }[];
  features: string[];
  warning: string;
  uncertainty: string;
  needMoreFeatures: string[];
  error?: string;
}

/** 图片质量检查（客户端预检） */
export function checkImageQuality(file: File): { ok: boolean; reason?: string } {
  if (!file.type.startsWith('image/'))
    return { ok: false, reason: '仅支持图片文件（JPG/PNG/WebP）' };
  if (file.size > 5 * 1024 * 1024) return { ok: false, reason: '图片超过 5MB，请压缩后重试' };
  if (file.size < 5 * 1024) return { ok: false, reason: '图片过小，可能不是有效照片' };
  return { ok: true };
}

/**
 * 调用服务端识别接口。
 * 无法确定时返回低置信度 candidates 与明确的"身份未确认"警告。
 */
export async function identifyImage(file: File, kind: 'plant' | 'animal'): Promise<IdentifyResult> {
  const quality = checkImageQuality(file);
  if (!quality.ok) {
    return {
      ok: false,
      kind,
      candidates: [],
      features: [],
      warning: '',
      uncertainty: '',
      needMoreFeatures: [],
      error: quality.reason ?? '图片质量不合格',
    };
  }
  const base64 = await fileToBase64(file);
  try {
    const res = await fetch('/api/ai/identify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64, kind }),
    });
    if (!res.ok) throw new Error(`识别服务返回 ${res.status}`);
    return (await res.json()) as IdentifyResult;
  } catch (e) {
    return {
      ok: false,
      kind,
      candidates: [],
      features: [],
      warning: '',
      uncertainty: '',
      needMoreFeatures: [],
      error: e instanceof Error ? e.message : '识别服务不可用（离线或服务端未配置）',
    };
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('读取图片失败'));
    reader.readAsDataURL(file);
  });
}

/** 用识别候选在本地库中比对相似物种（步骤6-7：检索与比对） */
export function matchLocalSpecies(
  candidates: { name: string; confidence: number }[],
  kind: 'plant' | 'animal',
) {
  const idx = getLocalIndex();
  return candidates.map((c) => {
    const hits = idx.search(c.name, { limit: 3, kind: kind === 'plant' ? 'plant' : 'animal' });
    return { ...c, localMatches: hits.map((h) => h.document) };
  });
}

/** 结构化回答骨架（服务端不可用时的格式占位） */
export function emptyStructure(uncertainty: string): AIAnswerStructure {
  return {
    analysis: '',
    risks: [],
    priority: '',
    recommended: [],
    discouraged: [],
    relatedKnowledge: [],
    sources: [],
    uncertainty,
  };
}
