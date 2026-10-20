import type {Location,MapGraph,Route} from '../shared/contracts';
import {navigationDetail} from '../shared/navigationDirections';

export interface NavigationStep {
 from:Location;to:Location;kind:'floor'|'building'|'destination';
 instruction:string;detail:string;action:string;
 leg:{buildingId:string;floor:number;points:Location[]};
}

/** Keep corridor geometry, but ask for confirmation only at useful destinations. */
export function navigationSteps(graph:MapGraph,route:Route):NavigationStep[]{
 const path=route.nodeIds.map(id=>graph.locations.find(point=>point.id===id)).filter((point):point is Location=>!!point);
 if(path.length<2)return [];
 const stops:{index:number;kind:NavigationStep['kind']}[]=[];
 for(let index=1;index<path.length;index++){
  const before=path[index-1],point=path[index];
  if(point.buildingId!==before.buildingId){stops.push({index,kind:'building'});continue;}
  if(point.floor!==before.floor){
   while(path[index+1]?.kind===point.kind&&path[index+1].buildingId===point.buildingId&&path[index+1].floor!==path[index].floor)index++;
   stops.push({index,kind:'floor'});
  }
 }
 if(stops.at(-1)?.index!==path.length-1)stops.push({index:path.length-1,kind:'destination'});
 let start=0;
 return stops.map(stop=>{
  const points=path.slice(start,stop.index+1),from=points[0],to=points.at(-1)!;
  start=stop.index;
  const floorPoints:Location[]=[];
  for(const point of points){if(point.buildingId!==from.buildingId||point.floor!==from.floor)break;floorPoints.push(point);}
  const transport=to.kind==='stairs'?'thang bộ':'thang máy';
  const direction=to.floor>from.floor?'lên':'xuống';
  const instruction=stop.kind==='floor'?`Đi ${transport} ${direction} tầng ${to.floor}`:stop.kind==='building'?`Sang Tòa ${to.buildingId}`:`Đến ${to.roomNumber?`phòng ${to.roomNumber}`:to.name.toLocaleLowerCase('vi-VN')}`;
  const detail=navigationDetail(from,to,floorPoints,stop.kind);
  const action=stop.kind==='floor'?`Đã tới tầng ${to.floor}`:stop.kind==='building'?`Đã sang Tòa ${to.buildingId}`:`Tôi đã đến ${to.roomNumber?`phòng ${to.roomNumber}`:to.name}`;
  return {from,to,kind:stop.kind,instruction,detail,action,leg:{buildingId:from.buildingId,floor:from.floor,points:floorPoints}};
 });
}
