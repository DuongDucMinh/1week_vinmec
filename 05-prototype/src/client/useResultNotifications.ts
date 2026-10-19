import { useEffect, useRef, useState } from 'react';
import type { Service, Visit } from '../shared/contracts';

type Permission = NotificationPermission | 'unsupported';
const permission = (): Permission => typeof Notification !== 'undefined' && window.isSecureContext ? Notification.permission : 'unsupported';
let registration: Promise<ServiceWorkerRegistration> | undefined;
function worker() {
  registration ??= navigator.serviceWorker.register('/notifications-sw.js').then(async () => navigator.serviceWorker.ready).catch(error => { registration=undefined; throw error; });
  return registration;
}

export function useResultNotifications(runId: string, visit: Visit, connected: boolean, open: (service: Service) => void) {
  const [status,setStatus]=useState<Permission>(permission);
  const [error,setError]=useState(false);
  const current=useRef({runId,visit,open});
  current.current={runId,visit,open};
  const baseline=useRef<{key:string;seen:Set<string>}>({key:'',seen:new Set()});
  const key=JSON.stringify([runId,visit.visitId,visit.journeyVersion??0]);

  useEffect(()=>{
    const refresh=()=>setStatus(permission());
    window.addEventListener('focus',refresh);
    return ()=>window.removeEventListener('focus',refresh);
  },[]);
  useEffect(()=>{
    if(!('serviceWorker' in navigator))return;
    const handle=(event:MessageEvent)=>{
      const data=event.data, latest=current.current;
      if(data?.type!=='OPEN_RESULT'||data.runId!==latest.runId||data.visitId!==latest.visit.visitId||data.journeyVersion!==(latest.visit.journeyVersion??0))return;
      const service=latest.visit.services.find(s=>s.id===data.serviceId&&s.resultStatus==='AVAILABLE');
      if(service)latest.open(service);
    };
    navigator.serviceWorker.addEventListener('message',handle);
    return ()=>navigator.serviceWorker.removeEventListener('message',handle);
  },[]);

  useEffect(()=>{
    const available=visit.services.filter(s=>s.resultStatus==='AVAILABLE');
    if(baseline.current.key!==key){baseline.current={key,seen:new Set(available.map(s=>s.id))};return;}
    if(!connected)return;
    for(const service of available){
      if(baseline.current.seen.has(service.id))continue;
      baseline.current.seen.add(service.id);
      if(permission()!=='granted')continue;
      const data={type:'OPEN_RESULT',runId,visitId:visit.visitId,journeyVersion:visit.journeyVersion??0,serviceId:service.id};
      const options={body:`Đã có kết quả ${service.name}. Nhấn để xem.`,tag:`result:${key}:${service.id}`,data};
      if('serviceWorker' in navigator){
        void worker().then(reg=>{
          if(JSON.stringify([current.current.runId,current.current.visit.visitId,current.current.visit.journeyVersion??0])!==key)return;
          return reg.showNotification('MyVinmec · Có kết quả mới',options);
        }).catch(()=>setError(true));
      }else{
        try{
          const notification=new Notification('MyVinmec · Có kết quả mới',options);
          notification.onclick=()=>{notification.close();window.focus();const latest=current.current;if(latest.runId===runId&&latest.visit.visitId===visit.visitId&&(latest.visit.journeyVersion??0)===(visit.journeyVersion??0))latest.open(service);};
        }catch{setError(true);}
      }
    }
  },[key,runId,visit,connected]);

  const enable=async()=>{
    try{
      setError(false);
      const next=await Notification.requestPermission();
      setStatus(next);
      if(next==='granted'&&'serviceWorker' in navigator)await worker();
    }catch{setError(true);}
  };
  return {status,error,enable};
}
