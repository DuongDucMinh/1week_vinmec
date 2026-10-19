import type { Actor, Visit } from '../shared/contracts';
import type { SimulationApi } from './api';

export function ResetJourney({visit,api,actor='control'}:{visit:Visit;api:SimulationApi;actor?:Actor}) {
 return <button className="text-button reset-journey" aria-label={`Reset hành trình của ${visit.displayName}`} disabled={api.pending||!api.connected||api.uncertain} onClick={()=>api.command('RESET_VISIT',visit.visitId,actor)}>Reset hành trình</button>;
}
