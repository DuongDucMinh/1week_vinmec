import { test, expect, type APIRequestContext } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import type { Command, Snapshot, ServiceId } from '../../src/shared/contracts';

const blood:ServiceId='DEMO-BLOOD-BIOCHEM',us:ServiceId='DEMO-US-ABD',urine:ServiceId='DEMO-URINE';
const snapshot=async(request:APIRequestContext):Promise<Snapshot>=>(await request.get('/api/snapshot')).json();
async function send(request:APIRequestContext,type:Command['type'],actor:Command['actor'],visitId='DEMO-P01',payload:Command['payload']={}){
 const s=await snapshot(request);const response=await request.post('/api/commands',{data:{commandId:crypto.randomUUID(),runId:s.runId,expectedRevision:s.revision,expectedJourneyVersion:s.visits.find(v=>v.visitId===visitId)?.journeyVersion??0,type,actor,visitId,payload}});
 const data=await response.json();expect(data.ok,data.message).toBe(true);return data.snapshot as Snapshot;
}
async function assign(request:APIRequestContext,visitId:string,serviceIds:ServiceId[]){
 await send(request,'REGISTER','control',visitId,{departmentId:'DEMO-INTERNAL'});await send(request,'CALL_INITIAL','doctor',visitId);await send(request,'BEGIN_ENCOUNTER','doctor',visitId);await send(request,'ASSIGN_SERVICES','doctor',visitId,{serviceIds});
}
test.beforeEach(async({request})=>{const s=await snapshot(request);expect((await request.post('/api/demo/reset',{data:{commandId:crypto.randomUUID(),expectedRunId:s.runId,expectedRevision:s.revision,actor:'control',mode:'RETURN_TO_DOCTOR',seed:'adaptive-routing'}})).ok()).toBe(true);await mkdir('outputs/adaptive-routing',{recursive:true});});

test('patient switches lift/stairs, sees intermediate floors and retains choice after reload',async({page,request})=>{
 await send(request,'REGISTER','control','DEMO-P01',{departmentId:'DEMO-ENT'});
 await page.setViewportSize({width:390,height:844});await page.goto('/patient');await page.getByRole('button',{name:'Xem đường đi',exact:true}).click();
 await expect(page.getByRole('button',{name:'Thang máy',exact:true})).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('.leg-instruction')).toContainText('Đi thang máy lên tầng 4');
 await page.getByRole('button',{name:'Thang bộ',exact:true}).click();
 await expect(page.getByRole('button',{name:'Thang bộ',exact:true})).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('.guided-floor')).toContainText('Thang bộ');
 await expect(page.locator('.guided-stage-title')).toContainText('Chặng 1/4');
 await expect(page.locator('.leg-instruction')).toContainText('Đi thang bộ lên tầng 2');
 await page.getByRole('button',{name:'Đã tới tầng 2',exact:true}).click();
 await expect(page.locator('.guided-stage-title')).toContainText('Tầng 2');
 await page.getByRole('button',{name:'Thang máy',exact:true}).click();
 await expect(page.locator('.guided-stage-title')).toContainText('Chặng 1/2');
 await expect(page.locator('.leg-instruction')).toContainText('Đi thang máy lên tầng 4');
 await page.getByRole('button',{name:'Thang bộ',exact:true}).click();await expect(page.getByRole('button',{name:'Thang bộ',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.reload();await page.getByRole('button',{name:'Đường đi',exact:true}).click();
 await expect(page.getByRole('button',{name:'Thang bộ',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.screenshot({path:'outputs/adaptive-routing/stairs-390.png',fullPage:true});
 await page.setViewportSize({width:360,height:800});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('physical attendance drives A → B → C preview, then completion recalculates A → C → B',async({page,request})=>{
 await assign(request,'DEMO-P02',[us]);await page.goto('/procedure?service=DEMO-US-ABD');
 await page.getByRole('button',{name:'Đã đến phòng',exact:true}).click();await expect(page.locator('.assigned-row')).toContainText('Đang chờ tại phòng');
 await assign(request,'DEMO-P03',[urine]);await send(request,'CHECK_IN_SERVICE','procedure','DEMO-P03',{serviceId:urine});
 await assign(request,'DEMO-P01',[us,urine,blood]);
 await page.setViewportSize({width:390,height:844});await page.goto('/patient');
 await expect(page.locator('#next-title')).toHaveText('Đến Xét nghiệm sinh hóa máu');
 expect(await page.locator('.service-name').allTextContents()).toEqual(['Xét nghiệm sinh hóa máu','Siêu âm ổ bụng','Xét nghiệm nước tiểu']);
 await page.screenshot({path:'outputs/adaptive-routing/plan-before-390.png',fullPage:true});
 await send(request,'COMPLETE_SERVICE','procedure','DEMO-P03',{serviceId:urine});
 await expect(page.locator('#next-title')).toHaveText('Đến Xét nghiệm sinh hóa máu');
 await send(request,'COMPLETE_SERVICE','procedure','DEMO-P01',{serviceId:blood});
 await expect(page.locator('#next-title')).toHaveText('Đến Xét nghiệm nước tiểu');
 expect(await page.locator('.service-name').allTextContents()).toEqual(['Xét nghiệm sinh hóa máu','Xét nghiệm nước tiểu','Siêu âm ổ bụng']);
 await page.screenshot({path:'outputs/adaptive-routing/plan-after-390.png',fullPage:true});
 await page.getByRole('button',{name:'Xem đường đi',exact:true}).click();await expect(page.locator('.route-endpoints')).toContainText('A205 · Sinh hóa');await expect(page.locator('.map-address')).toContainText('A501');
 const s=await snapshot(request);expect(s.visits[0].services.map(s=>s.id)).toEqual([us,urine,blood]);
 await page.emulateMedia({media:'print'});await expect(page.locator('.print-guide')).toContainText('Thứ tự thủ tục dự kiến');
});
