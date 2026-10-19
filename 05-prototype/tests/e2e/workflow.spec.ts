import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import type { Actor, Command, CommandType, Mode, ServiceId, Snapshot } from '../../src/shared/contracts';

const id = 'DEMO-P01';
const ultrasound: ServiceId = 'DEMO-US-ABD';
const blood: ServiceId = 'DEMO-BLOOD-BIOCHEM';
async function snapshot(request: APIRequestContext): Promise<Snapshot> { return (await request.get('/api/snapshot')).json(); }
async function command(request: APIRequestContext, type: CommandType, actor: Actor, visitId = id, payload: Command['payload'] = {}) {
  if(type==='REGISTER')payload={departmentId:'DEMO-INTERNAL',...payload};
  const s = await snapshot(request);
  const r = await request.post('/api/commands', { data: { commandId: crypto.randomUUID(), runId: s.runId, expectedRevision: s.revision, actor, type, visitId, payload } });
  const data = await r.json();
  expect(data.ok, `${type}: ${data.message}`).toBe(true);
  return data.snapshot as Snapshot;
}
async function reset(request: APIRequestContext, mode: Mode = 'RETURN_TO_DOCTOR') {
  const s = await snapshot(request);
  const r = await request.post('/api/demo/reset', { data: { commandId: crypto.randomUUID(), expectedRunId: s.runId, expectedRevision: s.revision, actor: 'control', mode, seed: 'e2e' } });
  expect((await r.json()).ok).toBe(true);
  for(const serviceId of [ultrasound,blood])await command(request,'SET_PROCEDURE_QUEUE_METHOD','control',id,{serviceId,queueMethod:'PAPER_TRAY'});
}
async function assign(request: APIRequestContext, visitId = id, serviceIds:ServiceId[]=[ultrasound,blood]) {
  await command(request, 'REGISTER', 'control', visitId);
  await command(request, 'CALL_INITIAL', 'doctor', visitId);
  await command(request, 'BEGIN_ENCOUNTER', 'doctor', visitId);
  await command(request, 'ASSIGN_SERVICES', 'doctor', visitId, {serviceIds});
}
async function perform(request: APIRequestContext, serviceId: ServiceId) {
  await command(request, 'START_SERVICE', 'control', id, { serviceId });
  await command(request, 'COMPLETE_SERVICE', 'control', id, { serviceId });
}
async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

async function finishDirections(page:Page) {
  await expect(page.locator('.guided-stage')).toBeVisible();
  for(let i=0;i<5;i++){
    const next=page.getByRole('button',{name:/^Đã tới tầng|^Đã sang Tòa/});
    if(await next.count())await next.click();else break;
  }
  await page.getByRole('button',{name:/^Tôi đã đến /}).click();
}

test.beforeEach(async ({ request }) => reset(request));

test('paper-only workflow: physical calling order can differ from both roster and suggested route',async({page,request})=>{
  await assign(request);await assign(request,'DEMO-P02');
  await page.goto('/procedure?service=DEMO-BLOOD-BIOCHEM');
  await expect(page.locator('.assigned-row')).toHaveCount(2);
  await expect(page.locator('.queue-number')).toHaveCount(0);
  const search=page.getByRole('searchbox',{name:'Tìm người bệnh trong phòng này'});
  for(const query of ['TRAN HOANG','Trần Hoàng','P02','DEMO-P02']){await search.fill(query);await expect(page.locator('.assigned-row')).toHaveCount(1);await expect(page.locator('.assigned-row')).toContainText('Trần Hoàng Nam');}
  // P02 is called by physical ticket first, and the physical call selects P02 first.
  await page.getByRole('button',{name:'Đã hoàn thành',exact:true}).click();
  await expect(page.locator('.procedure-results')).toContainText('Trần Hoàng Nam');
  await expect(page.locator('.assigned-row')).toHaveCount(0);
  await page.goto('/procedure?service=DEMO-US-ABD');await search.fill('P02');
  await page.getByRole('button',{name:'Đã hoàn thành',exact:true}).click();
  await expect(page.locator('.procedure-results')).toContainText('Trần Hoàng Nam');
  const s=await snapshot(request);expect(s.queues.review).toEqual(['DEMO-P02']);expect(s.visits[1].locationId).toBe('DEMO-SIEUAM');expect(s.visits[1].presenceConfirmed).toBe(false);expect(s.visits[0].phase).toBe('SERVICES');
  await page.goto('/doctor');await expect(page.locator('.queue-column').nth(1)).toContainText('Trần Hoàng Nam');
});

