import { finishDirections as arrive } from './navigation';
import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

async function paperDefaults(request:any){for(const serviceId of ['DEMO-US-ABD','DEMO-BLOOD-BIOCHEM']){const s=await(await request.get('/api/snapshot')).json();expect((await request.post('/api/commands',{data:{commandId:crypto.randomUUID(),runId:s.runId,expectedRevision:s.revision,type:'SET_PROCEDURE_QUEUE_METHOD',actor:'control',visitId:'DEMO-P01',payload:{serviceId,queueMethod:'PAPER_TRAY'}}})).ok()).toBe(true);}}



test('reception → first doctor → searched orders → nearest blood → ultrasound → automatic return, all screens sync',async({browser,request})=>{
 test.setTimeout(90000);
 const old=await(await request.get('/api/snapshot')).json();
 await request.post('/api/demo/reset',{data:{commandId:crypto.randomUUID(),expectedRunId:old.runId,expectedRevision:old.revision,actor:'control',mode:'RETURN_TO_DOCTOR',seed:'sequential-browser'}});
 await paperDefaults(request);
 const context=await browser.newContext();
 const patient=await context.newPage();await patient.setViewportSize({width:390,height:844});
 const doctor=await context.newPage();await doctor.setViewportSize({width:1440,height:1000});
 const reception=await context.newPage();await reception.setViewportSize({width:1440,height:1000});
 const us=await context.newPage();await us.setViewportSize({width:1440,height:1000});
 const blood=await context.newPage();await blood.setViewportSize({width:1440,height:1000});
 await Promise.all([patient.goto('/patient'),doctor.goto('/doctor'),reception.goto('/control'),us.goto('/procedure?service=DEMO-US-ABD'),blood.goto('/procedure?service=DEMO-BLOOD-BIOCHEM')]);
 await expect(patient.locator('.timeline')).not.toContainText('Siêu âm');
 await expect(patient.locator('.timeline')).not.toContainText('máu');
 await reception.getByRole('combobox',{name:'Khoa khám ban đầu',exact:true}).selectOption('DEMO-INTERNAL');
 await reception.getByRole('button',{name:'Xác nhận tiếp nhận',exact:true}).click();
 await expect(patient.getByRole('heading',{name:'Đến phòng khám Nội',exact:true})).toBeVisible();
 await patient.getByRole('button',{name:'Xem đường đi',exact:true}).click();
 await expect(patient.locator('.current-location')).toContainText('Quầy tiếp nhận');
 await expect(patient.locator('.route-endpoints')).toContainText('A201');
 await expect(patient.locator('.guided-floor')).toBeVisible();
  await expect(patient.locator('[data-route-segment="guided"]')).toBeVisible();
 await arrive(patient);
 await patient.getByRole('button',{name:'Lượt khám',exact:true}).click();
 await expect(patient.getByRole('heading',{name:'Chờ khám Nội lần đầu',exact:true})).toBeVisible();
 await doctor.getByRole('button',{name:'Gọi vào khám ban đầu',exact:true}).click();
 await doctor.getByRole('button',{name:'Bắt đầu trao đổi',exact:true}).click();
 await doctor.getByRole('searchbox',{name:'Tìm thủ tục'}).fill('sieu am');
 await doctor.getByRole('checkbox').check();
 await doctor.getByRole('searchbox',{name:'Tìm thủ tục'}).fill('máu');
 await doctor.getByRole('checkbox').check();
 await expect(doctor.locator('.order-preview')).toContainText('Siêu âm ổ bụng');
 await expect(patient.locator('.timeline')).not.toContainText('Siêu âm');
 await mkdir('outputs/adaptive-routing/regression/paper-workflow',{recursive:true});
 await doctor.screenshot({path:'outputs/adaptive-routing/regression/paper-workflow/doctor-orders.png',fullPage:true});
 await doctor.getByRole('button',{name:'Chốt 2 chỉ định'}).click();
 await expect(patient.getByRole('heading',{name:'Đến Xét nghiệm sinh hóa máu',exact:true})).toBeVisible();
 await expect(us.locator('.procedure-queue')).toContainText('Nguyễn Minh Anh');
 await expect(blood.locator('.procedure-queue')).toContainText('Nguyễn Minh Anh');
 await expect(blood.getByRole('button',{name:'Đã hoàn thành'})).toBeEnabled();
 await patient.getByRole('button',{name:'Xem đường đi',exact:true}).click();
 await expect(patient.locator('.current-location')).toContainText('A201 · Nội');
 await expect(patient.locator('.route-endpoints')).toContainText('A205');
 await patient.screenshot({path:'outputs/adaptive-routing/regression/paper-workflow/patient-guidance.png',fullPage:true});
 await arrive(patient);
 await expect(patient.locator('.arrival-note')).toContainText('đặt giấy chỉ định lên trên cùng');
 await blood.screenshot({path:'outputs/adaptive-routing/regression/paper-workflow/procedure-queue.png',fullPage:true});
 await blood.getByRole('button',{name:'Đã hoàn thành',exact:true}).click();
 await expect(blood.locator('.procedure-queue')).not.toContainText('Nguyễn Minh Anh');
 await expect(us.locator('.procedure-queue')).toContainText('Nguyễn Minh Anh');
 await expect(patient.locator('.current-location')).toContainText('A205 · Sinh hóa');
 await expect(patient.locator('.route-endpoints')).toContainText('B105');
 await expect(patient.locator('.guided-stage-title')).toContainText('Tòa A · Tầng 2');
 await arrive(patient);
 await us.getByRole('button',{name:'Đã hoàn thành',exact:true}).click();
 // Ready appears immediately after procedural completion, before results or app arrival.
 await expect(doctor.locator('.queue-column').nth(1)).toContainText('Nguyễn Minh Anh');
 await expect(doctor.locator('.queue-column').nth(1)).toContainText('Đang quay lại');
 expect((await(await request.get('/api/snapshot')).json()).visits[0].services.every((s:any)=>s.resultStatus==='WAITING')).toBe(true);
 await doctor.screenshot({path:'outputs/adaptive-routing/regression/paper-workflow/doctor-ready.png',fullPage:true});
 await expect(patient.locator('.route-endpoints')).toContainText('A201');
 await expect(patient.locator('.current-location')).toContainText('B105 · Siêu âm');
 await arrive(patient);
 await expect(patient.locator('.arrival-note')).toContainText('Chỉ vào phòng khi bác sĩ gọi');
 await patient.getByRole('button',{name:'Lượt khám',exact:true}).click();
 await expect(patient.getByRole('heading',{name:'Đã quay lại phòng Nội A201',exact:true})).toBeVisible();
 await expect(patient.getByRole('button',{name:'Sẵn sàng gặp bác sĩ chẩn đoán'})).toHaveCount(0);
 await expect(doctor.getByRole('button',{name:'Gọi vào xem kết quả'})).toHaveCount(0);
 await patient.screenshot({path:'outputs/adaptive-routing/regression/paper-workflow/patient-returned.png',fullPage:true});
 for(const width of [360,390,768]){
  await patient.setViewportSize({width,height:844});
  expect(await patient.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await context.close();
});

test('doctor can choose only blood and complete a patient without any procedures',async({page,request})=>{
 test.setTimeout(60000);
 const old=await(await request.get('/api/snapshot')).json();
 await request.post('/api/demo/reset',{data:{commandId:crypto.randomUUID(),expectedRunId:old.runId,expectedRevision:old.revision,actor:'control',mode:'RETURN_TO_DOCTOR',seed:'individual-orders'}});
 await paperDefaults(request);
 const register=async(id:string)=>{const s=await(await request.get('/api/snapshot')).json();await request.post('/api/commands',{data:{commandId:crypto.randomUUID(),runId:s.runId,expectedRevision:s.revision,type:'REGISTER',actor:'control',visitId:id,payload:{departmentId:'DEMO-INTERNAL'}}});};
 await register('DEMO-P01');await page.goto('/doctor');
 await page.getByRole('button',{name:'Gọi vào khám ban đầu'}).click();await page.getByRole('button',{name:'Bắt đầu trao đổi'}).click();
 await page.getByRole('searchbox',{name:'Tìm thủ tục'}).fill('máu');await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Chốt 1 chỉ định'}).click();
 let s=await(await request.get('/api/snapshot')).json();expect(s.visits[0].services.map((service:{id:string})=>service.id)).toEqual(['DEMO-BLOOD-BIOCHEM']);expect(s.procedureQueues['DEMO-US-ABD']).toEqual([]);
 await register('DEMO-P02');await page.getByRole('button',{name:'Gọi vào khám ban đầu'}).click();await page.getByRole('button',{name:'Bắt đầu trao đổi'}).click();await page.getByRole('button',{name:'Hoàn tất khám, không cần thủ tục'}).click();
 s=await(await request.get('/api/snapshot')).json();expect(s.visits[1].phase).toBe('COMPLETED');expect(s.visits[1].services).toEqual([]);
});
