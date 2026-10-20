// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Patient } from '../../src/client/Patient';
import { createRun } from '../../src/shared/fixtures';
import { makeSnapshot } from '../../src/domain/engine';
import type { SimulationApi } from '../../src/client/api';

let host: HTMLDivElement, root: Root;
beforeEach(() => {
  window.history.replaceState(null, '', '/patient');
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  Object.defineProperties(HTMLDialogElement.prototype, {
    show: { configurable: true, value: function (this: HTMLDialogElement) { this.open = true; } },
    showModal: { configurable: true, value: function (this: HTMLDialogElement) { this.open = true; } },
    close: { configurable: true, value: function (this: HTMLDialogElement) { this.open = false; } },
  });
  host = document.createElement('div'); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.unstubAllGlobals(); });
async function render() {
  const api = { connected: true, pending: false, command: vi.fn(), ask: vi.fn() } as unknown as SimulationApi;
  await act(async () => root.render(<Patient snapshot={makeSnapshot(createRun())} api={api} offline={false} setOffline={vi.fn()} />));
}
async function click(label: string) {
  const button = [...host.querySelectorAll('button')].find(button => button.getAttribute('aria-label') === label || button.textContent === label);
  expect(button, label).toBeDefined();
  await act(async () => button!.click());
}

it('shows identity in the shared header and updates personal information when switching patients', async () => {
  await render();
  for (const tab of ['Lượt khám', 'Đường đi', 'Thông báo', 'Trợ lý']) {
    await click(tab);
    expect(host.querySelector('.patient-header')?.textContent).toContain('Nguyễn Minh Anh');
    expect(host.querySelector('.visit-heading p')).toBeNull();
  }
  await click('Thông tin người bệnh');
  let profile = host.querySelector('dialog')!;
  expect(profile.textContent).toContain('Nguyễn Minh Anh');
  expect(profile.querySelector('.profile-details')?.textContent).toContain('35 tuổi');
  expect(profile.querySelector('.profile-details')?.textContent).toContain('PID-001');
  expect(profile.textContent).not.toMatch(/In \/ lưu|Bật thông báo/);
  const select = profile.querySelector('select')!;
  await act(async () => { select.value = 'DEMO-P02'; select.dispatchEvent(new Event('change', { bubbles: true })); });
  expect(host.querySelector('dialog')).toBeNull();
  expect(host.querySelector('.patient-header')?.textContent).toContain('Trần Hoàng Nam');
  await click('Thông tin người bệnh');
  profile = host.querySelector('dialog')!;
  expect(profile.querySelector('.profile-identity')?.textContent).toContain('Trần Hoàng Nam');
  expect(profile.querySelector('.profile-details')?.textContent).toContain('48 tuổi');
  expect(profile.querySelector('.profile-details')?.textContent).toContain('PID-002');
});

it('controls simulated phone notifications without asking Chrome for permission', async () => {
  localStorage.clear();
  const requestPermission = vi.fn();
  vi.stubGlobal('Notification', { permission: 'default', requestPermission });
  await render();
  await click('Thông tin người bệnh');
  expect(host.querySelector('dialog .notification-settings')).toBeNull();
  expect(host.querySelector('dialog .reset-journey')).not.toBeNull();
  await click('Đóng thông tin cá nhân');
  await click('Thông báo');
  expect(host.querySelector('.inbox .notification-settings')?.textContent).toContain('trong khung điện thoại');
  await click('Bật thông báo kết quả');
  expect(host.querySelector('.notification-settings')).toBeNull();
  expect(host.querySelector('.notification-toggle')?.getAttribute('aria-pressed')).toBe('true');
  await click('Tắt thông báo kết quả');
  expect(host.querySelector('.notification-settings')).toBeNull();
  expect(host.querySelector('.notification-toggle')?.getAttribute('aria-pressed')).toBe('false');
  await click('Bật thông báo kết quả');
  expect(host.querySelector('.notification-toggle')?.getAttribute('aria-pressed')).toBe('true');
  await act(async()=>root.render(<div/>));await render();await click('Thông báo');
  expect(host.querySelector('.notification-settings')).toBeNull();
  expect(host.querySelector('.notification-toggle')?.getAttribute('aria-pressed')).toBe('true');
  expect(requestPermission).not.toHaveBeenCalled();
});
