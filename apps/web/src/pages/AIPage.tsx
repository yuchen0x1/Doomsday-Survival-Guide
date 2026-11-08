import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { PageHeader, Panel, Tag, Spinner, EmptyState } from '../components/ui';
import { useApp } from '../lib/store';
import { checkAIHealth, streamChat, localFallbackAnswer, type ChatMessage } from '../lib/ai';
import { listConversations, saveConversation, uid } from '../lib/db';
import type { AIConversation } from '@apocalypse/core';

/**
 * AI 生存助手：流式对话 + 工具调用提示 + 离线降级本地检索。
 * 服务端持有 API Key；离线/无服务时明确降级，不伪造 AI 输出。
 */
export default function AIPage() {
  const { online, aiAvailable, setAiAvailable, toast } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [convId, setConvId] = useState<string>(uid());
  const [convList, setConvList] = useState<AIConversation[]>([]);
  const [toolCalls, setToolCalls] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    checkAIHealth().then(setAiAvailable);
    listConversations().then(setConvList);
  }, [setAiAvailable]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || streaming) return;
    setInput('');
    const nextMsgs: ChatMessage[] = [...messages, { role: 'user', content }];
    setMessages(nextMsgs);
    setStreaming(true);
    setToolCalls([]);

    // AI 不可用 → 本地知识库降级
    if (!online || aiAvailable === false) {
      setTimeout(() => {
        const fallback = localFallbackAnswer(content);
        setMessages([...nextMsgs, { role: 'assistant', content: fallback }]);
        setStreaming(false);
      }, 300);
      return;
    }

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    let acc = '';
    setMessages([...nextMsgs, { role: 'assistant', content: '' }]);

    try {
      await streamChat(
        nextMsgs,
        {
          onDelta: (d) => {
            acc += d;
            setMessages([...nextMsgs, { role: 'assistant', content: acc }]);
          },
          onToolCall: (c) => {
            setToolCalls((t) => [...t, c.name]);
          },
          onError: (msg) => {
            // 服务端异常 → 降级本地检索（明确标注）
            const fallback = localFallbackAnswer(content);
            setMessages([...nextMsgs, { role: 'assistant', content: `（AI 服务异常：${msg}）\n\n${fallback}` }]);
          },
        },
        ctrl.signal,
      );
    } catch {
      if (!ctrl.signal.aborted) {
        const fallback = localFallbackAnswer(content);
        setMessages([...nextMsgs, { role: 'assistant', content: `（无法连接 AI 服务，已切换本地知识检索）\n\n${fallback}` }]);
        setAiAvailable(false);
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const saveConv = async () => {
    if (messages.length === 0) return;
    const conv: AIConversation = {
      id: convId, title: messages[0]?.content.slice(0, 24) ?? '新对话',
      messages: messages.map((m, i) => ({ id: `${i}`, role: m.role, content: m.content, createdAt: new Date().toISOString() })),
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    await saveConversation(conv);
    setConvList(await listConversations());
    toast('对话已保存到本地', 'success');
  };

  const loadConv = (c: AIConversation) => {
    setMessages(c.messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })));
    setConvId(c.id);
  };

  const suggestions = ['洪水来了我该往哪撤？', '如何在野外快速净化水源？', '被蛇咬了第一步做什么？', '家庭应急包要准备什么？', '识别这种植物能不能吃？'];

  const degraded = !online || aiAvailable === false;

  return (
    <div className="fade-in">
      <PageHeader
        icon="bot"
        title="AI 生存助手"
        subtitle={degraded
          ? '当前为离线降级模式：使用本地知识库关键词检索，不提供 AI 生成分析'
          : 'MiMo-V2.6-Flash · 流式回答 · 工具调用检索正式知识库 · API Key 仅存于服务端'}
        actions={
          <>
            <span className="danger-badge" style={{ color: degraded ? 'var(--color-warn)' : 'var(--color-moss-hi)' }}>
              {degraded ? '⚠ 本地检索模式' : '● AI 在线'}
            </span>
            <button className="btn" onClick={saveConv} disabled={messages.length === 0}><Icon name="copy" size={14} /> 保存对话</button>
            <button className="btn btn-danger" onClick={() => { setMessages([]); setConvId(uid()); }}><Icon name="trash" size={14} /> 新对话</button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="flex min-h-[55vh] flex-col">
          <Panel className="flex flex-1 flex-col p-0 overflow-hidden">
            {/* 消息区 */}
            <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: '60vh' }}>
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--color-moss)] bg-[var(--color-moss-dim)]">
                    <Icon name="bot" size={28} className="text-[var(--color-moss-hi)]" />
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold">需要什么生存建议？</p>
                    <p className="mt-1.5 max-w-md text-[12.5px] leading-relaxed text-[var(--color-ink-faint)]">
                      AI 会先检索正式知识库再回答；高危问题优先给风险规避建议。
                      {degraded && ' 当前离线，将使用本地知识库检索。'}
                    </p>
                  </div>
                  <div className="flex max-w-lg flex-wrap justify-center gap-2">
                    {suggestions.map((s) => (
                      <button key={s} className="btn !py-1.5 text-[12.5px]" onClick={() => send(s)}>{s}</button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[86%] rounded-[4px] px-3.5 py-2.5 text-[13.5px] leading-[1.85] ${
                        m.role === 'user'
                          ? 'border border-[var(--color-moss)] bg-[var(--color-moss-dim)]'
                          : 'border border-[var(--color-edge)] bg-[var(--color-pit)]'
                      }`}>
                        {m.role === 'assistant' && (
                          <div className="mb-1.5 flex items-center gap-1.5 micro-label">
                            <Icon name="bot" size={12} /> SURVIVAL AI
                          </div>
                        )}
                        <div className="whitespace-pre-wrap">{m.content}
                          {streaming && i === messages.length - 1 && m.role === 'assistant' && (
                            <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-[var(--color-sand)]" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {toolCalls.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pl-1">
                      {Array.from(new Set(toolCalls)).map((t) => (
                        <span key={t} className="danger-badge flex items-center gap-1" style={{ color: 'var(--color-info)' }}>
                          <Icon name="database" size={10} /> {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            {/* 输入区 */}
            <div className="border-t border-[var(--color-edge)] p-3">
              <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); send(); }}>
                <textarea
                  className="field min-h-[46px] flex-1 resize-none"
                  rows={1}
                  placeholder={streaming ? 'AI 回答中…' : '描述你的处境或问题（Enter 发送，Shift+Enter 换行）'}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
                  }}
                  disabled={streaming}
                />
                {streaming ? (
                  <button type="button" className="btn btn-danger !px-4" onClick={() => abortRef.current?.abort()}>
                    <Icon name="stop" size={15} /> 停止
                  </button>
                ) : (
                  <button type="submit" className="btn btn-primary !px-4" disabled={!input.trim()}>
                    <Icon name="send" size={15} /> 发送
                  </button>
                )}
              </form>
              <p className="mt-2 text-[11px] text-[var(--color-ink-faint)]">
                AI 回答仅供参考，不能替代专业医疗、消防与救援。紧急情况请拨打 120 / 119。
              </p>
            </div>
          </Panel>
        </div>

        {/* 右栏：历史会话 + 能力 */}
        <div className="flex flex-col gap-4">
          <Panel className="p-4">
            <span className="micro-label">历史对话（本地）</span>
            <div className="mt-2.5 flex flex-col gap-1.5">
              {convList.length === 0 ? (
                <p className="text-[12px] text-[var(--color-ink-faint)]">暂无保存的对话</p>
              ) : convList.map((c) => (
                <button key={c.id} className="flex items-center gap-2 rounded-[3px] px-2.5 py-2 text-left text-[12.5px] hover:bg-[var(--color-riser)]"
                  onClick={() => loadConv(c)}>
                  <Icon name="bot" size={13} className="shrink-0 text-[var(--color-ink-faint)]" />
                  <span className="truncate">{c.title}</span>
                </button>
              ))}
            </div>
          </Panel>

          <Panel className="p-4">
            <span className="micro-label">工具调用能力</span>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {['search_knowledge', 'search_plants', 'search_animals', 'search_first_aid', 'search_items', 'search_skills', 'calculate_supplies', 'get_offline_status'].map((t) => (
                <span key={t} className="danger-badge" style={{ color: 'var(--color-moss-hi)' }}>{t}</span>
              ))}
            </div>
          </Panel>

          <Panel className="p-4">
            <span className="micro-label">离线时的行为</span>
            <ul className="mt-2.5 flex flex-col gap-1.5 text-[12px] text-[var(--color-ink-dim)]">
              <li>· 自动切换本地知识检索</li>
              <li>· 基础功能（图鉴/急救/搜索）不受影响</li>
              <li>· 不伪造 AI 回答，明确标注来源</li>
              <li>· 联网后自动恢复 AI 能力</li>
            </ul>
            <Link to="/offline" className="mt-3 block text-[12px] text-[var(--color-sand)] hover:underline">管理离线知识包 →</Link>
          </Panel>
        </div>
      </div>
    </div>
  );
}
