import {expect,test,type APIRequestContext,type Page} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import type {Actor,Command,CommandType,Snapshot} from '../../src/shared/contracts';
async function snapshot(request:APIRequestContext):Promise<Snapshot>{return (await request.get('/api/snapshot')).json();}
async function send(request:APIRequestContext,type:CommandType,actor:Actor='control',payload:Command['payload']={},visitId='DEMO-P01'){const s=await snapshot(request);const r=await request.post('/api/commands',{data:{commandId:crypto.randomUUID(),runId:s.runId,expectedRevision:s.revision,expectedJourneyVersion:s.visits.find(v=>v.visitId===visitId)!.journeyVersion??0,type,actor,payload,visitId}});const body=await r.json();expect(body.ok,`${type}: ${body.message}`).toBe(true);return body.snapshot as Snapshot;}
async function arrive(page:Page){for(let i=0;i<12;i++){const step=page.getByRole('button',{name:/^Đã tới tầng|^Đã sang Tòa/});if(await step.count())await step.click();else break;}await page.getByRole('button',{name:/^Tôi đã đến /}).click();}
test.beforeEach(async({request})=>{const old=await snapshot(request);expect((await request.post('/api/demo/reset',{data:{commandId:crypto.randomUUID(),expectedRunId:old.runId,expectedRevision:old.revision,actor:'control',mode:'RETURN_TO_DOCTOR',seed:'departments-reset'}})).ok()).toBe(true);await mkdir('outputs/departments-reset',{recursive:true});});

test('reception chooses cardiology, expanded orders route back there, and patient reset starts a new dermatology journey',async({browser,request})=>{
 test.setTimeout(120000);
 const context=await browser.newContext();const patient=await context.newPage();await patient.setViewportSize({width:390,height:844});const control=await context.newPage();const doctor=await context.newPage();
 await Promise.all([patient.goto('/patient'),control.goto('/control'),doctor.goto('/doctor?department=DEMO-CARDIOLOGY')]);
 await expect(patient.locator('.timeline')).not.toContainText('Khám Nội');await expect(patient.locator('.next-card')).not.toContainText('Tim mạch');
 await expect(control.getByRole('button',{name:'Xác nhận tiếp nhận',exact:true})).toBeDisabled();
 await control.getByRole('combobox',{name:'Khoa khám ban đầu',exact:true}).selectOption('DEMO-CARDIOLOGY');
 await expect(patient.locator('.next-card')).not.toContainText('Tim mạch');
 await control.getByRole('button',{name:'Xác nhận tiếp nhận',exact:true}).click();
 await expect(patient.getByRole('heading',{name:'Đến phòng khám Tim mạch',exact:true})).toBeVisible();
 await patient.getByRole('button',{name:'Xem đường đi',exact:true}).click();await expect(patient.locator('.map-address')).toContainText('A301');await arrive(patient);
 await doctor.getByRole('button',{name:'Gọi vào khám ban đầu',exact:true}).click();await doctor.getByRole('button',{name:'Bắt đầu trao đổi',exact:true}).click();
 for(const keyword of ['điện tim','CT','nước tiểu']){await doctor.getByRole('searchbox',{name:'Tìm thủ tục'}).fill(keyword);await doctor.getByRole('checkbox').check();}
 await doctor.screenshot({path:'outputs/departments-reset/cardiology-orders.png',fullPage:true});await doctor.getByRole('button',{name:'Chốt 3 chỉ định'}).click();
 const assigned=await snapshot(request);expect(assigned.visits[0].services.map(s=>s.id)).toEqual(['DEMO-ECG','DEMO-CT','DEMO-URINE']);for(const serviceId of ['DEMO-ECG','DEMO-CT','DEMO-URINE'] as const){expect(assigned.procedureQueues[serviceId]).toContain('DEMO-P01');await send(request,'COMPLETE_SERVICE','procedure',{serviceId});}
 await expect(doctor.locator('.queue-column').nth(1)).toContainText('Nguyễn Minh Anh');await expect(patient.locator('.map-address')).toContainText('A301');await expect(patient.locator('.route-endpoints')).toContainText('A501');
 await arrive(patient);await expect(patient.locator('.arrival-note')).toContainText('demo kết thúc');await patient.screenshot({path:'outputs/departments-reset/cardiology-return.png',fullPage:true});
 // Keep another patient's live encounter while resetting P01 from the app.
 await send(request,'REGISTER','control',{departmentId:'DEMO-ENT'},'DEMO-P02');await send(request,'CALL_INITIAL','doctor',{},'DEMO-P02');const other=(await snapshot(request)).visits[1];
 await patient.getByRole('button',{name:'Thông tin người bệnh',exact:true}).click();
 await patient.getByRole('button',{name:'Reset hành trình của Nguyễn Minh Anh',exact:true}).click();
 await expect(patient.getByRole('heading',{name:'Đến quầy tiếp nhận',exact:true})).toBeVisible();await expect(patient.locator('.timeline')).not.toContainText('Tim mạch');await expect(patient.locator('.timeline')).not.toContainText('điện tâm');await expect(doctor.locator('.queue-column').nth(1)).not.toContainText('Nguyễn Minh Anh');
 const reset=await snapshot(request);expect(reset.visits[0].journeyVersion).toBe(1);expect(reset.visits[1]).toEqual(other);expect(reset.activeEncounters['DEMO-ENT']?.visitId).toBe('DEMO-P02');
 await control.getByRole('combobox',{name:'Khoa khám ban đầu',exact:true}).selectOption('DEMO-DERMATOLOGY');await control.getByRole('button',{name:'Xác nhận tiếp nhận',exact:true}).click();
 await expect(patient.getByRole('heading',{name:'Đến phòng khám Da liễu',exact:true})).toBeVisible();await patient.getByRole('button',{name:'Xem đường đi',exact:true}).click();await expect(patient.locator('.map-address')).toContainText('A405');await patient.screenshot({path:'outputs/departments-reset/dermatology-route.png',fullPage:true});
 await control.getByRole('button',{name:'Reset hành trình của Nguyễn Minh Anh',exact:true}).click();await expect(patient.getByRole('heading',{name:'Đến quầy tiếp nhận',exact:true})).toBeVisible();expect((await snapshot(request)).visits[0].journeyVersion).toBe(2);
 await context.close();
});

