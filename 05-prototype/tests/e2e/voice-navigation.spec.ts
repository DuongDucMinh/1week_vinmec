import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

test('voice follows steps, cancels on leaving and reroutes from a confirmed landmark', async ({ page, request }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    (window as any).spoken = [];
    (window as any).cancelled = 0;
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: class { text:string; lang=''; rate=1; voice:unknown=null; onerror:unknown=null; constructor(text:string){this.text=text;} } });
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
      cancel: () => { (window as any).cancelled++; },
      getVoices: () => [{ lang: 'vi-VN', name: 'Test Vietnamese' }],
      speak: (u: SpeechSynthesisUtterance) => { (window as any).spoken.push({ text: u.text, lang: u.lang }); },
    } });
  });
  let s = await (await request.get('/api/snapshot')).json();
  await request.post('/api/demo/reset', { data: { commandId: crypto.randomUUID(), expectedRunId: s.runId, expectedRevision: s.revision, actor: 'control', mode: 'RETURN_TO_DOCTOR', seed: 'voice' } });
  s = await (await request.get('/api/snapshot')).json();
  await request.post('/api/commands', { data: { commandId: crypto.randomUUID(), runId: s.runId, expectedRevision: s.revision, type: 'REGISTER', actor: 'control', visitId: 'DEMO-P01', payload: { departmentId: 'DEMO-INTERNAL' } } });
  await page.goto('/patient');
  await page.getByRole('button', { name: 'Xem đường đi', exact: true }).click();
  await page.getByRole('button', { name: 'Bật giọng chỉ đường', exact: true }).click();
  await expect.poll(() => page.evaluate(() => (window as any).spoken.length)).toBeGreaterThan(0);
  await expect(page.locator('.walking-instruction')).toContainText('quay mặt');
  await page.getByRole('button', { name: 'Đã tới mốc tiếp theo', exact: true }).click();
  await expect.poll(() => page.evaluate(() => (window as any).spoken.at(-1).text)).toContain('tầng 2');
  await page.getByRole('button', { name: 'Đã tới tầng 2', exact: true }).click();
  await page.getByRole('button', { name: 'Đã tới mốc tiếp theo', exact: true }).click();
  await expect(page.locator('.walking-instruction')).toContainText('Rẽ phải');
  await page.getByRole('button', { name: 'Tôi đi nhầm / không rõ hướng', exact: true }).click();
  await expect(page.locator('.lost-message')).toBeVisible();
  await page.getByRole('combobox', { name: 'Vị trí hiện tại', exact: true }).selectOption('DEMO-SIEUAM');
  await page.getByRole('button', { name: 'Xác nhận vị trí của tôi', exact: true }).click();
  await expect(page.locator('.route-endpoints')).toContainText('B105');
  await expect(page.locator('.guided-stage-title')).toContainText('Tòa B');
  await mkdir('outputs/adaptive-routing/regression/user-feedback', { recursive: true });
  await page.screenshot({ path: 'outputs/adaptive-routing/regression/user-feedback/navigation-phone.png', fullPage: true });
  await page.getByText('Google Maps và sơ đồ trong viện', { exact: true }).click();
  await expect(page.getByRole('link', { name: 'Mở Google Maps tìm cơ sở' })).toHaveAttribute('href', /google.com\/maps\/search/);
  const count = await page.evaluate(() => (window as any).cancelled);
  await page.getByRole('button', { name: 'Lượt khám', exact: true }).click();
  await expect.poll(() => page.evaluate(() => (window as any).cancelled)).toBeGreaterThan(count);
});
