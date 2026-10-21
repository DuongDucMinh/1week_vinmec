import { uiArtifact } from './ui-artifacts';
import { test, expect, type APIRequestContext, type Page } from '@playwright/test';
import type { Actor, Command, CommandType, Snapshot } from '../../src/shared/contracts';

const id = 'DEMO-P01';
async function read(request: APIRequestContext): Promise<Snapshot> { return (await request.get('/api/snapshot')).json(); }
async function command(request: APIRequestContext, type: CommandType, actor: Actor, payload: Command['payload'] = {}) {
  const s = await read(request);
  const response = await request.post('/api/commands', { data: { commandId: crypto.randomUUID(), runId: s.runId, expectedRevision: s.revision, expectedJourneyVersion: s.views[id].visit.journeyVersion ?? 0, visitId: id, type, actor, payload } });
  const body = await response.json(); expect(body.ok, body.message).toBe(true); return body.snapshot as Snapshot;
}
async function prepare(request: APIRequestContext) {
  const s = await read(request);
  const response = await request.post('/api/demo/reset', { data: { commandId: crypto.randomUUID(), expectedRunId: s.runId, expectedRevision: s.revision, actor: 'control', mode: 'RETURN_TO_DOCTOR', seed: 'recovery' } });
  expect((await response.json()).ok).toBe(true);
  await command(request, 'REGISTER', 'control', { departmentId: 'DEMO-INTERNAL' });
  await command(request, 'CALL_INITIAL', 'doctor'); await command(request, 'BEGIN_ENCOUNTER', 'doctor');
  await command(request, 'ASSIGN_SERVICES', 'doctor', { serviceIds: ['DEMO-BLOOD-BIOCHEM', 'DEMO-US-ABD'] });
}
async function openMap(page: Page) {
  await page.goto('/patient'); await expect(page.locator('.sync-status')).toContainText('Đã đồng bộ');
  await page.getByRole('button', { name: 'Đường đi', exact: true }).click();
}
async function choose(page: Page, building: string, floor: string, location: string) {
  await page.getByRole('button', { name: 'Cập nhật vị trí', exact: true }).click();
  const dialog = page.locator('dialog[open]').filter({ has: page.locator('.location-update') });
  await dialog.getByLabel('Tòa nhà', { exact: true }).selectOption(building);
  await dialog.getByLabel('Tầng', { exact: true }).selectOption(floor);
  await dialog.getByLabel('Mốc đang đứng', { exact: true }).selectOption(location);
  return dialog;
}
test.beforeEach(async ({ request, page }) => {
  await prepare(request);
  await page.setViewportSize({ width: 480, height: 940 });
  await page.addInitScript(() => localStorage.setItem('vinmec.navigationVoice', 'off'));
});

test('user can recover from another building without replacing the destination or guessing a default position', async ({ page, request }) => {
  await openMap(page); const before = (await read(request)).views[id];
  await page.getByRole('button', { name: 'Cập nhật vị trí', exact: true }).click();
  const dialog = page.locator('dialog[open]').filter({ has: page.locator('.location-update') });
  await expect(dialog.getByRole('button', { name: 'Tôi đang tại mốc này' })).toBeDisabled();
  await dialog.getByRole('button', { name: 'Tôi không xác định được vị trí' }).click();
  await expect(dialog.locator('.location-help')).toContainText('Nhờ nhân viên');
  expect((await read(request)).views[id].visit.locationId).toBe(before.visit.locationId);
  await dialog.getByLabel('Tòa nhà', { exact: true }).selectOption('B');
  await dialog.getByLabel('Tầng', { exact: true }).selectOption('1');
  await dialog.getByLabel('Mốc đang đứng', { exact: true }).selectOption('DEMO-SIEUAM');
  await page.locator('.phone-shell').screenshot({ path: uiArtifact('navigation-recovery/choose-location.png') });
  await dialog.getByRole('button', { name: 'Tôi đang tại mốc này' }).click();
  await expect(dialog).toHaveCount(0); await expect(page.locator('.current-location')).toContainText('Siêu âm');
  const after = (await read(request)).views[id];
  expect(after.route.from).toBe('DEMO-SIEUAM'); expect(after.route.to).toBe(before.route.to);
  expect(after.visit.services).toEqual(before.visit.services); expect(after.visit.recommendedServiceId).toBe(before.visit.recommendedServiceId);
  await page.locator('.phone-shell').screenshot({ path: uiArtifact('navigation-recovery/rerouted-from-building-b.png') });
});

