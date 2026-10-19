import { describe, expect, it } from 'vitest';
import { deriveRoute } from '../../src/domain/engine';
import { createRun, graph } from '../../src/shared/fixtures';

const keyIds=['DEMO-ENTRANCE','DEMO-RECEPTION','DEMO-NOI','DEMO-SINHHOA','DEMO-SIEUAM'];
// Original weighted distances are retained when hallway legs split room edges.
const costs=[[0,1,5,5,5],[1,0,4,4,4],[5,4,0,2,6],[5,4,2,0,6],[5,4,6,6,0]];
const location=(id:string)=>graph.locations.find(l=>l.id===id)!;

describe('campus and floor route consistency',()=>{
 it.each([['DEMO-RECEPTION','DEMO-TIMMACH','lên tầng 3'],['DEMO-RECEPTION','DEMO-DIENTIM','lên tầng 6'],['DEMO-DIENTIM','DEMO-RECEPTION','xuống tầng 1']])('combines continuous lift travel from %s to %s', (from,to,direction)=>{
  const route=deriveRoute({...createRun().visits[0],locationId:from},to);
  expect(route.instructions.filter(step=>step.includes('Đi thang máy'))).toEqual([`Đi thang máy ${direction}.`]);
 });
 for(const [fromIndex,from] of keyIds.entries())for(const [toIndex,to] of keyIds.entries()){
  if(from===to)continue;
  it(`${from} → ${to}: connected shortest route and usable directions`,()=>{
   const visit=createRun().visits[0];visit.locationId=from;
   const route=deriveRoute(visit,to),origin=location(from),destination=location(to);
   expect(route.requiresStartConfirmation).toBe(false);
   expect(route.nodeIds[0]).toBe(from);expect(route.nodeIds.at(-1)).toBe(to);
   const edges=route.nodeIds.slice(1).map((id,i)=>graph.edges.find(e=>(e.from===route.nodeIds[i]&&e.to===id)||(e.to===route.nodeIds[i]&&e.from===id)));
   expect(edges.every(Boolean)).toBe(true);
   expect(edges.reduce((sum,edge)=>sum+edge!.weight,0)).toBe(costs[fromIndex][toIndex]);
   expect(route.instructions[0]).toContain(origin.name);
   expect(route.instructions.at(-1)).toContain(destination.name);
   const text=route.instructions.join(' ');
   if(origin.floor<destination.floor){expect(text).toContain(`lên tầng ${destination.floor}`);expect(text).not.toContain('xuống tầng');}
   else if(origin.floor>destination.floor){expect(text).toContain(`xuống tầng ${destination.floor}`);expect(text).not.toContain('lên tầng');}
   else expect(text).not.toMatch(/lên tầng|xuống tầng/);
   if(origin.buildingId!==destination.buildingId)expect(text).toContain(`Qua lối nối sang tòa ${destination.buildingId}.`);
   else expect(text).not.toContain('Qua lối nối');
   expect(new Set(route.instructions).size).toBe(route.instructions.length);
   expect(route.instructions.every(step=>step.length<=110)).toBe(true);
   expect(text).not.toMatch(/mô phỏng|demo|Mốc:|Đi tới.*Đi tới/i);
  });
 }

 it('every floor-plan edge is orthogonal and lift positions align across floors',()=>{
  for(const edge of graph.edges){
   const from=location(edge.from),to=location(edge.to);
   if(from.buildingId!==to.buildingId){expect(from.floor).toBe(to.floor);continue;}
   if(from.floor!==to.floor){expect(['lift','stairs']).toContain(from.kind);expect(to.kind).toBe(from.kind);expect([from.x,from.y]).toEqual([to.x,to.y]);}
   else {
    expect(from.x===to.x||from.y===to.y).toBe(true);
    expect(Math.sign(to.campusX-from.campusX)).toBe(Math.sign(to.x-from.x));
    expect(Math.sign(to.campusY-from.campusY)).toBe(Math.sign(to.y-from.y));
   }
  }
  for(const node of graph.locations){
   const building=graph.buildings.find(b=>b.id===node.buildingId)!;
   expect(node.campusX).toBeGreaterThanOrEqual(building.x);expect(node.campusX).toBeLessThanOrEqual(building.x+building.width);
   expect(node.campusY).toBeGreaterThanOrEqual(building.y);expect(node.campusY).toBeLessThanOrEqual(building.y+building.height);
   if(node.kind==='room')expect(node.name).toContain(node.roomNumber);
  }
 });

 it('turns reverse correctly and lift exits do not assume a facing direction',()=>{
  const visit=createRun().visits[0];visit.locationId='DEMO-RECEPTION';
  expect(deriveRoute(visit,'DEMO-NOI').instructions.at(-1)).toBe('Rẽ phải, tới phòng A201 · Nội.');
  expect(deriveRoute(visit,'DEMO-SINHHOA').instructions.at(-1)).toBe('Rẽ trái, tới phòng A205 · Sinh hóa.');
  visit.locationId='DEMO-NOI';
  expect(deriveRoute(visit,'DEMO-RECEPTION').instructions).toContain('Rẽ trái, ra sảnh thang máy.');
  const steps=deriveRoute(visit,'DEMO-RECEPTION').instructions;
  expect(steps[steps.findIndex(step=>step.includes('xuống tầng'))+1]).not.toMatch(/^Rẽ/);
 });

 it('same-location, absent destination and unconfirmed starts give one useful instruction',()=>{
  const visit=createRun().visits[0];visit.locationId='DEMO-NOI';
  expect(deriveRoute(visit,'DEMO-NOI').instructions).toEqual(['Bạn đang ở phòng A201 · Nội.']);
  expect(deriveRoute(visit,null).nodeIds).toEqual([]);
  visit.outsideHospital=true;
  expect(deriveRoute(visit,'DEMO-NOI')).toMatchObject({from:null,nodeIds:[],requiresStartConfirmation:true});
  expect(deriveRoute(visit,'DEMO-NOI').instructions).toHaveLength(1);
 });
});
