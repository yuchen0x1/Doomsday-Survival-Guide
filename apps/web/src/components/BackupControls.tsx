import { useRef, useState } from 'react';
import { BACKUP_STORES, MAX_BACKUP_BYTES, parseBackup, STORE_LABELS } from '../lib/backup';
import { exportAllData, importAllData } from '../lib/db';
import { useApp } from '../lib/store';
import { Icon } from './Icon';
import { Modal } from './ui';

export function downloadText(content: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function BackupControls() {
  const toast = useApp((s) => s.toast);
  const input = useRef<HTMLInputElement>(null);
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<{
    json: string;
    preview: ReturnType<typeof parseBackup>;
  } | null>(null);
  const run = async (action: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    try {
      await action();
    } catch (error) {
      toast(error instanceof Error ? error.message : '数据操作失败，请重试', 'error');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  return (
    <>
      <button
        type="button"
        className="btn"
        disabled={busy}
        onClick={() =>
          run(async () => {
            downloadText(
              await exportAllData(),
              `survival-backup-${new Date().toISOString().slice(0, 10)}.json`,
              'application/json',
            );
            toast('全量备份已导出，请妥善保管其中的个人资料', 'success');
          })
        }
      >
        <Icon name="download" size={14} /> 导出全量备份
      </button>
      <button type="button" className="btn" disabled={busy} onClick={() => input.current?.click()}>
        <Icon name="upload" size={14} /> 恢复备份
      </button>
      <input
        ref={input}
        type="file"
        accept=".json,application/json"
        className="hidden"
        aria-label="选择备份文件"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file)
            void run(async () => {
              if (file.size > MAX_BACKUP_BYTES) throw new Error('备份超过 25 MB，请使用较小的备份');
              const json = await file.text();
              setPending({ json, preview: parseBackup(json) });
            });
        }}
      />
      <Modal
        open={!!pending}
        title="确认恢复备份"
        onClose={() => {
          if (!busy) setPending(null);
        }}
      >
        <p className="text-sm text-[var(--color-ink-dim)]">
          共 {pending?.preview.count}{' '}
          条记录。将合并到当前设备，同一标识的记录会被备份覆盖；其他记录保留。建议先导出当前数据。
        </p>
        <p className="mt-2 text-xs text-[var(--color-ink-dim)]">
          备份时间：
          {pending?.preview.exportedAt
            ? new Date(pending.preview.exportedAt).toLocaleString()
            : '未提供'}
        </p>
        <dl className="my-4 grid grid-cols-2 gap-2 text-sm">
          {BACKUP_STORES.filter((s) => pending?.preview.data[s]).map((s) => (
            <div
              key={s}
              className="flex justify-between gap-2 border-b border-[var(--color-edge)] py-1"
            >
              <dt>{STORE_LABELS[s]}</dt>
              <dd>{pending?.preview.data[s]?.length}</dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-[var(--color-ink-dim)]">
          格式检查已通过。恢复成功后刷新页面；写入失败将回滚本次恢复。
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="btn" disabled={busy} onClick={() => setPending(null)}>
            取消
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy}
            onClick={() =>
              run(async () => {
                if (!pending) return;
                const count = await importAllData(pending.json);
                setPending(null);
                toast(`已恢复 ${count} 条记录`, 'success');
                setTimeout(() => window.location.reload(), 600);
              })
            }
          >
            {busy ? '正在恢复…' : '合并并恢复'}
          </button>
        </div>
      </Modal>
    </>
  );
}
