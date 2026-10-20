import type { Visit } from './contracts';

/** Stable demo patient identity, including visits saved before PID was introduced. */
export const patientPid = (visit: Pick<Visit, 'visitId' | 'patientId'>) =>
  visit.patientId || `PID-${visit.visitId.replace(/^DEMO-P/, '').padStart(3, '0')}`;
