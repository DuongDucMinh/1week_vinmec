import { useEffect, useRef, useState } from 'react';
import type { Location } from '../shared/contracts';
import { Icon } from './icons';

const voicePreferenceKey = 'vinmec.navigationVoice';
function initialVoiceEnabled() {
  try { return localStorage.getItem(voicePreferenceKey) !== 'off'; }
  catch { return true; }
}

export function walkingInstruction(points: Location[], step: number) {
  const current = points[step], target = points[step + 1];
  if (!current || !target) return 'Bạn đã tới cuối chặng.';
  const targetName=target.kind==='lift'?'sảnh thang máy':target.kind==='stairs'?'cầu thang bộ':target.kind==='room'?`phòng ${target.roomNumber||target.name}`:target.name;
  const dx = target.x - current.x, dy = target.y - current.y;
  const previous = points[step - 1];
  if (!previous) return `Đi tới ${targetName}. ${target.landmark || target.name}.`;
  const ax = current.x - previous.x, ay = current.y - previous.y;
  const cross = ax * dy - ay * dx, dot = ax * dx + ay * dy;
  const turn = Math.abs(cross) < 1 ? dot < 0 ? 'Quay lại' : 'Đi thẳng' : cross > 0 ? 'Rẽ phải' : 'Rẽ trái';
  return `${turn} đến ${targetName}. Nhận biết: ${target.landmark || target.name}.`;
}

export function NavigationGuide({ text, resetKey }: { text: string; resetKey: string }) {
  const [enabled, setEnabled] = useState(initialVoiceEnabled);
  const [message, setMessage] = useState('');
  const [retryKind, setRetryKind] = useState<'play' | 'request' | null>(null);
  const [attempt, setAttempt] = useState(0);
  const player = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setRetryKind(null);
    if (!enabled) { setMessage(''); return; }
    const controller = new AbortController();
    const audio = new Audio();
    player.current = audio;
    let disposed = false, url: string | undefined;
    const timer = window.setTimeout(() => controller.abort(), 15_000);
    const failed = () => {
      if (disposed) return;
      setMessage('Chưa phát được giọng tiếng Việt. Thử nghe lại hoặc xem chỉ dẫn.');
      setRetryKind('request');
    };
    audio.onerror = failed;
    setMessage('Đang tải giọng tiếng Việt…');
    void (async () => {
      try {
        const response = await fetch('/api/speech', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }), signal: controller.signal,
        });
        if (!response.ok) {
          let code = '';
          try { code = (await response.json()).code; } catch { /* Non-JSON/network errors use the playback error below. */ }
          if (disposed) return;
          if (code === 'SPEECH_RECORDING_MISSING') {
            setMessage('Chặng này chưa có bản ghi âm. Hãy xem chỉ dẫn bên dưới.');
            setRetryKind('request');
            return;
          }
          throw new Error('SPEECH_UNAVAILABLE');
        }
        if (!response.headers.get('content-type')?.startsWith('audio/')) throw new Error('SPEECH_UNAVAILABLE');
        const blob = await response.blob();
        if (disposed) return;
        window.clearTimeout(timer);
        url = URL.createObjectURL(blob);
        audio.src = url;
        await audio.play();
        if (!disposed) setMessage('');
      } catch (error) {
        if (disposed) return;
        if (error && typeof error === 'object' && 'name' in error && error.name === 'NotAllowedError') {
          setMessage('Chạm Nghe lại để nghe chỉ đường.');
          setRetryKind('play');
        } else failed();
      } finally { window.clearTimeout(timer); }
    })();
    return () => {
      disposed = true;
      controller.abort();
      window.clearTimeout(timer);
      audio.onerror = null;
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      if (url) URL.revokeObjectURL(url);
      if (player.current === audio) player.current = null;
    };
  }, [text, resetKey, enabled, attempt]);

  function retry() {
    const audio = player.current;
    if (retryKind !== 'play' || !audio) { setAttempt(value => value + 1); return; }
    // Retry a blocked playback directly in the tap gesture (important on mobile).
    void audio.play().then(() => {
      if (player.current === audio) { setMessage(''); setRetryKind(null); }
    }).catch(() => {
      if (player.current === audio) setMessage('Chưa phát được giọng tiếng Việt. Thử nghe lại hoặc xem chỉ dẫn.');
    });
  }

  function toggleVoice() {
    const next = !enabled;
    setEnabled(next);
    try { localStorage.setItem(voicePreferenceKey, next ? 'on' : 'off'); }
    catch { /* The button still works when browser storage is unavailable. */ }
  }

  return <div className="voice-guidance">
    <button className="icon-button" aria-label={enabled ? 'Tắt giọng chỉ đường' : 'Bật giọng chỉ đường'} title={enabled ? 'Tắt giọng chỉ đường' : 'Bật giọng chỉ đường'} aria-pressed={enabled} onClick={toggleVoice}><Icon name={enabled?'speaker':'muted'} size={23}/></button>
    {message && <p role="status">{message}{retryKind && <button className="secondary" onClick={retry}>Nghe lại</button>}</p>}
  </div>;
}
