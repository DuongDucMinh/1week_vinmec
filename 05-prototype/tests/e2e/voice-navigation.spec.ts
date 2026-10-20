import { test, expect, type APIRequestContext, type Page } from '@playwright/test';

// A real, decodable silent WAV exercises browser playback without calling a paid service.
function sampleAudio() {
  const audio=Buffer.alloc(1644);
  audio.write('RIFF');audio.writeUInt32LE(audio.length-8,4);audio.write('WAVEfmt ',8);
  audio.writeUInt32LE(16,16);audio.writeUInt16LE(1,20);audio.writeUInt16LE(1,22);
  audio.writeUInt32LE(8000,24);audio.writeUInt32LE(16000,28);audio.writeUInt16LE(2,32);audio.writeUInt16LE(16,34);
  audio.write('data',36);audio.writeUInt32LE(1600,40);return audio;
}

async function observeAudio(page:Page) {
  await page.addInitScript(() => {
    (window as any).spoken=[];(window as any).played=0;(window as any).cancelled=0;(window as any).nativeSpoken=0;
    const send=window.fetch.bind(window);
    window.fetch=(input,options)=>{
      if(input==='/api/speech')(window as any).spoken.push(JSON.parse(options!.body as string));
      return send(input,options);
    };
    const play=HTMLMediaElement.prototype.play,pause=HTMLMediaElement.prototype.pause;
    HTMLMediaElement.prototype.play=function(){(window as any).played++;return play.call(this);};
    HTMLMediaElement.prototype.pause=function(){(window as any).cancelled++;return pause.call(this);};
    Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{
      getVoices:()=>[{lang:'en-GB',name:'English only',default:true}],
      speak:()=>{(window as any).nativeSpoken++;},cancel:()=>{},
    }});
  });
}

async function prepareVisit(request:APIRequestContext) {
  let s=await (await request.get('/api/snapshot')).json();
  await request.post('/api/demo/reset',{data:{commandId:crypto.randomUUID(),expectedRunId:s.runId,expectedRevision:s.revision,actor:'control',mode:'RETURN_TO_DOCTOR',seed:'voice'}});
  s=await (await request.get('/api/snapshot')).json();
  await request.post('/api/commands',{data:{commandId:crypto.randomUUID(),runId:s.runId,expectedRevision:s.revision,type:'REGISTER',actor:'control',visitId:'DEMO-P01',payload:{departmentId:'DEMO-INTERNAL'}}});
}

