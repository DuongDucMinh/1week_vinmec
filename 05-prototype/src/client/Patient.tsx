import { useEffect, useRef, useState } from 'react';
import type { Service, Snapshot, VisitView } from '../shared/contracts';
import type { SimulationApi } from './api';
import { Icon } from './icons';
import { RouteMap } from './Map';
import { Dialog } from './Dialog';
import { clinicForVisit, departmentForVisit } from '../shared/journey';
import { ResetJourney } from './ResetJourney';
import { useResultNotifications } from './useResultNotifications';
import { procedureArrivalInstruction } from '../shared/procedure-arrival';
import { PatientAssistant } from './PatientAssistant';
import { PatientFrame } from './PatientFrame';
import { patientPid } from '../shared/patient';

function orderedServices(view: VisitView): Service[] {
 const done=view.visit.services.filter(s=>s.executionStatus==='COMPLETED').sort((a,b)=>(a.performanceOrder??0)-(b.performanceOrder??0));
 const pending=view.procedurePlan.map(step=>view.visit.services.find(s=>s.id===step.serviceId)!).filter(Boolean);
 return [...done,...pending,...view.visit.services.filter(s=>s.executionStatus!=='COMPLETED'&&!pending.includes(s))];
}

type PatientTab = 'journey' | 'map' | 'inbox' | 'assistant';
const time = (value: string) => new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
function Result({ service, close }: { service: Service; close: () => void }) {
  return <Dialog contained labelledBy="result-title" onDismiss={close}><section className="modal"><button className="icon-button modal-close" aria-label="Đóng kết quả" onClick={close}><Icon name="close" /></button><h2 id="result-title">{service.result?.title || service.name}</h2><p className="muted">Bộ phận dịch vụ đã công bố lúc {service.resultConfirmedAt ? time(service.resultConfirmedAt) : '—'}. Bạn và bác sĩ cùng xem được bản điện tử.</p><div className="result-content">{service.result?.content || 'Kết quả đã được công bố. Vui lòng trao đổi với bác sĩ để được giải thích.'}</div><p className="small">Trao đổi với bác sĩ để được giải thích kết quả.</p><button className="primary" onClick={close}>Đã xem</button></section></Dialog>;
}

