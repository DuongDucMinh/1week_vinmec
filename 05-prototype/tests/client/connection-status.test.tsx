// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { App } from '../../src/client/App';
import { createRun } from '../../src/shared/fixtures';
import { makeSnapshot } from '../../src/domain/engine';

class Stream {
  static current: Stream;
  closed = false;
  listeners = new Map<string, (event: MessageEvent<string>) => void>();
  onerror: (() => void) | null = null;
  constructor() { Stream.current = this; }
  addEventListener(name: string, handle: (event: MessageEvent<string>) => void) { this.listeners.set(name, handle); }
  close() { this.closed = true; }
  emit(value: unknown) { this.listeners.get('snapshot')?.(new MessageEvent('snapshot', { data: JSON.stringify(value) })); }
}
let root: Root;
let host: HTMLDivElement;
beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-21T03:00:00Z'));
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.stubGlobal('EventSource', Stream);
  Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
  Object.defineProperties(HTMLDialogElement.prototype, {
    show: { configurable: true, value: function(this: HTMLDialogElement) { this.open = true; } },
    close: { configurable: true, value: function(this: HTMLDialogElement) { this.open = false; } },
  });
  window.history.replaceState(null, '', '/patient');
  host = document.createElement('div'); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.useRealTimers(); vi.unstubAllGlobals(); });

it('keeps synchronization in the existing header and freezes its timestamp on disconnect', async () => {
  await act(async () => root.render(<App />));
  const snapshot = makeSnapshot(createRun()); snapshot.updatedAt = '2026-10-20T02:00:00Z';
  await act(async () => Stream.current.emit(snapshot));
  expect(host.querySelector('.patient-header .sync-status')).not.toBeNull();
  expect(host.querySelector('.phone-shell > .sync-status')).toBeNull();
  expect(host.querySelector('.sync-status')?.textContent).toContain('Đã đồng bộ');
  expect(host.querySelector('.sync-status time')?.getAttribute('datetime')).toBe('2026-10-21T03:00:00.000Z');
  expect(host.querySelector('.connection-banner')).toBeNull();
  await act(async () => host.querySelector<HTMLButtonElement>('.sync-status')!.click());
  const times = host.querySelectorAll('.connection-details time');
  expect([...times].map(item => item.getAttribute('datetime'))).toEqual(['2026-10-21T03:00:00.000Z', snapshot.updatedAt]);
  await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Đóng chi tiết kết nối"]')!.click());
  vi.setSystemTime(new Date('2026-10-21T03:10:00Z'));
  await act(async () => Stream.current.onerror?.());
  expect(host.querySelector('.sync-status')?.textContent).toContain('Mất kết nối');
  expect(host.querySelector('.connection-banner')?.textContent).toContain('giấy đã lưu');
  await act(async () => host.querySelector<HTMLButtonElement>('.sync-status')!.click());
  expect(host.querySelector('.connection-details time')?.getAttribute('datetime')).toBe('2026-10-21T03:00:00.000Z');
  const old = Stream.current;
  await act(async () => host.querySelector<HTMLButtonElement>('.connection-details .primary')!.click());
  expect(old.closed).toBe(true); expect(Stream.current).not.toBe(old);
  expect(host.querySelector('.sync-status')?.textContent).toContain('Mất kết nối');
  await act(async () => Stream.current.emit(snapshot));
  expect(host.querySelector('.connection-details time')?.getAttribute('datetime')).toBe('2026-10-21T03:10:00.000Z');
  expect(host.querySelector('.connection-banner')).toBeNull();
});

it('does not treat a rejected old snapshot as a fresh synchronization', async () => {
  await act(async () => root.render(<App />)); const snapshot = makeSnapshot(createRun()); snapshot.revision = 10;
  await act(async () => Stream.current.emit(snapshot));
  vi.setSystemTime(new Date('2026-10-21T04:00:00Z'));
  await act(async () => Stream.current.emit({ ...snapshot, revision: 9 }));
  expect(host.querySelector('.sync-status time')?.getAttribute('datetime')).toBe('2026-10-21T03:00:00.000Z');
});

it('reacts to browser offline/online events without claiming an unconfirmed reconnection', async () => {
  await act(async () => root.render(<App />)); const snapshot = makeSnapshot(createRun());
  await act(async () => Stream.current.emit(snapshot)); const old = Stream.current;
  await act(async () => window.dispatchEvent(new Event('offline')));
  expect(old.closed).toBe(true); expect(host.querySelector('.connection-banner')).not.toBeNull();
  await act(async () => window.dispatchEvent(new Event('online')));
  expect(Stream.current).not.toBe(old); expect(host.querySelector('.sync-status')?.textContent).toContain('Mất kết nối');
  await act(async () => Stream.current.emit(snapshot));
  expect(host.querySelector('.sync-status')?.textContent).toContain('Đã đồng bộ');
});
