import type { MapGraph, Route } from './contracts';
import { navigationSteps } from '../client/navigationSteps';

// Used by the UI and voice-pack builder so a recording always matches the visible route.
export function navigationSpeech(graph: MapGraph, route: Route): string {
  const destination = graph.locations.find(point => point.id === route.to);
  const step = navigationSteps(graph, route)[0];
  const instruction = route.from === route.to && destination
    ? `Bạn đã đến ${destination.name}.`
    : step?.detail || (route.requiresStartConfirmation ? 'Chọn mốc hiện tại để bắt đầu.' : 'Chưa tìm thấy đường đi. Mời bạn hỏi nhân viên tiếp nhận.');
  return instruction;
}

const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
export function normalizeSpeechText(text: string): string {
  return text.normalize('NFC')
    .replace(/\b([AB])(\d{3})\b/g, (_match, building: string, number: string) =>
      `${building === 'A' ? 'a' : 'bê'} ${[...number].map(digit => digits[Number(digit)]).join(' ')}`)
    .replace(/\b([0-9])\b/g, digit => digits[Number(digit)])
    .replace(/(tòa\s+)A(?![\p{L}\p{N}_])/giu, '$1a').replace(/(tòa\s+)B(?![\p{L}\p{N}_])/giu, '$1bê')
    .replace(/\s*·\s*/g, ', ').replace(/\.{2,}/g, '.').replace(/\s+/g, ' ').trim();
}
