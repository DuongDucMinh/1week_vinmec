import { describe, expect, it } from 'vitest';
import { applyCommand, makeSnapshot } from '../../src/domain/engine';
import { createRun, resultContent, resultEtaLabel } from '../../src/shared/fixtures';
import type { Actor, CommandType, ServiceId, SimulationRun } from '../../src/shared/contracts';

function command(run:SimulationRun,type:CommandType,actor:Actor='control',payload:{serviceId?:ServiceId;departmentId?:'DEMO-INTERNAL'}={}){
 if(type==='REGISTER')payload={departmentId:'DEMO-INTERNAL',...payload};
 const result=applyCommand(run,{commandId:crypto.randomUUID(),runId:run.runId,expectedRevision:run.revision,visitId:'DEMO-P01',type,actor,payload});
 if(result.changed)run.revision++;
}
function assign(run:SimulationRun){command(run,'REGISTER');command(run,'CALL_INITIAL','doctor');command(run,'BEGIN_ENCOUNTER','doctor');command(run,'ASSIGN_DEMO_SERVICES','doctor');}
function perform(run:SimulationRun,serviceId:ServiceId){command(run,'START_SERVICE','control',{serviceId});command(run,'COMPLETE_SERVICE','control',{serviceId});}

describe('product copy and existing-run presentation',()=>{
 it('normal result content is administrative and current product copy is concise',()=>{
  const run=createRun();assign(run);
  for(const service of run.visits[0].services){perform(run,service.id);command(run,'CONFIRM_RESULT','control',{serviceId:service.id});}
  const view=makeSnapshot(run).views['DEMO-P01'];
  for(const service of view.visit.services){expect(service.result!.title).toBe(`Kết quả ${service.name}`);expect(service.result!.content).toBe(resultContent);}
  const copy=[view.nextAction.title,view.nextAction.description,...view.route.instructions,...view.visit.inbox.map(n=>n.message),...view.visit.services.flatMap(s=>[s.resultEtaLabel,s.result!.title,s.result!.content])].join(' ');
  expect(copy).not.toMatch(/mô phỏng|kịch bản|demo|giả:|chỉ số|mg\/dL/i);
  expect(view.visit.history).toEqual([]);
 });

 it('updates only recognized old fixture copy without resetting progress or mutating storage',()=>{
  const run=createRun();assign(run);perform(run,'DEMO-US-ABD');command(run,'CONFIRM_RESULT','control',{serviceId:'DEMO-US-ABD'});
  const visit=run.visits[0],service=visit.services[0];
  visit.displayName='Người bệnh giả A';
  visit.history=[{date:'2026-09-01',content:'Lịch sử tự tạo cho demo: lần khám trước, không có dữ liệu lâm sàng thật.'},{date:'2026-09-02',content:'Ghi chú mô phỏng theo yêu cầu'}];
  service.resultEtaLabel='Dự kiến 30 phút sau thủ tục (giá trị kịch bản, không tự công bố kết quả)';
  service.result={title:`Kết quả giả: ${service.name}`,content:'Đây là dữ liệu mô phỏng cho Người bệnh giả A. Không phải kết quả xét nghiệm hoặc chẩn đoán thật. Trao đổi với bác sĩ trong kịch bản.'};
  visit.inbox[0].message='Quầy đã xác nhận tiếp nhận. Mời đến ngoài phòng Nội mô phỏng, tòa A tầng 2, chờ bác sĩ gọi.';visit.inbox[0].read=true;
  visit.inbox.push({id:'legacy-ready',message:'Đã đủ kết quả. Mời quay lại phòng A201 · Nội và xác nhận sẵn sàng.',createdAt:run.createdAt,read:false});
  const before=structuredClone(run),snapshot=makeSnapshot(run),presented=snapshot.visits[0];
  expect(run).toEqual(before);
  expect([snapshot.runId,snapshot.generation,snapshot.revision,snapshot.mode,snapshot.activeEncounter,snapshot.encounterHistory]).toEqual([run.runId,run.generation,run.revision,run.mode,run.activeEncounter,run.encounterHistory]);
  expect(presented.displayName).toBe('Nguyễn Minh Anh');expect(presented.history).toEqual([{date:'2026-09-02',content:'Ghi chú mô phỏng theo yêu cầu'}]);
  expect(presented.services[0]).toEqual({...service,resultEtaLabel,result:{title:`Kết quả ${service.name}`,content:resultContent}});
  expect(presented.inbox[0]).toEqual({...visit.inbox[0],message:'Đã tiếp nhận. Mời đến phòng A201 · Nội, tầng 2, tòa A và chờ gọi.'});
  expect(presented.inbox.at(-1)!.message).toContain('Bạn đã có trong danh sách sẵn sàng');expect(presented.inbox.at(-1)!.message).not.toContain('xác nhận sẵn sàng');
  expect(presented.phase).toBe(visit.phase);expect(presented.locationId).toBe(visit.locationId);
  expect(snapshot.views[visit.visitId].visit).toBe(presented);
 });

 it('preserves custom names, result content and unknown notifications verbatim',()=>{
  const run=createRun();assign(run);const visit=run.visits[0];visit.displayName='Tên riêng';
  visit.services[0].result={title:'Tài liệu riêng',content:'Nội dung mô phỏng do người dùng ghi'};
  visit.inbox.push({id:'custom',message:'Thông báo mô phỏng riêng',createdAt:run.createdAt,read:false});
  expect(makeSnapshot(run).visits[0]).toEqual(visit);
 });
});
