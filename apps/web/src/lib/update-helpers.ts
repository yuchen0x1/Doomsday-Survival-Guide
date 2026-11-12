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

export function formatUpdateTime(value: string | null): string {
  if (!value) return '尚未检查';
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date(value));
}
