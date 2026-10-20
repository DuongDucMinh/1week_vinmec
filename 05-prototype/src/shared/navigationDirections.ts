import type { Location } from './contracts';

const transportName = (point: Location) => point.kind === 'stairs' ? 'cầu thang bộ' : 'thang máy';
const placeName = (point: Location) => point.roomNumber ? `phòng ${point.roomNumber}` : point.name.toLocaleLowerCase('vi-VN');

/**
 * The demo floor plans have one horizontal corridor, with room doors above it.
 * Match GuidedFloor's door/corridor geometry, including B105's schematic door.
 * A lift/stair landing has no stored door bearing: explicitly face the room row
 * before giving a left/right instruction, rather than assuming an exit bearing.
 */
export function navigationDetail(from: Location, to: Location, floorPoints: Location[], kind: 'floor' | 'building' | 'destination'): string {
  const firstHorizontal = floorPoints.find(point => point.x !== from.x);
  const walkingDirection = firstHorizontal ? Math.sign(firstHorizontal.x - from.x) : 0;
  const last = floorPoints.at(-1)!;
  const previousHorizontal = [...floorPoints].reverse().find(point => point.x !== last.x);
  const arrivalDirection = previousHorizontal ? Math.sign(last.x - previousHorizontal.x) : 0;
  const walking = floorPoints.length > 1;
  let start = '';
  if (walking) {
    if (from.kind === 'room') {
      start = `Từ cửa ${placeName(from)}, đi ra hành lang${walkingDirection ? ` rồi rẽ ${walkingDirection > 0 ? 'trái' : 'phải'}` : ''}. `;
    } else if (from.kind === 'lift' || from.kind === 'stairs') {
      start = `Ra khỏi ${transportName(from)}${walkingDirection ? `, quay mặt về phía dãy phòng rồi rẽ ${walkingDirection > 0 ? 'phải' : 'trái'}` : ''}. `;
    } else if (from.kind === 'reception' || from.kind === 'entrance') {
      start = `Từ ${placeName(from)}, `;
    } else if (!from.id.includes('HALL')) {
      start = 'Từ lối nối, ';
    }
  }
  let finish: string;
  if (kind === 'floor') {
    const direction = to.floor > from.floor ? 'lên' : 'xuống';
    const board = to.kind === 'stairs' ? `${direction} tầng ${to.floor}` : `vào thang và ${direction} tầng ${to.floor}`;
    finish = walking
      ? `Đi dọc hành lang tới ${transportName(to)}, ${board}.`
      : to.kind === 'stairs' ? `Đi cầu thang bộ ${direction} tầng ${to.floor}.` : `Vào thang máy và ${direction} tầng ${to.floor}.`;
  } else if (kind === 'building') {
    finish = `Đi dọc hành lang tới lối nối, rồi sang Tòa ${to.buildingId}, tầng ${to.floor}.`;
  } else if (to.kind === 'room') {
    finish = arrivalDirection
      ? `Đi dọc hành lang tới ${placeName(to)} ở bên ${arrivalDirection > 0 ? 'trái' : 'phải'}.`
      : `Đi thẳng tới ${placeName(to)}.`;
  } else {
    finish = `Đi dọc hành lang tới ${to.kind === 'lift' || to.kind === 'stairs' ? transportName(to) : placeName(to)}.`;
  }
  // A comma joins a location cue to the action in the same sentence.
  return start.endsWith(', ') ? start + finish[0].toLocaleLowerCase('vi-VN') + finish.slice(1) : start + finish;
}
