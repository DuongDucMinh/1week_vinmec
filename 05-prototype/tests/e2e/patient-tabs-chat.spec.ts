import { uiArtifact } from './ui-artifacts';
import {test,expect,type APIRequestContext} from '@playwright/test';
import type {Command,Snapshot} from '../../src/shared/contracts';
const read=async(request:APIRequestContext):Promise<Snapshot>=>(await request.get('/api/snapshot')).json();
async function send(request:APIRequestContext,type:Command['type'],actor:Command['actor'],payload:Command['payload']={}){
 const s=await read(request);
 const response=await request.post('/api/commands',{data:{commandId:crypto.randomUUID(),runId:s.runId,expectedRevision:s.revision,type,actor,visitId:'DEMO-P01',payload}});
 const data=await response.json();expect(data.ok,data.message).toBe(true);return data.snapshot as Snapshot;
}
test.beforeEach(async({request})=>{const s=await read(request);const reset=await request.post('/api/demo/reset',{data:{commandId:crypto.randomUUID(),expectedRunId:s.runId,expectedRevision:s.revision,actor:'control',mode:'RETURN_TO_DOCTOR',seed:'patient-tabs-chat'}});expect((await reset.json()).ok).toBe(true);});

test('shared patient profile switches the current person and notification settings live in the inbox',async({page,context})=>{
 await page.setViewportSize({width:393,height:852});await page.goto('/patient');
 const profileButton=page.getByRole('button',{name:'Thông tin người bệnh',exact:true});
 for(const name of ['Lượt khám','Đường đi','Thông báo','Trợ lý']){
  await page.getByRole('button',{name,exact:true}).click();
  await expect(profileButton).toContainText('Nguyễn Minh Anh');
  await expect(page.locator('.visit-heading p')).toHaveCount(0);
  if(name==='Thông báo'){
   await expect(page.getByRole('heading',{name:'Nhận thông báo kết quả',exact:true})).toBeVisible();
   await page.screenshot({path:uiArtifact('patient-tabs/notification-settings-393.png'),fullPage:true});
   await page.getByRole('button',{name:'Bật thông báo kết quả',exact:true}).click();
   await expect(page.locator('.notification-settings')).toHaveCount(0);
   await page.getByRole('button',{name:'Tắt thông báo kết quả',exact:true}).click();
   await expect(page.locator('.notification-settings')).toHaveCount(0);
   await expect(page.locator('.notification-toggle')).toHaveAttribute('aria-pressed','false');
   await page.getByRole('button',{name:'Bật thông báo kết quả',exact:true}).click();
   await expect(page.locator('.notification-toggle')).toHaveAttribute('aria-pressed','true');

   await page.screenshot({path:uiArtifact('navigation-feedback/notification-bell.png'),fullPage:true});
  }else await expect(page.locator('.notification-settings')).toHaveCount(0);
 }
 await page.reload();
 await page.getByRole('button',{name:'Thông báo',exact:true}).click();
 await expect(page.locator('.notification-settings')).toHaveCount(0);
 await expect(page.locator('.notification-toggle')).toHaveAttribute('aria-pressed','true');
 await profileButton.click();
 const profile=page.getByRole('dialog',{name:'Thông tin cá nhân',exact:true});
 await expect(profile.locator('.profile-identity')).toContainText('Nguyễn Minh Anh');
 await expect(profile.locator('.profile-details')).toContainText('35 tuổi');
 await expect(profile.getByRole('button',{name:/In \/ lưu|Bật thông báo/})).toHaveCount(0);
 await expect(profile.getByRole('button',{name:'Reset hành trình của Nguyễn Minh Anh',exact:true})).toBeVisible();
 const phone=await page.locator('.phone-shell').boundingBox(),popup=await profile.boundingBox();
 expect(popup!.x).toBeGreaterThanOrEqual(phone!.x);expect(popup!.y).toBeGreaterThanOrEqual(phone!.y);expect(popup!.x+popup!.width).toBeLessThanOrEqual(phone!.x+phone!.width);expect(popup!.y+popup!.height).toBeLessThanOrEqual(phone!.y+phone!.height);
 await page.screenshot({path:uiArtifact('patient-tabs/patient-profile-393.png'),fullPage:true});
 await profile.getByRole('combobox',{name:'Đổi người khám',exact:true}).selectOption('DEMO-P02');
 await expect(profile).toHaveCount(0);await expect(profileButton).toContainText('Trần Hoàng Nam');
 await profileButton.click();
 await expect(profile.locator('.profile-identity')).toContainText('Trần Hoàng Nam');
 await expect(profile.locator('.profile-details')).toContainText('48 tuổi');
 await expect(profile.locator('.profile-details')).toContainText('PID-002');
});

