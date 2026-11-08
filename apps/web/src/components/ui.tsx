import type { ReactNode } from 'react';
import { useEffect } from 'react';
import type { DangerLevel, Credibility } from '@apocalypse/core';
import { DANGER_LABELS } from '@apocalypse/core';
import { Icon } from './Icon';
import { useApp } from '../lib/store';

/* ---------- 危险等级徽章 ---------- */
export function DangerBadge({ level, small = false }: { level: DangerLevel; small?: boolean }) {
  const color =
    level === 'L0' ? 'var(--color-info)' :
    level === 'L1' ? 'var(--color-sand)' :
    level === 'L2' ? 'var(--color-warn)' :
    'var(--color-danger)';
  return (
    <span
      className="danger-badge inline-flex items-center gap-1"
      style={{ color, fontSize: small ? 9 : 10 }}
      title={`危险等级 ${level}：${DANGER_LABELS[level]}`}
    >
      {level} · {DANGER_LABELS[level]}
    </span>
  );
}

/* ---------- 可信度徽章 ---------- */
export function CredBadge({ level }: { level: Credibility }) {
  const color = { A: 'var(--color-moss-hi)', B: 'var(--color-info)', C: 'var(--color-warn)', D: 'var(--color-danger)' }[level];
  const text = { A: 'A 权威', B: 'B 可靠', C: 'C 待确认', D: 'D 未核实' }[level];
  return <span className="danger-badge" style={{ color }}>{text}</span>;
}

/* ---------- 审核状态 ---------- */
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    draft: { label: '草稿', color: 'var(--color-ink-faint)' },
    pending_review: { label: '待审核', color: 'var(--color-warn)' },
    reviewed: { label: '已审核', color: 'var(--color-info)' },
    published: { label: '已发布', color: 'var(--color-moss-hi)' },
    retired: { label: '已下架', color: 'var(--color-danger)' },
  };
  const m = map[status] ?? map.draft;
  return <span className="danger-badge" style={{ color: m.color }}>{m.label}</span>;
}

/* ---------- 卡片 ---------- */
export function Panel({ children, className = '', accent, onClick }: {
  children: ReactNode; className?: string; accent?: 'moss' | 'sand' | 'danger'; onClick?: () => void;
}) {
  const accentClass = accent === 'sand' ? 'panel-accent-sand' : accent === 'danger' ? 'panel-accent-danger' : accent ? 'panel-accent' : '';
  return (
    <div className={`panel ${accentClass} ${className}`} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}>
      {children}
    </div>
  );
}