test('returning through the entrance retains the completed first procedure and survives reload', async ({ page, request }) => {
  await command(request, 'START_SERVICE', 'procedure', { serviceId: 'DEMO-BLOOD-BIOCHEM' });
  await command(request, 'COMPLETE_SERVICE', 'procedure', { serviceId: 'DEMO-BLOOD-BIOCHEM' });
  await openMap(page); const before = (await read(request)).views[id];
  const dialog = await choose(page, 'A', '1', 'DEMO-ENTRANCE');
  await dialog.getByRole('button', { name: 'Tôi đang tại mốc này' }).click(); await expect(dialog).toHaveCount(0);
  await expect(page.locator('.current-location')).toContainText('Cổng');
  const after = (await read(request)).views[id];
  expect(after.route.from).toBe('DEMO-ENTRANCE'); expect(after.route.to).toBe(before.route.to);
  expect(after.visit.services).toEqual(before.visit.services);
  expect(after.visit.services.find(item => item.id === 'DEMO-BLOOD-BIOCHEM')!.executionStatus).toBe('COMPLETED');
  await page.reload(); await page.getByRole('button', { name: 'Đường đi', exact: true }).click();
  await expect(page.locator('.current-location')).toContainText('Cổng');
  await page.locator('.phone-shell').screenshot({ path: uiArtifact('navigation-recovery/return-from-entrance.png') });
});

test('real network loss keeps sync time, blocks updates and recovers with fresh server data', async ({ page, context, request }) => {
  await openMap(page); const timestamp = await page.locator('.sync-status time').getAttribute('datetime');
  await page.locator('.phone-shell').screenshot({ path: uiArtifact('navigation-recovery/online-sync.png') });
  await page.getByRole('button', { name: 'Chi tiết kết nối' }).click();
  await expect(page.getByRole('dialog')).toContainText('Đồng bộ thành công lần cuối');
  await page.locator('.phone-shell').screenshot({ path: uiArtifact('navigation-recovery/sync-details.png') });
  await page.getByRole('button', { name: 'Đóng chi tiết kết nối' }).click();
  await context.setOffline(true);
  try {
    await expect(page.locator('.sync-status')).toContainText('Mất kết nối');
    await expect(page.locator('.connection-banner')).toBeVisible();
    await expect(page.locator('.navigation-advance')).toBeDisabled();
    await page.locator('.phone-shell').screenshot({ path: uiArtifact('navigation-recovery/offline-warning.png') });
    await page.getByRole('button', { name: 'Cập nhật vị trí', exact: true }).click();
    const dialog = page.locator('dialog[open]').filter({ has: page.locator('.location-update') });
    await expect(dialog.getByLabel('Tòa nhà', { exact: true })).toBeDisabled();
    await expect(dialog.getByRole('button', { name: 'Tôi đang tại mốc này' })).toBeDisabled();
  } finally { await context.setOffline(false); }
  await page.getByRole('button', { name: 'Đóng cập nhật vị trí' }).click();
  await expect(page.locator('.sync-status')).toContainText('Đã đồng bộ');
  await expect(page.locator('.sync-status time')).not.toHaveAttribute('datetime', timestamp!);
  await expect(page.locator('.connection-banner')).toHaveCount(0);
  await expect(page.locator('.navigation-advance')).toBeEnabled();
  expect((await read(request)).views[id].route.from).not.toBe('DEMO-ENTRANCE');
});

test('manual reconnect works for the testing switch and a failed position update does not close the dialog', async ({ page }) => {
  await page.goto('/patient?tools=1');
  await page.getByRole('button', { name: 'Thông tin người bệnh', exact: true }).click();
  await page.getByText('Công cụ kiểm tra kết nối', { exact: true }).click();
  await page.getByRole('button', { name: 'Tạm ngắt kết nối trang này' }).click();
  await expect(page.locator('.sync-status')).toContainText('Mất kết nối');
  await page.locator('.connection-banner').getByRole('button', { name: 'Kết nối lại' }).click();
  await expect(page.locator('.sync-status')).toContainText('Đã đồng bộ');
  await page.getByRole('button', { name: 'Đường đi', exact: true }).click();
  const dialog = await choose(page, 'A', '1', 'DEMO-ENTRANCE');
  await page.route('**/api/commands', route => route.fulfill({ status: 422, json: { ok: false, message: 'Không thể cập nhật vị trí.' } }));
  await dialog.getByRole('button', { name: 'Tôi đang tại mốc này' }).click();
  await expect(dialog).toBeVisible(); await expect(dialog.getByRole('alert')).toContainText('Không thể cập nhật vị trí');
});

test('connection indicator fits the existing header across patient tabs and window sizes', async ({ page }) => {
  for (const size of [{ width: 360, height: 640 }, { width: 390, height: 844 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(size); await page.goto('/patient');
    await expect(page.locator('.patient-header .sync-status')).toBeVisible();
    await expect(page.locator('.phone-shell > .sync-status')).toHaveCount(0);
    for (const name of ['Lượt khám', 'Đường đi', 'Thông báo', 'Trợ lý']) {
      await page.getByRole('button', { name, exact: true }).click();
      const header = await page.locator('.patient-header').boundingBox();
      const icon = await page.locator('.sync-status').boundingBox();
      const logo = await page.locator('.patient-header .brand').boundingBox();
      const profile = await page.locator('.patient-profile-button').boundingBox();
      expect(icon!.y).toBeGreaterThanOrEqual(header!.y);
      expect(icon!.y + icon!.height).toBeLessThanOrEqual(header!.y + header!.height + 1);
      expect(icon!.x + icon!.width).toBeLessThanOrEqual(header!.x + header!.width);
      expect(logo!.x + logo!.width).toBeLessThanOrEqual(profile!.x);
      await expect(page.locator('.sync-status')).toBeVisible();
    }
  }
});
