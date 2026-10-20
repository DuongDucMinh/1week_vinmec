import {describe,it,expect} from 'vitest';
import {navigationSteps} from '../../src/client/navigationSteps';
import {arrangeMapLabels} from '../../src/client/mapLabels';
import {graph,createRun} from '../../src/shared/fixtures';
import {deriveRoute} from '../../src/shared/routing';
import {navigationSpeech} from '../../src/shared/navigationSpeech';

const stepsFrom=(from:string,to:string,transportMode:'lift'|'stairs'='lift')=>{
 const route=deriveRoute({...createRun().visits[0],locationId:from,transportMode},to);
 return {route,steps:navigationSteps(graph,route)};
};

describe('meaningful navigation steps',()=>{
 it.each(['lift','stairs'] as const)('combines reaching the %s and changing from floor 1 to 4',transportMode=>{
  const route=deriveRoute({...createRun().visits[0],locationId:'DEMO-RECEPTION',transportMode},'DEMO-TMH');
  const steps=navigationSteps(graph,route);
  expect(steps.map(step=>step.kind)).toEqual(['floor','destination']);
  expect(steps[0].to.floor).toBe(4);expect(steps[0].leg.floor).toBe(1);
  expect(steps[1].to.id).toBe('DEMO-TMH');
  expect(route.instructions.filter(text=>text.includes('Đi thang'))).toEqual([`Đi ${transportMode==='lift'?'thang máy':'thang bộ'} lên tầng 4.`]);
 });
 it('keeps hallway turns in the geometry without another confirmation',()=>{
  const steps=navigationSteps(graph,deriveRoute({...createRun().visits[0],locationId:'DEMO-NOI'},'DEMO-SINHHOA'));
  expect(steps).toHaveLength(1);expect(steps[0].leg.points.some(point=>point.id.includes('HALL'))).toBe(true);
 });
 it('separates building transfers from floor changes',()=>{
  const steps=navigationSteps(graph,deriveRoute({...createRun().visits[0],locationId:'DEMO-NOI'},'DEMO-DADAY'));
  expect(steps.map(step=>step.kind)).toEqual(['floor','building','floor','destination']);
 });
 it.each([
  ['DEMO-NOI','DEMO-SINHHOA','A201','trái','A205','trái'],
  ['DEMO-SINHHOA','DEMO-NOI','A205','phải','A201','phải'],
 ])('anchors %s to %s at the room door and names the destination only once', (from,to,origin,exitTurn,destination,arrivalSide)=>{
  const {route,steps}=stepsFrom(from,to);
  expect(steps[0].detail).toBe(`Từ cửa phòng ${origin}, đi ra hành lang rồi rẽ ${exitTurn}. Đi dọc hành lang tới phòng ${destination} ở bên ${arrivalSide}.`);
  expect(steps[0].detail.match(new RegExp(destination,'g'))).toHaveLength(1);
  expect(navigationSpeech(graph,route)).toBe(steps[0].detail);
  expect(navigationSpeech(graph,route)).not.toContain(steps[0].instruction);
 });
 it.each(['lift','stairs'] as const)('describes only the current floor leg when leaving a room for the %s',mode=>{
  const {steps}=stepsFrom('DEMO-SINHHOA','DEMO-NUOCTIEU',mode);
  expect(steps[0].detail).toContain('Từ cửa phòng A205, đi ra hành lang rồi rẽ phải.');
  expect(steps[0].detail).toContain('lên tầng 5.');
  expect(steps[0].detail).not.toContain('A501');
  expect(steps[1].detail).not.toContain('A205');
  expect(steps[1].detail).not.toContain('lên tầng');
 });
 it.each([
  ['DEMO-A-LIFT-5','DEMO-NUOCTIEU','trái','phải'],
  ['DEMO-LIFT-2','DEMO-SINHHOA','phải','trái'],
 ])('gives an explicit facing cue at %s before left or right', (from,to,turn,side)=>{
  const {steps}=stepsFrom(from,to);
  expect(steps[0].detail).toContain(`Ra khỏi thang máy, quay mặt về phía dãy phòng rồi rẽ ${turn}.`);
  expect(steps[0].detail).toContain(`ở bên ${side}.`);
 });
 it('matches the displayed B105 door geometry in both directions',()=>{
  expect(stepsFrom('DEMO-SIEUAM','DEMO-XQUANG').steps[0].detail).toContain('Từ cửa phòng B105, đi ra hành lang rồi rẽ phải.');
  expect(stepsFrom('DEMO-CONNECTOR-B','DEMO-SIEUAM').steps[0].detail).toBe('Từ lối nối, đi dọc hành lang tới phòng B105 ở bên trái.');
 });
 it('keeps arrival, an unconfirmed start and an unavailable route meaningful',()=>{
  const {route}=stepsFrom('DEMO-NOI','DEMO-NOI');
  expect(navigationSpeech(graph,route)).toBe('Bạn đã đến A201 · Nội.');
  expect(navigationSpeech(graph,{...route,from:null,nodeIds:[],requiresStartConfirmation:true})).toBe('Chọn mốc hiện tại để bắt đầu.');
  expect(navigationSpeech(graph,{...route,from:'unknown',nodeIds:[]})).toBe('Chưa tìm thấy đường đi. Mời bạn hỏi nhân viên tiếp nhận.');
 });
 it('places a nearby current-position caption and staircase/connector captions on separate rows',()=>{
  const labels=arrangeMapLabels([
   {id:'me',text:'Bạn ở đây',x:280,pointY:178,fontSize:14,color:'blue',bold:true,priority:100},
   {id:'stairs',text:'Thang bộ',x:240,pointY:178,fontSize:13,color:'green',bold:true,priority:90},
   {id:'connector',text:'Sang Tòa B',x:310,pointY:178,fontSize:13,color:'gray',bold:false,priority:10}
  ]);
  for(const a of labels)for(const b of labels){
   if(a===b||a.y!==b.y)continue;
   expect(Math.abs(a.x-b.x)).toBeGreaterThan((a.width+b.width)/2);
  }
 });
});
