import { applyCommand } from '../../domain/engine';
import { createRun } from '../../shared/fixtures';
import type { Actor,CommandType } from '../../shared/contracts';
export function evaluationRun(stage:string){
 const run=createRun(stage==='PAPER_ONE'?'COLLECT_PAPER':'RETURN_TO_DOCTOR','ai-evaluation');
 const act=(type:CommandType,actor:Actor='control',payload:any={})=>{if(type==='REGISTER')payload={departmentId:'DEMO-INTERNAL',...payload};const result=applyCommand(run,{commandId:crypto.randomUUID(),runId:run.runId,expectedRevision:run.revision,visitId:'DEMO-P01',type,actor,payload});if(result.changed)run.revision++;};
 act('REGISTER');if(stage==='INITIAL')return run;
 act('CALL_INITIAL','doctor');act('BEGIN_ENCOUNTER','doctor');act('ASSIGN_DEMO_SERVICES','doctor');if(stage==='ASSIGNED')return run;
 act('START_SERVICE','control',{serviceId:'DEMO-US-ABD'});act('COMPLETE_SERVICE','control',{serviceId:'DEMO-US-ABD'});act('START_SERVICE','control',{serviceId:'DEMO-BLOOD-BIOCHEM'});
 if(stage==='ONE_RESULT'){act('CONFIRM_RESULT','control',{serviceId:'DEMO-US-ABD'});return run;}
 act('COMPLETE_SERVICE','control',{serviceId:'DEMO-BLOOD-BIOCHEM'});if(stage==='WAITING')return run;
 for(const serviceId of ['DEMO-US-ABD','DEMO-BLOOD-BIOCHEM'])act('CONFIRM_RESULT','control',{serviceId});
 if(stage==='PAPER_ONE'){act('COLLECT_PAPER','control',{serviceId:'DEMO-US-ABD'});return run;}
 if(stage==='OUTSIDE'){act('CONFIRM_LOCATION','patient',{outsideHospital:true});return run;}
 if(stage==='RETURNABLE')return run;
 act('CONFIRM_LOCATION','patient',{locationId:'DEMO-NOI'});return run;
}
