import type { Actor, Command, CommandType, NextAction, Route, SimulationRun, Snapshot, Visit, ServiceId } from '../shared/contracts';
import { createService, departmentCatalog, graph, resultContent, serviceCatalog } from '../shared/fixtures';
import { procedureArrivalInstruction, procedureQueueMethods } from '../shared/procedure-arrival';
import { activeEncounters, clinicAddress, clinicForVisit, departmentForVisit } from '../shared/journey';
import { presentRun } from './presentation';
import { deriveRoute } from '../shared/routing';
import { planProcedures, recommendNextService } from './procedure-planning';
export { deriveRoute } from '../shared/routing';
export class DomainError extends Error { constructor(public code: string, message: string) { super(message); } }
const requireGate = (yes: unknown, message: string) => { if (!yes) throw new DomainError('GATE_BLOCKED', message); };
const permissions: Record<Actor, readonly CommandType[]> = {
 patient:['SET_TRANSPORT_MODE','CONFIRM_LOCATION','START_RETURN','MARK_READY','WITHDRAW_READY','MARK_NOTIFICATION_READ','RESET_VISIT'],
 doctor:['CALL_INITIAL','BEGIN_ENCOUNTER','ASSIGN_SERVICES','ASSIGN_DEMO_SERVICES','CALL_REVIEW','COMPLETE_ENCOUNTER'],
 procedure:['CHECK_IN_SERVICE','START_SERVICE','COMPLETE_SERVICE','CONFIRM_RESULT','COLLECT_PAPER'],
 control:['REGISTER','CHECK_IN_SERVICE','START_SERVICE','COMPLETE_SERVICE','CONFIRM_RESULT','COLLECT_PAPER','STAFF_MARK_READY','SET_PROCEDURE_QUEUE_METHOD','RESET_VISIT']
};
export const allPerformed = (v: Visit) => v.services.length>0 && v.services.every(s=>s.executionStatus==='COMPLETED');
export const allResultsAvailable = (v: Visit) => allPerformed(v) && v.services.every(s=>s.resultStatus==='AVAILABLE');
export const canReturn = (_run: SimulationRun, v: Visit) => allPerformed(v);
// This is an order roster, never the physical paper/ticket calling order.
export function deriveProcedureQueues(run: SimulationRun): Record<ServiceId,string[]> {
 return Object.fromEntries(serviceCatalog.map(service=>[service.id,run.visits
  .filter(v=>v.services.some(s=>s.id===service.id&&s.executionStatus!=='COMPLETED'))
  .map(v=>v.visitId)])) as Record<ServiceId,string[]>;
}
export function deriveQueues(run: SimulationRun) { return { initial:run.visits.filter(v=>v.phase==='WAITING_INITIAL').sort((a,b)=>(a.queueNumber??0)-(b.queueNumber??0)).map(v=>v.visitId),review:run.visits.filter(v=>v.phase==='READY'&&allPerformed(v)).map(v=>v.visitId) }; }
export function deriveNextAction(run: SimulationRun,v: Visit): NextAction {
 const clinic=clinicForVisit(v), department=departmentForVisit(v), address=clinicAddress(v);
 const base={canReturn:canReturn(run,v),canMarkReady:false,canLeave:false,destinationId:null,allowedCommands:[] as CommandType[]};
 const make=(kind:NextAction['kind'],title:string,description:string,destinationId:string|null=null,allowedCommands:CommandType[]=[],serviceId?:NextAction['serviceId']):NextAction=>({...base,kind,title,description,destinationId,allowedCommands,serviceId});
 if(v.phase==='UNREGISTERED') return make('REGISTER','Đến quầy tiếp nhận','Nhờ nhân viên xác nhận tiếp nhận lượt khám.','DEMO-RECEPTION');
 if(v.phase==='WAITING_INITIAL')return make('WAIT_INITIAL',v.locationId===clinic!.id?`Chờ khám ${department!.shortName} lần đầu`:`Đến phòng khám ${department!.shortName}`,`Số khám ${v.queueNumber??''} được xếp từ quầy tiếp nhận. Đến ${address} và chờ bác sĩ gọi.`,clinic!.id);
 if(v.phase==='INITIAL_ENCOUNTER'||v.phase==='REVIEW_ENCOUNTER')return make('ENCOUNTER','Bác sĩ đã gọi vào',`Mời vào ${address}.`,clinic!.id);
 if(v.phase==='COMPLETED')return make('COMPLETE','Đã hoàn tất lượt khám','Lượt khám của bạn đã kết thúc.');
 if(v.phase==='READY'||allPerformed(v)){
  const resultsReady=allResultsAvailable(v);
  return v.locationId===clinic!.id&&!v.outsideHospital
   ?make('READY',resultsReady?'Sẵn sàng nghe chẩn đoán':`Đã quay lại phòng ${department!.shortName} ${clinic!.roomNumber}`,resultsReady?'Tất cả thủ tục đã có kết quả. Mời ngồi chờ ngoài phòng, sẵn sàng vào nghe chẩn đoán khi bác sĩ gọi.':'Bạn đã hoàn tất các thủ tục. Mời ngồi chờ ngoài phòng; kết quả sẽ được cập nhật khi có. Chỉ vào phòng khi bác sĩ gọi.',clinic!.id)
   :make('RETURN',`Quay lại phòng ${department!.shortName} ${clinic!.roomNumber}`,resultsReady?`Tất cả thủ tục đã có kết quả. Mời quay lại ${address}, ngồi chờ và sẵn sàng vào nghe chẩn đoán khi bác sĩ gọi.`:`Bạn đã hoàn tất các thủ tục và được cập nhật vào danh sách sẵn sàng của bác sĩ. Mời quay lại ${address} và chờ ngoài phòng.`,clinic!.id);
 }
 const current=v.services.find(s=>s.executionStatus==='IN_PROGRESS');
 if(current)return make('IN_SERVICE',`Đang thực hiện ${current.name}`,'Theo hướng dẫn của bác sĩ tại phòng.',current.locationId,[],current.id);
 const nextServiceId=planProcedures(run,v)[0]?.serviceId;
 const next=v.services.find(s=>s.id===nextServiceId);
 if(next)return make('GO_SERVICE',`Đến ${next.name}`,procedureArrivalInstruction(run,next.id),next.locationId,[],next.id);
 return make('WAIT_RESULTS','Theo dõi lượt khám','Kiểm tra hướng dẫn trong lượt khám.');
}
export function applyCommand(run: SimulationRun,c: Command,now=new Date().toISOString()): {changed:boolean;message:string} {
 requireGate(permissions[c.actor].includes(c.type),'Bạn không có quyền thực hiện thao tác này.');
 const v=run.visits.find(v=>v.visitId===c.visitId);requireGate(v,'Không tìm thấy lượt khám.');const visit=v!;
 if(c.type!=='SET_PROCEDURE_QUEUE_METHOD'&&(c.expectedJourneyVersion??0)!==(visit.journeyVersion??0))throw new DomainError('STALE_VISIT','Hành trình người bệnh đã được reset. Hãy kiểm tra lượt mới trước khi thao tác.');
 const department=departmentForVisit(visit)??departmentCatalog[0], clinic=graph.locations.find(l=>l.id===department.locationId)!;
 const s=visit.services.find(s=>s.id===c.payload.serviceId);
 const encounter=activeEncounters(run)[department.id];
 const setEncounter=(value:typeof encounter|null)=>{run.activeEncounters=activeEncounters(run);if(value)run.activeEncounters[department.id]=value;else delete run.activeEncounters[department.id];if(department.id==='DEMO-INTERNAL')run.activeEncounter=value??null;}; const active=()=>requireGate(encounter?.visitId===visit.visitId,'Đây không phải người đang được tiếp nhận.');
 const notify=(id:string,message:string)=>{if(!visit.inbox.some(n=>n.id===id))visit.inbox.push({id,message,createdAt:now,read:false});};
 let changed=true;
 switch(c.type){
 case 'RESET_VISIT':
  if(encounter?.visitId===visit.visitId)setEncounter(null);
  run.encounterHistory=run.encounterHistory.filter(e=>e.visitId!==visit.visitId);
  Object.assign(visit,{journeyVersion:(visit.journeyVersion??0)+1,departmentId:null,queueNumber:null,transportMode:'lift',recommendedServiceId:null,phase:'UNREGISTERED',services:[],locationId:'DEMO-RECEPTION',outsideHospital:false,returning:false,presenceConfirmed:false,readySource:null,inbox:[]});
  return {changed:true,message:`Đã reset hành trình của ${visit.displayName}. Mời chọn khoa và tiếp nhận lại.`};
 case 'REGISTER': {
  if(visit.phase!=='UNREGISTERED'){changed=false;break;}
  const selected=departmentCatalog.find(d=>d.id===c.payload.departmentId);requireGate(selected,'Hãy chọn khoa khám trước khi xác nhận tiếp nhận.');
  run.departmentTicketCounters??={};
  const previous=Math.max(run.departmentTicketCounters[selected!.id]??0,...run.visits.filter(v=>v.departmentId===selected!.id).map(v=>v.queueNumber??0));
  visit.departmentId=selected!.id;visit.queueNumber=previous+1;run.departmentTicketCounters[selected!.id]=visit.queueNumber;visit.phase='WAITING_INITIAL';
  notify('registered',`Đã tiếp nhận tại ${selected!.name}. Số khám ${visit.queueNumber}. Mời đến ${clinicAddress(visit)} và chờ gọi.`);break;
 }
 case 'CALL_INITIAL':
 case 'CALL_REVIEW': {
  requireGate(c.type==='CALL_INITIAL','Luồng demo dừng khi người bệnh hoàn tất thủ tục và quay lại phòng khám ban đầu.');
  const kind='initial' as const;
  if(encounter?.visitId===visit.visitId&&encounter.kind===kind){changed=false;break;}
  requireGate(!encounter,'Bác sĩ đang tiếp nhận một người bệnh khác.');requireGate(visit.phase===(kind==='initial'?'WAITING_INITIAL':'READY'),'Người bệnh chưa ở hàng chờ phù hợp.');
  setEncounter({visitId:visit.visitId,kind,status:'CALLED',calledAt:now,startedAt:null});visit.phase=kind==='initial'?'INITIAL_ENCOUNTER':'REVIEW_ENCOUNTER';visit.locationId=clinic.id;visit.outsideHospital=false;notify(`called-${kind}`,`Bác sĩ đã gọi ${kind==='initial'?'khám lần đầu':'vào nghe chẩn đoán'}. Mời vào ${clinicAddress(visit)}.`);break;
 }
 case 'BEGIN_ENCOUNTER':active();if(encounter!.status==='IN_PROGRESS'){changed=false;break;}encounter!.status='IN_PROGRESS';encounter!.startedAt=now;break;
 case 'ASSIGN_SERVICES':
 case 'ASSIGN_DEMO_SERVICES': {
  const ids=c.type==='ASSIGN_DEMO_SERVICES'?['DEMO-US-ABD','DEMO-BLOOD-BIOCHEM'] as ServiceId[]:c.payload.serviceIds;
  requireGate(ids?.length&&new Set(ids).size===ids.length&&ids.every(id=>serviceCatalog.some(s=>s.id===id)),'Chọn ít nhất một thủ tục hợp lệ, không trùng lặp.');
  if(visit.phase==='SERVICES'&&!encounter){requireGate(visit.services.map(s=>s.id).join()===ids!.join(),'Chỉ định đã chốt. Không thể thay đổi khi đang thực hiện.');changed=false;break;}
  active();requireGate(encounter!.kind==='initial'&&encounter!.status==='IN_PROGRESS','Cần bắt đầu khám ban đầu trước khi chỉ định.');
  visit.services=ids!.map(id=>createService(id,run.mode));for(const service of visit.services){service.enqueuedAt=now;service.enqueuedRevision=run.revision+1;}visit.phase='SERVICES';visit.locationId=clinic.id;recommendNextService(run,visit);
  run.encounterHistory.push({...encounter!,endedAt:now,outcome:'ASSIGNED'});setEncounter(null);
  notify('services-assigned',`Bác sĩ đã chỉ định: ${visit.services.map(s=>s.name).join(', ')}. Mời đến ${visit.services.find(s=>s.id===visit.recommendedServiceId)!.name} trước theo số người tại phòng và khoảng cách.`);break;
 }
 case 'CHECK_IN_SERVICE':
  requireGate(s&&s.executionStatus==='NOT_STARTED'&&visit.phase==='SERVICES','Chỉ ghi nhận đến phòng cho thủ tục chưa bắt đầu.');
  requireGate(!visit.services.some(x=>x.executionStatus==='IN_PROGRESS'),'Người bệnh đang thực hiện thủ tục ở phòng khác.');
  changed=visit.locationId!==s!.locationId||visit.outsideHospital;visit.locationId=s!.locationId;visit.outsideHospital=false;break;
 case 'START_SERVICE':
 case 'COMPLETE_SERVICE': {
  requireGate(s,'Thủ tục chưa được chỉ định.');
  if(s!.executionStatus==='COMPLETED'||(c.type==='START_SERVICE'&&s!.executionStatus==='IN_PROGRESS')){changed=false;break;}
  requireGate(visit.phase==='SERVICES','Lượt khám không ở bước thực hiện thủ tục.');
  requireGate(!visit.services.some(x=>x.id!==s!.id&&x.executionStatus==='IN_PROGRESS'),'Người bệnh đang thực hiện thủ tục ở phòng khác.');
  requireGate(!run.visits.some(v=>v.visitId!==visit.visitId&&v.services.some(x=>x.id===s!.id&&x.executionStatus==='IN_PROGRESS')),'Phòng đang thực hiện cho người bệnh khác.');
  if(c.type==='COMPLETE_SERVICE')requireGate(s!.executionStatus==='IN_PROGRESS'||c.actor==='procedure','Thủ tục chưa bắt đầu.');
  s!.performanceOrder??=1+Math.max(0,...visit.services.map(x=>x.performanceOrder??0));
  visit.locationId=s!.locationId;visit.outsideHospital=false;
  if(c.type==='START_SERVICE'){s!.executionStatus='IN_PROGRESS';break;}
  s!.executionStatus='COMPLETED';s!.resultStatus='WAITING';recommendNextService(run,visit);
  if(allPerformed(visit)){
   visit.phase='READY';visit.readySource='system';visit.returning=true;
   notify('can-return',`Đã hoàn tất tất cả thủ tục. Mời quay lại ${clinicAddress(visit)}. Bác sĩ đã thấy bạn trong danh sách sẵn sàng.`);
  }
  notify('completed-'+s!.id,'Đã thực hiện '+s!.name+'. '+deriveNextAction(run,visit).title+'.');break;
 }
 case 'CONFIRM_RESULT':{
  requireGate(s,'Không có thủ tục phù hợp.');if(s!.resultStatus==='AVAILABLE'){changed=false;break;}
  requireGate(s!.executionStatus==='COMPLETED','Chưa hoàn tất thao tác thủ tục.');s!.resultStatus='AVAILABLE';s!.resultConfirmedAt=now;s!.result={title:`Kết quả ${s!.name}`,content:resultContent};
  notify(`result-${s!.id}`,`Đã có kết quả ${s!.name}. Bạn có thể xem trong ứng dụng.`);
  if(allResultsAvailable(visit))notify('all-results-ready',`Tất cả thủ tục đã có kết quả. ${visit.locationId===clinic.id&&!visit.outsideHospital?`Mời ngồi chờ ngoài ${clinicAddress(visit)}`:`Mời quay lại ${clinicAddress(visit)} và chờ ngoài phòng`}, sẵn sàng vào nghe chẩn đoán khi bác sĩ gọi.`);
  break;
 }
 case 'COLLECT_PAPER':requireGate(run.mode==='COLLECT_PAPER'&&s,'Chế độ này không nhận bản giấy kết quả.');if(s!.paperStatus==='COLLECTED'){changed=false;break;}requireGate(s!.resultStatus==='AVAILABLE','Chưa có kết quả tương ứng.');s!.paperStatus='COLLECTED';notify('paper-'+s!.id,'Đã nhận bản giấy '+s!.name+'.');break;
 case 'CONFIRM_LOCATION':{
  requireGate(visit.phase!=='COMPLETED','Lượt đã hoàn tất.');
  if(c.payload.outsideHospital){requireGate(run.mode==='RETURN_TO_DOCTOR'&&allPerformed(visit)&&visit.phase==='READY','Chỉ có thể rời viện khi đã làm xong các thủ tục và dùng kết quả điện tử.');visit.locationId=null;visit.outsideHospital=true;visit.presenceConfirmed=false;}
  else{requireGate(graph.locations.some(l=>l.id===c.payload.locationId),'Hãy chọn vị trí trên sơ đồ.');visit.locationId=c.payload.locationId!;visit.outsideHospital=false;}break;
 }
 case 'SET_TRANSPORT_MODE':
  requireGate(['lift','stairs'].includes(c.payload.transportMode||''),'Chọn thang máy hoặc thang bộ.');
  requireGate(visit.phase!=='COMPLETED','Lượt đã hoàn tất.');
  changed=(visit.transportMode??'lift')!==c.payload.transportMode;visit.transportMode=c.payload.transportMode!;break;
 case 'START_RETURN':requireGate(visit.phase==='READY','Chưa hoàn tất các thủ tục.');changed=false;break;
 case 'MARK_READY':
 case 'STAFF_MARK_READY':
 case 'WITHDRAW_READY':requireGate(false,'Danh sách sẵn sàng tự cập nhật khi hoàn tất đủ thủ tục, không cần xác nhận trên app.');break;
 case 'SET_PROCEDURE_QUEUE_METHOD':
  requireGate(c.payload.serviceId&&['PAPER_TRAY','TAKE_NUMBER'].includes(c.payload.queueMethod||''),'Chọn phòng và cách lấy lượt hợp lệ.');
  if(procedureQueueMethods(run)[c.payload.serviceId!]===c.payload.queueMethod){changed=false;break;}
  run.procedureQueueMethods={...procedureQueueMethods(run),[c.payload.serviceId!]:c.payload.queueMethod!};break;
 case 'COMPLETE_ENCOUNTER':if(visit.phase==='COMPLETED'){changed=false;break;}active();requireGate(encounter!.status==='IN_PROGRESS'&&encounter!.kind==='initial'&&visit.services.length===0,'Cần bắt đầu lượt trao đổi trước khi hoàn tất.');visit.phase='COMPLETED';run.encounterHistory.push({...encounter!,endedAt:now,outcome:'COMPLETED'});setEncounter(null);notify('visit-completed','Bác sĩ đã hoàn tất lượt khám của bạn.');break;
 case 'MARK_NOTIFICATION_READ':{const n=visit.inbox.find(n=>n.id===c.payload.notificationId);requireGate(n,'Thông báo không tồn tại.');changed=!n!.read;n!.read=true;break;}
 }
 return {changed,message:changed?'Đã xác nhận thao tác.':'Thao tác đã được ghi nhận trước đó.'};
}
export function makeSnapshot(run:SimulationRun,events:Snapshot['events']=[],ai:Snapshot['ai']={configured:false,model:null}):Snapshot {
 run=presentRun(run);
 events=events.map(event=>event.message==='Đã tạo lượt mô phỏng mới.'?{...event,message:'Đã tạo lượt mới.'}:event);
 const views=Object.fromEntries(run.visits.map(v=>{const nextAction=deriveNextAction(run,v);const options=[{type:'REGISTER' as const},...v.services.flatMap(s=>(['START_SERVICE','COMPLETE_SERVICE','CONFIRM_RESULT','COLLECT_PAPER'] as const).map(type=>({type,serviceId:s.id})))];return [v.visitId,{visit:v,nextAction,procedurePlan:planProcedures(run,v),route:deriveRoute(v,nextAction.destinationId),serviceRoutes:Object.fromEntries(v.services.map(s=>[s.id,deriveRoute(v,s.locationId)])) as Record<ServiceId,Route>,canReturn:canReturn(run,v),controlActions:options.map(o=>{try{const probe=applyCommand(structuredClone(run),{commandId:'probe',runId:run.runId,expectedRevision:run.revision,expectedJourneyVersion:v.journeyVersion??0,visitId:v.visitId,actor:'control',type:o.type,payload:{departmentId:'DEMO-INTERNAL',serviceId:'serviceId' in o?o.serviceId:undefined,presenceConfirmed:true,locationId:undefined}});return {...o,enabled:probe.changed,reason:probe.changed?undefined:'Thao tác đã được xác nhận.'};}catch(e){return {...o,enabled:false,reason:(e as Error).message};}})}];}));
 return {...run,generation:Number.isSafeInteger(run.generation)&&run.generation>=0?run.generation:0,updatedAt:events.at(-1)?.at??run.createdAt,facility:'Vinmec tại Vinhomes Ocean Park 2',synthetic:true,activeEncounters:activeEncounters(run),departmentCatalog,queues:deriveQueues(run),procedureQueues:deriveProcedureQueues(run),procedureQueueMethods:procedureQueueMethods(run),serviceCatalog,views,graph,events,ai};
}
