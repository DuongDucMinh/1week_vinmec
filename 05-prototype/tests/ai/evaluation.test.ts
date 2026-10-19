import { describe,it,expect } from 'vitest';
import cases from '../../data/ai-evaluation-cases.json';
import { evaluationRun } from '../../src/server/ai/evaluation';
import { answerAssistant,buildFacts } from '../../src/server/ai/assistant';
import type { AiIntent } from '../../src/shared/contracts';
describe('24 AI case fixtures: renderer/applicability only, no live NLU claim',()=>{
 for(const test of cases)it(`${test.id}: ${test.stage} — ${test.question}`,async()=>{const run=evaluationRun(test.stage);const facts=buildFacts(run,'DEMO-P01');expect(test.allowedFactIds.every(id=>facts.some(f=>f.id===id&&f.intents.includes(test.expectedIntent as AiIntent)))).toBe(true);const answer=await answerAssistant({runId:run.runId,expectedRevision:run.revision,visitId:'DEMO-P01',question:test.question},()=>run,{configured:true,model:'mock-selection-fixture',select:async()=>({intent:test.expectedIntent as AiIntent,factIds:[test.allowedFactIds[0]]})});expect(answer.intent).toBe(test.expectedIntent);expect(answer.answer).toBe(facts.find(f=>f.id===test.allowedFactIds[0])!.text);});
});
