import { describe,it,expect } from 'vitest';
import { answerAssistant,buildFacts,ResponsesProvider,type AiProvider } from '../../src/server/ai/assistant';
import { createRun } from '../../src/shared/fixtures';
import type { AssistantRequest } from '../../src/shared/contracts';
import { evaluationRun } from '../../src/server/ai/evaluation';
import { AI_CLIENT_TIMEOUT_MS,AI_PROVIDER_TIMEOUT_MS } from '../../src/shared/timeouts';
function context(){const run=createRun();const request:AssistantRequest={runId:run.runId,expectedRevision:run.revision,visitId:run.visits[0].visitId,question:'Giờ tôi làm gì?'};return {run,request};}
describe('AI administrative facts (mock provider transport, not live model)',()=>{
 for(const stage of ['RETURNABLE','READY'] as const)for(const intent of ['RETURN','READINESS','RESULTS'] as const)it(`${intent} facts reflect ${stage} without asking for app readiness`,async()=>{
  const run=evaluationRun(stage);
  const factId=intent==='RETURN'?'return':intent==='READINESS'?'readiness':'results';
  const answer=await answerAssistant({runId:run.runId,expectedRevision:run.revision,visitId:'DEMO-P01',question:'Trạng thái hiện tại?'},()=>run,{configured:true,model:'mock-phase-facts',select:async()=>({intent,factIds:[factId]})});
  expect(answer.source).toBe('LIVE');expect(answer.answer).toContain(stage==='READY'?'khi bác sĩ gọi':'Quay lại');
  expect(answer.answer).not.toContain('tự xác nhận có mặt');expect(answer.answer).not.toContain('Chỉ xác nhận sẵn sàng');
 });
 it('paper facts explain physical queue independently of app or result mode',()=>{const run=evaluationRun('ASSIGNED');const paper=buildFacts(run,'DEMO-P01').find(f=>f.id==='paper')!.text;expect(paper).toContain('lên trên cùng');expect(paper).toContain('kể cả khi dùng app');});
 it('client timeout leaves a response margin after the provider deadline',()=>{expect(AI_CLIENT_TIMEOUT_MS-AI_PROVIDER_TIMEOUT_MS).toBeGreaterThanOrEqual(5000);});
 it('labels missing credential fallback explicitly, never claims live',async()=>{const {run,request}=context();const answer=await answerAssistant(request,()=>run,new ResponsesProvider(''));expect(answer.source).toBe('FALLBACK');expect(answer.reason).toBe('NOT_CONFIGURED');});
 it('only renders current facts selected by valid schema, clinical history excluded',async()=>{const {run,request}=context();const facts=buildFacts(run,request.visitId);expect(JSON.stringify(facts)).not.toContain('Lịch sử tự tạo');const provider:AiProvider={configured:true,model:'mock',select:async()=>({intent:'PAPER',factIds:['paper']})};const answer=await answerAssistant(request,()=>run,provider);expect(answer.source).toBe('LIVE');expect(answer.answer).toContain('Chưa có chỉ định');});
 it('rejects unknown fact or wrong intent applicability into fallback',async()=>{for(const factIds of [['invented'],['paper'],[]]){const {run,request}=context();const answer=await answerAssistant(request,()=>run,{configured:true,model:'mock',select:async()=>({intent:'RETURN',factIds})});expect(answer.source).toBe('FALLBACK');}});
 it('rejects revision changes or reset during model request',async()=>{for(const reset of [false,true]){let {run,request}=context();const provider:AiProvider={configured:true,model:'mock',select:async()=>{run=reset?createRun():{...run,revision:run.revision+1};return {intent:'NEXT_ACTION',factIds:['next']};}};await expect(answerAssistant(request,()=>run,provider)).rejects.toMatchObject({code:'STALE_CONTEXT'});}});
 it('rejects stale incoming context without calling provider',async()=>{const {run,request}=context();await expect(answerAssistant({...request,expectedRevision:9},()=>run,{configured:true,model:'mock',select:async()=>{throw Error('should not run');}})).rejects.toMatchObject({code:'STALE_CONTEXT'});});
 it('Responses uses strict schema and handles refusal, incomplete and transport error',async()=>{
  const {run,request}=context();let sent:any;const transport:typeof fetch=async(_input,init)=>{sent=JSON.parse(String(init?.body));return Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify({intent:'NEXT_ACTION',factIds:['next']})}]}]});};
  const answer=await answerAssistant(request,()=>run,new ResponsesProvider('fake-transport-key','mock-model',transport));expect(answer.source).toBe('LIVE');expect(sent.text.format.strict).toBe(true);expect(sent.store).toBe(false);expect(JSON.stringify(sent)).not.toContain('Lịch sử tự tạo');
  for(const body of [{status:'incomplete'},{status:'completed',output:[{content:[{type:'refusal'}]}]}]){const a=await answerAssistant(request,()=>run,new ResponsesProvider('fake','mock',async()=>Response.json(body)));expect(a.source).toBe('FALLBACK');}
 });
});