export function Patient({ snapshot, api, offline, setOffline }: { snapshot: Snapshot; api: SimulationApi; offline: boolean; setOffline: (v: boolean) => void }) {
  const [visitId,setVisitId]=useState('DEMO-P01');
  const [tab,setTab]=useState<PatientTab>('journey');
  const [result,setResult]=useState<Service|null>(null);
  const [profileOpen,setProfileOpen]=useState(false);
  const [toast,setToast]=useState<string|null>(null);
  const content=useRef<HTMLElement>(null);
  const baseline=useRef<{key:string;ids:Set<string>;connected:boolean}>({key:'',ids:new Set(),connected:false});
  const showTools=new URLSearchParams(location.search).get('tools')==='1';
  const view=snapshot.views[visitId]||Object.values(snapshot.views)[0];
  const {visit,nextAction}=view;const department=departmentForVisit(visit), clinic=clinicForVisit(visit);
  useEffect(()=>{setTab('journey');setResult(null);setProfileOpen(false);},[snapshot.runId,visitId,visit.journeyVersion]);
  useEffect(()=>{if(content.current)content.current.scrollTop=0;},[tab,visitId,snapshot.runId,visit.journeyVersion]);
  useEffect(()=>{
    const key=snapshot.runId+visitId+visit.journeyVersion, previous=baseline.current;
    const message=api.connected&&previous.connected&&previous.key===key?visit.inbox.filter(n=>!previous.ids.has(n.id)&&!n.id.startsWith('result-')).at(-1):null;
    if(message)setToast(message.message);else if(previous.key!==key||!api.connected)setToast(null);
    baseline.current={key,ids:new Set(visit.inbox.map(n=>n.id)),connected:api.connected};
  },[snapshot.runId,visitId,visit.journeyVersion,visit.inbox,api.connected]);
  useEffect(()=>{if(!toast)return;const timer=window.setTimeout(()=>setToast(null),6000);return()=>window.clearTimeout(timer);},[toast]);
  const notifications=useResultNotifications(snapshot.runId,visit,api.connected,service=>{setProfileOpen(false);setResult(service);});
  const notificationSettings=!notifications.configured&&<section className="notification-settings" aria-labelledby="notification-settings-title"><div className="notification-settings-title"><Icon name="bell" size={18}/><h2 id="notification-settings-title">Nhận thông báo kết quả</h2></div><p>Nhận banner trong khung điện thoại ngay khi có kết quả mới.</p><button className="secondary" onClick={notifications.enable}>Bật thông báo kết quả</button></section>;
  const unread=visit.inbox.filter(n=>!n.read).length;
  const destination=snapshot.graph.locations.find(l=>l.id===nextAction.destinationId);
  const initialDone=!['UNREGISTERED','WAITING_INITIAL','INITIAL_ENCOUNTER'].includes(visit.phase);
  const assigned=visit.services.length>0;
  const available=visit.services.filter(s=>s.resultStatus==='AVAILABLE').length;
  const disabled=api.pending||!api.connected;
  const atDestination=!!destination&&visit.locationId===destination.id&&!visit.outsideHospital;
  let currentInstruction=nextAction.description;
  switch(nextAction.kind){
    case 'REGISTER':currentInstruction='Nhờ nhân viên xác nhận lượt khám.';break;
    case 'WAIT_INITIAL':currentInstruction=atDestination?'Mời ngồi tại khu chờ, bác sĩ sẽ gọi bạn.':'Đến phòng và chờ bác sĩ gọi theo số khám.';break;
    case 'ENCOUNTER':currentInstruction='Mời vào phòng để gặp bác sĩ.';break;
  }
  const showQueueNumber=visit.queueNumber!=null&&(nextAction.kind==='WAIT_INITIAL'||nextAction.kind==='ENCOUNTER');
  const openMap=()=>setTab('map');
  return <PatientFrame><div className={`phone-shell${tab==='map'?' navigation-active':''}`}>
    <header className="patient-header"><a className="brand" href="/patient"><span className="brand-mark" aria-hidden="true">+</span><span>My<span>Vinmec</span></span></a><button className="patient-profile-button" aria-label="Thông tin người bệnh" aria-description={`Thông tin cá nhân của ${visit.displayName}`} aria-haspopup="dialog" onClick={()=>setProfileOpen(true)}><span className="patient-profile-avatar"><Icon name="user" size={18}/></span><span className="patient-profile-name">{visit.displayName}</span></button></header>
    {notifications.notification&&<aside className="patient-result-banner" role="status"><span className="result-banner-icon"><Icon name="bell" size={22}/></span><button className="result-banner-content" onClick={notifications.openNotification}><small>MyVinmec · Vừa xong</small><strong>Có kết quả mới</strong><span>{notifications.notification.name}</span><small>Chạm để xem kết quả</small></button><button className="icon-button" aria-label="Đóng thông báo kết quả" onClick={notifications.dismiss}><Icon name="close" size={17}/></button></aside>}
    {toast&&<aside className="patient-update-toast" aria-live="polite"><span>{toast}</span><button className="text-button" onClick={()=>{setTab('inbox');setToast(null);}}>Xem</button><button className="icon-button" aria-label="Đóng cập nhật" onClick={()=>setToast(null)}><Icon name="close" size={16}/></button></aside>}
    <main ref={content} className={`patient-main patient-${tab}`}><div className="visit-heading"><h1>{tab==='journey'?'Lượt khám hôm nay':tab==='map'?'Đường đi của bạn':tab==='inbox'?'Thông báo':'Trợ lý hướng dẫn'}</h1>{tab==='inbox'&&notifications.configured&&<button className="icon-button notification-toggle" aria-label={notifications.status==='enabled'?'Tắt thông báo kết quả':'Bật thông báo kết quả'} title={notifications.status==='enabled'?'Tắt thông báo kết quả':'Bật thông báo kết quả'} aria-pressed={notifications.status==='enabled'} onClick={notifications.status==='enabled'?notifications.disable:notifications.enable}><Icon name={notifications.status==='enabled'?'bell':'bell-off'} size={22}/></button>}</div>

      {tab==='journey'&&<>
        <section className="next-card" aria-labelledby="next-title">
          <div className="next-topline"><span>{nextAction.kind==='COMPLETE'?'Lượt khám đã kết thúc':'Bước hiện tại'}</span>{showQueueNumber?<span className="next-queue">Số khám <strong>{visit.queueNumber}</strong></span>:atDestination&&nextAction.kind!=='REGISTER'?<span className="next-status"><Icon name="check" size={14}/>Đã đến</span>:nextAction.kind==='COMPLETE'?<Icon name="check" size={18}/>:null}</div>
          <h2 id="next-title">{nextAction.title}</h2>
          <p>{currentInstruction}</p>
          {destination&&<div className="destination"><Icon name="pin" size={16}/>{destination.roomNumber&&!nextAction.title.includes(destination.roomNumber)&&<strong className="destination-code">Phòng {destination.roomNumber}</strong>}<span className="destination-address">{destination.building} · Tầng {destination.floor}</span></div>}
        <div className="next-actions">{destination&&!atDestination&&<button className="primary" onClick={openMap}><Icon name="map" size={18}/> Xem đường đi <Icon name="arrow" size={17}/></button>}</div></section>
        <section className="progress-section"><div className="section-heading"><h2>Hành trình khám</h2>{assigned&&<span className="muted small">{available}/{visit.services.length} kết quả</span>}</div><ol className="timeline">
          <li className={`timeline-step ${visit.phase!=='UNREGISTERED'?'done':'current'}`}><span className="timeline-dot">{visit.phase!=='UNREGISTERED'?<Icon name="check" size={14}/>:1}</span><div><strong>Tiếp nhận tại quầy</strong><span>{visit.phase==='UNREGISTERED'?'Chờ lễ tân xác nhận':'Đã hoàn tất tiếp nhận'}</span></div></li>
          <li className={`timeline-step ${initialDone?'done':visit.phase!=='UNREGISTERED'?'current':''}`}><span className="timeline-dot">{initialDone?<Icon name="check" size={14}/>:2}</span><div><strong>{department?`Khám ${department.shortName} · ${clinic?.roomNumber}`:'Khám chuyên khoa'}</strong><span>{initialDone?'Đã khám ban đầu':visit.phase==='INITIAL_ENCOUNTER'?'Đang được bác sĩ tiếp nhận':visit.phase==='WAITING_INITIAL'?atDestination?'Đã đến phòng · Chờ bác sĩ gọi':`Đi từ quầy tiếp nhận đến ${department?.name}`:'Lễ tân sẽ chọn khoa sau khi tiếp nhận'}</span></div></li>
          {orderedServices(view).map((s,index)=>{const current=nextAction.serviceId===s.id;const room=snapshot.graph.locations.find(l=>l.id===s.locationId);const status=s.resultStatus!=='NOT_AVAILABLE'||s.executionStatus==='COMPLETED'?null:s.executionStatus==='IN_PROGRESS'?'Đang thực hiện':current?'Đến làm thủ tục này':null;return <li className={`service-card timeline-step ${s.executionStatus==='COMPLETED'?'done':current?'current':''}`} key={s.id}><span className="timeline-dot">{s.executionStatus==='COMPLETED'?<Icon name="check" size={14}/>:index+3}</span><div className="service-body"><strong className="service-name">{s.name}</strong>{status&&<span>{status}</span>}{room&&<small className="service-room">Phòng {room.roomNumber} · {room.building} · Tầng {room.floor}</small>}{s.resultStatus!=='NOT_AVAILABLE'&&<div className="result-row"><span className={`result-status ${s.resultStatus==='AVAILABLE'?'available':''}`}>{s.resultStatus==='AVAILABLE'?'Đã có kết quả':'Đang chờ kết quả'}</span>{s.resultStatus==='AVAILABLE'&&<button className="text-button" onClick={()=>setResult(s)}>Xem kết quả <span>›</span></button>}</div>}{s.resultStatus==='WAITING'&&<p className="eta">{s.resultEtaLabel}</p>}{snapshot.mode==='COLLECT_PAPER'&&<p className="paper-status">{s.paperStatus==='COLLECTED'?'Đã nhận bản giấy':'Nhận bản giấy khi được hướng dẫn'}</p>}</div></li>;})}
          {assigned&&<li className={`timeline-step ${visit.phase==='READY'?(atDestination?'done':'current'):''}`}><span className="timeline-dot">{visit.phase==='READY'&&atDestination?<Icon name="check" size={14}/>:visit.services.length+3}</span><div><strong>Quay lại phòng {department?.shortName} · {clinic?.roomNumber}</strong><span>{visit.phase==='READY'?(atDestination?(available===visit.services.length?'Đã đủ kết quả · Chờ bác sĩ gọi vào nghe chẩn đoán':'Đã quay lại · Chờ kết quả và bác sĩ gọi'):'Đã hoàn tất thủ tục · Mời quay lại'):'Sau khi hoàn tất tất cả thủ tục'}</span></div></li>}
        </ol></section>
        {assigned&&<div className="mode-note"><Icon name={snapshot.mode==='RETURN_TO_DOCTOR'?'file':'print'} size={18}/><p><strong>{snapshot.mode==='RETURN_TO_DOCTOR'?'Kết quả chuyển điện tử':'Nhận kết quả bản giấy'}</strong><span>{snapshot.mode==='RETURN_TO_DOCTOR'?'Kết quả được chuyển tới bạn và bác sĩ khi sẵn sàng.':'Phòng thủ tục trả bản giấy kết quả theo hướng dẫn tại phòng.'}</span></p></div>}

      </>}
      {tab==='map'&&<RouteMap snapshot={snapshot} view={view} api={api}/>}
      {tab==='inbox'&&<section className="inbox">{notificationSettings}{visit.inbox.length?[...visit.inbox].reverse().map(n=><article className={`notification ${!n.read?'unread':''}`} key={n.id}><Icon name="bell" size={18}/><div><p>{n.message}</p><div className="notification-meta"><small>{time(n.createdAt)}</small>{!n.read&&<button className="text-button" disabled={disabled} onClick={()=>api.command('MARK_NOTIFICATION_READ',visitId,'patient',{notificationId:n.id})}>Đánh dấu đã đọc</button>}</div></div></article>):<div className="empty-state"><span className="empty-icon"><Icon name="bell" size={28}/></span><h2>Chưa có thông báo mới</h2><p>Lời gọi bác sĩ và kết quả sẽ xuất hiện tại đây.</p></div>}</section>}
      <div className="assistant-slot" hidden={tab!=='assistant'}><PatientAssistant key={snapshot.runId+visitId+visit.journeyVersion} api={api} view={view} snapshot={snapshot} active={tab==='assistant'}/></div>
    </main>
    <nav className="bottom-nav" aria-label="Điều hướng người bệnh">{([{id:'journey',label:'Lượt khám',icon:'home'},{id:'map',label:'Đường đi',icon:'map'},{id:'inbox',label:'Thông báo',icon:'bell'},{id:'assistant',label:'Trợ lý',icon:'chat'}] as const).map(item=><button key={item.id} aria-label={item.label} aria-description={item.id==='inbox'&&unread>0?`${unread} thông báo chưa đọc`:undefined} className={tab===item.id?'active':''} aria-current={tab===item.id?'page':undefined} onClick={()=>setTab(item.id)}><span><Icon name={item.icon} size={21}/>{item.id==='inbox'&&unread>0&&<i className="unread-count">{unread}</i>}</span>{item.label}</button>)}</nav>
    <PrintGuide snapshot={snapshot} view={view}/>

    {result&&<Result service={result} close={()=>setResult(null)}/>}
    {profileOpen&&<Dialog contained label="Thông tin cá nhân" onDismiss={()=>setProfileOpen(false)}><section className="modal patient-profile">
      <button className="icon-button modal-close" aria-label="Đóng thông tin cá nhân" onClick={()=>setProfileOpen(false)}><Icon name="close"/></button>
      <h2>Thông tin cá nhân</h2>
      <div className="profile-identity"><span className="profile-avatar"><Icon name="user" size={28}/></span><div><h3>{visit.displayName}</h3><p>Người đang khám</p></div></div>
      <dl className="profile-details"><div><dt>Tuổi</dt><dd>{visit.age} tuổi</dd></div><div><dt>Mã bệnh nhân PID</dt><dd>{patientPid(visit)}</dd></div></dl>
      <label className="profile-switch">Đổi người khám<select value={visitId} onChange={e=>setVisitId(e.target.value)}>{snapshot.visits.map(v=><option key={v.visitId} value={v.visitId}>{v.displayName} · {v.age} tuổi</option>)}</select></label>
      <ResetJourney visit={visit} api={api} actor="patient"/>
      {showTools&&<details className="operator-tools"><summary>Công cụ kiểm tra kết nối</summary><button className="secondary" onClick={()=>{setOffline(!offline);setProfileOpen(false);}}>{offline?'Kết nối lại ứng dụng':'Tạm ngắt kết nối trang này'}</button><div className="role-links"><a href="/doctor">Màn hình bác sĩ ↗</a><a href="/procedure">Phòng thủ tục ↗</a><a href="/control">Điều phối ↗</a></div></details>}
    </section></Dialog>}
  </div></PatientFrame>;
}