test('room entrance settings update app, map, procedure page and printed guide',async({page,request,context})=>{
  await assign(request,id,[ultrasound]);await page.goto('/control');await page.getByText('Cài đặt & kiểm tra',{exact:true}).click();
  await page.getByRole('combobox',{name:'Cách lấy lượt Siêu âm ổ bụng',exact:true}).selectOption('TAKE_NUMBER');
  const patient=await context.newPage();await patient.setViewportSize({width:390,height:844});await patient.goto('/patient');
  await expect(patient.locator('.next-card')).toContainText('lấy số tại máy');
  await patient.getByRole('button',{name:'Xem đường đi',exact:true}).click();await expect(patient.locator('.map-arrival-instruction')).toContainText('không dùng số khám chuyên khoa ban đầu');
  await finishDirections(patient);await expect(patient.locator('.arrival-note')).toContainText('lấy số tại máy');
  await patient.emulateMedia({media:'print'});await expect(patient.locator('.print-guide')).toContainText('lấy số tại máy');
  await patient.pdf({path:'outputs/adaptive-routing/regression/paper-workflow/printed-guide.pdf',format:'A4',printBackground:true});
  await page.goto('/procedure?service=DEMO-US-ABD');await expect(page.locator('.procedure-arrival-note')).toContainText('Gọi theo số lấy tại cửa phòng');
});

test('paper result mode does not postpone automatic return after procedures',async({page,request})=>{
  await reset(request,'COLLECT_PAPER');await assign(request,id,[blood,ultrasound]);await page.goto('/patient');
  await perform(request,blood);await command(request,'CONFIRM_RESULT','procedure',id,{serviceId:blood});
  await expect(page.getByRole('button',{name:'Xem kết quả'})).toBeVisible();
  await page.getByRole('button',{name:'Xem kết quả'}).click();await expect(page.getByRole('dialog')).toContainText('Kết quả đã được chuyển tới bác sĩ');await page.getByRole('button',{name:'Đã xem',exact:true}).click();
  await perform(request,ultrasound);
  await expect(page.getByRole('heading',{name:'Quay lại phòng Nội A201',exact:true})).toBeVisible();
  let s=await snapshot(request);expect(s.queues.review).toEqual([id]);expect(s.visits[0].services.every(x=>x.paperStatus==='NOT_COLLECTED')).toBe(true);
  await command(request,'CONFIRM_RESULT','procedure',id,{serviceId:ultrasound});await command(request,'COLLECT_PAPER','procedure',id,{serviceId:ultrasound});
  s=await snapshot(request);expect(s.visits[0].locationId).toBe('DEMO-SIEUAM');expect(s.queues.review).toEqual([id]);
});

test('background result for another person never replaces active doctor encounter', async ({ page, request }) => {
  await assign(request);
  await perform(request, ultrasound);
  await command(request, 'REGISTER', 'control', 'DEMO-P02');
  await command(request, 'CALL_INITIAL', 'doctor', 'DEMO-P02');
  await page.goto('/doctor');
  await expect(page.locator('.encounter-card')).toContainText('Trần Hoàng Nam');
  await command(request, 'CONFIRM_RESULT', 'control', id, { serviceId: ultrasound });
  await expect(page.locator('.encounter-card')).toContainText('Trần Hoàng Nam');
  await expect(page.getByRole('heading', { name: 'Bộ kết quả' })).toHaveCount(0);
  expect((await snapshot(request)).activeEncounter?.visitId).toBe('DEMO-P02');
});

test('two resets keep all three pages on the newest generation when an earlier reset acknowledgement is delayed', async ({ context, request }) => {
  await assign(request);
  const control = await context.newPage();
  const patient = await context.newPage();
  const doctor = await context.newPage();
  await Promise.all([control.goto('/control'), patient.goto('/patient'), doctor.goto('/doctor')]);
  let release!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  let responseReady!: () => void;
  const responseReceived = new Promise<void>(resolve => { responseReady = resolve; });
  await control.route('**/api/demo/reset', async route => {
    const response = await route.fetch();
    responseReady();
    await held;
    await route.fulfill({ response });
  });
  await control.getByText('Cài đặt & kiểm tra', { exact: true }).click();
  await control.getByRole('radio').nth(1).check();
  await control.getByRole('button', { name: 'Tạo lượt mới / đặt lại với chế độ đã chọn' }).click();
  await control.getByRole('button', { name: 'Xác nhận tạo lượt mới', exact: true }).click();
  await responseReceived;
  const intermediate = await snapshot(request);
  await reset(request, 'RETURN_TO_DOCTOR');
  const newest = await snapshot(request);
  expect(newest.generation).toBe(intermediate.generation + 1);
  await expect(control.locator('.technical-panel')).toContainText(newest.runId);
  release();
  await expect(control.locator('.technical-panel')).toContainText(newest.runId);
  await command(request, 'REGISTER', 'control');
  await expect(patient.getByRole('heading', { name: 'Đến phòng khám Nội', exact: true })).toBeVisible();
  await expect(doctor.getByRole('button', { name: 'Gọi vào khám ban đầu' })).toBeEnabled();
  await expect(control.locator('.technical-panel')).toContainText(newest.runId);
  await expect(control.locator('.current-fact')).toContainText('Đến phòng khám Nội');
});

