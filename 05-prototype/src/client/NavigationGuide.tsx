import { useEffect, useState } from 'react';
import type { Location } from '../shared/contracts';

export function walkingInstruction(points: Location[], step: number) {
  const current = points[step], target = points[step + 1];
  if (!current || !target) return 'Bạn đã tới cuối chặng. Xác nhận mốc bên dưới để tiếp tục.';
  const targetName=target.kind==='lift'?'sảnh thang máy':target.name;
  const dx = target.x - current.x, dy = target.y - current.y;
  const previous = points[step - 1];
  if (!previous) return `Đứng tại ${current.name}, quay mặt về ${target.landmark || target.name}. Đi tới ${targetName}.`;
  const ax = current.x - previous.x, ay = current.y - previous.y;
  const cross = ax * dy - ay * dx, dot = ax * dx + ay * dy;
  const turn = Math.abs(cross) < 1 ? dot < 0 ? 'Quay lại' : 'Đi thẳng' : cross > 0 ? 'Rẽ phải' : 'Rẽ trái';
  return `${turn} đến ${targetName}. Nhận biết: ${target.landmark || target.name}.`;
}

export function NavigationGuide({ text, resetKey }: { text: string; resetKey: string }) {
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState('');
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  function speak() {
    if (!supported) { setError('Thiết bị chưa hỗ trợ giọng đọc. Bạn có thể xem chỉ dẫn hoặc hỏi nhân viên.'); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.88;
    const voice = window.speechSynthesis.getVoices().find(v => v.lang.toLowerCase().startsWith('vi'));
    if (voice) utterance.voice = voice;
    utterance.onerror = e => { if (!['canceled', 'interrupted'].includes(e.error)) setError('Chưa phát được giọng đọc. Thử nghe lại hoặc xem chỉ dẫn.'); };
    setError('');
    window.speechSynthesis.speak(utterance);
  }
  useEffect(() => {
    if (enabled) speak();
    return () => { if (supported) window.speechSynthesis.cancel(); };
  }, [text, resetKey, enabled]);
  return <div className="voice-guidance">
    <button className="secondary" aria-pressed={enabled} onClick={() => { if (!supported) { speak(); return; } setEnabled(v => !v); }}>{enabled ? 'Tắt giọng chỉ đường' : 'Bật giọng chỉ đường'}</button>
    {enabled && <button className="text-button" onClick={speak}>Nghe lại</button>}
    {error && <p role="status">{error}</p>}
  </div>;
}
