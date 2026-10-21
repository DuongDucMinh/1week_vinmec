import { uiArtifact } from './ui-artifacts';
import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import type { Actor, Command, CommandType, Snapshot } from '../../src/shared/contracts';

const viewports = [{ width: 1280, height: 720 }, { width: 1024, height: 768 }, { width: 768, height: 1024 }, { width: 390, height: 844 }, { width: 360, height: 640 }, { width: 360, height: 800 }];

async function snapshot(request: APIRequestContext): Promise<Snapshot> { return (await request.get('/api/snapshot')).json(); }
async function send(request: APIRequestContext, type: CommandType, actor: Actor, payload: Command['payload'] = {}, visitId = 'DEMO-P01') {
  const current = await snapshot(request);
  const response = await request.post('/api/commands', { data: { commandId: crypto.randomUUID(), runId: current.runId, expectedRevision: current.revision, expectedJourneyVersion: current.visits.find(v => v.visitId === visitId)!.journeyVersion ?? 0, type, actor, payload, visitId } });
  const body = await response.json();
  expect(body.ok, `${type}: ${body.message}`).toBe(true);
}
async function fitsScreen(page: Page) {
  expect(await page.evaluate(() => ({ horizontal: document.documentElement.scrollWidth > innerWidth, vertical: document.documentElement.scrollHeight > innerHeight + 1 }))).toEqual({ horizontal: false, vertical: false });
  for (const panel of await page.locator('.staff-workspace > [data-pane]:visible').all()) {
    const bounds = await panel.boundingBox();
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual((await page.viewportSize())!.height);
    expect(bounds!.height).toBeGreaterThan(150);
  }
}
async function visibleAction(page: Page, name: string) {
  const action = page.getByRole('button', { name, exact: true });
  await expect(action).toBeVisible();
  await expect(action).toBeInViewport({ ratio: 1 });
  const bounds = await action.boundingBox();
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual((await page.viewportSize())!.height);
}
test.beforeEach(async ({ request }) => {
  const current = await snapshot(request);
  const response = await request.post('/api/demo/reset', { data: { commandId: crypto.randomUUID(), expectedRunId: current.runId, expectedRevision: current.revision, actor: 'control', mode: 'COLLECT_PAPER', seed: 'staff-workspace' } });
  expect(response.ok()).toBe(true);

});