test('offline app does not block paper-only completion; reconnect recovers the return route',async({page,request})=>{
  await assign(request);await perform(request,ultrasound);await page.goto('/patient?tools=1');
  await page.getByRole('button',{name:'Thông tin người bệnh'}).click();await page.getByText('Công cụ kiểm tra kết nối',{exact:true}).click();await page.getByRole('button',{name:'Tạm ngắt kết nối trang này'}).click();
  await expect(page.getByRole('status')).toContainText('Chưa có kết nối');
  await perform(request,blood);expect((await snapshot(request)).queues.review).toEqual([id]);
  await expect(page.getByRole('heading',{name:'Đến Xét nghiệm sinh hóa máu',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Kết nối lại',exact:true}).click();await expect(page.getByRole('heading',{name:'Quay lại phòng Nội A201',exact:true})).toBeVisible();
  await expect(page.locator('.patient-update-toast')).toHaveCount(0);
});

test('help dialog contains keyboard focus, closes with Escape and returns focus to its opener', async ({ page }) => {
  await page.goto('/patient');
  const opener = page.getByRole('button', { name: 'Thông tin người bệnh' });
  await opener.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Hỗ trợ và người bệnh' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Đóng hỗ trợ' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  const lastControl=dialog.getByRole('button',{name:/^Reset hành trình của/});
  await expect(lastControl).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', { name: 'Đóng hỗ trợ' })).toBeFocused();
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate(el => el.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test('mobile routes are per service, assistant fallback truthful, print and 360/390 captures', async ({ page, request, context }) => {
  await assign(request);
  await perform(request, ultrasound);
  await command(request, 'CONFIRM_RESULT', 'control', id, { serviceId: ultrasound });
  await command(request, 'START_SERVICE', 'control', id, { serviceId: blood });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/patient');
  await expect(page.getByRole('heading', { name: 'Đang thực hiện Xét nghiệm sinh hóa máu', exact: true })).toBeVisible();
  await mkdir('outputs/adaptive-routing/regression/paper-workflow', { recursive: true });
  await page.screenshot({ path: 'outputs/adaptive-routing/regression/paper-workflow/patient-390.png', fullPage: true });
  await page.screenshot({ path: 'outputs/adaptive-routing/regression/paper-workflow/patient-phone-390.png', fullPage: false });
  await page.setViewportSize({ width: 360, height: 800 });
  await noOverflow(page);
  await page.screenshot({ path: 'outputs/adaptive-routing/regression/paper-workflow/patient-360.png', fullPage: true });
  await page.getByRole('button',{name:'Đường đi',exact:true}).click();
  await expect(page.locator('.map-card h2')).toHaveText('A205 · Sinh hóa');
  await expect(page.locator('.arrival-note')).toBeVisible();
  await expect(page.getByRole('button',{name:'Tổng quan',exact:true})).toHaveCount(0);
  await page.screenshot({path:'outputs/adaptive-routing/regression/paper-workflow/map-360.png',fullPage:true});
  await noOverflow(page);
  await page.getByRole('button', { name: 'Trợ lý', exact: true }).click();
  await page.getByRole('button', { name: 'Giờ tôi làm gì?', exact: true }).click();
  await expect(page.locator('.answer-bubble .answer-source')).toContainText(/Trợ lý hướng dẫn|Hướng dẫn theo tiến độ/);
  await expect(page.locator('.answer-bubble')).not.toContainText(/LIVE|FALLBACK|NOT_LIVE/);
  await page.getByRole('button', { name: 'Lượt khám', exact: true }).click();
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.print-guide')).toBeVisible();
  await expect(page.locator('.print-guide')).toContainText('Giấy không tự cập nhật tiến độ mới');
  await command(request, 'COMPLETE_SERVICE', 'control', id, { serviceId: blood });
  await command(request, 'CONFIRM_RESULT', 'control', id, { serviceId: blood });
  await command(request, 'REGISTER', 'control', 'DEMO-P02');
  const doctor = await context.newPage();
  await doctor.setViewportSize({ width: 1440, height: 1000 });
  await doctor.goto('/doctor');
  await expect(doctor.locator('.queue-column').nth(1)).toContainText('Nguyễn Minh Anh');
  await doctor.screenshot({ path: 'outputs/adaptive-routing/regression/paper-workflow/doctor-desktop.png', fullPage: true });
  await doctor.goto('/control');
  await expect(doctor.getByRole('heading', { name: 'Tiếp nhận & điều phối', exact: true })).toBeVisible();
  await doctor.screenshot({ path: 'outputs/adaptive-routing/regression/paper-workflow/control-desktop.png', fullPage: true });
});
