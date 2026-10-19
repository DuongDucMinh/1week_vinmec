import type { Location, Actor, Command, CommandType, NextAction, Route, SimulationRun, Snapshot, Visit, ServiceId } from '../shared/contracts';
import { createService, departmentCatalog, graph, resultContent, serviceCatalog } from '../shared/fixtures';
import { procedureArrivalInstruction, procedureQueueMethods } from '../shared/procedure-arrival';
import { activeEncounters, clinicAddress, clinicForVisit, departmentForVisit } from '../shared/journey';
import { presentRun } from './presentation';
export class DomainError extends Error { constructor(public code: string, message: string) { super(message); } }
const requireGate = (yes: unknown, message: string) => { if (!yes) throw new DomainError('GATE_BLOCKED', message); };
const permissions: Record<Actor, readonly CommandType[]> = {
 patient:['CONFIRM_LOCATION','START_RETURN','MARK_READY','WITHDRAW_READY','MARK_NOTIFICATION_READ','RESET_VISIT'],
 doctor:['CALL_INITIAL','BEGIN_ENCOUNTER','ASSIGN_SERVICES','ASSIGN_DEMO_SERVICES','CALL_REVIEW','COMPLETE_ENCOUNTER'],
 procedure:['START_SERVICE','COMPLETE_SERVICE','CONFIRM_RESULT','COLLECT_PAPER'],
 control:['REGISTER','START_SERVICE','COMPLETE_SERVICE','CONFIRM_RESULT','COLLECT_PAPER','STAFF_MARK_READY','SET_PROCEDURE_QUEUE_METHOD','RESET_VISIT']
};
export const allPerformed = (v: Visit) => v.services.length>0 && v.services.every(s=>s.executionStatus==='COMPLETED');
export const canReturn = (_run: SimulationRun, v: Visit) => allPerformed(v);
export const currentService = (v: Visit) => v.phase==='SERVICES' ? v.services.find(s=>s.executionStatus!=='COMPLETED') : undefined;
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
 if(v.phase==='READY'||allPerformed(v))return v.locationId===clinic!.id&&!v.outsideHospital
  ?make('READY',`Đã quay lại phòng ${department!.shortName} ${clinic!.roomNumber}`,'Bạn đã hoàn tất các thủ tục. Mời ngồi chờ ngoài phòng. Luồng demo kết thúc tại đây.',clinic!.id)
  :make('RETURN',`Quay lại phòng ${department!.shortName} ${clinic!.roomNumber}`,`Bạn đã hoàn tất các thủ tục và được cập nhật vào danh sách sẵn sàng của bác sĩ. Mời quay lại ${address}.`,clinic!.id);
 const current=v.services.find(s=>s.executionStatus==='IN_PROGRESS');
 if(current)return make('IN_SERVICE',`Đang thực hiện ${current.name}`,'Theo hướng dẫn của bác sĩ tại phòng.',current.locationId,[],current.id);
 const next=v.services.find(s=>s.executionStatus==='NOT_STARTED');
 if(next)return make('GO_SERVICE',`Đến ${next.name}`,procedureArrivalInstruction(run,next.id),next.locationId,[],next.id);
 return make('WAIT_RESULTS','Theo dõi lượt khám','Kiểm tra hướng dẫn trong lượt khám.');
}
const placeLabel = (location: Location) => location.kind==='room'?`phòng ${location.name}`:location.name;
const lowerBuilding = (location: Location) => location.building.replace(/^Tòa/,'tòa');
function turnAt(before: Location | undefined, at: Location, after: Location): string {
 if(!before||before.buildingId!==at.buildingId||at.buildingId!==after.buildingId||before.floor!==at.floor||at.floor!==after.floor)return '';
 const cross=(at.x-before.x)*(after.y-at.y)-(at.y-before.y)*(after.x-at.x);
 return cross===0?'':cross>0?'Rẽ phải, ':'Rẽ trái, ';
}
function routeInstructions(path: Location[]): string[] {
 const origin=path[0];
 if(path.length===1)return [`Bạn đang ở ${placeLabel(origin)}.`];
 const instructions=[`Từ ${placeLabel(origin)}, tầng ${origin.floor}, ${lowerBuilding(origin)}.`];
 for(let i=1;i<path.length;i++){
  const previous=path[i-1],location=path[i],turn=turnAt(path[i-2],previous,location);
  if(location.floor!==previous.floor){
   let exit=location;
   while(exit.kind==='lift'&&path[i+1]?.kind==='lift'&&path[i+1].buildingId===exit.buildingId){exit=path[++i];}
   instructions.push(`Đi thang máy ${exit.floor>previous.floor?'lên':'xuống'} tầng ${exit.floor}.`);continue;
  }
  if(location.buildingId!==previous.buildingId){instructions.push(`Qua lối nối sang ${lowerBuilding(location)}.`);continue;}
  if(i===path.length-1){instructions.push(`${turn}${turn?'tới':'Tới'} ${placeLabel(location)}.`);continue;}
  if(location.kind==='lift'){instructions.push(`${turn}${turn?'ra':'Ra'} sảnh thang máy.`);continue;}
  if(location.id.includes('HALL')){
   if(previous.kind==='room')instructions.push('Ra hành lang.');
   else if(previous.kind==='lift')instructions.push(`Theo hành lang tới lối rẽ phòng ${graph.locations.find(room=>room.kind==='room'&&graph.edges.some(e=>e.from===location.id&&e.to===room.id||e.to===location.id&&e.from===room.id))?.roomNumber||''}.`);
   continue;
  }
  if(location.id==='DEMO-CONNECTOR-A'||location.id==='DEMO-CONNECTOR-B')instructions.push(previous.kind==='room'?'Ra lối nối tòa A.':'Theo hành lang tới lối nối.');
  else if(location.kind==='reception')instructions.push('Đi qua quầy tiếp nhận.');
 }
 return instructions;
}
export function deriveRoute(v: Visit,destination:string|null):Route {
 const base={from:v.outsideHospital?null:v.locationId,to:destination,nodeIds:[] as string[],instructions:[] as string[],requiresStartConfirmation:v.outsideHospital||!v.locationId};
 if(!destination)return {...base,instructions:['Theo dõi thông báo để biết bước tiếp theo.']};
 if(base.requiresStartConfirmation)return {...base,instructions:['Chọn vị trí xuất phát khi bạn trở lại viện.']};
 const distances=new Map(graph.locations.map(l=>[l.id,Infinity])); const previous=new Map<string,string>(); const unvisited=new Set(distances.keys());distances.set(v.locationId!,0);
 while(unvisited.size){const cur=[...unvisited].sort((a,b)=>distances.get(a)!-distances.get(b)!)[0];unvisited.delete(cur);if(cur===destination)break;for(const edge of graph.edges){const next=edge.from===cur?edge.to:edge.to===cur?edge.from:null;if(next&&unvisited.has(next)&&distances.get(cur)!+edge.weight<distances.get(next)!){distances.set(next,distances.get(cur)!+edge.weight);previous.set(next,cur);}}}
 const path=[destination];while(path[0]!==v.locationId&&previous.has(path[0]))path.unshift(previous.get(path[0])!);
 if(path[0]!==v.locationId||!graph.locations.some(l=>l.id===destination))return {...base,instructions:['Chưa tìm thấy đường đi. Hãy hỏi quầy tiếp nhận.']};
 return {...base,nodeIds:path,instructions:routeInstructions(path.map(id=>graph.locations.find(l=>l.id===id)!))};
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
  Object.assign(visit,{journeyVersion:(visit.journeyVersion??0)+1,departmentId:null,queueNumber:null,phase:'UNREGISTERED',services:[],locationId:'DEMO-RECEPTION',outsideHospital:false,returning:false,presenceConfirmed:false,readySource:null,inbox:[]});
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
  visit.services=ids!.map(id=>createService(id,run.mode));for(const service of visit.services){service.enqueuedAt=now;service.enqueuedRevision=run.revision+1;}visit.phase='SERVICES';visit.locationId=clinic.id;
  run.encounterHistory.push({...encounter!,endedAt:now,outcome:'ASSIGNED'});setEncounter(null);
  notify('services-assigned',`Bác sĩ đã chỉ định: ${visit.services.map(s=>s.name).join(', ')}. Mời đến ${visit.services[0].name} trước.`);break;
 }
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
  s!.executionStatus='COMPLETED';s!.resultStatus='WAITING';
  if(allPerformed(visit)){
   visit.phase='READY';visit.readySource='system';visit.returning=true;
   notify('can-return',`Đã hoàn tất tất cả thủ tục. Mời quay lại ${clinicAddress(visit)}. Bác sĩ đã thấy bạn trong danh sách sẵn sàng.`);
  }
  notify('completed-'+s!.id,'Đã thực hiện '+s!.name+'. '+deriveNextAction(run,visit).title+'.');break;
 }
 case 'CONFIRM_RESULT':requireGate(s,'Không có thủ tục phù hợp.');if(s!.resultStatus==='AVAILABLE'){changed=false;break;}requireGate(s!.executionStatus==='COMPLETED','Chưa hoàn tất thao tác thủ tục.');s!.resultStatus='AVAILABLE';s!.resultConfirmedAt=now;s!.result={title:`Kết quả ${s!.name}`,content:resultContent};notify(`result-${s!.id}`,`Đã có kết quả ${s!.name}. Bạn có thể xem trong ứng dụng.`);break;
 case 'COLLECT_PAPER':requireGate(run.mode==='COLLECT_PAPER'&&s,'Chế độ này không nhận bản giấy kết quả.');if(s!.paperStatus==='COLLECTED'){changed=false;break;}requireGate(s!.resultStatus==='AVAILABLE','Chưa có kết quả tương ứng.');s!.paperStatus='COLLECTED';notify('paper-'+s!.id,'Đã nhận bản giấy '+s!.name+'.');break;
 case 'CONFIRM_LOCATION':{
  requireGate(visit.phase!=='COMPLETED','Lượt đã hoàn tất.');
  if(c.payload.outsideHospital){requireGate(run.mode==='RETURN_TO_DOCTOR'&&allPerformed(visit)&&visit.phase==='READY','Chỉ có thể rời viện khi đã làm xong các thủ tục và dùng kết quả điện tử.');visit.locationId=null;visit.outsideHospital=true;visit.presenceConfirmed=false;}
  else{requireGate(graph.locations.some(l=>l.id===c.payload.locationId),'Hãy chọn vị trí trên sơ đồ.');visit.locationId=c.payload.locationId!;visit.outsideHospital=false;}break;
 }
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
 const views=Object.fromEntries(run.visits.map(v=>{const nextAction=deriveNextAction(run,v);const options=[{type:'REGISTER' as const},...v.services.flatMap(s=>(['START_SERVICE','COMPLETE_SERVICE','CONFIRM_RESULT','COLLECT_PAPER'] as const).map(type=>({type,serviceId:s.id})))];return [v.visitId,{visit:v,nextAction,route:deriveRoute(v,nextAction.destinationId),serviceRoutes:Object.fromEntries(v.services.map(s=>[s.id,deriveRoute(v,s.locationId)])) as Record<ServiceId,Route>,canReturn:canReturn(run,v),controlActions:options.map(o=>{try{const probe=applyCommand(structuredClone(run),{commandId:'probe',runId:run.runId,expectedRevision:run.revision,expectedJourneyVersion:v.journeyVersion??0,visitId:v.visitId,actor:'control',type:o.type,payload:{departmentId:'DEMO-INTERNAL',serviceId:'serviceId' in o?o.serviceId:undefined,presenceConfirmed:true,locationId:undefined}});return {...o,enabled:probe.changed,reason:probe.changed?undefined:'Thao tác đã được xác nhận.'};}catch(e){return {...o,enabled:false,reason:(e as Error).message};}})}];}));
 return {...run,generation:Number.isSafeInteger(run.generation)&&run.generation>=0?run.generation:0,updatedAt:events.at(-1)?.at??run.createdAt,facility:'Vinmec tại Vinhomes Ocean Park 2',synthetic:true,activeEncounters:activeEncounters(run),departmentCatalog,queues:deriveQueues(run),procedureQueues:deriveProcedureQueues(run),procedureQueueMethods:procedureQueueMethods(run),serviceCatalog,views,graph,events,ai};
}
