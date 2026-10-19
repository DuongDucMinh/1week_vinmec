import type { ProcedurePlanStep, ServiceId, SimulationRun, Visit } from '../shared/contracts';
import { routeDistance } from '../shared/routing';

/** Count physical waiting/active patients, not the roster of all future orders. */
export function peopleAtRoom(run: SimulationRun, locationId: string, excludeVisitId: string): number {
 return run.visits.filter(v=>v.visitId!==excludeVisitId&&!v.outsideHospital&&v.phase==='SERVICES'&&v.services.some(s=>
  s.locationId===locationId&&(s.executionStatus==='IN_PROGRESS'||s.executionStatus==='NOT_STARTED'&&v.locationId===locationId)
 )).length;
}

/** Keep the current trip stable; the remaining order is a live, provisional preview. */
export function planProcedures(run: SimulationRun, visit: Visit, retainDestination=true): ProcedurePlanStep[] {
 if(visit.phase!=='SERVICES')return [];
 const remaining=visit.services.filter(s=>s.executionStatus!=='COMPLETED');
 const active=remaining.find(s=>s.executionStatus==='IN_PROGRESS');
 const locked=active?.id??(retainDestination?visit.recommendedServiceId:null);
 const plan: ProcedurePlanStep[]=[];
 let from={...visit};
 while(remaining.length){
  const ranked=remaining.map(s=>({service:s,people:peopleAtRoom(run,s.locationId,visit.visitId),distance:routeDistance(from,s.locationId)}))
   .sort((a,b)=>a.people-b.people||a.distance-b.distance||visit.services.indexOf(a.service)-visit.services.indexOf(b.service));
  const next=plan.length===0&&locked?ranked.find(r=>r.service.id===locked)??ranked[0]:ranked[0];
  plan.push({serviceId:next.service.id,peopleAtRoom:next.people,distance:Number.isFinite(next.distance)?next.distance:null});
  remaining.splice(remaining.indexOf(next.service),1);
  from={...from,locationId:next.service.locationId,outsideHospital:false};
 }
 return plan;
}

/** Called only at a new decision point: assigned orders or a completed procedure. */
export function recommendNextService(run: SimulationRun, visit: Visit): ServiceId | null {
 const next=planProcedures(run,visit,false)[0]?.serviceId??null;
 visit.recommendedServiceId=next;
 return next;
}