test('voice follows the single action and reroutes automatically from updated position', async ({ page, request }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await observeAudio(page);
  await page.route('**/api/speech',route=>route.fulfill({contentType:'audio/wav',body:sampleAudio()}));
  await prepareVisit(request);
  await page.goto('/patient');
  await page.getByRole('button', { name: 'Xem đường đi', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Tắt giọng chỉ đường', exact: true })).toHaveAttribute('aria-pressed','true');
  await expect.poll(() => page.evaluate(() => (window as any).spoken.length)).toBeGreaterThan(0);
  await expect.poll(()=>page.evaluate(()=>(window as any).played)).toBeGreaterThan(0);
  expect(await page.evaluate(()=>(window as any).nativeSpoken)).toBe(0);
  await expect(page.locator('.walking-instruction')).toContainText('Đi thang máy lên tầng 2');
  await expect(page.locator('.navigation-map button.primary')).toHaveCount(1);
  await expect.poll(() => page.evaluate(() => (window as any).spoken.at(-1).text)).toContain('tầng 2');
  expect(await page.evaluate(()=>(window as any).spoken.at(-1).text)).toBe(await page.locator('.walking-instruction p').innerText());
  await page.getByRole('button', { name: 'Đã tới tầng 2', exact: true }).click();
  await expect(page.locator('.walking-instruction')).toContainText('Ra khỏi thang máy, quay mặt về phía dãy phòng rồi rẽ trái.');
  await expect.poll(() => page.evaluate(() => (window as any).spoken.at(-1).text)).toBe(await page.locator('.walking-instruction p').innerText());
  expect(await page.evaluate(()=>(window as any).spoken.at(-1).text)).not.toContain('Đến phòng A201');
  await expect(page.getByRole('button', { name: /đi nhầm|không rõ hướng/i })).toHaveCount(0);
  const s = await (await request.get('/api/snapshot')).json();
  const update=await request.post('/api/commands',{data:{commandId:crypto.randomUUID(),runId:s.runId,expectedRevision:s.revision,type:'CONFIRM_LOCATION',actor:'patient',visitId:'DEMO-P01',payload:{locationId:'DEMO-SIEUAM'}}});
  expect((await update.json()).ok).toBe(true);
  await expect(page.locator('.walking-instruction [role="status"]')).toContainText('Đã cập nhật đường đi');
  await expect(page.locator('.current-location')).toContainText('B105');
  await expect(page.locator('.guided-stage-title')).toContainText('Tòa B');
  await expect.poll(()=>page.evaluate(()=>(window as any).spoken.at(-1).text)).toBe(await page.locator('.walking-instruction p').innerText());
  const afterReroute=await page.evaluate(()=>({requests:(window as any).spoken.length,cancelled:(window as any).cancelled}));
  await expect(page.locator('.walking-instruction [role="status"]')).toHaveCount(0,{timeout:10_000});
  // Dismissing the temporary reroute label must not interrupt or restart speech.
  expect(await page.evaluate(()=>(window as any).spoken.length)).toBe(afterReroute.requests);
  expect(await page.evaluate(()=>(window as any).cancelled)).toBe(afterReroute.cancelled);
  const count = await page.evaluate(() => (window as any).cancelled);
  await page.getByRole('button', { name: 'Lượt khám', exact: true }).click();
  await expect.poll(() => page.evaluate(() => (window as any).cancelled)).toBeGreaterThan(count);
});

test('an unavailable voice service shows retry without speaking in English',async({page,request})=>{
  await page.setViewportSize({width:390,height:844});await observeAudio(page);await prepareVisit(request);
  await page.route('**/api/speech',route=>route.fulfill({status:503,json:{ok:false,code:'SPEECH_NOT_CONFIGURED'}}));
  await page.goto('/patient');await page.getByRole('button',{name:'Xem đường đi',exact:true}).click();
  await expect(page.locator('.voice-guidance [role="status"]')).toContainText('Chưa phát được giọng tiếng Việt');
  expect(await page.evaluate(()=>(window as any).nativeSpoken)).toBe(0);expect(await page.evaluate(()=>(window as any).played)).toBe(0);
  await page.unroute('**/api/speech');await page.route('**/api/speech',route=>route.fulfill({contentType:'audio/wav',body:sampleAudio()}));
  await page.getByRole('button',{name:'Nghe lại',exact:true}).click();
  await expect.poll(()=>page.evaluate(()=>(window as any).played)).toBeGreaterThan(0);
  await expect(page.locator('.voice-guidance [role="status"]')).toHaveCount(0);
  const count=await page.evaluate(()=>(window as any).cancelled);
  await page.getByRole('button',{name:'Tắt giọng chỉ đường',exact:true}).click();
  await expect.poll(()=>page.evaluate(()=>(window as any).cancelled)).toBeGreaterThan(count);
});

test('a missing sentence is explained separately and remains retryable after installing audio',async({page,request})=>{
  await observeAudio(page);await prepareVisit(request);
  await page.route('**/api/speech',route=>route.fulfill({status:503,json:{ok:false,code:'SPEECH_RECORDING_MISSING'}}));
  await page.goto('/patient');await page.getByRole('button',{name:'Xem đường đi',exact:true}).click();
  await expect(page.locator('.voice-guidance [role="status"]')).toContainText('Chặng này chưa có bản ghi âm');
  await expect(page.getByRole('button',{name:'Tắt giọng chỉ đường',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.unroute('**/api/speech');await page.route('**/api/speech',route=>route.fulfill({contentType:'audio/wav',body:sampleAudio()}));
  await page.getByRole('button',{name:'Nghe lại',exact:true}).click();
  await expect.poll(()=>page.evaluate(()=>(window as any).played)).toBeGreaterThan(0);
  await expect(page.locator('.voice-guidance [role="status"]')).toHaveCount(0);
});

test('remembers the patient voice preference across steps, tabs and reloads',async({page,request})=>{
  await observeAudio(page);await prepareVisit(request);
  await page.route('**/api/speech',route=>route.fulfill({contentType:'audio/wav',body:sampleAudio()}));
  await page.goto('/patient');await page.getByRole('button',{name:'Xem đường đi',exact:true}).click();
  await expect.poll(()=>page.evaluate(()=>(window as any).played)).toBeGreaterThan(0);
  await page.getByRole('button',{name:'Tắt giọng chỉ đường',exact:true}).click();
  const requests=await page.evaluate(()=>(window as any).spoken.length);
  await page.getByRole('button',{name:'Đã tới tầng 2',exact:true}).click();
  await expect(page.getByRole('button',{name:'Bật giọng chỉ đường',exact:true})).toHaveAttribute('aria-pressed','false');
  expect(await page.evaluate(()=>(window as any).spoken.length)).toBe(requests);
  await page.getByRole('button',{name:'Lượt khám',exact:true}).click();
  await page.getByRole('button',{name:'Xem đường đi',exact:true}).click();
  await expect(page.getByRole('button',{name:'Bật giọng chỉ đường',exact:true})).toBeVisible();
  await page.reload();
  // Wait for the snapshot to render after reload before selecting the map tab.
  await page.getByRole('button',{name:'Đường đi',exact:true}).click();
  await expect(page.getByRole('button',{name:'Bật giọng chỉ đường',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>(window as any).spoken.length)).toBe(0);
  await page.getByRole('button',{name:'Bật giọng chỉ đường',exact:true}).click();
  await expect.poll(()=>page.evaluate(()=>(window as any).played)).toBeGreaterThan(0);
  await page.getByRole('button',{name:'Lượt khám',exact:true}).click();
  await page.getByRole('button',{name:'Xem đường đi',exact:true}).click();
  await expect(page.getByRole('button',{name:'Tắt giọng chỉ đường',exact:true})).toBeVisible();
});
