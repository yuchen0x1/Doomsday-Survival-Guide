import { useRegisterSW } from 'virtual:pwa-register/react';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { detectPlatform } from './platform';
import { getInitialUpdateStatus, type UpdateStatus } from './update-helpers';

const LAST_CHECK_KEY = 'apocalypse-survival:last-update-check';
const CHECK_FREQUENCY_KEY = 'apocalypse-survival:update-check-frequency';
const INTERVAL_MS = { hourly: 3_600_000, daily: 86_400_000, manual: 0 } as const;

type CheckFrequency = keyof typeof INTERVAL_MS;

export type { UpdateStatus } from './update-helpers';

export interface AppUpdateContextValue {
  needRefresh: boolean;
  showUpdateBanner: boolean;
  offlineReady: boolean;
  status: UpdateStatus;
  error: string | null;
  lastCheckedAt: string | null;
  checkFrequency: CheckFrequency;
  setCheckFrequency: (value: CheckFrequency) => void;
  checkForUpdate: () => Promise<void>;
  updateNow: () => Promise<void>;
  dismissUpdate: () => void;
}

const UpdateContext = createContext<AppUpdateContextValue | null>(null);

function readPreference(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function savePreference(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Update checks also work when the browser restricts local storage.
  }
}

const nativeUpdateState: AppUpdateContextValue = {
  needRefresh: false,
  showUpdateBanner: false,
  offlineReady: true,
  status: 'ready',
  error: null,
  lastCheckedAt: null,
  checkFrequency: 'manual',
  setCheckFrequency: () => {},
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
  const [lastCheckedAt, setLastCheckedAt] = useState(() => readPreference(LAST_CHECK_KEY));
  const [checkFrequency, changeCheckFrequency] = useState<CheckFrequency>(() => {
    const saved = readPreference(CHECK_FREQUENCY_KEY);
    return saved === 'hourly' || saved === 'manual' ? saved : 'daily';
  });
  const setCheckFrequency = useCallback((value: CheckFrequency) => {
    changeCheckFrequency(value);
    savePreference(CHECK_FREQUENCY_KEY, value);
  }, []);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const activationTimer = useRef<number | undefined>(undefined);
  const checkInProgress = useRef(false);
  const lastAttemptAt = useRef(0);
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onNeedRefresh: () => setStatus('available'),
    onOfflineReady: () => setStatus((current) => (current === 'checking' ? 'ready' : current)),
    onRegisteredSW: (_swScriptUrl, registration) => {
      if (registration) setStatus((current) => (current === 'checking' ? 'ready' : current));
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
      setStatus((current) => (current === 'checking' ? 'error' : current));
    }, 5000);
    return () => window.clearTimeout(timeout);
  }, []);

  const runCheck = useCallback(async () => {
    if (checkInProgress.current || activationTimer.current !== undefined) return;
    const checkedAt = new Date().toISOString();
    lastAttemptAt.current = Date.parse(checkedAt);
    setLastCheckedAt(checkedAt);
    savePreference(LAST_CHECK_KEY, checkedAt);
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
    checkInProgress.current = true;
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        setStatus('unsupported');
        return;
      }
      if (!registration.waiting) await registration.update();
      if (registration.waiting) {
        setNeedRefresh(true);
        setStatus('available');
        return;
      }
      setStatus((current) => (current === 'available' ? 'available' : 'ready'));
    } catch (checkError) {
      setError(checkError instanceof Error ? checkError.message : '检查更新失败');
      setStatus('error');
    } finally {
      checkInProgress.current = false;
    }
  }, [setNeedRefresh]);

  const checkForUpdate = useCallback(async () => {
    setBannerDismissed(false);
    await runCheck();
  }, [runCheck]);

  useEffect(() => {
    const interval = INTERVAL_MS[checkFrequency];
    if (!interval || import.meta.env.DEV || !('serviceWorker' in navigator)) return;
    const checkIfDue = () => {
      if (!navigator.onLine || document.visibilityState !== 'visible') return;
      const last = Math.max(
        lastAttemptAt.current,
        Date.parse(readPreference(LAST_CHECK_KEY) ?? '') || 0,
      );
      if (Date.now() - last >= interval) void runCheck();
    };
    const timer = window.setInterval(checkIfDue, 60_000);
    window.addEventListener('focus', checkIfDue);
    window.addEventListener('online', checkIfDue);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', checkIfDue);
      window.removeEventListener('online', checkIfDue);
    };
  }, [checkFrequency, runCheck]);

  useEffect(() => () => window.clearTimeout(activationTimer.current), []);

  const updateNow = useCallback(async () => {
    if (activationTimer.current !== undefined) return;
    setStatus('updating');
    setError(null);
    const fail = (message: string) => {
      window.clearTimeout(activationTimer.current);
      activationTimer.current = undefined;
      setError(message);
      setStatus('error');
    };
    activationTimer.current = window.setTimeout(
      () => fail('新版本尚未接管，请检查更新后重试。'),
      15_000,
    );
    try {
      // Workbox reloads when the waiting worker takes control.
      await updateServiceWorker(true);
    } catch (updateError) {
      fail(updateError instanceof Error ? updateError.message : '更新失败，请稍后重试');
    }
  }, [updateServiceWorker]);

  const dismissUpdate = useCallback(() => {
    setBannerDismissed(true);
  }, []);

  const value = useMemo<AppUpdateContextValue>(
    () => ({
      needRefresh,
      showUpdateBanner: !bannerDismissed && (needRefresh || status === 'error'),
      offlineReady,
      status,
      error,
      lastCheckedAt,
      checkFrequency,
      setCheckFrequency,
      checkForUpdate,
      updateNow,
      dismissUpdate,
    }),
    [
      needRefresh,
      bannerDismissed,
      offlineReady,
      status,
      error,
      lastCheckedAt,
      checkFrequency,
      setCheckFrequency,
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
