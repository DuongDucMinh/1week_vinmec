// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RouteMap } from '../../src/client/Map';
import { Patient } from '../../src/client/Patient';
import { Control, Doctor, Procedure } from '../../src/client/Dashboards';
import type { SimulationApi } from '../../src/client/api';
import { createRun, createService } from '../../src/shared/fixtures';
import { applyCommand, makeSnapshot, deriveRoute } from '../../src/domain/engine';

let host: HTMLDivElement;
let root: Root;
const snapshot = () => makeSnapshot(createRun());
const api = () => ({ connected: true, pending: false, error: null, uncertain: false, command: vi.fn(), ask: vi.fn(), reset: vi.fn(), retry: vi.fn(), clearError: vi.fn() }) as unknown as SimulationApi;
const click = async (text: string) => {
  const button = [...host.querySelectorAll('button')].find(b => b.textContent === text);
  if (!button) throw new Error(`Missing button ${text}`);
  await act(async () => { button.click(); });
};
beforeEach(() => { localStorage.setItem('vinmec.navigationVoice','off'); window.history.replaceState(null, '', '/patient'); vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); Object.defineProperties(HTMLDialogElement.prototype, { show: { configurable: true, value: function (this: HTMLDialogElement) { this.open = true; } }, showModal: { configurable: true, value: function (this: HTMLDialogElement) { this.open = true; } }, close: { configurable: true, value: function (this: HTMLDialogElement) { this.open = false; } } }); host = document.createElement('div'); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.unstubAllGlobals(); });

