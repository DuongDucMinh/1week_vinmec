import { afterEach,describe,it,expect } from 'vitest';
import { mkdtempSync,rmSync } from 'node:fs';import { tmpdir } from 'node:os';import { join } from 'node:path';
import { Repository } from '../../src/server/repository';
import { DatabaseSync } from 'node:sqlite';
import { makeSnapshot } from '../../src/domain/engine';
import type { Command } from '../../src/shared/contracts';
const dirs:string[]=[];afterEach(()=>{for(const dir of dirs.splice(0))rmSync(dir,{recursive:true,force:true});});
function c(repo:Repository,overrides:Partial<Command>={}):Command{const run=repo.read();return {commandId:crypto.randomUUID(),runId:run.runId,expectedRevision:run.revision,actor:'control',type:'REGISTER',visitId:'DEMO-P01',...overrides,payload:{...(overrides.type===undefined||overrides.type==='REGISTER'?{departmentId:'DEMO-INTERNAL' as const}:{}),...overrides.payload}};}
describe('SQLite atomic command receipts',()=>{
 it('reset generation is monotonic, persisted and unaffected by old receipt retries',()=>{
  const dir=mkdtempSync(join(tmpdir(),'vinmec-generation-'));dirs.push(dir);const path=join(dir,'state.sqlite');const r=new Repository(path);expect(r.read().generation).toBe(0);const receipts=[];
  for(let i=1;i<=3;i++){const old=r.read();const reset={commandId:`generation-reset-${i}`,expectedRunId:old.runId,expectedRevision:old.revision,mode:'RETURN_TO_DOCTOR' as const,seed:'generation',actor:'control' as const};r.reset(reset);receipts.push(reset);expect(r.read().generation).toBe(i);expect(makeSnapshot(r.read()).generation).toBe(i);}
  const latest=r.read();r.reset(receipts[0]);expect(r.read()).toEqual(latest);r.close();const restarted=new Repository(path);expect(restarted.read().generation).toBe(3);expect(restarted.reset(receipts[1]).duplicate).toBe(true);expect(restarted.read()).toEqual(latest);restarted.close();
 });
 it('legacy SQLite run missing generation normalizes to zero before the next durable reset',()=>{
  const dir=mkdtempSync(join(tmpdir(),'vinmec-legacy-'));dirs.push(dir);const path=join(dir,'state.sqlite');const r=new Repository(path);const legacy=r.read() as any;delete legacy.generation;r.close();
  const raw=new DatabaseSync(path);raw.prepare('UPDATE state SET json=? WHERE id=1').run(JSON.stringify(legacy));raw.close();
  const migrated=new Repository(path);expect(migrated.read().generation).toBe(0);expect(makeSnapshot(legacy).generation).toBe(0);const old=migrated.read();migrated.reset({commandId:'legacy-reset',expectedRunId:old.runId,expectedRevision:old.revision,mode:'COLLECT_PAPER',seed:'legacy',actor:'control'});expect(migrated.read().generation).toBe(1);migrated.close();
  const restarted=new Repository(path);expect(restarted.read().generation).toBe(1);restarted.close();
 });
 it('room entrance configuration survives restart and progress reset',()=>{
  const dir=mkdtempSync(join(tmpdir(),'vinmec-room-method-'));dirs.push(dir);const path=join(dir,'state.sqlite');const r=new Repository(path);
  r.command(c(r,{type:'SET_PROCEDURE_QUEUE_METHOD',payload:{serviceId:'DEMO-US-ABD',queueMethod:'TAKE_NUMBER'}}));const old=r.read();r.reset({commandId:'method-reset',expectedRunId:old.runId,expectedRevision:old.revision,mode:'COLLECT_PAPER',seed:'settings',actor:'control'});r.close();
  const restarted=new Repository(path);expect(makeSnapshot(restarted.read()).procedureQueueMethods).toMatchObject({'DEMO-US-ABD':'TAKE_NUMBER','DEMO-BLOOD-BIOCHEM':'PAPER_TRAY','DEMO-CT':'PAPER_TRAY'});expect(restarted.read().visits.every(v=>v.services.length===0)).toBe(true);restarted.close();
 });
 it('legacy visits with completed procedures become ready without fabricating arrival or results',()=>{
  const dir=mkdtempSync(join(tmpdir(),'vinmec-ready-migration-'));dirs.push(dir);const path=join(dir,'state.sqlite');const r=new Repository(path);
  for(const [type,actor,payload] of [['REGISTER','control',{}],['CALL_INITIAL','doctor',{}],['BEGIN_ENCOUNTER','doctor',{}],['ASSIGN_SERVICES','doctor',{serviceIds:['DEMO-US-ABD']}],['COMPLETE_SERVICE','procedure',{serviceId:'DEMO-US-ABD'}]] as [Command['type'],Command['actor'],Command['payload']][])r.command(c(r,{type,actor,payload}));
  const legacy=r.read();legacy.visits[0].phase='SERVICES';legacy.visits[0].readySource=null;r.close();const raw=new DatabaseSync(path);raw.prepare('UPDATE state SET json=? WHERE id=1').run(JSON.stringify(legacy));raw.close();
  const migrated=new Repository(path),s=makeSnapshot(migrated.read());expect(s.queues.review).toEqual(['DEMO-P01']);expect(s.visits[0].locationId).toBe('DEMO-SIEUAM');expect(s.visits[0].services[0].resultStatus).toBe('WAITING');expect(s.revision).toBe(legacy.revision);migrated.close();
 });
 it('a patient reset is durable, idempotent and rejects old journey operations after re-intake',()=>{
  const dir=mkdtempSync(join(tmpdir(),'vinmec-patient-reset-'));dirs.push(dir);const path=join(dir,'state.sqlite');const r=new Repository(path);
  const intake=c(r,{payload:{departmentId:'DEMO-CARDIOLOGY'},expectedJourneyVersion:0});r.command(intake);r.command(c(r,{visitId:'DEMO-P02'}));
  const other=r.read().visits[1];const reset=c(r,{type:'RESET_VISIT',expectedJourneyVersion:0});r.command(reset);r.command(c(r,{expectedJourneyVersion:1,payload:{departmentId:'DEMO-ENT'}}));const after=r.read();
  expect(r.command(reset).duplicate).toBe(true);expect(r.command(intake).duplicate).toBe(true);expect(r.read()).toEqual(after);expect(r.read().visits[1]).toEqual(other);
  expect(()=>r.command(c(r,{expectedJourneyVersion:0,type:'CALL_INITIAL',actor:'doctor'}))).toThrow(/reset/);r.close();
  const reopened=new Repository(path);expect(reopened.read().visits[0]).toMatchObject({journeyVersion:1,departmentId:'DEMO-ENT',phase:'WAITING_INITIAL'});reopened.close();
 });
 it('same ID retries after progress; different payload conflicts; stale writes reject',()=>{const r=new Repository();const first=c(r);r.command(first);r.command(c(r,{visitId:'DEMO-P02'}));expect(r.command(first).duplicate).toBe(true);expect(r.read().revision).toBe(2);expect(()=>r.command({...first,visitId:'DEMO-P03'})).toThrow('nội dung khác');expect(()=>r.command({...first,commandId:'stale'})).toThrow('thay đổi');const events=r.events();expect(events).toHaveLength(2);r.close();});
 it('business duplicates do not increment revision or duplicate queue',()=>{const r=new Repository();r.command(c(r));const rev=r.read().revision;expect(r.command(c(r)).duplicate).toBe(true);expect(r.read().revision).toBe(rev);expect(r.read().visits.filter(v=>v.phase==='WAITING_INITIAL')).toHaveLength(1);r.close();});
 it('reset receipt survives resetting and later progress; stale concurrent reset rejects',()=>{const r=new Repository();const old=r.read();const reset={commandId:'reset-1',expectedRunId:old.runId,expectedRevision:old.revision,mode:'COLLECT_PAPER' as const,seed:'different',actor:'control' as const};r.reset(reset);const newId=r.read().runId;r.command(c(r));r.reset(reset);expect(r.read().runId).toBe(newId);expect(r.read().revision).toBe(1);expect(()=>r.reset({...reset,commandId:'reset-2'})).toThrow('Lượt khám đã đổi.');expect(()=>r.command(c(r,{runId:old.runId}))).toThrow('đã đổi');r.close();});
 it('persists active encounter, paper, ready queue, inbox and receipts after restart',()=>{
  const dir=mkdtempSync(join(tmpdir(),'vinmec-demo-'));dirs.push(dir);const path=join(dir,'state.sqlite');const r=new Repository(path);const old=r.read();
  const reset={commandId:'persistent-reset',expectedRunId:old.runId,expectedRevision:old.revision,mode:'COLLECT_PAPER' as const,seed:'persistence',actor:'control' as const};r.reset(reset);
  const first=c(r);r.command(first);
  const act=(type:Command['type'],actor:Command['actor']='control',payload:Command['payload']={},visitId='DEMO-P01')=>r.command(c(r,{type,actor,payload,visitId}));
  for(const visitId of ['DEMO-P01','DEMO-P02']){
   if(visitId!=='DEMO-P01')act('REGISTER','control',{},visitId);
   act('CALL_INITIAL','doctor',{},visitId);act('BEGIN_ENCOUNTER','doctor',{},visitId);act('ASSIGN_DEMO_SERVICES','doctor',{},visitId);
   for(const serviceId of ['DEMO-US-ABD','DEMO-BLOOD-BIOCHEM'] as const){act('START_SERVICE','control',{serviceId},visitId);act('COMPLETE_SERVICE','control',{serviceId},visitId);act('CONFIRM_RESULT','control',{serviceId},visitId);}
   for(const serviceId of ['DEMO-US-ABD','DEMO-BLOOD-BIOCHEM'] as const)act('COLLECT_PAPER','control',{serviceId},visitId);

  }
  act('SET_PROCEDURE_QUEUE_METHOD','control',{serviceId:'DEMO-US-ABD',queueMethod:'TAKE_NUMBER'});act('REGISTER','control',{},'DEMO-P03');act('CALL_INITIAL','doctor',{},'DEMO-P03');act('BEGIN_ENCOUNTER','doctor',{},'DEMO-P03');const state=r.read();const eventCount=r.events().length;
  expect(state.activeEncounter?.status).toBe('IN_PROGRESS');expect(state.visits[1].phase).toBe('READY');expect(state.visits[0].services.every(s=>s.paperStatus==='COLLECTED')).toBe(true);expect(state.visits[0].inbox.length).toBeGreaterThan(2);
  r.close();const restarted=new Repository(path);expect(restarted.read()).toEqual(state);expect(restarted.command(first).duplicate).toBe(true);expect(restarted.reset(reset).duplicate).toBe(true);expect(restarted.read()).toEqual(state);expect(restarted.events()).toHaveLength(eventCount);restarted.close();
 });
});