/* ---------- 链接式卡片 ---------- */
export function LinkCard({ href, icon, title, subtitle, meta, dangerLevel, onClick }: {
  href?: string; icon: string; title: string; subtitle?: string; meta?: ReactNode;
  dangerLevel?: DangerLevel; onClick?: () => void;
}) {
  const inner = (
    <>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] border border-[var(--color-edge)] bg-[var(--color-pit)] text-[var(--color-moss-hi)]">
          <Icon name={icon} size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[14px] font-semibold text-[var(--color-ink)]">{title}</h3>
            {dangerLevel && <DangerBadge level={dangerLevel} small />}
          </div>
          {subtitle && <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-[var(--color-ink-dim)]">{subtitle}</p>}
          {meta && <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[var(--color-ink-faint)]">{meta}</div>}
        </div>
        <Icon name="chevron" size={14} className="mt-2 text-[var(--color-ink-faint)]" />
      </div>
    </>
  );
  const cls = 'panel block cursor-pointer p-3.5 transition-colors hover:border-[var(--color-edge-hi)] hover:bg-[var(--color-riser)]';
  return href ? <a href={href} className={cls}>{inner}</a> : <div className={cls} onClick={onClick} role="button" tabIndex={0}>{inner}</div>;
}

/* ---------- 空状态 ---------- */
export function EmptyState({ icon = 'box', title, hint, action }: {
  icon?: string; title: string; hint?: string; action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded border border-dashed border-[var(--color-edge)] bg-[var(--color-pit)] px-6 py-12 text-center">
      <Icon name={icon} size={30} className="text-[var(--color-ink-faint)]" />
      <p className="text-sm font-medium text-[var(--color-ink-dim)]">{title}</p>
      {hint && <p className="max-w-md text-xs leading-relaxed text-[var(--color-ink-faint)]">{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/* ---------- 加载 ---------- */
export function Spinner({ size = 18 }: { size?: number }) {
  return (
    <span className="inline-block animate-spin rounded-full border-2 border-[var(--color-edge)] border-t-[var(--color-moss-hi)]" style={{ width: size, height: size }} />
  );
}

/* ---------- 进度条 ---------- */
export function Progress({ value, label }: { value: number; label?: string }) {
  return (
    <div className="w-full">
      {label && (
        <div className="mb-1 flex justify-between text-[11px] text-[var(--color-ink-dim)]">
          <span>{label}</span><span className="font-mono">{Math.round(value)}%</span>
        </div>
      )}
      <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>
    </div>
  );
}

/* ---------- 统计卡片（首页真实数据） ---------- */
export function StatCard({ label, value, unit, icon, accent = 'moss', hint }: {
  label: string; value: number | string; unit?: string; icon: string;
  accent?: 'moss' | 'sand' | 'danger' | 'info'; hint?: string;
}) {
  const colorMap = {
    moss: 'var(--color-moss-hi)', sand: 'var(--color-sand)',
    danger: 'var(--color-danger)', info: 'var(--color-info)',
  };
  return (
    <Panel className="p-3.5" accent={accent === 'danger' ? 'danger' : accent === 'sand' ? 'sand' : 'moss'}>
      <div className="flex items-center justify-between">
        <span className="micro-label">{label}</span>
        <Icon name={icon} size={15} style={{ color: colorMap[accent] }} />
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="font-mono text-[26px] font-bold leading-none text-[var(--color-ink)]">{value}</span>
        {unit && <span className="text-[11px] text-[var(--color-ink-faint)]">{unit}</span>}
      </div>
      {hint && <p className="mt-1.5 text-[11px] text-[var(--color-ink-faint)]">{hint}</p>}
    </Panel>
  );
}

/* ---------- 模态框 ---------- */
export function Modal({ open, title, onClose, children, width = 520 }: {
  open: boolean; title: string; onClose: () => void; children: ReactNode; width?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-[2px] fade-in" onClick={onClose}>
      <div
        className="panel max-h-[85vh] w-full overflow-y-auto p-5 fade-in"
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold tracking-wide">{title}</h2>
          <button className="btn btn-ghost !p-1.5" onClick={onClose} aria-label="关闭"><Icon name="close" size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------- 确认对话框 ---------- */
export function Confirm({ open, title, message, confirmText = '确认', danger, onConfirm, onCancel }: {
  open: boolean; title: string; message: string; confirmText?: string;
  danger?: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <Modal open={open} title={title} onClose={onCancel} width={400}>
      <p className="text-[13px] leading-relaxed text-[var(--color-ink-dim)]">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button className="btn" onClick={onCancel}>取消</button>
        <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>{confirmText}</button>
      </div>
    </Modal>
  );
}

/* ---------- Toast 容器 ---------- */
export function ToastHost() {
  const toasts = useApp((s) => s.toasts);
  const dismiss = useApp((s) => s.dismissToast);
  if (toasts.length === 0) return null;
  const toneColor = {
    info: 'var(--color-info)', success: 'var(--color-moss-hi)',
    warn: 'var(--color-warn)', error: 'var(--color-danger)',
  };
  return (
    <div className="pointer-events-none fixed bottom-20 left-1/2 z-[60] flex -translate-x-1/2 flex-col gap-2 md:bottom-6">
      {toasts.map((t) => (
        <div key={t.id} className="panel pointer-events-auto flex items-center gap-2 px-4 py-2.5 text-[13px] shadow-lg fade-in"
          style={{ borderColor: toneColor[t.tone] }} onClick={() => dismiss(t.id)}>
          <span style={{ color: toneColor[t.tone] }}>
            <Icon name={t.tone === 'error' ? 'warning' : t.tone === 'success' ? 'check' : 'info'} size={14} />
          </span>
          {t.message}
        </div>
      ))}
    </div>
  );
}

/* ---------- 分段标签 ---------- */
export function Tabs<T extends string>({ tabs, active, onChange }: {
  tabs: { key: T; label: string; count?: number }[]; active: T; onChange: (k: T) => void;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-[var(--color-edge)]">
      {tabs.map((t) => (
        <button key={t.key}
          className={`relative whitespace-nowrap px-3.5 py-2 text-[13px] transition-colors ${
            active === t.key ? 'text-[var(--color-sand)]' : 'text-[var(--color-ink-dim)] hover:text-[var(--color-ink)]'
          }`}
          onClick={() => onChange(t.key)}
        >
          {t.label}{t.count !== undefined && <span className="ml-1.5 font-mono text-[10px] opacity-70">{t.count}</span>}
          {active === t.key && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-[var(--color-sand)]" />}
        </button>
      ))}
    </div>
  );
}

/* ---------- 页头 ---------- */
export function PageHeader({ title, subtitle, icon, actions, danger }: {
  title: string; subtitle?: string; icon: string; actions?: ReactNode; danger?: boolean;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-[4px] border border-[var(--color-edge)] bg-[var(--color-panel)]"
          style={{ color: danger ? 'var(--color-danger)' : 'var(--color-sand)' }}>
          <Icon name={icon} size={20} />
        </span>
        <div>
          <h1 className="text-[19px] font-bold tracking-wide">{title}</h1>
          {subtitle && <p className="mt-0.5 text-[12.5px] text-[var(--color-ink-dim)]">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ---------- 标签 ---------- */
export function Tag({ children, onClick, active }: { children: ReactNode; onClick?: () => void; active?: boolean }) {
  const cls = `inline-flex items-center gap-1 rounded-[2px] border px-2 py-0.5 text-[11px] transition-colors ${
    active
      ? 'border-[var(--color-moss-hi)] bg-[var(--color-moss-dim)] text-[var(--color-ink)]'
      : 'border-[var(--color-edge)] bg-[var(--color-pit)] text-[var(--color-ink-dim)] hover:border-[var(--color-edge-hi)]'
  }`;
  return onClick ? <button className={cls} onClick={onClick}>{children}</button> : <span className={cls}>{children}</span>;
}
