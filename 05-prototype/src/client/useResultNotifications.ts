import { useEffect, useRef, useState } from 'react';
import type { Service, Visit } from '../shared/contracts';

const preferenceKey = 'myvinmec:simulated-result-notifications';
const initialPreference = () => { try { const value=localStorage.getItem(preferenceKey);return value==='on'||value==='off'?value:null; } catch { return null; } };

/** Result alerts belong to the simulated phone, without browser notification permissions. */
export function useResultNotifications(runId: string, visit: Visit, connected: boolean, open: (service: Service) => void) {
  const [preference, setStoredPreference] = useState(initialPreference);
  const enabled=preference==='on';
  const [queue, setQueue] = useState<{ key: string; service: Service }[]>([]);
  const current = useRef({ runId, visit, open });
  current.current = { runId, visit, open };
  const baseline = useRef<{ key: string; seen: Set<string> }>({ key: '', seen: new Set() });
  const key = JSON.stringify([runId, visit.visitId, visit.journeyVersion ?? 0]);
  const notification = enabled && queue[0]?.key === key ? queue[0].service : null;

  useEffect(() => {
    const available = visit.services.filter(service => service.resultStatus === 'AVAILABLE');
    if (baseline.current.key !== key) {
      baseline.current = { key, seen: new Set(available.map(service => service.id)) };
      setQueue([]);
      return;
    }
    if (!connected) return;
    const fresh = available.filter(service => !baseline.current.seen.has(service.id));
    fresh.forEach(service => baseline.current.seen.add(service.id));
    if (enabled && fresh.length) setQueue(previous => [...previous.filter(item => item.key === key), ...fresh.map(service => ({ key, service }))]);
  }, [key, visit, connected, enabled]);

  useEffect(() => {
    if (!notification) return;
    const timer = window.setTimeout(() => setQueue(previous => previous.slice(1)), 8000);
    return () => window.clearTimeout(timer);
  }, [key, notification?.id]);

  const dismiss = () => setQueue(previous => previous.slice(1));
  const setPreference = (value: boolean) => {
    setStoredPreference(value?'on':'off');
    if (!value) setQueue([]);
    try { localStorage.setItem(preferenceKey, value ? 'on' : 'off'); } catch { /* The current session still works without storage. */ }
  };
  const openNotification = () => {
    const latest = current.current;
    if (JSON.stringify([latest.runId, latest.visit.visitId, latest.visit.journeyVersion ?? 0]) !== key) return;
    const service = latest.visit.services.find(item => item.id === notification?.id && item.resultStatus === 'AVAILABLE');
    dismiss();
    if (service) latest.open(service);
  };
  return { status: enabled ? 'enabled' as const : 'disabled' as const, configured:preference!==null, enable: () => setPreference(true), disable: () => setPreference(false), notification, dismiss, openNotification };
}
