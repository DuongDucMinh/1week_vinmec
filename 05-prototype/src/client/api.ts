import { useCallback, useEffect, useRef, useState } from 'react';
import type { Actor, AssistantAnswer, Command, CommandResponse, CommandType, Mode, Snapshot } from '../shared/contracts';
import { AI_CLIENT_TIMEOUT_MS } from '../shared/timeouts';

export function acceptSnapshot(current: Snapshot | null, incoming: Snapshot, retired: Set<string>): Snapshot | null {
  // A response can arrive from a reset the client never observed over SSE.
  // Only the persisted server generation orders runs; run IDs are identities.
  if (current && incoming.generation < current.generation) return current;
  if (current && incoming.generation === current.generation && incoming.runId !== current.runId) return current;
  if (retired.has(incoming.runId)) return current;
  if (current?.runId === incoming.runId && incoming.revision < current.revision) return current;
  if (current && current.runId !== incoming.runId) retired.add(current.runId);
  return incoming;
}

export function useSimulation(offline = false) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [connected, setConnected] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uncertain, setUncertain] = useState(false);
  const latest = useRef<Snapshot | null>(null);
  const retired = useRef(new Set<string>());
  const retryRequest = useRef<{ path: string; body: unknown } | null>(null);
  const apply = useCallback((incoming: Snapshot) => {
    const next = acceptSnapshot(latest.current, incoming, retired.current);
    latest.current = next;
    setSnapshot(next);
  }, []);
  useEffect(() => {
    if (offline) { setConnected(false); return; }
    const events = new EventSource('/api/events');
    const handle = (event: MessageEvent<string>) => {
      try { apply(JSON.parse(event.data)); setConnected(true); } catch { setError('Không đọc được cập nhật. Hãy tải lại hoặc hỏi nhân viên.'); }
    };
    events.addEventListener('snapshot', handle);
    events.onerror = () => setConnected(false);
    return () => { events.close(); setConnected(false); };
  }, [offline, apply]);

  const send = async (path: string, body: unknown) => {
    if (offline) { setError('Đang mất kết nối. Chưa gửi xác nhận; vui lòng báo nhân viên.'); return false; }
    setPending(true); setError(null); setUncertain(false);
    retryRequest.current = { path, body };
    try {
      let data: CommandResponse;
      for (let attempt = 0; ; attempt++) {
        const response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(10000) });
        data = await response.json() as CommandResponse;
        if (data.snapshot) apply(data.snapshot);
        // Another screen may have just confirmed a location. A definite stale-revision
        // rejection has no side effect: revalidate the same intent once on the server.
        // Run changes, resets and uncertain outcomes never use this recovery path.
        if (attempt === 0 && path === '/api/commands' && data.code === 'STALE_REVISION' && data.snapshot?.runId === (body as Command).runId && (data.snapshot.visits.find(v=>v.visitId===(body as Command).visitId)?.journeyVersion??0) === ((body as Command).expectedJourneyVersion??0)) {
          body = { ...(body as Command), commandId: crypto.randomUUID(), expectedRevision: data.snapshot.revision };
          retryRequest.current = { path, body };
          continue;
        }
        break;
      }
      retryRequest.current = null;
      if (!data.ok) { setError(`${data.message || 'Thao tác chưa được xác nhận.'} Dữ liệu mới nhất đã được tải; hãy kiểm tra rồi thử lại.`); return false; }
      return true;
    } catch {
      setUncertain(true); setError('Chưa nhận được phản hồi. Chưa thể xác nhận thao tác thành công. Kết nối lại rồi kiểm tra hoặc gửi lại cùng xác nhận.');
      return false;
    } finally { setPending(false); }
  };
  const command = (type: CommandType, visitId: string, actor: Actor, payload: Command['payload'] = {}) => {
    const s = latest.current;
    if (!s) return Promise.resolve(false);
    return send('/api/commands', { commandId: crypto.randomUUID(), runId: s.runId, expectedRevision: s.revision, expectedJourneyVersion:s.visits.find(v=>v.visitId===visitId)?.journeyVersion??0, actor, type, visitId, payload });
  };
  const reset = (mode: Mode) => {
    const s = latest.current;
    if (!s) return Promise.resolve(false);
    return send('/api/demo/reset', { commandId: crypto.randomUUID(), expectedRunId: s.runId, expectedRevision: s.revision, actor: 'control', mode, seed: 'demo' });
  };
  const retry = () => retryRequest.current ? send(retryRequest.current.path, retryRequest.current.body) : Promise.resolve(false);
  const ask = async (visitId: string, question: string, previousIntent?: string): Promise<AssistantAnswer> => {
    const s = latest.current;
    if (!s || offline) throw new Error('Trợ lý chưa kết nối. Hướng dẫn ở trang Lượt khám vẫn có sẵn; khi cần hãy hỏi nhân viên.');
    const response = await fetch('/api/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ runId: s.runId, expectedRevision: s.revision, visitId, question, previousIntent }), signal: AbortSignal.timeout(AI_CLIENT_TIMEOUT_MS) });
    const answer = await response.json();
    if (!response.ok) throw new Error(answer.message || 'Tiến độ đã đổi. Hãy hỏi lại theo dữ liệu mới nhất.');
    if (!latest.current || latest.current.runId !== answer.runId || latest.current.revision !== answer.revision) throw new Error('Tiến độ vừa cập nhật. Hãy hỏi lại để nhận hướng dẫn mới nhất.');
    return answer;
  };
  return { snapshot, connected, pending, error, uncertain, command, reset, retry, ask, clearError: () => setError(null) };
}
export type SimulationApi = ReturnType<typeof useSimulation>;
