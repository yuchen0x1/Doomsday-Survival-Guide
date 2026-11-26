export type UpdateStatus =
  | 'checking'
  | 'ready'
  | 'available'
  | 'updating'
  | 'updated'
  | 'offline'
  | 'unsupported'
  | 'error';

export function getInitialUpdateStatus({
  isDev,
  hasServiceWorker,
  isOnline = true,
}: {
  isDev: boolean;
  hasServiceWorker: boolean;
  isOnline?: boolean;
}): UpdateStatus {
  if (isDev) return 'ready';
  if (!hasServiceWorker) return 'unsupported';
  if (!isOnline) return 'offline';
  return 'checking';
}

export function isUpdateCheckDue({
  lastAttemptAt,
  lastSuccessfulAt,
  intervalMs,
  now = Date.now(),
}: {
  lastAttemptAt: number;
  lastSuccessfulAt: number;
  intervalMs: number;
  now?: number;
}): boolean {
  if (intervalMs <= 0) return false;
  const isRecent = (time: number, interval: number) =>
    Number.isFinite(time) && time > 0 && time <= now && now - time < interval;
  return !isRecent(lastSuccessfulAt, intervalMs) && !isRecent(lastAttemptAt, 5 * 60_000);
}

export function formatUpdateTime(value: string | null): string {
  if (!value) return '尚未检查';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '时间格式无效';
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(date);
}
