// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { LocationUpdate } from '../../src/client/LocationUpdate';
import { createRun } from '../../src/shared/fixtures';
import { makeSnapshot } from '../../src/domain/engine';
import type { SimulationApi } from '../../src/client/api';

let root: Root; let host: HTMLDivElement;
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  Object.defineProperties(HTMLDialogElement.prototype, {
    show: { configurable: true, value: function(this: HTMLDialogElement) { this.open = true; } },
    close: { configurable: true, value: function(this: HTMLDialogElement) { this.open = false; } },
  });
  host = document.createElement('div'); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.unstubAllGlobals(); });
async function mount(connected = true, success = true) {
  const snapshot = makeSnapshot(createRun()), close = vi.fn();
  const api = { connected, pending: false, uncertain: false, error: null, command: vi.fn().mockResolvedValue(success) } as unknown as SimulationApi;
  await act(async () => root.render(<LocationUpdate snapshot={snapshot} view={snapshot.views['DEMO-P01']} api={api} close={close} />));
  return { api, close };
}
async function select(index: number, value: string) {
  await act(async () => { const element = host.querySelectorAll('select')[index]; element.value = value; element.dispatchEvent(new Event('change', { bubbles: true })); });
}
it('requires an explicit building, floor and routable landmark before confirming', async () => {
  const { api, close } = await mount();
  expect(host.querySelector<HTMLButtonElement>('.primary')!.disabled).toBe(true);
  expect([...host.querySelectorAll('select')].map(item => item.value)).toEqual(['', '', '']);
  await select(0, 'B'); await select(1, '1'); await select(2, 'DEMO-SIEUAM');
  expect(host.querySelector<HTMLButtonElement>('.primary')!.disabled).toBe(false);
  await act(async () => host.querySelector<HTMLButtonElement>('.primary')!.click());
  expect(api.command).toHaveBeenCalledExactlyOnceWith('CONFIRM_LOCATION', 'DEMO-P01', 'patient', { locationId: 'DEMO-SIEUAM', outsideHospital: false });
  expect(close).toHaveBeenCalledOnce();
});
it('resets dependent choices when building changes and offers help without changing position', async () => {
  const { api } = await mount(); await select(0, 'B'); await select(1, '1'); await select(2, 'DEMO-SIEUAM'); await select(0, 'A');
  expect([...host.querySelectorAll('select')].map(item => item.value)).toEqual(['A', '', '']);
  await act(async () => host.querySelector<HTMLButtonElement>('.text-button')!.click());
  expect(host.querySelector('.location-help')?.textContent).toContain('Nhờ nhân viên'); expect(api.command).not.toHaveBeenCalled();
});
it('keeps the dialog open and selection available after a failed update', async () => {
  const { close } = await mount(true, false); await select(0, 'A'); await select(1, '1'); await select(2, 'DEMO-ENTRANCE');
  await act(async () => host.querySelector<HTMLButtonElement>('.primary')!.click());
  expect(close).not.toHaveBeenCalled(); expect(host.querySelectorAll('select')[2].value).toBe('DEMO-ENTRANCE');
});
it('allows reading help offline but blocks location confirmation', async () => {
  const { api } = await mount(false); expect(host.querySelector<HTMLButtonElement>('.primary')!.disabled).toBe(true);
  await act(async () => host.querySelector<HTMLButtonElement>('.text-button')!.click());
  expect(host.querySelector('.location-help')).not.toBeNull(); expect(api.command).not.toHaveBeenCalled();
});