describe('current destination guidance', () => {
  async function mount(from='DEMO-RECEPTION',to='DEMO-NOI',mode:'lift'|'stairs'='lift'){
    const s=snapshot(),a=api();let visit={...s.views['DEMO-P01'].visit,phase:'WAITING_INITIAL' as const,departmentId:'DEMO-INTERNAL' as const,locationId:from,transportMode:mode};
    const draw=()=>root.render(<RouteMap snapshot={s} view={{...s.views['DEMO-P01'],visit,route:deriveRoute(visit,to)}} api={a}/>);
    a.command=vi.fn(async(type,_id,_actor,payload)=>{
      if(type==='CONFIRM_LOCATION')visit={...visit,locationId:payload!.locationId!};
      if(type==='SET_TRANSPORT_MODE')visit={...visit,transportMode:payload!.transportMode!};
      draw();return true;
    });
    await act(async()=>draw());
    return {a,visit:()=>visit,position:async(id:string)=>{visit={...visit,locationId:id};await act(async()=>draw());}};
  }
  it('shows nearby rooms without turning the lift landing or corridor into confirmation steps',async()=>{
    const {a}=await mount('DEMO-RECEPTION','DEMO-NOI','stairs');
    const map=host.querySelector('.guided-floor')!;
    for(const code of ['A101','A103','A106','A110'])expect(map.textContent).toContain(code);
    expect(map.textContent).toContain('Cổng');expect(map.textContent).toContain('Sang Tòa B');
    expect(host.querySelector('.navigation-advance')?.textContent).toBe('Đã tới tầng 2');
    await click('Đã tới tầng 2');
    expect(host.querySelector('.navigation-advance')?.textContent).toBe('Tôi đã đến phòng A201');
    expect(host.querySelector('.current-location')?.textContent).toContain('Thang bộ tầng 2');
    expect(a.command).toHaveBeenCalledWith('CONFIRM_LOCATION','DEMO-P01','patient',{locationId:'DEMO-A-STAIRS-2',outsideHospital:false});
    await click('Tôi đã đến phòng A201');
    expect(host.querySelector('.arrival-note')).not.toBeNull();
    expect(host.querySelector('.navigation-back')).toBeNull();
    expect(host.querySelector('.navigation-advance')).toBeNull();
  });
  it.each(['lift','stairs'] as const)('goes directly to floor 4 using %s, supports back and retains position when changing transport',async mode=>{
    const {visit}=await mount('DEMO-RECEPTION','DEMO-TMH',mode);
    expect(host.querySelector('.navigation-advance')?.textContent).toBe('Đã tới tầng 4');
    expect(host.querySelector<HTMLButtonElement>('.navigation-back')?.disabled).toBe(true);
    await click('Đã tới tầng 4');
    const reached=visit().locationId;
    expect(host.querySelector('.guided-stage-title')?.textContent).toContain('Tầng 4');
    expect(host.querySelector<HTMLButtonElement>('.navigation-back')?.disabled).toBe(false);
    await click(mode==='lift'?'Thang bộ':'Thang máy');
    expect(visit().locationId).toBe(reached);
    expect(host.querySelector('.guided-stage-title')?.textContent).toContain('Tầng 4');
    expect(host.querySelector('.navigation-advance')?.textContent).toBe('Tôi đã đến phòng A401');
    await act(async()=>host.querySelector<HTMLButtonElement>('.navigation-back')!.click());
    expect(visit().locationId).toBe('DEMO-RECEPTION');
    expect(host.querySelector('.navigation-advance')?.textContent).toBe('Đã tới tầng 4');
  });
  it('returns through earlier floor and building checkpoints while navigating',async()=>{
    const {visit}=await mount('DEMO-NOI','DEMO-DADAY');
    const reached=['DEMO-NOI'];
    for(let index=0;index<3;index++){
      await act(async()=>host.querySelector<HTMLButtonElement>('.navigation-advance')!.click());
      reached.push(visit().locationId);
    }
    expect(reached).toEqual(['DEMO-NOI','DEMO-LIFT-1','DEMO-CONNECTOR-B','DEMO-B-LIFT-3']);
    for(const expected of reached.slice(0,-1).reverse()){
      await act(async()=>host.querySelector<HTMLButtonElement>('.navigation-back')!.click());
      expect(visit().locationId).toBe(expected);
    }
    expect(host.querySelector<HTMLButtonElement>('.navigation-back')?.disabled).toBe(true);
  });
  it('walks directly to the destination on the same floor',async()=>{
    const {a}=await mount('DEMO-NOI','DEMO-SINHHOA');
    expect(host.querySelector('.navigation-advance')?.textContent).toBe('Tôi đã đến phòng A205');
    await click('Tôi đã đến phòng A205');
    expect(a.command).toHaveBeenCalledTimes(1);
  });
  it('keeps a failed confirmation at the last known position',async()=>{
    const {a,visit}=await mount();a.command=vi.fn().mockResolvedValue(false);
    await click('Đã tới tầng 2');
    expect(visit().locationId).toBe('DEMO-RECEPTION');
    expect(host.querySelector<HTMLButtonElement>('.navigation-back')?.disabled).toBe(true);
  });
  it('shows rooms on both sides of B105 and uses matching compact room tiles',async()=>{
    await mount('DEMO-SIEUAM','DEMO-XQUANG');
    const map=host.querySelector('.guided-floor')!;
    const rect=(id:string)=>map.querySelector(`[data-location-id="${id}"] rect`)!;
    expect(Number(rect('DEMO-REFERENCE-B104').getAttribute('x'))).toBeLessThan(Number(rect('DEMO-SIEUAM').getAttribute('x')));
    expect(Number(rect('DEMO-REFERENCE-B106').getAttribute('x'))).toBeGreaterThan(Number(rect('DEMO-SIEUAM').getAttribute('x')));
    expect(rect('DEMO-REFERENCE-B104').getAttribute('height')).toBe(rect('DEMO-SIEUAM').getAttribute('height'));
    expect(rect('DEMO-REFERENCE-B104').getAttribute('width')).toBe(rect('DEMO-SIEUAM').getAttribute('width'));
  });
  it('automatically reroutes on external position changes and removes obsolete back steps',async()=>{
    const {position}=await mount();await click('Đã tới tầng 2');
    await position('DEMO-SIEUAM');
    expect(host.querySelector('[role="status"]')?.textContent).toContain('Đã cập nhật đường đi');
    expect(host.querySelector('.guided-stage-title')?.textContent).toContain('Tòa B');
    expect(host.querySelector<HTMLButtonElement>('.navigation-back')?.disabled).toBe(true);
  });
  it('does not show a route until an unknown starting position is confirmed',async()=>{
    const s=snapshot(),view={...s.views['DEMO-P01'],route:{from:null,to:'DEMO-NOI',nodeIds:[],instructions:[],requiresStartConfirmation:true}};
    await act(async()=>root.render(<RouteMap snapshot={s} view={view} api={api()}/>));
    expect(host.querySelector('.start-confirm')).not.toBeNull();expect(host.querySelector('.guided-floor')).toBeNull();
  });
});