test('dentistry and ENT doctors work independently; reset removes one active visit from procedure lists',async({page,request})=>{
 for(const [visitId,departmentId] of [['DEMO-P01','DEMO-DENTISTRY'],['DEMO-P02','DEMO-ENT']] as const){await send(request,'REGISTER','control',{departmentId},visitId);await send(request,'CALL_INITIAL','doctor',{},visitId);await send(request,'BEGIN_ENCOUNTER','doctor',{},visitId);}
 await page.goto('/doctor?department=DEMO-DENTISTRY');await expect(page.locator('.encounter-card')).toContainText('Nguyễn Minh Anh');await expect(page.locator('.page-title')).toContainText('A305');
 await page.getByRole('searchbox',{name:'Tìm thủ tục'}).fill('X-quang');await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Chốt 1 chỉ định'}).click();
 await page.getByRole('combobox',{name:'Khoa làm việc'}).selectOption('DEMO-ENT');await expect(page.locator('.encounter-card')).toContainText('Trần Hoàng Nam');await expect(page.locator('.page-title')).toContainText('A401');
 await send(request,'ASSIGN_SERVICES','doctor',{serviceIds:['DEMO-EEG','DEMO-ENDO-ESOPHAGUS','DEMO-ENDO-STOMACH']},'DEMO-P02');
 await page.goto('/procedure?service=DEMO-ENDO-STOMACH');await expect(page.locator('.assigned-row')).toContainText('Trần Hoàng Nam');
 await page.getByRole('combobox',{name:'Phòng làm việc'}).selectOption('DEMO-XRAY');await expect(page.locator('.assigned-row')).toContainText('Nguyễn Minh Anh');
 await send(request,'RESET_VISIT','control',{},'DEMO-P01');await expect(page.locator('.assigned-row')).toHaveCount(0);expect((await snapshot(request)).visits[1].services).toHaveLength(3);
});


test('long specialty names and new endoscopy map legs remain readable at phone and tablet widths',async({page,request})=>{
 test.setTimeout(90000);await send(request,'REGISTER','control',{departmentId:'DEMO-DENTISTRY'});
 await page.setViewportSize({width:390,height:844});await page.goto('/patient');await expect(page.locator('.timeline')).toContainText('Khám Răng - Hàm - Mặt');
 await page.screenshot({path:'outputs/departments-reset/dentistry-patient-390.png',fullPage:true});
 await send(request,'CALL_INITIAL','doctor');await send(request,'BEGIN_ENCOUNTER','doctor');await send(request,'ASSIGN_SERVICES','doctor',{serviceIds:['DEMO-ENDO-STOMACH']});
 await page.getByRole('button',{name:'Xem đường đi',exact:true}).click();await expect(page.locator('.map-address')).toContainText('B305');
 for(let i=0;i<10;i++){
  expect(await page.locator('.guided-floor').evaluate(svg=>[...svg.querySelectorAll('text')].every(text=>{const box=text.getBBox();return box.x>=0&&box.x+box.width<=360&&box.y>=0&&box.y+box.height<=190;}))).toBe(true);
  const next=page.getByRole('button',{name:/^Đã tới tầng|^Đã sang Tòa/});if(await next.count())await next.click();else break;
 }
 await expect(page.locator('.guided-stage-title')).toContainText('Tòa B · Tầng 3');await expect(page.locator('.guided-floor')).toContainText('dạ dày');await page.screenshot({path:'outputs/departments-reset/endoscopy-map-390.png',fullPage:true});
 for(const width of [360,390,768]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 await page.goto('/control');await expect(page.locator('.patient-reset-row')).toHaveCount(3);await page.getByText('Cài đặt & kiểm tra',{exact:true}).click();await expect(page.locator('.room-method-setting')).toHaveCount(9);await page.screenshot({path:'outputs/departments-reset/control-768.png',fullPage:true});
 await page.goto('/doctor?department=DEMO-DENTISTRY');await page.screenshot({path:'outputs/departments-reset/doctor-dentistry-768.png',fullPage:true});
});
