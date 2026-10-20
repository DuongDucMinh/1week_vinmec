import { advanceDirection, expectReadableMap } from './navigation';
import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import type { Command } from '../../src/shared/contracts';

test('nearby rooms on both sides of B105 orient the walk to the lift',async({page,request})=>{
  let s=await (await request.get('/api/snapshot')).json();
  const reset=await request.post('/api/demo/reset',{data:{commandId:crypto.randomUUID(),expectedRunId:s.runId,expectedRevision:s.revision,actor:'control',mode:'RETURN_TO_DOCTOR',seed:'context-rooms'}});
  expect((await reset.json()).ok).toBe(true);
  async function send(type:Command['type'],actor:Command['actor'],payload:Command['payload']={}){
    s=await (await request.get('/api/snapshot')).json();
    const response=await request.post('/api/commands',{data:{commandId:crypto.randomUUID(),runId:s.runId,expectedRevision:s.revision,type,actor,visitId:'DEMO-P01',payload}});
    const data=await response.json();expect(data.ok,data.message).toBe(true);
  }
  await send('REGISTER','control',{departmentId:'DEMO-INTERNAL'});
  await send('CALL_INITIAL','doctor');await send('BEGIN_ENCOUNTER','doctor');
  await send('ASSIGN_SERVICES','doctor',{serviceIds:['DEMO-XRAY']});
  await send('CONFIRM_LOCATION','patient',{locationId:'DEMO-SIEUAM'});
  await page.setViewportSize({width:390,height:844});await page.goto('/patient');
  await page.getByRole('button',{name:'Xem đường đi',exact:true}).click();
  await expect(page.locator('.walking-instruction')).toContainText('Đi thang máy lên tầng 2');
  const map=page.locator('.guided-floor');
  for(const room of ['B103','B104','B105','B106'])await expect(map).toContainText(room);
  const positions=await map.evaluate(svg=>{
    const center=(id:string)=>{const rect=svg.querySelector(`[data-location-id="${id}"] rect`)!;return Number(rect.getAttribute('x'))+Number(rect.getAttribute('width'))/2;};
    return {left:center('DEMO-REFERENCE-B104'),current:center('DEMO-SIEUAM'),right:center('DEMO-REFERENCE-B106'),lift:center('DEMO-B-LIFT-1')};
  });
  expect(positions.left).toBeLessThan(positions.current);expect(positions.right).toBeGreaterThan(positions.current);
  expect(positions.lift).toBeLessThan(positions.left);
  const rooms=await map.evaluate(svg=>[...svg.querySelectorAll('[data-room-door]')].map(door=>{
    const rect=door.parentElement!.querySelector('rect')!;
    const left=Number(rect.getAttribute('x')),top=Number(rect.getAttribute('y'));
    return {left,top,right:left+Number(rect.getAttribute('width')),bottom:top+Number(rect.getAttribute('height')),corridor:Number(door.getAttribute('y2'))};
  }).sort((a,b)=>a.left-b.left));
  for(const [index,room] of rooms.entries()){
    expect(room.top).toBe(rooms[0].top);
    expect(room.right-room.left).toBe(54);expect(room.bottom-room.top).toBe(36);
    expect(room.corridor-room.bottom).toBeLessThanOrEqual(24);
    if(index)expect(rooms[index-1].right).toBeLessThan(room.left);
  }
  await expectReadableMap(page);
  await expect(page.locator('.navigation-map button.primary')).toHaveCount(1);
  await mkdir('outputs/patient-navigation',{recursive:true});
  await page.screenshot({path:'outputs/patient-navigation/context-room-b105.png',fullPage:true});
});

test('all guidance fits one screen with one action through lift and stair routes',async({page,request})=>{
  test.setTimeout(90000);
  let s=await (await request.get('/api/snapshot')).json();
  await request.post('/api/demo/reset',{data:{commandId:crypto.randomUUID(),expectedRunId:s.runId,expectedRevision:s.revision,actor:'control',mode:'RETURN_TO_DOCTOR',seed:'compact-navigation'}});
  s=await (await request.get('/api/snapshot')).json();
  const registered=await request.post('/api/commands',{data:{commandId:crypto.randomUUID(),runId:s.runId,expectedRevision:s.revision,type:'REGISTER',actor:'control',visitId:'DEMO-P01',payload:{departmentId:'DEMO-DENTISTRY'}}});
  expect((await registered.json()).ok).toBe(true);
  await mkdir('outputs/patient-navigation',{recursive:true});
  for(const [width,height] of [[360,640],[375,667],[390,844],[768,1024],[1440,900]]){
    await page.setViewportSize({width,height});
    await page.goto('/patient');
    await page.getByRole('button',{name:'Xem đường đi',exact:true}).click();
    await expect(page.locator('.destination-room')).toHaveText('A305');
    await expect(page.getByRole('button',{name:'Tắt giọng chỉ đường',exact:true})).toBeVisible();
    for(const mode of ['Thang máy','Thang bộ']){
      await page.getByRole('button',{name:mode,exact:true}).click();
      await expect(page.getByRole('button',{name:mode,exact:true})).toHaveAttribute('aria-pressed','true');
      for(let step=0;step<20;step++){
        await expect(page.locator('.navigation-map button.primary')).toHaveCount(1);
        expect(await page.locator('.guided-floor [data-map-context="room"]').count()).toBeGreaterThanOrEqual(2);
        await expectReadableMap(page);
        const geometry=await page.evaluate(()=>{
          const map=document.querySelector('.guided-stage')!.getBoundingClientRect();
          const button=document.querySelector('.navigation-advance')!.getBoundingClientRect();
          const nav=document.querySelector('.bottom-nav')!.getBoundingClientRect();
          return {scrollHeight:document.documentElement.scrollHeight,scrollWidth:document.documentElement.scrollWidth,height:innerHeight,width:innerWidth,mapHeight:document.querySelector<HTMLElement>('.guided-stage')!.clientHeight,buttonBottom:button.bottom,navTop:nav.top};
        });
        expect(geometry.scrollWidth).toBeLessThanOrEqual(width);
        expect(geometry.scrollHeight).toBeLessThanOrEqual(height);
        expect(geometry.mapHeight).toBeGreaterThanOrEqual(140);
        expect(geometry.buttonBottom).toBeLessThanOrEqual(geometry.navTop);
        await expect(page.locator('.guided-floor')).not.toContainText(mode==='Thang bộ'?'Thang máy':'Thang bộ');
        if(step===0)await page.screenshot({path:`outputs/patient-navigation/${width}x${height}-${mode==='Thang bộ'?'stairs':'lift'}.png`,fullPage:true});
        const action=page.locator('.navigation-advance');
        if((await action.textContent())?.startsWith('Tôi đã đến'))break;
        await advanceDirection(page);
      }
    }
  }
});
