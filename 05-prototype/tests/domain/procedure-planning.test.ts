import { describe, expect, it } from 'vitest';
import { applyCommand, deriveRoute, makeSnapshot } from '../../src/domain/engine';
import { peopleAtRoom } from '../../src/domain/procedure-planning';
import { createRun, createService, graph } from '../../src/shared/fixtures';
import { commandSchema, type Command, type ServiceId, type SimulationRun } from '../../src/shared/contracts';

const blood:ServiceId='DEMO-BLOOD-BIOCHEM', us:ServiceId='DEMO-US-ABD', urine:ServiceId='DEMO-URINE';
function send(run:SimulationRun,type:Command['type'],actor:Command['actor'],payload:Command['payload']={},visitId='DEMO-P01'){
 return applyCommand(run,{commandId:crypto.randomUUID(),runId:run.runId,expectedRevision:run.revision,expectedJourneyVersion:run.visits.find(v=>v.visitId===visitId)?.journeyVersion??0,type,actor,payload,visitId});
}
function assign(run:SimulationRun,serviceIds:ServiceId[]){
 send(run,'REGISTER','control',{departmentId:'DEMO-INTERNAL'});send(run,'CALL_INITIAL','doctor');send(run,'BEGIN_ENCOUNTER','doctor');send(run,'ASSIGN_SERVICES','doctor',{serviceIds});
}
function waiting(run:SimulationRun,index:number,id:ServiceId){
 const v=run.visits[index],s=createService(id,run.mode);Object.assign(v,{phase:'SERVICES',services:[s],locationId:s.locationId});return s;
}
const view=(run:SimulationRun)=>makeSnapshot(run).views['DEMO-P01'];

describe('adaptive procedure guidance',()=>{
 it('chooses the least occupied room and changes A → B → C to A → C → B after A',()=>{
  const run=createRun();waiting(run,1,us);const other=waiting(run,2,urine);assign(run,[us,urine,blood]);
  expect(view(run).procedurePlan.map(p=>p.serviceId)).toEqual([blood,us,urine]);
  other.executionStatus='COMPLETED';run.visits[2].phase='READY';
  expect(view(run).nextAction.serviceId).toBe(blood); // Stable while travelling.
  send(run,'COMPLETE_SERVICE','procedure',{serviceId:blood});
  expect(view(run).procedurePlan.map(p=>p.serviceId)).toEqual([urine,us]);
  expect(view(run).route).toMatchObject({from:'DEMO-SINHHOA',to:'DEMO-NUOCTIEU'});
  expect(run.visits[0].services.map(s=>s.id)).toEqual([us,urine,blood]);
 });
 it('breaks equal occupancy by actual route distance, ahead of doctor list order',()=>{
  const run=createRun();assign(run,[us,urine,blood]);expect(view(run).nextAction.serviceId).toBe(blood);
  expect(view(run).procedurePlan[0]).toMatchObject({peopleAtRoom:0,distance:2});
 });
 it('counts waiting and active patients, excludes self, completed and future orders elsewhere',()=>{
  const run=createRun();const active=waiting(run,1,blood);active.executionStatus='IN_PROGRESS';
  waiting(run,2,blood);run.visits[2].locationId='DEMO-NOI';assign(run,[blood,us]);
  expect(view(run).nextAction.serviceId).toBe(us);
  expect(peopleAtRoom(run,'DEMO-SINHHOA','DEMO-P01')).toBe(1);
  send(run,'CONFIRM_LOCATION','patient',{locationId:'DEMO-SIEUAM'});
  expect(view(run).procedurePlan[0].peopleAtRoom).toBe(0);
  active.executionStatus='COMPLETED';expect(peopleAtRoom(run,'DEMO-SINHHOA','DEMO-P01')).toBe(0);
 });
 it('pins an in-progress procedure, allows physical room order, then replans from that room',()=>{
  const run=createRun();assign(run,[us,blood,urine]);send(run,'START_SERVICE','procedure',{serviceId:us});
  expect(view(run).nextAction).toMatchObject({kind:'IN_SERVICE',serviceId:us});
  expect(view(run).procedurePlan[0].serviceId).toBe(us);
  send(run,'COMPLETE_SERVICE','procedure',{serviceId:us});expect(view(run).nextAction.serviceId).toBe(blood);
  send(run,'COMPLETE_SERVICE','procedure',{serviceId:blood});send(run,'COMPLETE_SERVICE','procedure',{serviceId:urine});
  expect(view(run).procedurePlan).toEqual([]);expect(view(run).nextAction.kind).toBe('RETURN');
 });
 it('lets staff count paper patients at the room without app confirmation',()=>{
  const run=createRun();waiting(run,1,blood);run.visits[1].locationId='DEMO-NOI';assign(run,[us,blood]);
  send(run,'CHECK_IN_SERVICE','procedure',{serviceId:blood},'DEMO-P02');
  expect(peopleAtRoom(run,'DEMO-SINHHOA','DEMO-P01')).toBe(1);
  expect(send(run,'CHECK_IN_SERVICE','procedure',{serviceId:blood},'DEMO-P02').changed).toBe(false);
  expect(()=>send(run,'CHECK_IN_SERVICE','patient',{serviceId:blood})).toThrow(/quyền/);
 });
 it('keeps equal count/distance ties deterministic using doctor order',()=>{
  const run=createRun();run.visits[0].phase='SERVICES';run.visits[0].locationId='DEMO-LIFT-2';
  run.visits[0].services=[createService(blood,run.mode),{...createService(us,run.mode),locationId:'DEMO-NOI'}];
  expect(view(run).procedurePlan[0].serviceId).toBe(blood);
 });
});

