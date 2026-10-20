import { describe, expect, it } from 'vitest';
import { createRun } from '../../src/shared/fixtures';
import { applyCommand, canReturn, makeSnapshot } from '../../src/domain/engine';
import type { Actor, Command, CommandType, ServiceId, SimulationRun } from '../../src/shared/contracts';

const us:ServiceId='DEMO-US-ABD', blood:ServiceId='DEMO-BLOOD-BIOCHEM';
function act(run:SimulationRun,type:CommandType,actor:Actor,payload:Command['payload']={},visitId='DEMO-P01',now?:string){
 if(type==='REGISTER')payload={departmentId:'DEMO-INTERNAL',...payload};
 const result=applyCommand(run,{commandId:crypto.randomUUID(),runId:run.runId,expectedRevision:run.revision,type,actor,payload,visitId},now);if(result.changed)run.revision++;return result;
}
function assign(run:SimulationRun,serviceIds:ServiceId[],id='DEMO-P01',now?:string){
 act(run,'REGISTER','control',{},id);act(run,'CALL_INITIAL','doctor',{},id);act(run,'BEGIN_ENCOUNTER','doctor',{},id);act(run,'ASSIGN_SERVICES','doctor',{serviceIds},id,now);
}

describe('doctor orders and physical paper/ticket workflow',()=>{
 it('starts with no orders; reception guides to the first doctor with a connected route',()=>{
  const run=createRun();expect(run.visits.every(v=>!v.services.length)).toBe(true);expect(canReturn(run,run.visits[0])).toBe(false);
  act(run,'REGISTER','control');const s=makeSnapshot(run),view=s.views['DEMO-P01'];
  expect(view.nextAction.destinationId).toBe('DEMO-NOI');expect(view.route.nodeIds[0]).toBe('DEMO-RECEPTION');expect(view.route.nodeIds.at(-1)).toBe('DEMO-NOI');
  expect(view.visit.services).toEqual([]);expect(Object.values(s.procedureQueues).flat()).toEqual([]);
  expect(()=>act(run,'ASSIGN_SERVICES','doctor',{serviceIds:[us]})).toThrow();
 });
 it('exposes every ordered room immediately; confirmations update the route without arrival gates',()=>{
  const run=createRun();assign(run,[us,blood]);let s=makeSnapshot(run);
  expect(s.procedureQueues[us]).toEqual(['DEMO-P01']);expect(s.procedureQueues[blood]).toEqual(['DEMO-P01']);
  expect(s.views['DEMO-P01'].route.from).toBe('DEMO-NOI');
  act(run,'COMPLETE_SERVICE','procedure',{serviceId:us});s=makeSnapshot(run);
  expect(s.procedureQueues[us]).toEqual([]);expect(s.procedureQueues[blood]).toEqual(['DEMO-P01']);
  expect(s.views['DEMO-P01'].route).toMatchObject({from:'DEMO-SIEUAM',to:'DEMO-SINHHOA'});
  expect(act(run,'COMPLETE_SERVICE','procedure',{serviceId:us}).changed).toBe(false);
  act(run,'COMPLETE_SERVICE','procedure',{serviceId:blood});s=makeSnapshot(run);
  expect(s.procedureQueues[blood]).toEqual([]);expect(s.views['DEMO-P01'].nextAction.kind).toBe('RETURN');
 });
 for(const mode of ['RETURN_TO_DOCTOR','COLLECT_PAPER'] as const)for(const atClinic of [false,true])it(`${mode} notifies once when all results are ready, at clinic: ${atClinic}`,()=>{
  const run=createRun(mode);assign(run,[us,blood]);const visit=run.visits[0];
  act(run,'COMPLETE_SERVICE','procedure',{serviceId:us});
  act(run,'CONFIRM_RESULT','procedure',{serviceId:us});
  expect(visit.inbox.some(n=>n.id==='all-results-ready')).toBe(false);
  act(run,'COMPLETE_SERVICE','procedure',{serviceId:blood});
  if(atClinic)act(run,'CONFIRM_LOCATION','patient',{locationId:'DEMO-NOI'});
  expect(makeSnapshot(run).views[visit.visitId].nextAction.title).not.toContain('Sẵn sàng nghe chẩn đoán');
  act(run,'CONFIRM_RESULT','procedure',{serviceId:blood});
  const ready=makeSnapshot(run).views[visit.visitId].nextAction;
  expect(ready.kind).toBe(atClinic?'READY':'RETURN');
  expect(ready.description).toContain('Tất cả thủ tục đã có kết quả');
  expect(ready.description).toContain('khi bác sĩ gọi');
  expect(ready.description).toContain(atClinic?'ngồi chờ ngoài phòng':'quay lại phòng A201');
  expect(visit.inbox.filter(n=>n.id==='all-results-ready')).toEqual([expect.objectContaining({read:false,message:expect.stringContaining('khi bác sĩ gọi')})]);
  const before=structuredClone(visit.inbox);
  act(run,'CONFIRM_RESULT','procedure',{serviceId:blood});
  expect(visit.inbox).toEqual(before);
  if(!atClinic){act(run,'CONFIRM_LOCATION','patient',{locationId:'DEMO-NOI'});expect(makeSnapshot(run).views[visit.visitId].nextAction.title).toBe('Sẵn sàng nghe chẩn đoán');}
 });
 it('notifies for a single ordered procedure without treating completion as result publication',()=>{
  const run=createRun();assign(run,[blood]);act(run,'COMPLETE_SERVICE','procedure',{serviceId:blood});
  expect(run.visits[0].inbox.some(n=>n.id==='all-results-ready')).toBe(false);
  act(run,'CONFIRM_RESULT','procedure',{serviceId:blood});
  expect(run.visits[0].inbox.filter(n=>n.id==='all-results-ready')).toHaveLength(1);
 });
 it.each([{serviceIds:[blood] as ServiceId[]},{serviceIds:[blood,us] as ServiceId[]}])('respects a different selection and doctor order: $serviceIds',({serviceIds})=>{
  const run=createRun();assign(run,serviceIds);expect(run.visits[0].services.map(s=>s.id)).toEqual(serviceIds);
  expect(makeSnapshot(run).procedureQueues[blood]).toEqual(['DEMO-P01']);
  for(const id of serviceIds){act(run,'COMPLETE_SERVICE','procedure',{serviceId:id});act(run,'CONFIRM_RESULT','procedure',{serviceId:id});}
  expect(canReturn(run,run.visits[0])).toBe(true);
 });
 it('permits calling any assigned patient and performing rooms in physical paper order',()=>{
  const run=createRun();assign(run,[us,blood],'DEMO-P02');assign(run,[us,blood],'DEMO-P01');
  expect(makeSnapshot(run).procedureQueues[us]).toEqual(['DEMO-P01','DEMO-P02']);
  // Physical order can differ from roster order and suggested navigation order.
  act(run,'COMPLETE_SERVICE','procedure',{serviceId:blood},'DEMO-P02');
  expect(run.visits[1].services.find(s=>s.id===blood)!.executionStatus).toBe('COMPLETED');
  expect(makeSnapshot(run).views['DEMO-P02'].route).toMatchObject({from:'DEMO-SINHHOA',to:'DEMO-SIEUAM'});
  act(run,'COMPLETE_SERVICE','procedure',{serviceId:us},'DEMO-P02');
  expect(makeSnapshot(run).queues.review).toEqual(['DEMO-P02']);expect(run.visits[1].presenceConfirmed).toBe(false);
  act(run,'CONFIRM_RESULT','procedure',{serviceId:us},'DEMO-P02');
  expect(run.visits[1].services.find(s=>s.id===blood)!.resultStatus).toBe('WAITING');
 });
 it('keeps in-progress room and patient exclusivity, including one-click completion',()=>{
  const run=createRun();assign(run,[us,blood],'DEMO-P01');assign(run,[us,blood],'DEMO-P02');
  act(run,'START_SERVICE','procedure',{serviceId:us});
  expect(()=>act(run,'COMPLETE_SERVICE','procedure',{serviceId:us},'DEMO-P02')).toThrow(/Phòng đang/);
  expect(()=>act(run,'COMPLETE_SERVICE','procedure',{serviceId:blood})).toThrow(/phòng khác/);
  act(run,'COMPLETE_SERVICE','procedure',{serviceId:blood},'DEMO-P02');
  expect(run.visits[1].services.find(s=>s.id===blood)!.executionStatus).toBe('COMPLETED');
 });
 it('changes room entrance instructions without changing roster, route or result mode',()=>{
  const run=createRun('COLLECT_PAPER');assign(run,[us]);const before=makeSnapshot(run);
  expect(before.views['DEMO-P01'].nextAction.description).toContain('lên trên cùng');
  act(run,'SET_PROCEDURE_QUEUE_METHOD','control',{serviceId:us,queueMethod:'TAKE_NUMBER'});
  const after=makeSnapshot(run);expect(after.views['DEMO-P01'].nextAction.description).toContain('lấy số tại máy');
  expect(after.procedureQueues).toEqual(before.procedureQueues);expect(after.views['DEMO-P01'].route).toEqual(before.views['DEMO-P01'].route);
  expect(()=>act(run,'SET_PROCEDURE_QUEUE_METHOD','patient',{serviceId:us,queueMethod:'PAPER_TRAY'})).toThrow(/quyền/);
 });
 it('supports finishing an initial consultation without procedures; unselected rooms stay empty',()=>{
  const run=createRun();act(run,'REGISTER','control');act(run,'CALL_INITIAL','doctor');act(run,'BEGIN_ENCOUNTER','doctor');act(run,'COMPLETE_ENCOUNTER','doctor');
  expect(run.visits[0].phase).toBe('COMPLETED');expect(run.visits[0].services).toEqual([]);expect(Object.values(makeSnapshot(run).procedureQueues).flat()).toEqual([]);
 });
 it('rejects duplicate selections and procedures not ordered for this patient',()=>{
  const run=createRun();act(run,'REGISTER','control');act(run,'CALL_INITIAL','doctor');act(run,'BEGIN_ENCOUNTER','doctor');
  expect(()=>act(run,'ASSIGN_SERVICES','doctor',{serviceIds:[us,us]})).toThrow(/không trùng/);
  act(run,'ASSIGN_SERVICES','doctor',{serviceIds:[us]});
  expect(()=>act(run,'COMPLETE_SERVICE','procedure',{serviceId:blood})).toThrow();
  expect(()=>act(run,'COMPLETE_SERVICE','patient',{serviceId:us})).toThrow(/quyền/);
 });
});