test('all results notify the patient to wait for the doctor and stay close to procedure details',async({page,request})=>{
 await page.setViewportSize({width:393,height:852});
 await send(request,'REGISTER','control',{departmentId:'DEMO-INTERNAL'});
 await send(request,'CALL_INITIAL','doctor');await send(request,'BEGIN_ENCOUNTER','doctor');
 const serviceIds=['DEMO-BLOOD-BIOCHEM','DEMO-URINE','DEMO-ECG'] as const;
 await send(request,'ASSIGN_SERVICES','doctor',{serviceIds:[...serviceIds]});
 for(const serviceId of serviceIds)await send(request,'COMPLETE_SERVICE','procedure',{serviceId});
 await send(request,'CONFIRM_LOCATION','patient',{locationId:'DEMO-NOI'});
 await page.goto('/patient');
 await expect(page.locator('.next-card')).toContainText('kết quả sẽ được cập nhật khi có');
 for(const serviceId of serviceIds.slice(0,-1))await send(request,'CONFIRM_RESULT','procedure',{serviceId});
 await expect(page.locator('.result-status.available')).toHaveCount(2);
 await expect(page.locator('#next-title')).not.toHaveText('Sẵn sàng nghe chẩn đoán');
 await send(request,'CONFIRM_RESULT','procedure',{serviceId:serviceIds[2]});
 await expect(page.locator('.patient-update-toast')).toContainText('Tất cả thủ tục đã có kết quả');
 await expect(page.locator('.patient-update-toast')).toContainText('khi bác sĩ gọi');
 await expect(page.locator('#next-title')).toHaveText('Sẵn sàng nghe chẩn đoán');
 await expect(page.locator('.next-card')).toContainText('ngồi chờ ngoài phòng');
 await page.getByRole('button',{name:'Thông báo',exact:true}).click();
 await expect(page.locator('.notification').first()).toContainText('sẵn sàng vào nghe chẩn đoán khi bác sĩ gọi');
 await page.reload();
 await expect(page.locator('#next-title')).toHaveText('Sẵn sàng nghe chẩn đoán');

 await page.screenshot({path:uiArtifact('results-readiness/ready-393.png'),fullPage:true});
 for(const width of [360,393,768]){
  await page.setViewportSize({width,height:852});
  for(const service of await page.locator('.service-card').all()){
   const spacing=await service.evaluate(card=>{
    const room=card.querySelector('.service-room')!.getBoundingClientRect();
    const status=card.querySelector('.result-status')!.getBoundingClientRect();
    const textTop=(selector:string)=>{const range=document.createRange();range.selectNodeContents(card.querySelector(selector)!.firstChild!);return range.getBoundingClientRect().top;};
    const body=card.querySelector('.service-body')!.getBoundingClientRect();
    return {gap:status.top-room.bottom,alignment:Math.abs(textTop('.result-status')-textTop('.result-row button')),tail:body.bottom-status.bottom,touchHeight:card.querySelector<HTMLButtonElement>('.result-row button')!.offsetHeight};
   });
   expect(spacing.gap).toBeGreaterThanOrEqual(0);expect(spacing.gap).toBeLessThanOrEqual(6);
   expect(spacing.alignment).toBeLessThanOrEqual(4);expect(spacing.touchHeight).toBeGreaterThanOrEqual(40);
   expect(spacing.tail).toBeLessThanOrEqual(2);
  }
  const stepGaps=await page.locator('.timeline-step').evaluateAll(steps=>steps.slice(0,-1).map((step,index)=>steps[index+1].getBoundingClientRect().top-step.querySelector(':scope > div')!.getBoundingClientRect().bottom));
  expect(Math.max(...stepGaps)-Math.min(...stepGaps)).toBeLessThan(1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await page.setViewportSize({width:393,height:852});
 await page.locator('.service-card').first().scrollIntoViewIfNeeded();
 await page.screenshot({path:uiArtifact('results-readiness/procedure-spacing-393.png'),fullPage:true});
 await page.getByRole('button',{name:'Xem kết quả ›',exact:true}).first().click();
 await expect(page.getByRole('dialog')).toBeVisible();
});

test('desktop patient preview keeps the iPhone 16 aspect ratio when the window gets shorter',async({page})=>{
 test.setTimeout(90000);
 await page.goto('/patient');
 for(const [width,height] of [[1440,1000],[1366,768],[1024,600],[800,500],[650,900],[640,900],[500,900],[393,852],[360,640],[1440,1000]]){
  await page.setViewportSize({width,height});
  for(const name of ['Lượt khám','Đường đi','Thông báo','Trợ lý']){
   await page.getByRole('button',{name,exact:true}).click();
   await expect.poll(async()=>{
    const frame=await page.locator('.phone-shell').boundingBox();
    return Math.abs(frame!.height-852*Math.min(1,(height-48)/852,(width-48)/393));
   }).toBeLessThan(1);
   const layout=await page.locator('.phone-shell').evaluate(frame=>{
    const rect=frame.getBoundingClientRect();
    return {width:rect.width,height:rect.height,logicalWidth:frame.clientWidth,logicalHeight:frame.clientHeight,bodyWidth:document.documentElement.scrollWidth,bodyHeight:document.documentElement.scrollHeight};
   });
   expect(layout.width/layout.height).toBeCloseTo(393/852,4);
   expect(layout.logicalWidth).toBe(391);expect(layout.logicalHeight).toBe(850);
   expect(layout.bodyWidth).toBeLessThanOrEqual(width);expect(layout.bodyHeight).toBeLessThanOrEqual(height);
  }
 }
});

test('result banners, personal reset and arrival guidance stay inside the simulated phone',async({page,request})=>{
 await page.addInitScript(()=>{
  Object.assign(window,{nativeNotificationCalls:0});
  Object.defineProperty(window,'Notification',{configurable:true,value:class{
   static permission='denied';
   static requestPermission(){Object.assign(window,{nativeNotificationCalls:1});throw new Error('Unexpected browser notification permission');}
   constructor(){Object.assign(window,{nativeNotificationCalls:1});throw new Error('Unexpected browser notification');}
  }});
 });
 await send(request,'REGISTER','control',{departmentId:'DEMO-INTERNAL'});
 await send(request,'CALL_INITIAL','doctor');await send(request,'BEGIN_ENCOUNTER','doctor');
 await send(request,'ASSIGN_SERVICES','doctor',{serviceIds:['DEMO-US-ABD']});
 await page.setViewportSize({width:800,height:900});await page.goto('/patient');
 await expect(page.locator('.next-card')).toContainText('Siêu âm');
 await page.getByRole('button',{name:'Thông báo',exact:true}).click();
 await page.getByRole('button',{name:'Bật thông báo kết quả',exact:true}).click();
 await page.getByRole('button',{name:'Lượt khám',exact:true}).click();
 await send(request,'COMPLETE_SERVICE','procedure',{serviceId:'DEMO-US-ABD'});
 await send(request,'CONFIRM_RESULT','procedure',{serviceId:'DEMO-US-ABD'});
 const banner=page.locator('.patient-result-banner');await expect(banner).toBeVisible();
 const phone=await page.locator('.phone-shell').boundingBox(),alert=await banner.boundingBox();
 expect(alert!.x).toBeGreaterThan(phone!.x);expect(alert!.x+alert!.width).toBeLessThan(phone!.x+phone!.width);
 await banner.locator('.result-banner-content').click();
 const result=page.getByRole('dialog');await expect(result).toContainText('Kết quả Siêu âm');
 const popup=await result.boundingBox();expect(popup!.x).toBeGreaterThan(phone!.x);expect(popup!.x+popup!.width).toBeLessThan(phone!.x+phone!.width);
 await result.getByRole('button',{name:'Đã xem',exact:true}).click();
 expect(await page.evaluate(()=>Reflect.get(window,'nativeNotificationCalls'))).toBe(0);
 await page.getByRole('button',{name:'Thông tin người bệnh',exact:true}).click();
 await expect(page.locator('.profile-details')).toContainText('PID-001');
 await page.getByRole('button',{name:'Reset hành trình của Nguyễn Minh Anh',exact:true}).click();
 await expect(page.locator('.next-card')).toContainText('Đến quầy tiếp nhận');
 await page.getByRole('button',{name:'Thông tin người bệnh',exact:true}).click();
 await expect(page.locator('.profile-details')).toContainText('PID-001');
 await page.getByRole('button',{name:'Đóng thông tin cá nhân',exact:true}).click();
 await page.getByRole('button',{name:'Đường đi',exact:true}).click();
 await expect(page.locator('.arrival-note h3')).toHaveText('Bạn đã đến quầy tiếp nhận');
 await expect(page.getByRole('button',{name:'Cập nhật vị trí',exact:true})).toBeVisible();
 const gap=await page.evaluate(()=>document.querySelector('.arrival-note')!.getBoundingClientRect().top-document.querySelector('.location-update-trigger')!.getBoundingClientRect().bottom);
 expect(gap).toBeGreaterThan(8);expect(gap).toBeLessThan(32);
 await page.screenshot({path:uiArtifact('patient-tabs/arrival-at-reception.png'),fullPage:true});
 await page.getByRole('button',{name:'Trợ lý',exact:true}).click();
 await expect(page.locator('.chat-heading .assistant-avatar-art')).toBeVisible();
});

test('patient tabs share the same frame and retain their header and navigation while content scrolls',async({page,request})=>{
 test.setTimeout(90000);
 await send(request,'REGISTER','control',{departmentId:'DEMO-INTERNAL'});
 await send(request,'CALL_INITIAL','doctor');await send(request,'BEGIN_ENCOUNTER','doctor');
 const s=await read(request);
 await send(request,'ASSIGN_SERVICES','doctor',{serviceIds:s.serviceCatalog.map(service=>service.id)});
 for(const service of s.serviceCatalog){await send(request,'COMPLETE_SERVICE','procedure',{serviceId:service.id});await send(request,'CONFIRM_RESULT','procedure',{serviceId:service.id});}
 for(const [width,height] of [[360,640],[390,844],[1440,900]]){
  await page.setViewportSize({width,height});await page.goto('/patient');
  let frameHeight=0,headerHeight=0,navHeight=0;
  for(const [tab,name] of [['journey','Lượt khám'],['map','Đường đi'],['inbox','Thông báo'],['assistant','Trợ lý']]){
   await page.getByRole('button',{name,exact:true}).click();
   const before=await page.evaluate(()=>{
    const frame=document.querySelector('.phone-shell')!.getBoundingClientRect(),header=document.querySelector('.patient-header')!.getBoundingClientRect(),nav=document.querySelector('.bottom-nav')!.getBoundingClientRect();
    return {frame:frame.height,header:header.height,nav:nav.height,top:header.top,navTop:nav.top,bodyHeight:document.documentElement.scrollHeight,bodyWidth:document.documentElement.scrollWidth};
   });
   if(!frameHeight){frameHeight=before.frame;headerHeight=before.header;navHeight=before.nav;}
   expect(before.frame).toBe(frameHeight);expect(before.header).toBe(headerHeight);expect(before.nav).toBe(navHeight);
   expect(before.bodyHeight).toBeLessThanOrEqual(height);expect(before.bodyWidth).toBeLessThanOrEqual(width);
   if(width===390)await page.screenshot({path:uiArtifact(`patient-tabs/${tab}-390.png`),fullPage:true});
   if(tab==='journey'||tab==='inbox'){
    const scrolled=await page.locator('.patient-main').evaluate(main=>{main.scrollTop=main.scrollHeight;return main.scrollTop;});
    expect(scrolled).toBeGreaterThan(0);
    const after=await page.locator('.patient-header').boundingBox();expect(after!.y).toBe(before.top);
    expect((await page.locator('.bottom-nav').boundingBox())!.y).toBe(before.navTop);
    await expect(page.getByRole('button',{name:'Thông tin người bệnh',exact:true})).toBeVisible();
   }
  }
 }
});

test('chat displays pending questions, keeps history between tabs, and anchors the composer during a long conversation',async({page,request})=>{
 await send(request,'REGISTER','control',{departmentId:'DEMO-INTERNAL'});
 const s=await read(request);let release!:()=>void;
 const gate=new Promise<void>(resolve=>{release=resolve;});let calls=0;
 await page.route('**/api/assistant',async route=>{
  const payload=route.request().postDataJSON();calls++;
  if(calls===1)await gate;
  await route.fulfill({json:{source:'FALLBACK',label:'Hướng dẫn theo lượt khám',answer:calls===1?'Bạn cần giữ giấy chỉ định. Khi đến phòng, xếp giấy hoặc lấy số theo hướng dẫn tại cửa phòng.':`Câu hỏi: ${payload.question}. Hướng dẫn hiện tại: đến đúng phòng được chỉ định và làm theo hướng dẫn tại cửa phòng.`,intent:'PAPER',factIds:['paper'],runId:s.runId,revision:s.revision,route:s.views['DEMO-P01'].route}});
 });
 await page.setViewportSize({width:390,height:844});await page.goto('/patient');
 await page.getByRole('button',{name:'Trợ lý',exact:true}).click();
 await page.getByRole('button',{name:'Tôi có phải lấy giấy không?',exact:false}).click();
 await expect(page.locator('.question-bubble')).toHaveText('Tôi có phải lấy giấy không?');
 await expect(page.locator('.typing-indicator')).toBeVisible();
 release();await expect(page.locator('.answer-bubble')).toContainText('giữ giấy chỉ định');
 await page.getByRole('button',{name:'Đường đi',exact:true}).click();await page.getByRole('button',{name:'Trợ lý',exact:true}).click();
 await expect(page.locator('.question-bubble')).toHaveCount(1);
 for(let i=0;i<7;i++){
  await page.getByRole('textbox',{name:'Câu hỏi hướng dẫn'}).fill(`Tôi cần chuẩn bị gì ở bước ${i+1}?`);
  await page.getByRole('button',{name:'Gửi câu hỏi',exact:true}).click();
  await expect(page.locator('.answer-bubble')).toHaveCount(i+2);
  await expect(page.locator('.typing-indicator')).toHaveCount(0);
 }
 const geometry=await page.evaluate(()=>{
  const form=document.querySelector('.chat-composer')!.getBoundingClientRect(),nav=document.querySelector('.bottom-nav')!.getBoundingClientRect(),chat=document.querySelector('.chat-scroll')!;
  return {bottom:form.bottom,navTop:nav.top,scrollTop:chat.scrollTop,scrollHeight:chat.scrollHeight,clientHeight:chat.clientHeight,bodyHeight:document.documentElement.scrollHeight};
 });
 expect(geometry.bottom).toBeLessThanOrEqual(geometry.navTop);expect(geometry.scrollTop).toBeGreaterThan(0);
 expect(geometry.scrollHeight).toBeGreaterThan(geometry.clientHeight);expect(geometry.bodyHeight).toBeLessThanOrEqual(844);
 await page.screenshot({path:uiArtifact('patient-tabs/chat-conversation-390.png'),fullPage:true});
});
