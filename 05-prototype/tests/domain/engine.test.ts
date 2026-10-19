import { describe,it,expect } from 'vitest';
import { createRun } from '../../src/shared/fixtures';
import { applyCommand,canReturn,deriveNextAction,deriveQueues,deriveRoute,makeSnapshot } from '../../src/domain/engine';
import type { Actor,CommandType,Mode,SimulationRun,ServiceId } from '../../src/shared/contracts';
export function command(run:SimulationRun,type:CommandType,actor:Actor='control',payload:any={},visitId='DEMO-P01') {if(type==='REGISTER')payload={departmentId:'DEMO-INTERNAL',...payload};const c={commandId:crypto.randomUUID(),runId:run.runId,expectedRevision:run.revision,type,actor,payload,visitId};const r=applyCommand(run,c);if(r.changed)run.revision++;return r;}
export function assign(run:SimulationRun,id='DEMO-P01',serviceIds:ServiceId[]=['DEMO-US-ABD','DEMO-BLOOD-BIOCHEM']){command(run,'REGISTER','control',{},id);command(run,'CALL_INITIAL','doctor',{},id);command(run,'BEGIN_ENCOUNTER','doctor',{},id);command(run,'ASSIGN_SERVICES','doctor',{serviceIds},id);}
export function perform(run:SimulationRun,id:ServiceId){command(run,'START_SERVICE','control',{serviceId:id});command(run,'COMPLETE_SERVICE','control',{serviceId:id});}
const ids:ServiceId[]=['DEMO-US-ABD','DEMO-BLOOD-BIOCHEM'];
describe('simulation invariants',()=>{
 it('administrative handoffs notify once across business retries',()=>{const run=createRun('COLLECT_PAPER');const v=run.visits[0];assign(run);expect(v.inbox.filter(n=>n.id==='registered')).toHaveLength(1);expect(v.inbox.filter(n=>n.id==='services-assigned')).toHaveLength(1);command(run,'REGISTER');command(run,'ASSIGN_DEMO_SERVICES','doctor');perform(run,ids[0]);command(run,'COMPLETE_SERVICE','control',{serviceId:ids[0]});perform(run,ids[1]);command(run,'CONFIRM_RESULT','control',{serviceId:ids[0]});command(run,'COLLECT_PAPER','control',{serviceId:ids[0]});command(run,'COLLECT_PAPER','control',{serviceId:ids[0]});expect(v.inbox.filter(n=>n.id.startsWith('completed-'))).toHaveLength(2);expect(v.inbox.filter(n=>n.id.startsWith('paper-'))).toHaveLength(1);expect(new Set(v.inbox.map(n=>n.id)).size).toBe(v.inbox.length);});
 for(const mode of ['RETURN_TO_DOCTOR','COLLECT_PAPER'] as Mode[])for(const order of [ids,[...ids].reverse()])it(`${mode} automatically returns after procedures, first ${order[0]}`,()=>{
  const run=createRun(mode);assign(run,'DEMO-P01',order);const v=run.visits[0];
  expect(run.activeEncounter).toBeNull();expect(deriveQueues(run)).toEqual({initial:[],review:[]});
  command(run,'START_SERVICE','control',{serviceId:order[0]});expect(()=>command(run,'START_SERVICE','control',{serviceId:order[1]})).toThrow();
  command(run,'COMPLETE_SERVICE','control',{serviceId:order[0]});expect(canReturn(run,v)).toBe(false);
  perform(run,order[1]);expect(v.phase).toBe('READY');expect(canReturn(run,v)).toBe(true);expect(deriveQueues(run).review).toEqual([v.visitId]);
  expect(v.services.every(s=>s.resultStatus==='WAITING')).toBe(true);expect(v.locationId).toBe(v.services.find(s=>s.id===order[1])!.locationId);
  expect(deriveNextAction(run,v).kind).toBe('RETURN');
  command(run,'CONFIRM_RESULT','control',{serviceId:order[1]});command(run,'CONFIRM_RESULT','control',{serviceId:order[0]});
  if(mode==='COLLECT_PAPER'){command(run,'COLLECT_PAPER','control',{serviceId:order[1]});command(run,'COLLECT_PAPER','control',{serviceId:order[0]});}
  command(run,'CONFIRM_LOCATION','patient',{locationId:'DEMO-NOI'});expect(deriveNextAction(run,v).kind).toBe('READY');
  for(const [type,actor] of [['MARK_READY','patient'],['STAFF_MARK_READY','control'],['WITHDRAW_READY','patient'],['CALL_REVIEW','doctor'],['COMPLETE_ENCOUNTER','doctor']] as [CommandType,Actor][])expect(()=>command(run,type,actor,{presenceConfirmed:true})).toThrow();
  expect(deriveQueues(run).review).toEqual([v.visitId]);
 });
 it('notifications, duplicate business operations and doctor selection stay stable',()=>{const run=createRun();assign(run);perform(run,ids[0]);command(run,'REGISTER','control',{},'DEMO-P02');command(run,'CALL_INITIAL','doctor',{},'DEMO-P02');const before=structuredClone(run.activeEncounter);command(run,'CONFIRM_RESULT','control',{serviceId:ids[0]});command(run,'CONFIRM_RESULT','control',{serviceId:ids[0]});expect(run.activeEncounter).toEqual(before);expect(run.visits[0].inbox.filter(n=>n.id.startsWith('result-'))).toHaveLength(1);expect(()=>command(run,'CALL_INITIAL','doctor',{},'DEMO-P03')).toThrow();});
 it('result papers can be delivered independently while other procedures remain',()=>{const run=createRun('COLLECT_PAPER');assign(run);perform(run,ids[0]);expect(()=>command(run,'COLLECT_PAPER','control',{serviceId:ids[0]})).toThrow();command(run,'CONFIRM_RESULT','control',{serviceId:ids[0]});command(run,'COLLECT_PAPER','control',{serviceId:ids[0]});expect(run.visits[0].services[0].paperStatus).toBe('COLLECTED');expect(deriveNextAction(run,run.visits[0]).kind).toBe('GO_SERVICE');expect(()=>command(run,'STAFF_MARK_READY','control',{presenceConfirmed:true})).toThrow();});
 it('routes include real graph connectors and floor transitions',()=>{const run=createRun();const v=run.visits[0];v.locationId='DEMO-NOI';const route=deriveRoute(v,'DEMO-SIEUAM');expect(route.nodeIds).toEqual(['DEMO-NOI','DEMO-HALL-NOI','DEMO-LIFT-2','DEMO-LIFT-1','DEMO-CONNECTOR-A','DEMO-CONNECTOR-B','DEMO-SIEUAM']);expect(route.instructions.join(' ')).toContain('tòa B');});
 it('control actions and patient permission are authoritative',()=>{const run=createRun();const view=makeSnapshot(run).views['DEMO-P01'];expect(view.controlActions.some(a=>a.type==='START_SERVICE')).toBe(false);expect(()=>command(run,'REGISTER','patient')).toThrow();});
});
