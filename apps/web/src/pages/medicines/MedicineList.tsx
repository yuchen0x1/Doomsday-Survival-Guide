import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../components/Icon';
import { DangerBadge, EmptyState, PageHeader, Tag } from '../../components/ui';
import { medicines, search } from '../../lib/knowledge';

/** 药物图鉴列表 */
export default function MedicineList() {
  const [cat, setCat] = useState('');
  const [query, setQuery] = useState('');

  const cats = useMemo(() => Array.from(new Set(medicines.map((m) => m.category))), []);
  const filtered = useMemo(() => {
    let list = query.trim()
      ? (search(query, 80, { kind: 'medicine' })
          .map((r) => medicines.find((m) => `medicine:${m.id}` === r.document.id))
          .filter(Boolean) as typeof medicines)
      : medicines;
    if (cat) list = list.filter((m) => m.category === cat);
    return list;
  }, [cat, query]);

  return (
    <div className="fade-in">
      <PageHeader
        icon="pill"
        title="药物图鉴"
        subtitle={`${medicines.length} 种常见药物知识 · 仅作科普参考，不构成用药建议 · 用药前请遵医嘱`}
        actions={
          <div className="relative w-full sm:w-56">
            <Icon
              name="search"
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)]"
            />
            <input
              className="field !pl-9"
              placeholder="搜索药名/用途…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        }
      />

      <div className="mb-4 rounded-[3px] border border-[var(--color-warn)] bg-[var(--color-warn-dim)]/40 px-4 py-2.5 text-[12.5px] text-[var(--color-warn)]">
        <Icon name="warning" size={14} className="mr-1.5 inline" />
        本栏目为药品知识介绍，<b>不提供任何处方与剂量建议</b>。紧急情况请拨打 120 或咨询医师/药师。
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        <Tag active={!cat} onClick={() => setCat('')}>
          全部 <span className="font-mono opacity-60">{medicines.length}</span>
        </Tag>
        {cats.map((c) => (
          <Tag key={c} active={cat === c} onClick={() => setCat(cat === c ? '' : c)}>
            {c}
          </Tag>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="pill" title="没有匹配的药物" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <Link
              key={m.id}
              to={`/medicines/${m.id}`}
              className="panel group flex flex-col p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--color-edge-hi)]"
            >
              <div className="flex items-center justify-between">
                <span className="micro-label">{m.category}</span>
                <DangerBadge level={m.meta.dangerLevel} small />
              </div>
              <h3 className="mt-2.5 text-[14.5px] font-semibold group-hover:text-[var(--color-sand)]">
                {m.name}
              </h3>
              {m.aliases.length > 0 && (
                <p className="mt-0.5 text-[11.5px] text-[var(--color-ink-faint)]">
                  {m.aliases.join('、')}
                </p>
              )}
              <p className="mt-2 line-clamp-2 flex-1 text-[12px] leading-relaxed text-[var(--color-ink-dim)]">
                {m.purpose}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1">
                {m.commonForms.slice(0, 3).map((f) => (
                  <Tag key={f}>{f}</Tag>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
