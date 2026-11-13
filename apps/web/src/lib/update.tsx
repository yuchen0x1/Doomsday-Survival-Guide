import { useRegisterSW } from 'virtual:pwa-register/react';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { detectPlatform } from './platform';
import { getInitialUpdateStatus, type UpdateStatus } from './update-helpers';

const LAST_CHECK_KEY = 'apocalypse-survival:last-update-check';

export type { UpdateStatus } from './update-helpers';

export interface AppUpdateContextValue {
  needRefresh: boolean;
  offlineReady: boolean;
  status: UpdateStatus;
  error: string | null;
  lastCheckedAt: string | null;
  checkForUpdate: () => Promise<void>;
  updateNow: () => Promise<void>;
  dismissUpdate: () => void;
}

const UpdateContext = createContext<AppUpdateContextValue | null>(null);

function readLastCheckedAt(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(LAST_CHECK_KEY);
}

function saveLastCheckedAt(value: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LAST_CHECK_KEY, value);
}

const nativeUpdateState: AppUpdateContextValue = {
  needRefresh: false,
  offlineReady: true,
  status: 'ready',
  error: null,
  lastCheckedAt: null,
  checkForUpdate: async () => {},
  updateNow: async () => {},
  dismissUpdate: () => {},
};

export function PwaUpdateProvider({ children }: { children: ReactNode }) {
  if (detectPlatform() !== 'web') {
    return <UpdateContext.Provider value={nativeUpdateState}>{children}</UpdateContext.Provider>;
  }
  return <WebUpdateProvider>{children}</WebUpdateProvider>;
}

function WebUpdateProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<UpdateStatus>(() => {
    return getInitialUpdateStatus({
      isDev: import.meta.env.DEV,
      hasServiceWorker: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
      isOnline: typeof navigator === 'undefined' || navigator.onLine,
    });
  });
  const [error, setError] = useState<string | null>(null);
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(readLastCheckedAt);
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onNeedRefresh: () => setStatus('available'),
    onOfflineReady: () => setStatus('ready'),
    onRegisteredSW: (_swScriptUrl, registration) => {
      if (registration) setStatus('ready');
    },
    onRegisterError: (registrationError) => {
      setError(
        registrationError instanceof Error ? registrationError.message : 'Service Worker 注册失败',
      );
      setStatus('error');
    },
  });

  useEffect(() => {
    if (
      import.meta.env.DEV ||
      typeof navigator === 'undefined' ||
      !('serviceWorker' in navigator)
    ) {
      return;
    }
    const timeout = window.setTimeout(() => {
      setStatus((current) => (current === 'checking' ? 'unsupported' : current));
    }, 5000);
    return () => window.clearTimeout(timeout);
  }, []);

  const checkForUpdate = useCallback(async () => {
    const checkedAt = new Date().toISOString();
    setLastCheckedAt(checkedAt);
    saveLastCheckedAt(checkedAt);
    setError(null);

    if (import.meta.env.DEV) {
      setStatus('ready');
      return;
    }
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      setStatus('unsupported');
      return;
    }
    if (!navigator.onLine) {
      setStatus('offline');
      return;
    }

    setStatus('checking');
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        setStatus('unsupported');
        return;
      }
      await registration.update();
      setStatus((current) => (current === 'available' ? 'available' : 'ready'));
    } catch (checkError) {
      setError(checkError instanceof Error ? checkError.message : '检查更新失败');
      setStatus('error');
    }
  }, []);

  const updateNow = useCallback(async () => {
    setStatus('updating');
    setError(null);
    try {
      await updateServiceWorker(true);
      setStatus('updated');
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : '更新失败，请稍后重试');
      setStatus('error');
    }
  }, [updateServiceWorker]);

  const dismissUpdate = useCallback(() => {
    setNeedRefresh(false);
    setStatus('ready');
  }, [setNeedRefresh]);

  const value = useMemo<AppUpdateContextValue>(
    () => ({
      needRefresh,
      offlineReady,
      status,
      error,
      lastCheckedAt,
      checkForUpdate,
      updateNow,
      dismissUpdate,
    }),
    [
      needRefresh,
      offlineReady,
      status,
      error,
      lastCheckedAt,
      checkForUpdate,
      updateNow,
      dismissUpdate,
    ],
  );

  return <UpdateContext.Provider value={value}>{children}</UpdateContext.Provider>;
}

export function useAppUpdate(): AppUpdateContextValue {
  const context = useContext(UpdateContext);
  if (!context) throw new Error('useAppUpdate 必须在 PwaUpdateProvider 内使用');
  return context;
}
