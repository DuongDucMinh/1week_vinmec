// @vitest-environment jsdom
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {beforeEach,afterEach,expect,it,vi} from 'vitest';
import {useResultNotifications} from '../../src/client/useResultNotifications';
import {createRun,createService} from '../../src/shared/fixtures';
import type {Visit} from '../../src/shared/contracts';

let host:HTMLDivElement,root:Root,visit:Visit;
const delivered:{title:string;options:NotificationOptions;onclick?:()=>void;close:ReturnType<typeof vi.fn>}[]=[];
let allowed:NotificationPermission;
const requestPermission=vi.fn(async()=>allowed='granted' as NotificationPermission);
const open=vi.fn();
function Harness({value,connected=true,runId='run'}:{value:Visit;connected?:boolean;runId?:string}){
 const n=useResultNotifications(runId,value,connected,open);
 return <button onClick={()=>void n.enable()}>{n.status}{n.error?' error':''}</button>;
}
const render=async(value=visit,connected=true,runId='run')=>act(async()=>root.render(<Harness value={structuredClone(value)} connected={connected} runId={runId}/>));
beforeEach(()=>{
 vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);vi.stubGlobal('isSecureContext',true);
 allowed='granted';delivered.length=0;requestPermission.mockClear();open.mockClear();
 class FakeNotification{
  static get permission(){return allowed;}
  static requestPermission=requestPermission;
  close=vi.fn();
  constructor(public title:string,public options:NotificationOptions){delivered.push(this);}
 }
 vi.stubGlobal('Notification',FakeNotification);
 visit=createRun().visits[0];visit.services=[createService('DEMO-US-ABD','RETURN_TO_DOCTOR'),createService('DEMO-BLOOD-BIOCHEM','RETURN_TO_DOCTOR')];
 host=document.createElement('div');document.body.append(host);root=createRoot(host);
});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();vi.unstubAllGlobals();});

it('notifies for every newly available result even in a single update, without replaying snapshots',async()=>{
 await render();visit.services.forEach(s=>s.resultStatus='AVAILABLE');await render();await render();
 expect(delivered).toHaveLength(2);
 expect(delivered[0].options.body).toContain(visit.services[0].name);
 expect(delivered[1].options.body).toContain(visit.services[1].name);
 expect(delivered[0].options.tag).not.toBe(delivered[1].options.tag);
});
it('does not announce existing results on load or patient/journey changes',async()=>{
 visit.services[0].resultStatus='AVAILABLE';await render();expect(delivered).toHaveLength(0);
 visit.journeyVersion=1;visit.services[1].resultStatus='AVAILABLE';await render();expect(delivered).toHaveLength(0);
});
it('asks permission only on the enable button and delivers future results',async()=>{
 allowed='default';await render();expect(requestPermission).not.toHaveBeenCalled();
 await act(async()=>host.querySelector('button')!.click());expect(requestPermission).toHaveBeenCalledOnce();
 visit.services[0].resultStatus='AVAILABLE';await render();expect(delivered).toHaveLength(1);
});
it('catches results after reconnect without duplicate alerts',async()=>{
 await render();visit.services[0].resultStatus='AVAILABLE';await render(visit,false);expect(delivered).toHaveLength(0);
 await render();await render();expect(delivered).toHaveLength(1);
});
it('does not send system alerts when permission is denied',async()=>{
 allowed='denied';await render();visit.services[0].resultStatus='AVAILABLE';await render();expect(delivered).toHaveLength(0);
});
it('opens the corresponding result and ignores notifications for a reset journey',async()=>{
 vi.spyOn(window,'focus').mockImplementation(()=>{});
 await render();visit.services[0].resultStatus='AVAILABLE';await render();
 await act(async()=>delivered[0].onclick?.());expect(open).toHaveBeenCalledWith(expect.objectContaining({id:visit.services[0].id}));
 open.mockClear();visit.journeyVersion=1;await render();
 await act(async()=>delivered[0].onclick?.());expect(open).not.toHaveBeenCalled();
 vi.restoreAllMocks();
});
