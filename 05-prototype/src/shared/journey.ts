import type { DepartmentId, Encounter, SimulationRun, Visit } from './contracts';
import { departmentCatalog, graph } from './fixtures';

// Registered legacy visits belonged to Internal Medicine. New visits have no assignment before intake.
export const departmentForVisit=(visit:Visit)=>visit.phase==='UNREGISTERED'?null:departmentCatalog.find(d=>d.id===(visit.departmentId||'DEMO-INTERNAL'))!;
export const clinicForVisit=(visit:Visit)=>graph.locations.find(l=>l.id===departmentForVisit(visit)?.locationId);
export const clinicAddress=(visit:Visit)=>{const room=clinicForVisit(visit);return room?`phòng ${room.name}, tầng ${room.floor}, ${room.building.replace(/^Tòa/,'tòa')}`:'phòng khám được lễ tân chỉ định';};
export function activeEncounters(run:Pick<SimulationRun,'activeEncounter'|'activeEncounters'|'visits'>):Partial<Record<DepartmentId,Encounter>> {
 const entries={...run.activeEncounters};
 if(run.activeEncounter){const visit=run.visits.find(v=>v.visitId===run.activeEncounter!.visitId);if(visit)entries[departmentForVisit(visit)?.id||'DEMO-INTERNAL']=run.activeEncounter;}
 return entries;
}