describe('plain product language', () => {
  it.each([false, true])('keeps the profile personal and exposes connection tools only with the explicit testing URL (tools=%s)', async tools => {
    window.history.replaceState(null, '', tools ? '/patient?tools=1' : '/patient');
    const setOffline = vi.fn();
    await act(async () => root.render(<Patient snapshot={snapshot()} api={api()} offline={false} setOffline={setOffline} />));
    await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Thông tin người bệnh"]')!.click());
    const help = host.querySelector('dialog')!;
    expect(help.querySelector('select')?.options).toHaveLength(3);
    expect(help.textContent).toContain('Thông tin cá nhân');
    expect(help.textContent).not.toContain('In / lưu giấy hướng dẫn');
    expect(help.querySelector('.notification-settings')).toBeNull();
    if (tools) {
      const controls = help.querySelector<HTMLDetailsElement>('.operator-tools');
      expect(controls).not.toBeNull();
      expect(controls?.open).toBe(false);
      await act(async () => controls!.querySelector('summary')!.click());
      await click('Tạm ngắt kết nối trang này');
      expect(setOffline).toHaveBeenCalledWith(true);
      expect(host.querySelector('dialog')).toBeNull();
    } else {
      expect(help.querySelector('.operator-tools')).toBeNull();
      expect(help.querySelector('a[href="/doctor"]')).toBeNull();
      expect(help.textContent).not.toContain('Công cụ kiểm tra kết nối');
    }
  });

  it('shows the estimated wait without repeated timing caveats or a duplicate room sign', async () => {
    const s = snapshot();
    s.views['DEMO-P01'].nextAction.destinationId = 'DEMO-NOI';s.views['DEMO-P01'].visit.services=[createService('DEMO-US-ABD',s.mode)];
    s.views['DEMO-P01'].visit.services[0].resultStatus = 'WAITING';
    await act(async () => root.render(<Patient snapshot={s} api={api()} offline={false} setOffline={vi.fn()} />));
    expect(host.querySelector('.destination')?.textContent).toContain('A201');
    expect(host.querySelector('.destination small')).toBeNull();
    expect(host.querySelector('.eta')?.textContent).toContain('Dự kiến');
    expect(host.querySelector('.eta')?.textContent).not.toContain('Hết mốc dự kiến');
  });

  it.each(['patient', 'doctor', 'control'])('keeps %s guidance free of demo badges and raw status labels', async role => {
    const s = snapshot(); const a = api();
    await act(async () => root.render(role === 'patient' ? <Patient snapshot={s} api={a} offline={false} setOffline={vi.fn()} /> : role === 'doctor' ? <Doctor snapshot={s} api={a} /> : <Control snapshot={s} api={a} />));
    expect(host.textContent).not.toMatch(/dữ liệu giả|LIVE|FALLBACK|UNREGISTERED|NOT_STARTED|NOT_AVAILABLE|NOT_COLLECTED/);
    if (role === 'control') expect(host.querySelector('dialog')).toBeNull();
  });

  it('explains assistant availability without claiming a live connection', async () => {
    const s = snapshot(); const a = api();
    a.ask = vi.fn().mockResolvedValue({ source: 'FALLBACK', answer: 'Mời đến quầy tiếp nhận.', revision: s.revision, runId: s.runId });
    await act(async () => root.render(<Patient snapshot={s} api={a} offline={false} setOffline={vi.fn()} />));
    await click('Trợ lý');
    expect(host.querySelector('.assistant-availability')?.textContent).toBe('Hướng dẫn theo lượt khám');
    await click('Giờ tôi làm gì?');
    expect(host.querySelector('.answer-source')?.textContent).toBe('Hướng dẫn theo tiến độ lượt khám');
    expect(host.querySelector('.answer-bubble')?.textContent).not.toMatch(/LIVE|FALLBACK|NOT_LIVE/);
  });
});


