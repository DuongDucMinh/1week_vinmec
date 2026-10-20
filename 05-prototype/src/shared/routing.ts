import type { Location, Route, Visit } from './contracts';
import { graph } from './fixtures';

const placeLabel = (location: Location) => location.kind==='room'?`phòng ${location.name}`:location.name;
const lowerBuilding = (location: Location) => location.building.replace(/^Tòa/,'tòa');
function turnAt(before: Location | undefined, at: Location, after: Location): string {
 if(!before||before.buildingId!==at.buildingId||at.buildingId!==after.buildingId||before.floor!==at.floor||at.floor!==after.floor)return '';
 const cross=(at.x-before.x)*(after.y-at.y)-(at.y-before.y)*(after.x-at.x);
 return cross===0?'':cross>0?'Rẽ phải, ':'Rẽ trái, ';
}
function routeInstructions(path: Location[]): string[] {
 const origin=path[0];
 if(path.length===1)return [`Bạn đang ở ${placeLabel(origin)}.`];
 const instructions=[`Từ ${placeLabel(origin)}, tầng ${origin.floor}, ${lowerBuilding(origin)}.`];
 for(let i=1;i<path.length;i++){
  const previous=path[i-1],location=path[i],turn=turnAt(path[i-2],previous,location);
  if(location.floor!==previous.floor){
   let exit=location;
   while(path[i+1]?.kind===location.kind&&path[i+1].buildingId===exit.buildingId&&path[i+1].floor!==exit.floor){exit=path[++i];}
   instructions.push(`Đi ${location.kind==='stairs'?'thang bộ':'thang máy'} ${exit.floor>previous.floor?'lên':'xuống'} tầng ${exit.floor}.`);continue;
  }
  if(location.buildingId!==previous.buildingId){instructions.push(`Qua lối nối sang ${lowerBuilding(location)}.`);continue;}
  if(i===path.length-1){instructions.push(`${turn}${turn?'tới':'Tới'} ${placeLabel(location)}.`);continue;}
  if(location.kind==='stairs'){instructions.push(`${turn}${turn?'tới':'Tới'} cầu thang bộ.`);continue;}
  if(location.kind==='lift'){instructions.push(`${turn}${turn?'ra':'Ra'} sảnh thang máy.`);continue;}
  if(location.id.includes('HALL')){
   if(previous.kind==='room')instructions.push('Ra hành lang.');
   else if(previous.kind==='lift'||previous.kind==='stairs')instructions.push(`Theo hành lang tới lối rẽ phòng ${graph.locations.find(room=>room.kind==='room'&&graph.edges.some(e=>e.from===location.id&&e.to===room.id||e.to===location.id&&e.from===room.id))?.roomNumber||''}.`);
   continue;
  }
  if(location.id==='DEMO-CONNECTOR-A'||location.id==='DEMO-CONNECTOR-B')instructions.push(previous.kind==='room'?'Ra lối nối tòa A.':'Theo hành lang tới lối nối.');
  else if(location.kind==='reception')instructions.push('Đi qua quầy tiếp nhận.');
 }
 return instructions;
}
export function deriveRoute(v: Visit,destination:string|null):Route {
 const base={from:v.outsideHospital?null:v.locationId,to:destination,nodeIds:[] as string[],instructions:[] as string[],requiresStartConfirmation:v.outsideHospital||!v.locationId};
 if(!destination)return {...base,instructions:['Theo dõi thông báo để biết bước tiếp theo.']};
 if(base.requiresStartConfirmation)return {...base,instructions:['Chọn vị trí xuất phát khi bạn trở lại viện.']};
 const distances=new Map(graph.locations.map(l=>[l.id,Infinity])); const previous=new Map<string,string>(); const unvisited=new Set(distances.keys());distances.set(v.locationId!,0);
 while(unvisited.size){const cur=[...unvisited].sort((a,b)=>distances.get(a)!-distances.get(b)!)[0];unvisited.delete(cur);if(cur===destination)break;for(const edge of graph.edges){
  const a=graph.locations.find(l=>l.id===edge.from)!,b=graph.locations.find(l=>l.id===edge.to)!;
  const unusedTransport=(v.transportMode??'lift')==='lift'?'stairs':'lift';
  if([a,b].some(point=>point.kind===unusedTransport&&point.id!==v.locationId&&point.id!==destination))continue;
  if(a.floor!==b.floor && (a.kind!==(v.transportMode??'lift')||b.kind!==(v.transportMode??'lift')))continue;
  const next=edge.from===cur?edge.to:edge.to===cur?edge.from:null;if(next&&unvisited.has(next)&&distances.get(cur)!+edge.weight<distances.get(next)!){distances.set(next,distances.get(cur)!+edge.weight);previous.set(next,cur);}}}
 const path=[destination];while(path[0]!==v.locationId&&previous.has(path[0]))path.unshift(previous.get(path[0])!);
 if(path[0]!==v.locationId||!graph.locations.some(l=>l.id===destination))return {...base,instructions:['Chưa tìm thấy đường đi. Hãy hỏi quầy tiếp nhận.']};
 return {...base,nodeIds:path,instructions:routeInstructions(path.map(id=>graph.locations.find(l=>l.id===id)!))};
}

/** Weighted graph length, not metres or a waiting-time estimate. */
export function routeDistance(visit: Visit, destination: string): number {
 const route=deriveRoute(visit,destination);
 if(!route.nodeIds.length)return Infinity;
 return route.nodeIds.slice(1).reduce((sum,id,index)=>sum+graph.edges.find(e=>e.from===route.nodeIds[index]&&e.to===id||e.to===route.nodeIds[index]&&e.from===id)!.weight,0);
}
