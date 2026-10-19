import { serviceIds } from './catalog-ids';
import type { ProcedureQueueMethod, ServiceId, SimulationRun } from './contracts';

export function procedureQueueMethods(run: Pick<SimulationRun, 'procedureQueueMethods'>): Record<ServiceId, ProcedureQueueMethod> {
  return { ...Object.fromEntries(serviceIds.map(id=>[id,'PAPER_TRAY'])), ...run.procedureQueueMethods } as Record<ServiceId, ProcedureQueueMethod>;
}
export function procedureArrivalInstruction(run: Pick<SimulationRun, 'procedureQueueMethods'>, serviceId: ServiceId): string {
  return procedureQueueMethods(run)[serviceId] === 'TAKE_NUMBER'
    ? 'Đến cửa phòng, lấy số tại máy và giữ giấy chỉ định. Chờ gọi theo số vừa lấy, không dùng số khám chuyên khoa ban đầu.'
    : 'Đến cửa phòng, đặt giấy chỉ định lên trên cùng của khay giấy bên ngoài. Ngồi chờ bác sĩ gọi theo thứ tự giấy.';
}