describe('lift and staircase routes',()=>{
 it.each([['DEMO-RECEPTION','DEMO-DIENTIM'],['DEMO-DIENTIM','DEMO-SIEUAM'],['DEMO-SIEUAM','DEMO-DADAY']])('uses only selected vertical edges from %s to %s', (from,to)=>{
  for(const transportMode of ['lift','stairs'] as const){
   const v={...createRun().visits[0],locationId:from,transportMode};const route=deriveRoute(v,to);
   expect(route.nodeIds[0]).toBe(from);expect(route.nodeIds.at(-1)).toBe(to);
   const vertical=route.nodeIds.slice(1).flatMap((id,i)=>{const a=graph.locations.find(l=>l.id===route.nodeIds[i])!,b=graph.locations.find(l=>l.id===id)!;return a.floor===b.floor?[]:[[a,b]];});
   expect(vertical.length).toBeGreaterThan(0);
   for(const [a,b] of vertical){expect(a.kind).toBe(transportMode);expect(b.kind).toBe(transportMode);expect(Math.abs(a.floor-b.floor)).toBe(1);}
   expect(route.instructions.join(' ')).toContain(transportMode==='stairs'?'Đi thang bộ':'Đi thang máy');
   expect(route.instructions.join(' ')).not.toContain(transportMode==='stairs'?'Đi thang máy':'Đi thang bộ');
  }
 });
 it('defaults to lift, persists patient choice across snapshots, resets to lift and validates permissions',()=>{
  const run=createRun();assign(run,[us,blood]);const before=view(run);
  expect(before.serviceRoutes[us]!.nodeIds).toContain('DEMO-LIFT-1');
  send(run,'SET_TRANSPORT_MODE','patient',{transportMode:'stairs'});
  expect(view(run).visit.transportMode).toBe('stairs');expect(view(run).nextAction).toEqual(before.nextAction);
  expect(view(run).serviceRoutes[us]!.nodeIds).toContain('DEMO-A-STAIRS-1');
  expect(()=>send(run,'SET_TRANSPORT_MODE','doctor',{transportMode:'lift'})).toThrow(/quyền/);
  expect(()=>send(run,'SET_TRANSPORT_MODE','patient',{})).toThrow(/Chọn thang/);
  expect(commandSchema.safeParse({commandId:'bad',runId:run.runId,expectedRevision:0,type:'SET_TRANSPORT_MODE',actor:'patient',visitId:'DEMO-P01',payload:{transportMode:'escalator'}}).success).toBe(false);
  send(run,'RESET_VISIT','patient');expect(run.visits[0]).toMatchObject({transportMode:'lift',recommendedServiceId:null,services:[]});
 });
});