function PrintGuide({snapshot,view}:{snapshot:Snapshot;view:VisitView}) {
  const clinic=clinicForVisit(view.visit);const roomIds=new Set([clinic?.id||'DEMO-RECEPTION',...view.visit.services.map(s=>s.locationId)]);
  return <article className="print-guide"><h1>Giấy hướng dẫn lượt khám</h1><p>{snapshot.facility}<br/>Người bệnh: {view.visit.displayName} · Mã: {view.visit.visitId.replace('DEMO-','')}</p><h2>{view.nextAction.title}</h2><p>{view.nextAction.description}</p><ol>{view.route.instructions.map((text,i)=><li key={i}>{text}</li>)}</ol><p>Di chuyển giữa các tầng: {view.visit.transportMode==='stairs'?'Thang bộ':'Thang máy'}.</p><h2>Các điểm trong lượt khám</h2><ul>{snapshot.graph.locations.filter(l=>roomIds.has(l.id)).map(l=><li key={l.id}>{l.name} · {l.building}, tầng {l.floor}</li>)}</ul>{view.visit.services.length>0?<><h2>Thứ tự thủ tục dự kiến</h2><p>Ưu tiên phòng ít người, bằng nhau chọn gần nhất. Thứ tự sẽ được tính lại trên ứng dụng sau mỗi thủ tục.</p><ol>{orderedServices(view).map(s=><li key={s.id}>{s.name} · {s.executionStatus==='COMPLETED'?'Đã thực hiện':'Chưa hoàn tất'} · {s.resultStatus==='AVAILABLE'?'Đã có kết quả':'Chưa có kết quả'}<p>{procedureArrivalInstruction(snapshot,s.id)}</p></li>)}</ol></>:<p>Bác sĩ sẽ quyết định thủ tục sau khi khám chuyên khoa.</p>}<p>Mọi người bệnh đều dùng giấy chỉ định hoặc lấy số tại cửa phòng, kể cả khi có ứng dụng. {clinic&&`Sau khi hoàn tất các thủ tục, quay lại phòng ${clinic.name}.`}</p><p>Cập nhật: {new Date(snapshot.updatedAt).toLocaleString('vi-VN')}. Giấy không tự cập nhật tiến độ mới.</p></article>;
}
