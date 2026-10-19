import { DatabaseSync } from 'node:sqlite';
import { createHash, randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type { Command, DomainEvent, ResetCommand, SimulationRun } from '../shared/contracts';
import { procedureQueueMethods } from '../shared/procedure-arrival';
import { createRun } from '../shared/fixtures';
import { allPerformed, applyCommand, DomainError } from '../domain/engine';
export class RepositoryError extends DomainError {}
const canonical=(v:unknown):string=>v&&typeof v==='object'?(Array.isArray(v)?`[${v.map(canonical).join(',')}]`:`{${Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>JSON.stringify(k)+':'+canonical(x)).join(',')}}`):JSON.stringify(v);
const hash=(v:unknown)=>createHash('sha256').update(canonical(v)).digest('hex');
export class Repository {
 private db:DatabaseSync;
 constructor(path=':memory:'){
  if(path!==':memory:')mkdirSync(dirname(path),{recursive:true});this.db=new DatabaseSync(path);
  this.db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=3000; CREATE TABLE IF NOT EXISTS state (id INTEGER PRIMARY KEY CHECK(id=1), json TEXT NOT NULL); CREATE TABLE IF NOT EXISTS receipts (command_id TEXT PRIMARY KEY, hash TEXT NOT NULL, run_id TEXT NOT NULL, revision INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, run_id TEXT NOT NULL, json TEXT NOT NULL);');
  if(!this.db.prepare('SELECT id FROM state WHERE id=1').get())this.db.prepare('INSERT INTO state(id,json) VALUES(1,?)').run(JSON.stringify(createRun()));
 }
 read():SimulationRun{const run=JSON.parse((this.db.prepare('SELECT json FROM state WHERE id=1').get() as {json:string}).json) as SimulationRun;run.generation=Number.isSafeInteger(run.generation)&&run.generation>=0?run.generation:0;for(const visit of run.visits){
  visit.journeyVersion??=0;visit.departmentId??=visit.phase==='UNREGISTERED'?null:'DEMO-INTERNAL';visit.queueNumber??=null;
  // Old demos pre-created orders before consultation. Only remove untouched placeholders.
  if(['UNREGISTERED','WAITING_INITIAL','INITIAL_ENCOUNTER'].includes(visit.phase)&&visit.services.every(s=>s.executionStatus==='NOT_STARTED'&&s.resultStatus==='NOT_AVAILABLE'))visit.services=[];
  if(visit.phase==='SERVICES'&&allPerformed(visit)){visit.phase='READY';visit.readySource='system';visit.returning=true;}
 }return run;}
 events():DomainEvent[]{const run=this.read();return (this.db.prepare('SELECT json FROM events WHERE run_id=? ORDER BY id DESC LIMIT 100').all(run.runId) as {json:string}[]).reverse().map(r=>JSON.parse(r.json));}
 private transact<T>(fn:()=>T):T{this.db.exec('BEGIN IMMEDIATE');try{const result=fn();this.db.exec('COMMIT');return result;}catch(e){this.db.exec('ROLLBACK');throw e;}}
 private duplicate(id:string,request:unknown){const receipt=this.db.prepare('SELECT hash FROM receipts WHERE command_id=?').get(id) as {hash:string}|undefined;if(receipt&&receipt.hash!==hash(request))throw new RepositoryError('COMMAND_ID_REUSED','Mã thao tác đã dùng cho nội dung khác.');return Boolean(receipt);}
 private save(run:SimulationRun,id:string,request:unknown,type:string,visitId:string|null,message:string){
  const event:DomainEvent={id:randomUUID(),runId:run.runId,revision:run.revision,type,visitId,at:new Date().toISOString(),message};
  this.db.prepare('UPDATE state SET json=? WHERE id=1').run(JSON.stringify(run));this.db.prepare('INSERT INTO receipts(command_id,hash,run_id,revision) VALUES(?,?,?,?)').run(id,hash(request),run.runId,run.revision);this.db.prepare('INSERT INTO events(run_id,json) VALUES(?,?)').run(run.runId,JSON.stringify(event));
 }
 command(c:Command){return this.transact(()=>{if(this.duplicate(c.commandId,c))return {duplicate:true,changed:false};const run=this.read();if(c.runId!==run.runId)throw new RepositoryError('STALE_RUN','Lượt khám đã đổi. Hãy đồng bộ lại.');if(c.expectedRevision!==run.revision)throw new RepositoryError('STALE_REVISION','Tiến độ đã thay đổi. Hãy kiểm tra trạng thái mới.');const result=applyCommand(run,c);if(result.changed)run.revision++;this.save(run,c.commandId,c,c.type,c.visitId,result.message);return {duplicate:!result.changed,changed:result.changed};});}
 reset(c:ResetCommand){return this.transact(()=>{if(this.duplicate(c.commandId,c))return {duplicate:true,changed:false};const old=this.read();if(c.expectedRunId!==old.runId)throw new RepositoryError('STALE_RUN','Lượt khám đã đổi. Hãy tải lại trước khi tạo lượt mới.');if(c.expectedRevision!==old.revision)throw new RepositoryError('STALE_REVISION','Tiến độ đã thay đổi. Hãy kiểm tra trước khi tạo lượt mới.');const run=createRun(c.mode,c.seed);run.generation=old.generation+1;run.procedureQueueMethods=procedureQueueMethods(old);this.save(run,c.commandId,c,'RESET',null,'Đã tạo lượt mới.');return {duplicate:false,changed:true};});}
 close(){this.db.close();}
}
