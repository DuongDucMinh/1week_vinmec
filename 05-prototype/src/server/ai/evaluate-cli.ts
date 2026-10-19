import { existsSync,mkdirSync,writeFileSync } from 'node:fs';
import cases from '../../../data/ai-evaluation-cases.json';
import { evaluationRun } from './evaluation';
import { answerAssistant,PROMPT_VERSION,ResponsesProvider } from './assistant';
if(existsSync('.env'))process.loadEnvFile('.env');
const provider=new ResponsesProvider();
const results=[];
for(const test of cases){const run=evaluationRun(test.stage);const answer=await answerAssistant({runId:run.runId,expectedRevision:run.revision,visitId:'DEMO-P01',question:test.question,previousIntent:'previousIntent' in test?test.previousIntent:undefined},()=>run,provider);results.push({id:test.id,question:test.question,stage:test.stage,expectedIntent:test.expectedIntent,source:answer.source,intent:answer.intent,factIds:answer.factIds,answer:answer.answer,result:answer.source==='LIVE'?(answer.intent===test.expectedIntent&&answer.factIds.every(id=>test.allowedFactIds.includes(id))?'PASS':'FAIL'):'NOT_LIVE',reason:answer.reason});}
mkdirSync('.prototype-runtime',{recursive:true});const path=`.prototype-runtime/ai-evaluation-${Date.now()}.json`;writeFileSync(path,JSON.stringify({timestamp:new Date().toISOString(),promptVersion:PROMPT_VERSION,model:provider.model,configured:provider.configured,live:results.some(r=>r.source==='LIVE'),results},null,2));
console.log(`AI evaluation: ${results.filter(r=>r.result==='PASS').length} pass, ${results.filter(r=>r.result==='FAIL').length} fail, ${results.filter(r=>r.result==='NOT_LIVE').length} not live. Report: ${path}`);if(results.some(r=>r.result==='FAIL'))process.exitCode=1;
