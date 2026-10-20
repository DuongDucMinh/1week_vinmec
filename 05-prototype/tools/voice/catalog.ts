import { graph, createRun, departmentCatalog, serviceCatalog } from '../../src/shared/fixtures';
import { deriveRoute } from '../../src/shared/routing';
import { navigationSpeech, normalizeSpeechText } from '../../src/shared/navigationSpeech';
import { procedureArrivalInstruction } from '../../src/shared/procedure-arrival';
import type { DepartmentId, ServiceId, TransportMode } from '../../src/shared/contracts';
import { speechId } from '../../src/server/speechKey';

export { speechId };
export const scenarios: { id: string; departmentId: DepartmentId; services: ServiceId[] }[] = [
  { id: 'tim-mach', departmentId: 'DEMO-CARDIOLOGY', services: ['DEMO-BLOOD-BIOCHEM', 'DEMO-ECG'] },
  { id: 'noi', departmentId: 'DEMO-INTERNAL', services: ['DEMO-BLOOD-BIOCHEM', 'DEMO-URINE', 'DEMO-US-ABD'] },
];
export function permutations<T>(values: T[]): T[][] {
  return values.length ? values.flatMap((value, index) => permutations(values.filter((_, i) => i !== index)).map(rest => [value, ...rest])) : [[]];
}

export function buildCatalog() {
  const entries = new Map<string, { id: string; text: string; aliases: string[]; categories: string[] }>();
  const add = (raw: string, category: string) => {
    const text = normalizeSpeechText(raw), id = speechId(text);
    let entry = entries.get(id);
    if (!entry) { entry = { id, text, aliases: [], categories: [] }; entries.set(id, entry); }
    if (!entry.aliases.includes(raw)) entry.aliases.push(raw);
    if (!entry.categories.includes(category)) entry.categories.push(category);
    return id;
  };
  const base = createRun().visits[0];
  const journeys = scenarios.flatMap(scenario => {
    const clinic = departmentCatalog.find(item => item.id === scenario.departmentId)!;
    return permutations(scenario.services).map((order, index) => {
      const services = order.map(id => serviceCatalog.find(item => item.id === id)!);
      const stops = ['DEMO-RECEPTION', clinic.locationId, ...services.map(service => service.locationId), clinic.locationId];
      const legs = stops.slice(1).map((to, legIndex) => ({ from: stops[legIndex], to }));
      const announcements = [
        add(`Mời bạn đến ${clinic.name}, phòng ${graph.locations.find(point => point.id === clinic.locationId)!.roomNumber}.`, 'journey'),
        ...services.map((service, serviceIndex) => add(`${serviceIndex ? `Bạn đã hoàn tất ${services[serviceIndex - 1].name}. ` : ''}Tiếp theo, mời bạn đến phòng ${graph.locations.find(point => point.id === service.locationId)!.roomNumber} để ${service.name.toLocaleLowerCase('vi-VN')}.`, 'journey')),
        add(`Bạn đã hoàn tất các thủ tục được chỉ định. Mời bạn quay lại ${clinic.name}, phòng ${graph.locations.find(point => point.id === clinic.locationId)!.roomNumber}.`, 'journey'),
      ];
      return { id: `${scenario.id}-${index + 1}`, departmentId: clinic.id, department: clinic.name, order, serviceNames: services.map(service => service.name), stops, legs, announcements, transportCombinations: 2 ** legs.length };
    });
  });
  // The patient UI can select every clinic/procedure, not only the two sample journeys.
  const destinations = [...new Set(['DEMO-RECEPTION', 'DEMO-ENTRANCE', ...departmentCatalog.map(item=>item.locationId), ...serviceCatalog.map(item=>item.locationId)])];
  // Every actual graph position is covered, including return/back, route changes, and resuming midway.
  // Landmarks drawn only for visual context are not positions in the routing graph.
  const routes = [];
  for (const origin of graph.locations) for (const to of destinations) for (const transportMode of ['lift', 'stairs'] as TransportMode[]) {
    const route = deriveRoute({ ...base, locationId: origin.id, transportMode }, to);
    if (!route.nodeIds.length) throw new Error(`Không có đường: ${origin.id} -> ${to} (${transportMode})`);
    // Rerouting updates the description; voice reads that description without an extra announcement.
    const speech = navigationSpeech(graph, route);
    routes.push({ from: origin.id, to, transportMode, normal: add(speech, 'navigation'), rerouted: add(speech, 'reroute') });
  }
  for (const destination of destinations) {
    const room = graph.locations.find(point => point.id === destination)!;
    add(room.roomNumber ? `Bạn đã đến phòng ${room.roomNumber}, ${room.name.split(' · ').at(-1)}.` : `Bạn đã đến ${room.name.toLocaleLowerCase('vi-VN')}.`, 'arrival');
  }
  for (const scenario of scenarios) {
    const clinic = departmentCatalog.find(item => item.id === scenario.departmentId)!;
    const room = graph.locations.find(point => point.id === clinic.locationId)!;
    add(`Bạn đã đến ${clinic.name}, phòng ${room.roomNumber}. Mời bạn ngồi chờ ngoài phòng. Bác sĩ sẽ gọi bạn.`, 'waiting');
    for (const id of scenario.services) {
      const service = serviceCatalog.find(item => item.id === id)!;
      add(`Bạn đã hoàn tất ${service.name}. Kết quả sẽ được cập nhật khi phòng thủ tục công bố.`, 'results');
      add(`Đã có kết quả ${service.name}. Bạn có thể xem trong mục kết quả.`, 'results');
      for (const method of ['PAPER_TRAY', 'TAKE_NUMBER'] as const) add(procedureArrivalInstruction({ procedureQueueMethods: { [id]: method } }, id), 'queue');
    }
  }
  add('Chọn mốc hiện tại để bắt đầu.', 'navigation');
  add('Chưa tìm thấy đường đi. Mời bạn hỏi nhân viên tiếp nhận.', 'help');
  add('Bạn đã hoàn tất hướng dẫn của lượt khám. Cảm ơn bạn.', 'help');
  const phrases = [...entries.values()].sort((a, b) => a.id.localeCompare(b.id));
  return {
    version: 1, model: 'k2-fsa/OmniVoice', language: 'vi', voice: 'Nhật Phong',
    assumptions: ['Xét nghiệm máu của khoa Nội dùng thủ tục sinh hóa máu DEMO-BLOOD-BIOCHEM hiện có tại A205.', 'Đồ thị và phòng lấy từ dữ liệu mô phỏng của ứng dụng; không phải sơ đồ viện thực tế.', 'Chỉ có hướng dẫn di chuyển / hành chính; không thêm hướng dẫn chuẩn bị hoặc diễn giải y khoa.'],
    stats: { journeys: journeys.length, mixedTransportCombinations: journeys.reduce((sum, journey) => sum + journey.transportCombinations, 0), origins: graph.locations.length, destinations: destinations.length, routeCases: routes.length, uniquePhrases: phrases.length },
    journeys, routes, phrases,
  };
}
