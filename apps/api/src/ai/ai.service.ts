import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { describeError, forwardChat, joinUrl, type ChatMessageLike } from './openai';
import { SSE_DONE, formatSSE } from './sse';

export interface IdentifyCandidate {
  name: string;
  scientificName?: string;
  confidence: number;
  matchedId?: string;
}

export interface IdentifyResult {
  ok: boolean;
  kind: 'plant' | 'animal';
  candidates: IdentifyCandidate[];
  features: string[];
  warning: string;
  uncertainty: string;
  needMoreFeatures: string[];
  error?: string;
}

const IDENTIFY_WARNING =
  '识别结果由 AI 生成，置信度仅供参考；身份未确认前禁止食用、药用或触碰。';

@Injectable()
export class AIService {
  private readonly logger = new Logger('AI');

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private get baseUrl(): string {
    return this.config.get<string>('AI_BASE_URL') ?? 'https://api.xiaomimimo.com/v1';
  }
  private get apiKey(): string {
    return (this.config.get<string>('AI_API_KEY') ?? '').trim();
  }
  private get model(): string {
    return this.config.get<string>('AI_MODEL') ?? 'mimo-v2.6-Flash';
  }
  private get timeoutMs(): number {
    const raw = Number(this.config.get('AI_TIMEOUT_MS') ?? 60000);
    return Number.isFinite(raw) && raw > 0 ? raw : 60000;
  }

  /** 是否配置了服务端密钥（绝不外呼探测） */
  isAvailable(): boolean {
    return this.apiKey.length > 0;
  }

  health(): { available: boolean; model?: string } {
    return this.isAvailable()
      ? { available: true, model: this.model }
      : { available: false };
  }

  /**
   * SSE 流式对话：把上游 OpenAI 兼容流转换为前端契约。
   * 未配置密钥时返回 error 事件（而不是假装成功）。
   */
  async chat(
    messages: ChatMessageLike[],
    res: Response,
    userId?: string,
  ): Promise<void> {
    res.status(200);
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    if (typeof res.flushHeaders === 'function') res.flushHeaders();

    const started = Date.now();
    let status = 'ok';
    let error: string | undefined;
    let usage: { promptTokens?: number; completionTokens?: number; totalTokens?: number } = {};

    try {
      if (!this.isAvailable()) {
        status = 'unavailable';
        error = 'AI 服务未配置（服务端缺少 AI_API_KEY），已停止请求';
        res.write(formatSSE({ type: 'error', error }));
        res.write(SSE_DONE);
        return;
      }

      const stream = forwardChat({
        baseUrl: this.baseUrl,
        apiKey: this.apiKey,
        model: this.model,
        messages,
        timeoutMs: this.timeoutMs,
      });
      const iterator = stream[Symbol.asyncIterator]();
      for (;;) {
        const step = await iterator.next();
        if (step.done) {
          usage = step.value ?? {};
          break;
        }
        const event = step.value;
        if (event.type === 'error') {
          status = 'error';
          error = event.error;
        }
        res.write(formatSSE(event));
      }
      res.write(SSE_DONE);
    } catch (err) {
      status = 'error';
      error = describeError(err, 'AI 流式响应中断');
      try {
        res.write(formatSSE({ type: 'error', error }));
        res.write(SSE_DONE);
      } catch {
        /* 客户端已断开 */
      }
    } finally {
      try {
        res.end();
      } catch {
        /* ignore */
      }
      void this.logUsage({
        userId,
        endpoint: 'chat',
        status,
        latencyMs: Date.now() - started,
        error,
        usage,
      });
    }
  }

