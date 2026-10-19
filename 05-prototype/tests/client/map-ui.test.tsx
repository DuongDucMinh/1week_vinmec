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
import type { Route } from '../../src/shared/contracts';

let host: HTMLDivElement;
let root: Root;
const toNoi: Route = { from: 'DEMO-RECEPTION', to: 'DEMO-NOI', nodeIds: ['DEMO-RECEPTION', 'DEMO-LIFT-1', 'DEMO-LIFT-2', 'DEMO-HALL-NOI', 'DEMO-NOI'], instructions: ['Đi đến thang máy, lên tầng 2.', 'Đến phòng A201 · Nội.'], requiresStartConfirmation: false };
const snapshot = () => makeSnapshot(createRun());
const api = () => ({ connected: true, pending: false, error: null, uncertain: false, command: vi.fn(), ask: vi.fn(), reset: vi.fn(), retry: vi.fn(), clearError: vi.fn() }) as unknown as SimulationApi;
const click = async (text: string) => {
  const button = [...host.querySelectorAll('button')].find(b => b.textContent === text);
  if (!button) throw new Error(`Missing button ${text}`);
  await act(async () => { button.click(); });
};
const change = async (select: HTMLSelectElement, value: string) => { await act(async () => { select.value = value; select.dispatchEvent(new Event('change', { bubbles: true })); }); };
beforeEach(() => { window.history.replaceState(null, '', '/patient'); vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); Object.defineProperties(HTMLDialogElement.prototype, { showModal: { configurable: true, value: function (this: HTMLDialogElement) { this.open = true; } }, close: { configurable: true, value: function (this: HTMLDialogElement) { this.open = false; } } }); host = document.createElement('div'); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.unstubAllGlobals(); });

describe('current destination guidance', () => {
  it.each([['DEMO-RECEPTION','DEMO-TIMMACH',3],['DEMO-RECEPTION','DEMO-DIENTIM',6],['DEMO-DIENTIM','DEMO-RECEPTION',1]] as const)('takes the lift directly from %s to %s', async (from,to,floor) => {
    const s=snapshot(), v=s.views['DEMO-P01'];
    const route=deriveRoute({...v.visit,locationId:from},to);
    await act(async()=>root.render(<RouteMap snapshot={s} view={{...v,route}} api={api()}/>));
    expect(host.querySelector('.guided-stage-title')?.textContent).toContain('Chặng 1/2');
    expect(host.querySelector('.leg-instruction')?.textContent).toContain(`tầng ${floor}`);
    await click(`Đã tới tầng ${floor}`);
    expect(host.querySelector('.guided-floor')?.getAttribute('aria-label')).toContain(`tầng ${floor}`);
    expect(host.querySelector('.leg-controls')?.textContent).not.toContain('Đã tới tầng');
    await click('Quay lại');
    expect(host.querySelector('.guided-stage-title')?.textContent).toContain('Chặng 1/2');
  });
  it('starts on the origin floor and advances along the route without floor selectors', async () => {
    const s=snapshot(); const a=api(); const view={...s.views['DEMO-P01'],visit:{...s.views['DEMO-P01'].visit,phase:'WAITING_INITIAL' as const,departmentId:'DEMO-INTERNAL' as const},route:toNoi};
    await act(async()=>root.render(<RouteMap snapshot={s} view={view} api={a}/>));
    expect(host.querySelector('.guided-floor')?.getAttribute('aria-label')).toContain('Tòa A, tầng 1');
    expect(host.querySelectorAll('[data-route-segment="guided"]')).toHaveLength(1);
    expect(host.textContent).not.toMatch(/Tổng quan|Tầng & phòng/);
    await click('Đã tới tầng 2');
    expect(host.querySelector('.guided-floor')?.getAttribute('aria-label')).toContain('Tòa A, tầng 2');
    expect(host.querySelector('.guided-floor')?.textContent).toContain('A201');
    await click('Tôi đã đến ngoài phòng Nội A201');
    expect(a.command).toHaveBeenCalledWith('CONFIRM_LOCATION','DEMO-P01','patient',{locationId:'DEMO-NOI',outsideHospital:false});
  });
  it('hides map paths when origin is unknown, and follows new current destination on live updates', async () => {
    const s=snapshot(), v=s.views['DEMO-P01'];
    v.route={from:null,to:'DEMO-SIEUAM',nodeIds:[],instructions:[],requiresStartConfirmation:true};
    await act(async()=>root.render(<RouteMap snapshot={s} view={v} api={api()}/>));
    expect(host.textContent).toContain('Chọn lại điểm xuất phát');
    expect(host.querySelector('.guided-floor')).toBeNull();
    v.route=deriveRoute({...v.visit,locationId:'DEMO-NOI'},'DEMO-SIEUAM');
    await act(async()=>root.render(<RouteMap snapshot={s} view={v} api={api()}/>));
    await click('Đã tới tầng 1');await click('Đã sang Tòa B');
    expect(host.querySelector('.guided-floor')?.textContent).toContain('B105');
    v.route=deriveRoute({...v.visit,locationId:'DEMO-SIEUAM'},'DEMO-SINHHOA');
    await act(async()=>root.render(<RouteMap snapshot={s} view={v} api={api()}/>));
    expect(host.querySelector('.guided-stage-title')?.textContent).toContain('Tòa B');
    expect(host.querySelector('.map-address')?.textContent).toContain('A205');
  });
});

describe('plain product language', () => {
  it.each([false, true])('keeps normal help simple and exposes connection tools only with the explicit testing URL (tools=%s)', async tools => {
    window.history.replaceState(null, '', tools ? '/patient?tools=1' : '/patient');
    const setOffline = vi.fn();
    await act(async () => root.render(<Patient snapshot={snapshot()} api={api()} offline={false} setOffline={setOffline} />));
    await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Thông tin người bệnh"]')!.click());
    const help = host.querySelector('dialog')!;
    expect(help.querySelector('select')?.options).toHaveLength(3);
    expect(help.textContent).toContain('In / lưu giấy hướng dẫn');
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
    if (role === 'control') expect(host.querySelector<HTMLDetailsElement>('.operator-controls')?.open).toBe(false);
  });

  it('explains assistant availability without claiming a live connection', async () => {
    const s = snapshot(); const a = api();
    a.ask = vi.fn().mockResolvedValue({ source: 'FALLBACK', answer: 'Mời đến quầy tiếp nhận.', revision: s.revision, runId: s.runId });
    await act(async () => root.render(<Patient snapshot={s} api={a} offline={false} setOffline={vi.fn()} />));
    await click('Trợ lý');
    expect(host.querySelector('.assistant-availability')?.textContent).toContain('Trợ lý trò chuyện hiện chưa kết nối');
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
  await act(async()=>rows[1].querySelector<HTMLButtonElement>('button.primary')!.click());expect(a.command).toHaveBeenCalledWith('COMPLETE_SERVICE','DEMO-P02','procedure',{serviceId:'DEMO-BLOOD-BIOCHEM'});
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
  await act(async()=>root.render(<Doctor snapshot={makeSnapshot(run)} api={api()}/>));const column=host.querySelectorAll('.queue-column')[1];expect(column.textContent).toContain('Sẵn sàng vào phòng');expect(column.textContent).toContain('Nguyễn Minh Anh');expect(column.textContent).toContain('Đang quay lại');expect(column.querySelector('button')).toBeNull();
 });
});