describe('paper / app parity in procedure UI',()=>{
 const prepared=()=>{const run=createRun();const send=(type:any,actor:any,payload:any={},visitId='DEMO-P01')=>applyCommand(run,{commandId:crypto.randomUUID(),runId:run.runId,expectedRevision:run.revision,type,actor,payload:type==='REGISTER'?{departmentId:'DEMO-INTERNAL',...payload}:payload,visitId});for(const id of ['DEMO-P01','DEMO-P02']){send('REGISTER','control',{},id);send('CALL_INITIAL','doctor',{},id);send('BEGIN_ENCOUNTER','doctor',{},id);send('ASSIGN_DEMO_SERVICES','doctor',{},id);}return {run,send};};
 it('shows all orders without app arrival and lets the physical queue select any patient',async()=>{
  window.history.replaceState(null,'','/procedure?service=DEMO-BLOOD-BIOCHEM');const {run}=prepared();const a=api();
  await act(async()=>root.render(<Procedure snapshot={makeSnapshot(run)} api={a}/>));
  expect(host.querySelectorAll('.assigned-row')).toHaveLength(2);expect(host.querySelector('.queue-number')).toBeNull();
  const rows=host.querySelectorAll('.assigned-row');expect(rows[1].textContent).toContain('Trần Hoàng Nam');
  await act(async()=>rows[1].querySelector<HTMLButtonElement>('button[aria-label="Đã hoàn thành"]')!.click());expect(a.command).toHaveBeenCalledWith('COMPLETE_SERVICE','DEMO-P02','procedure',{serviceId:'DEMO-BLOOD-BIOCHEM'});
  const search=host.querySelector<HTMLInputElement>('#patient-search')!;
  await act(async()=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(search,'TRAN HOANG');search.dispatchEvent(new Event('input',{bubbles:true}));});
  expect(host.querySelectorAll('.assigned-row')).toHaveLength(1);expect(host.querySelector('.assigned-row')?.textContent).toContain('Trần Hoàng Nam');
 });
 it.each(['PAPER_TRAY','TAKE_NUMBER'] as const)('uses %s instructions on arrival and on printed guide',async method=>{
  const {run,send}=prepared();send('SET_PROCEDURE_QUEUE_METHOD','control',{serviceId:'DEMO-US-ABD',queueMethod:method});send('COMPLETE_SERVICE','procedure',{serviceId:'DEMO-BLOOD-BIOCHEM'});send('CONFIRM_LOCATION','patient',{locationId:'DEMO-SIEUAM'});
  const s=makeSnapshot(run),view=s.views['DEMO-P01'];
  await act(async()=>root.render(<RouteMap snapshot={s} view={view} api={api()}/>));expect(host.querySelector('.arrival-note')?.textContent).toContain(method==='PAPER_TRAY'?'lên trên cùng':'lấy số tại máy');
  await act(async()=>root.render(<Patient snapshot={s} api={api()} offline={false} setOffline={vi.fn()}/>));expect(host.querySelector('.print-guide')?.textContent).toContain(method==='PAPER_TRAY'?'lên trên cùng':'lấy số tại máy');expect(host.textContent).not.toContain('Sẵn sàng gặp bác sĩ chẩn đoán');
 });
 it('doctor shows automatic readiness while patient is still at the last procedure room',async()=>{
  const {run,send}=prepared();send('COMPLETE_SERVICE','procedure',{serviceId:'DEMO-US-ABD'});send('COMPLETE_SERVICE','procedure',{serviceId:'DEMO-BLOOD-BIOCHEM'});
  await act(async()=>root.render(<Doctor snapshot={makeSnapshot(run)} api={api()}/>));const column=host.querySelectorAll('.queue-column')[1];expect(column.getAttribute('aria-label')).toBe('Người bệnh quay lại');expect(column.textContent).toContain('Nguyễn Minh Anh');expect(column.textContent).toContain('Đang quay lại');expect(column.querySelector('button')).toBeNull();
 });
});