  /** 图片识别（无密钥时明确报错，绝不伪造识别结果） */
  async identify(
    image: string,
    kind: 'plant' | 'animal',
    userId?: string,
  ): Promise<IdentifyResult> {
    const started = Date.now();
    if (!this.isAvailable()) {
      throw new ServiceUnavailableException({
        code: 'AI_NOT_CONFIGURED',
        message: '识别服务未配置（服务端缺少 AI_API_KEY），无法进行识别',
      });
    }
    const subject = kind === 'plant' ? '植物' : '动物';
    const system =
      `你是末日生存指南的${subject}识别助手。只输出一个 JSON 对象，不要输出任何其他文字，格式：` +
      `{"candidates":[{"name":"中文名","scientificName":"学名或空字符串","confidence":0.0}],"features":["已观察到的形态特征"],"needMoreFeatures":["需要补充拍摄的部位"],"uncertainty":"不确定性说明"}` +
      `。规则：无法确定时 confidence 必须低于 0.5，并在 uncertainty 中写明“身份未确认”；` +
      `禁止建议食用、药用或接触；宁可给出低置信度也不得编造。`;

    try {
      const response = await fetch(joinUrl(this.baseUrl, '/chat/completions'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: system },
            {
              role: 'user',
              content: [
                { type: 'text', text: `请识别这张${subject}图片。` },
                { type: 'image_url', image_url: { url: image } },
              ],
            },
          ],
          temperature: 0.2,
        }),
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new ServiceUnavailableException({
          code: 'AI_UPSTREAM_ERROR',
          message: `识别服务返回 ${response.status}${text ? `：${text.slice(0, 200)}` : ''}`,
        });
      }
      const data = (await response.json()) as {
        choices?: { message?: { content?: string } }[];
        usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
      };
      const content = data.choices?.[0]?.message?.content ?? '';
      const parsed = extractJson(content);
      if (!parsed) {
        return {
          ok: false,
          kind,
          candidates: [],
          features: [],
          warning: IDENTIFY_WARNING,
          uncertainty: '模型返回无法解析，身份未确认',
          needMoreFeatures: ['主体清晰的正面照片', '叶片/花/果实等细节'],
          error: '模型返回无法解析为识别结果',
        };
      }
      const candidates: IdentifyCandidate[] = Array.isArray(parsed.candidates)
        ? parsed.candidates
            .filter((c): c is Record<string, unknown> => Boolean(c) && typeof c === 'object')
            .map((c) => ({
              name: String(c.name ?? '未知'),
              scientificName:
                typeof c.scientificName === 'string' && c.scientificName
                  ? c.scientificName
                  : undefined,
              confidence: clampConfidence(c.confidence),
            }))
        : [];
      void this.logUsage({
        userId,
        endpoint: 'identify',
        status: 'ok',
        latencyMs: Date.now() - started,
        usage: {
          promptTokens: data.usage?.prompt_tokens,
          completionTokens: data.usage?.completion_tokens,
          totalTokens: data.usage?.total_tokens,
        },
      });
      return {
        ok: candidates.length > 0,
        kind,
        candidates,
        features: toStringArray(parsed.features),
        warning: IDENTIFY_WARNING,
        uncertainty:
          typeof parsed.uncertainty === 'string' && parsed.uncertainty
            ? parsed.uncertainty
            : 'AI 识别存在不确定性，身份未确认前不得采信',
        needMoreFeatures: toStringArray(parsed.needMoreFeatures),
      };
    } catch (err) {
      if (err instanceof ServiceUnavailableException) throw err;
      const message = describeError(err, '识别服务不可用');
      void this.logUsage({
        userId,
        endpoint: 'identify',
        status: 'error',
        latencyMs: Date.now() - started,
        error: message,
      });
      throw new ServiceUnavailableException({
        code: 'AI_UPSTREAM_ERROR',
        message,
      });
    }
  }

  private async logUsage(input: {
    userId?: string;
    endpoint: string;
    status: string;
    latencyMs: number;
    error?: string;
    usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
  }): Promise<void> {
    try {
      await this.prisma.aIUsageLog.create({
        data: {
          userId: input.userId ?? null,
          endpoint: input.endpoint,
          model: this.model,
          status: input.status,
          promptTokens: input.usage?.promptTokens ?? null,
          completionTokens: input.usage?.completionTokens ?? null,
          totalTokens: input.usage?.totalTokens ?? null,
          latencyMs: input.latencyMs,
          error: input.error ?? null,
        },
      });
    } catch (err) {
      this.logger.warn(`AI 用量落库失败：${describeError(err, 'unknown')}`);
    }
  }
}

function clampConfidence(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return 0.3;
  return Math.min(1, Math.max(0, n));
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((v) => String(v)).filter((v) => v.trim().length > 0)
    : [];
}

/** 从模型输出中提取 JSON 对象（容忍 ```json 围栏与前后废话） */
export function extractJson(text: string): Record<string, unknown> | null {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/.exec(text);
  const candidate = fenced?.[1] ?? text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    const parsed: unknown = JSON.parse(candidate.slice(start, end + 1));
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}
