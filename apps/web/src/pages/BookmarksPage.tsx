import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DANGER_LABELS, type BookmarkKind } from '@apocalypse/core';
import { Icon } from '../components/Icon';
import { PageHeader, Tabs, Tag, EmptyState, Panel, Modal, Confirm } from '../components/ui';
import { useApp } from '../lib/store';
import { resolveRef, resolveRefs } from '../lib/knowledge';
import { exportAllData } from '../lib/db';

const KIND_LABELS: Record<BookmarkKind, string> = {
  article: '知识', plant: '植物', animal: '动物', insect: '昆虫', medicine: '药物',
  first_aid: '急救', skill: '技能', supply: '物资', scenario: '场景', hazard: '危险',
};

/** 收藏与知识手册：收藏 / 标签 / 笔记 / 历史 / 手册导出 */
export default function BookmarksPage() {
  const { bookmarks, history, notes, updateBookmarkMeta, removeBookmarkById, addNote, editNote, removeNote, clearHistory, toast } = useApp();
  const [tab, setTab] = useState<'bookmarks' | 'notes' | 'history'>('bookmarks');
  const [kindFilter, setKindFilter] = useState<BookmarkKind | ''>('');
  const [noteModal, setNoteModal] = useState<{ id?: string; title: string; body: string } | null>(null);
  const [delTarget, setDelTarget] = useState<{ type: 'bookmark' | 'note'; id: string; name: string } | null>(null);
  const [handbookIds, setHandbookIds] = useState<string[]>([]);
  const [handbookOpen, setHandbookOpen] = useState(false);

  const filtered = useMemo(
    () => (kindFilter ? bookmarks.filter((b) => b.kind === kindFilter) : bookmarks),
    [bookmarks, kindFilter],
  );
  const kindCounts = useMemo(() => {
    const m = new Map<string, number>();
    bookmarks.forEach((b) => m.set(b.kind, (m.get(b.kind) ?? 0) + 1));
    return m;
  }, [bookmarks]);

  const toggleHandbook = (id: string) =>
    setHandbookIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const printHandbook = () => {
    setHandbookOpen(true);
    setTimeout(() => window.print(), 400);
  };

  const exportData = async () => {
    const json = await exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `survival-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast('数据已导出', 'success');
  };

  return (
    <div className="fade-in">
      <PageHeader
        icon="bookmark"
        title="收藏与知识手册"
        subtitle={`${bookmarks.length} 条收藏 · ${notes.length} 条笔记 · ${history.length} 条历史 · 全部本地保存`}
        actions={
          <>
            <button className="btn" onClick={exportData}><Icon name="download" size={14} /> 导出数据</button>
            <button className="btn btn-sand" disabled={handbookIds.length === 0} onClick={printHandbook}>
              <Icon name="print" size={14} /> 导出手册（{handbookIds.length}）
            </button>
          </>
        }
      />

      <Tabs
        active={tab} onChange={setTab}
        tabs={[
          { key: 'bookmarks', label: '我的收藏', count: bookmarks.length },
          { key: 'notes', label: '笔记', count: notes.length },
          { key: 'history', label: '阅读历史', count: history.length },
        ]}
      />

      <div className="mt-4">
        {tab === 'bookmarks' && (
          <>
            <div className="mb-3 flex flex-wrap gap-1.5">
              <Tag active={!kindFilter} onClick={() => setKindFilter('')}>全部</Tag>
              {Array.from(kindCounts.entries()).map(([k, n]) => (
                <Tag key={k} active={kindFilter === k} onClick={() => setKindFilter(kindFilter === (k as BookmarkKind) ? '' : (k as BookmarkKind))}>
                  {KIND_LABELS[k as BookmarkKind]} <span className="font-mono opacity-60">{n}</span>
                </Tag>
              ))}
            </div>

            {filtered.length === 0 ? (
              <EmptyState icon="bookmark" title="还没有收藏" hint="在任意知识详情页点击「收藏」，内容会出现在这里，支持自定义笔记与手册导出。" />
            ) : (
              <div className="flex flex-col gap-2.5">
                {filtered.map((b) => {
                  const ref = resolveRef(b.refId);
                  return (
                    <Panel key={b.id} className="p-3.5">
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="flex cursor-pointer items-center gap-1.5 text-[11.5px] text-[var(--color-ink-faint)]" title="加入手册导出">
                          <input type="checkbox" checked={handbookIds.includes(b.id)} onChange={() => toggleHandbook(b.id)}
                            className="accent-[var(--color-moss-hi)]" />
                          手册
                        </label>
                        <span className="danger-badge" style={{ color: 'var(--color-info)' }}>{KIND_LABELS[b.kind]}</span>
                        {ref ? (
                          <Link to={ref.href} className="flex-1 text-[14px] font-medium hover:text-[var(--color-sand)]">{b.title}</Link>
                        ) : (
                          <span className="flex-1 text-[14px] font-medium text-[var(--color-ink-faint)]">{b.title}（已下架）</span>
                        )}
                        <span className="font-mono text-[11px] text-[var(--color-ink-faint)]">{b.createdAt.slice(0, 10)}</span>
                        <button className="btn !px-2 !py-1" title="编辑笔记" onClick={() => setNoteModal({ id: b.id, title: b.title, body: b.note ?? '' })}>
                          <Icon name="edit" size={13} />
                        </button>
                        <button className="btn btn-danger !px-2 !py-1" title="删除收藏"
                          onClick={() => setDelTarget({ type: 'bookmark', id: b.id, name: b.title })}>
                          <Icon name="trash" size={13} />
                        </button>
                      </div>
                      {b.note && <p className="mt-2 rounded-[3px] bg-[var(--color-pit)] px-3 py-2 text-[12.5px] text-[var(--color-ink-dim)]">📝 {b.note}</p>}
                    </Panel>
                  );
                })}
              </div>
            )}
          </>
        )}

        {tab === 'notes' && (
          <>
            <div className="mb-3 flex justify-end">
              <button className="btn btn-primary" onClick={() => setNoteModal({ title: '', body: '' })}>
                <Icon name="plus" size={14} /> 新建笔记
              </button>
            </div>
            {notes.length === 0 ? (
              <EmptyState icon="edit" title="暂无笔记" hint="记录你的生存计划、避难点、物资位置等私人信息，仅存本机。" />
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {notes.map((n) => (
                  <Panel key={n.id} className="flex flex-col p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-[14px] font-semibold">{n.title}</h3>
                      <div className="flex gap-1">
                        <button className="btn !px-1.5 !py-1" onClick={() => setNoteModal({ id: n.id, title: n.title, body: n.body })}><Icon name="edit" size={12} /></button>
                        <button className="btn btn-danger !px-1.5 !py-1" onClick={() => setDelTarget({ type: 'note', id: n.id, name: n.title })}><Icon name="trash" size={12} /></button>
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-4 flex-1 whitespace-pre-wrap text-[12.5px] leading-relaxed text-[var(--color-ink-dim)]">{n.body}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex gap-1">{n.tags.map((t) => <Tag key={t}>{t}</Tag>)}</div>
                      <span className="font-mono text-[10.5px] text-[var(--color-ink-faint)]">{n.updatedAt.slice(0, 10)}</span>
                    </div>
                  </Panel>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'history' && (
          <>
            <div className="mb-3 flex justify-end">
              <button className="btn btn-danger" onClick={() => clearHistory().then(() => toast('历史已清空', 'info'))}>
                <Icon name="trash" size={14} /> 清空历史
              </button>
            </div>
            {history.length === 0 ? (
              <EmptyState icon="history" title="暂无阅读历史" />
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {history.map((h) => {
                  const ref = resolveRef(h.refId);
                  return (
                    <Link key={h.refId + h.at} to={ref?.href ?? '/knowledge'} className="panel flex items-center gap-3 px-3.5 py-2.5 hover:border-[var(--color-edge-hi)]">
                      <span className="danger-badge" style={{ color: 'var(--color-ink-faint)' }}>{KIND_LABELS[h.kind]}</span>
                      <span className="flex-1 truncate text-[13px]">{h.title}</span>
                      <span className="font-mono text-[11px] text-[var(--color-ink-faint)]">{h.at.slice(0, 16).replace('T', ' ')}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* 笔记编辑 */}
      <Modal open={!!noteModal} title={noteModal?.id ? '编辑笔记 / 收藏备注' : '新建笔记'} onClose={() => setNoteModal(null)}>
        {noteModal && (
          <div className="flex flex-col gap-3.5">
            <label className="text-[12.5px] text-[var(--color-ink-dim)]">
              标题
              <input className="field mt-1.5" value={noteModal.title} disabled={!!noteModal.id && tab === 'bookmarks'}
                onChange={(e) => setNoteModal({ ...noteModal, title: e.target.value })} />
            </label>
            <label className="text-[12.5px] text-[var(--color-ink-dim)]">
              内容
              <textarea className="field mt-1.5 min-h-[140px] resize-y" value={noteModal.body}
                onChange={(e) => setNoteModal({ ...noteModal, body: e.target.value })} placeholder="记录你的计划、地点、提醒…" />
            </label>
            <div className="flex justify-end gap-2">
              <button className="btn" onClick={() => setNoteModal(null)}>取消</button>
              <button className="btn btn-primary" onClick={async () => {
                if (noteModal.id) {
                  if (tab === 'bookmarks') await updateBookmarkMeta(noteModal.id, { note: noteModal.body });
                  else await editNote(noteModal.id, { body: noteModal.body });
                } else {
                  if (!noteModal.title.trim()) { toast('请填写标题', 'warn'); return; }
                  await addNote({ title: noteModal.title, body: noteModal.body, tags: [] });
                }
                setNoteModal(null);
                toast('已保存', 'success');
              }}><Icon name="check" size={14} /> 保存</button>
            </div>
          </div>
        )}
      </Modal>

      {/* 手册打印视图 */}
      <div className="print-only hidden">
        <h1 style={{ fontSize: 22, margin: '0 0 4px' }}>我的生存知识手册</h1>
        <p style={{ fontSize: 12, color: '#555' }}>导出时间 {new Date().toLocaleString('zh-CN')} · APOCALYPSE SURVIVAL</p>
        {handbookIds.map((id) => {
          const b = bookmarks.find((x) => x.id === id);
          if (!b) return null;
          const ref = resolveRef(b.refId);
          return (
            <div key={id} style={{ marginBottom: 18, breakInside: 'avoid' }}>
              <h2 style={{ fontSize: 16, borderBottom: '1px solid #ccc', paddingBottom: 4 }}>{b.title}</h2>
              <p style={{ fontSize: 12, color: '#666' }}>类型：{KIND_LABELS[b.kind]}{ref ? ` · 链接：${window.location.origin}${ref.href}` : ''}</p>
              {b.note && <p style={{ fontSize: 13 }}>{b.note}</p>}
            </div>
          );
        })}
      </div>

      <Confirm
        open={!!delTarget} danger
        title={delTarget?.type === 'bookmark' ? '删除收藏' : '删除笔记'}
        message={`确定删除「${delTarget?.name}」吗？`}
        confirmText="删除"
        onCancel={() => setDelTarget(null)}
        onConfirm={async () => {
          if (!delTarget) return;
          if (delTarget.type === 'bookmark') await removeBookmarkById(delTarget.id);
          else await removeNote(delTarget.id);
          setDelTarget(null);
          toast('已删除', 'info');
        }}
      />
    </div>
  );
}