test('reception keeps intake and long progress lists in one screen, with settings in a dismissible dialog', async ({ page, request }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/control');
  await fitsScreen(page);
  await expect(page.getByRole('button', { name: 'Xác nhận tiếp nhận', exact: true })).toBeDisabled();
  for (const size of viewports) {
    await page.setViewportSize(size); await fitsScreen(page); await visibleAction(page, 'Xác nhận tiếp nhận');
  }
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.getByRole('combobox', { name: 'Khoa khám ban đầu', exact: true }).selectOption('DEMO-INTERNAL');
  await page.getByRole('button', { name: 'Xác nhận tiếp nhận', exact: true }).click();
  await send(request, 'CALL_INITIAL', 'doctor');
  await send(request, 'BEGIN_ENCOUNTER', 'doctor');
  await send(request, 'ASSIGN_SERVICES', 'doctor', { serviceIds: (await snapshot(request)).serviceCatalog.map(s => s.id) });
  await expect(page.locator('.control-service')).toHaveCount(9);
  await page.screenshot({ path: uiArtifact('staff-layout/reception-desktop.png') });
  for (const size of viewports) {
    await page.setViewportSize(size); await fitsScreen(page);
    await visibleAction(page, 'Reset hành trình của Nguyễn Minh Anh');
  }
  await page.getByRole('button', { name: 'Người bệnh 3', exact: true }).click();
  await page.locator('.reception-person').filter({ hasText: 'Trần Hoàng Nam' }).click();
  await expect(page.locator('.reception-identity')).toContainText('Trần Hoàng Nam');
  await visibleAction(page, 'Xác nhận tiếp nhận');
  await page.screenshot({ path: uiArtifact('staff-layout/reception-mobile.png') });
  await page.getByRole('button', { name: 'Cài đặt & kiểm tra', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Trả kết quả', exact: true }).click();
  await page.getByRole('radio').first().check();
  await page.getByRole('button', { name: 'Tạo lượt mới / đặt lại với chế độ đã chọn' }).click();
  await expect(page.getByRole('dialog')).toContainText('Bắt đầu lượt khám mới?');
  await page.getByRole('button', { name: 'Tiếp tục lượt hiện tại' }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Cài đặt & kiểm tra', exact: true })).toBeFocused();
  await fitsScreen(page);
});

test('doctor can choose, reorder and confirm all nine orders without moving the page', async ({ page, request }) => {
  await send(request, 'REGISTER', 'control', { departmentId: 'DEMO-DENTISTRY' });
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/doctor?department=DEMO-DENTISTRY');
  await page.getByRole('button', { name: 'Gọi vào khám ban đầu' }).click();
  await page.getByRole('button', { name: 'Bắt đầu trao đổi' }).click();
  await expect(page.getByRole('checkbox')).toHaveCount(9);
  for (const checkbox of await page.getByRole('checkbox').all()) await checkbox.check();
  await page.getByRole('searchbox', { name: 'Tìm thủ tục' }).fill('điện tim');
  await expect(page.getByRole('checkbox')).toHaveCount(1);
  await expect(page.getByRole('checkbox')).toBeChecked();
  await page.getByRole('searchbox', { name: 'Tìm thủ tục' }).fill('');
  await page.screenshot({ path: uiArtifact('staff-layout/doctor-desktop.png') });
  for (const size of viewports) {
    await page.setViewportSize(size); await fitsScreen(page); await visibleAction(page, 'Chốt 9 chỉ định');
  }
  await page.getByRole('group', { name: 'Danh sách thủ tục' }).getByRole('button', { name: 'Đã chọn 9', exact: true }).click();
  const first = (await snapshot(request)).serviceCatalog[0];
  await page.getByRole('button', { name: `Đưa ${first.name} xuống sau` }).click();
  await page.screenshot({ path: uiArtifact('staff-layout/doctor-mobile.png') });
  await page.getByRole('button', { name: 'Chốt 9 chỉ định' }).click();
  await expect(page.locator('.encounter-card')).toContainText('Sẵn sàng khám');
  const ordered = (await snapshot(request)).visits[0].services;
  expect(ordered).toHaveLength(9); expect(ordered[1].id).toBe(first.id);
  await page.getByRole('group', { name: 'Không gian bác sĩ' }).getByRole('button', { name: /^Danh sách/ }).click();
  await page.getByRole('button', { name: /^Kết quả 1$/ }).click();
  await expect(page.locator('.background-updates')).toBeVisible();
  await expect(page.locator('.background-updates')).toContainText('0/9 kết quả');
  await fitsScreen(page);
});

test('procedure separates performance, publication and paper handoff while fitting laptop and phone screens', async ({ page, request }) => {
  for (const visitId of ['DEMO-P01', 'DEMO-P02', 'DEMO-P03']) {
    await send(request, 'REGISTER', 'control', { departmentId: 'DEMO-INTERNAL' }, visitId);
    await send(request, 'CALL_INITIAL', 'doctor', {}, visitId);
    await send(request, 'BEGIN_ENCOUNTER', 'doctor', {}, visitId);
    await send(request, 'ASSIGN_SERVICES', 'doctor', { serviceIds: ['DEMO-BLOOD-BIOCHEM'] }, visitId);
  }
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/procedure?service=DEMO-BLOOD-BIOCHEM');
  const row = page.locator('.assigned-row').filter({ hasText: 'Nguyễn Minh Anh' });
  await row.getByRole('button', { name: 'Đã đến phòng', exact: true }).click();
  await row.getByRole('button', { name: 'Bắt đầu thực hiện', exact: true }).click();
  await expect(row).toContainText('Đang thực hiện');
  await expect(page.locator('.assigned-row').filter({ hasText: 'Trần Hoàng Nam' }).getByRole('button', { name: 'Bắt đầu thực hiện' })).toBeDisabled();
  await row.getByRole('button', { name: 'Đã hoàn thành', exact: true }).click();
  await expect(page.locator('.completed-row')).toContainText('Nguyễn Minh Anh');
  await page.screenshot({ path: uiArtifact('staff-layout/procedure-desktop.png') });
  for (const size of viewports) {
    await page.setViewportSize(size); await fitsScreen(page);
    await expect(page.locator('.assigned-row').first().getByRole('button', { name: 'Đã hoàn thành', exact: true })).toBeInViewport({ ratio: 1 });
  }
  await page.getByRole('group', { name: 'Không gian phòng thủ tục' }).getByRole('button', { name: 'Kết quả 1', exact: true }).click();
  await page.getByRole('button', { name: 'Công bố kết quả', exact: true }).click();
  await page.getByRole('button', { name: 'Xác nhận giao bản giấy', exact: true }).click();
  await expect(page.locator('.completed-row')).toContainText('Đã giao bản giấy');
  await page.screenshot({ path: uiArtifact('staff-layout/procedure-mobile.png') });
  await page.getByRole('button', { name: 'Hướng dẫn tại phòng' }).click();
  await expect(page.getByRole('dialog')).toContainText('không phải thứ tự gọi');
  await page.keyboard.press('Escape'); await fitsScreen(page);
});
