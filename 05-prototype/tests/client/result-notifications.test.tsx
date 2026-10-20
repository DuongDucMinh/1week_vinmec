// @vitest-environment jsdom
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {beforeEach,afterEach,expect,it,vi} from 'vitest';
import {useResultNotifications} from '../../src/client/useResultNotifications';
import {createRun,createService} from '../../src/shared/fixtures';
import type {Visit} from '../../src/shared/contracts';

let host:HTMLDivElement,root:Root,visit:Visit,latest:ReturnType<typeof useResultNotifications>;
const open=vi.fn(),requestPermission=vi.fn();
function Harness({value,connected=true,runId='run'}:{value:Visit;connected?:boolean;runId?:string}){
 latest=useResultNotifications(runId,value,connected,open);
 return <div><span>{latest.status}</span><button onClick={latest.enable}>Bật</button><button onClick={latest.disable}>Tắt</button>{latest.notification&&<button className="alert" onClick={latest.openNotification}>{latest.notification.name}</button>}<button onClick={latest.dismiss}>Đóng</button></div>;
}
const render=async(value=visit,connected=true,runId='run')=>act(async()=>root.render(<Harness value={structuredClone(value)} connected={connected} runId={runId}/>));
const click=async(label:string)=>act(async()=>[...host.querySelectorAll('button')].find(button=>button.textContent===label)!.click());
beforeEach(()=>{
 vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);localStorage.clear();open.mockClear();requestPermission.mockClear();
 vi.stubGlobal('Notification',{permission:'default',requestPermission});
 visit=createRun().visits[0];visit.services=[createService('DEMO-US-ABD','RETURN_TO_DOCTOR'),createService('DEMO-BLOOD-BIOCHEM','RETURN_TO_DOCTOR')];
 host=document.createElement('div');document.body.append(host);root=createRoot(host);
});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();vi.unstubAllGlobals();vi.useRealTimers();});

it('queues every new result within the simulated phone without using browser permissions',async()=>{
 await render();await click('Bật');visit.services.forEach(service=>service.resultStatus='AVAILABLE');await render();await render();
 expect(host.querySelector('.alert')?.textContent).toBe(visit.services[0].name);
 await click('Đóng');expect(host.querySelector('.alert')?.textContent).toBe(visit.services[1].name);
 await click('Đóng');await render();expect(host.querySelector('.alert')).toBeNull();expect(requestPermission).not.toHaveBeenCalled();
});
it('does not replay existing results and clears alerts when the journey changes',async()=>{
 visit.services[0].resultStatus='AVAILABLE';await render();await click('Bật');expect(host.querySelector('.alert')).toBeNull();
 visit.services[1].resultStatus='AVAILABLE';await render();expect(host.querySelector('.alert')).not.toBeNull();
 visit.journeyVersion=1;await render();expect(host.querySelector('.alert')).toBeNull();
});
it('honors the simulated notification toggle without replaying results received while off',async()=>{
 await render();await click('Tắt');visit.services[0].resultStatus='AVAILABLE';await render();await click('Bật');expect(host.querySelector('.alert')).toBeNull();
 await click('Bật');expect(host.querySelector('.alert')).toBeNull();visit.services[1].resultStatus='AVAILABLE';await render();
 expect(host.querySelector('.alert')?.textContent).toBe(visit.services[1].name);expect(requestPermission).not.toHaveBeenCalled();
});
it('catches results after reconnect without duplicate alerts',async()=>{
 await render();await click('Bật');visit.services[0].resultStatus='AVAILABLE';await render(visit,false);expect(host.querySelector('.alert')).toBeNull();
 await render();await render();expect(host.querySelector('.alert')).not.toBeNull();await click('Đóng');await render();expect(host.querySelector('.alert')).toBeNull();
});
it('opens the corresponding result and ignores an alert from a reset journey',async()=>{
 await render();await click('Bật');visit.services[0].resultStatus='AVAILABLE';await render();await act(async()=>latest.openNotification());
 expect(open).toHaveBeenCalledWith(expect.objectContaining({id:visit.services[0].id}));
 open.mockClear();visit.services[1].resultStatus='AVAILABLE';await render();const stale=latest.openNotification;
 visit.journeyVersion=1;await render();await act(async()=>stale());expect(open).not.toHaveBeenCalled();
});
it('dismisses the banner after eight seconds',async()=>{
 vi.useFakeTimers();await render();await click('Bật');visit.services[0].resultStatus='AVAILABLE';await render();expect(host.querySelector('.alert')).not.toBeNull();
 await act(async()=>vi.advanceTimersByTime(8000));expect(host.querySelector('.alert')).toBeNull();
});
