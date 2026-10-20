import { useEffect, useRef, useState } from 'react';
import type { Location, MapGraph, Route, ServiceId, Snapshot, VisitView } from '../shared/contracts';
import type { SimulationApi } from './api';
import { Icon } from './icons';
import { NavigationGuide } from './NavigationGuide';
import { navigationSteps, type NavigationStep } from './navigationSteps';
import { arrangeMapLabels } from './mapLabels';
import { navigationSpeech } from '../shared/navigationSpeech';

function GuidedFloor({graph,route,leg}:{graph:MapGraph;route:Route;leg:NavigationStep['leg']}) {
  const all=graph.locations.filter(p=>p.buildingId===leg.buildingId&&p.floor===leg.floor);
  const referenceRooms=(graph.landmarks||[]).filter(p=>p.buildingId===leg.buildingId&&p.floor===leg.floor);
  const isReference=(p:Location)=>['entrance','reception'].includes(p.kind)||['DEMO-CONNECTOR-A','DEMO-CONNECTOR-B'].includes(p.id);
  const visible=[...all.filter(p=>p.kind==='room'||leg.points.includes(p)||isReference(p)),...referenceRooms];
  const roomPoints=visible.filter(p=>p.kind==='room').sort((a,b)=>a.x-b.x);
  const referenceIds=new Set(referenceRooms.map(p=>p.id));
  const roomWidth=(_p:Location)=>54;
  const minX=Math.min(...visible.map(p=>p.x)),maxX=Math.max(...visible.map(p=>p.x));
  // Reserve enough space for each room card, preserving its left/right order.
  // Other points follow the same projection so doors stay over the corridor.
  const roomSpan=roomPoints.length?roomPoints.reduce((sum,p)=>sum+roomWidth(p),0)-(roomWidth(roomPoints[0])+roomWidth(roomPoints.at(-1)!))/2:0;
  const roomGap=roomPoints.length>1?Math.max(8,(264-roomSpan)/(roomPoints.length-1)):0;
  let roomCenter=48;
  const anchors=roomPoints.map((point,index)=>{
    if(index)roomCenter+=roomWidth(roomPoints[index-1])/2+roomGap+roomWidth(point)/2;
    return {world:point.x,screen:roomCenter};
  });
  const x=(p:Location)=>{
    if(anchors.length<2)return maxX===minX?180:48+(p.x-minX)/(maxX-minX)*264;
    const nextAnchor=anchors.findIndex(anchor=>anchor.world>=p.x);
    const after=Math.max(1,nextAnchor<0?anchors.length-1:nextAnchor);
    const a=anchors[after-1],b=anchors[after];
    return Math.max(40,Math.min(320,a.screen+(p.x-a.world)/(b.world-a.world)*(b.screen-a.screen)));
  };
  const hasRooms=roomPoints.length>0;
  const roomTop=122,roomHeight=36,corridorY=178;
  const y=(p:Location)=>p.kind==='room'?166:corridorY;
  const floorPath=(points:Location[])=>points.map((p,i)=>{
    if(!i)return `M${x(p)},${y(p)}`;
    const before=points[i-1];
    const corner=x(before)!==x(p)&&y(before)!==y(p)?before.kind==='room'?`L${x(before)},${y(p)} `:`L${x(p)},${y(before)} `:'';
    return `${corner}L${x(p)},${y(p)}`;
  }).join(' ');
  const path=floorPath(leg.points);
  const length=leg.points.slice(1).reduce((total,p,i)=>total+Math.abs(x(p)-x(leg.points[i]))+Math.abs(y(p)-y(leg.points[i])),0);
  const arrowCount=Math.max(1,Math.round(length/10));
  const duration=length/22;
  const current=leg.points[0],next=leg.points.at(-1);
  const facilities=visible.filter(p=>p.kind!=='room'&&!p.id.includes('HALL'));
  const labels=arrangeMapLabels([
    ...facilities.filter(p=>p.id!==current?.id).map(p=>({id:p.id,text:p.kind==='lift'?'Thang máy':p.kind==='stairs'?'Thang bộ':p.kind==='reception'?'Tiếp nhận':p.kind==='entrance'?'Cổng':`Sang Tòa ${p.buildingId==='A'?'B':'A'}`,x:x(p),pointY:y(p),fontSize:13,color:p.id===next?.id?'#146b5a':'#687b6e',bold:p.id===next?.id,priority:p.id===next?.id?90:10})),
    ...(current?[{id:'current-position',text:'Bạn ở đây',x:x(current),pointY:y(current),fontSize:14,color:'#174b91',bold:true,priority:100}]:[])
  ]);
  const bottom=Math.max(230,...labels.map(label=>label.y+15));
  return <svg className="guided-floor" viewBox={`0 ${hasRooms?108:148} 360 ${bottom-(hasRooms?108:148)}`} role="img" aria-label={`Đường đi và các phòng xung quanh tại Tòa ${leg.buildingId}, tầng ${leg.floor}`}>
    {graph.edges.map((e,i)=>{const a=all.find(p=>p.id===e.from),b=all.find(p=>p.id===e.to);return a&&b?<path key={i} d={floorPath([a,b])} fill="none" stroke="#e4eae7" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>:null;})}
    {roomPoints.map(p=>{
      const reference=referenceIds.has(p.id),context=!leg.points.includes(p);
      return <g key={p.id} data-map-context={context?'room':undefined} data-location-id={p.id} aria-label={`Phòng ${p.roomNumber}${context?' · Mốc tham chiếu':''}`}>
        <title>{p.name}</title>
        <line data-room-door="true" x1={x(p)} y1={roomTop+roomHeight} x2={x(p)} y2={corridorY} stroke="#dce4df" strokeWidth="3"/>
        <rect x={x(p)-roomWidth(p)/2} y={roomTop} width={roomWidth(p)} height={roomHeight} rx="5" fill={p.id===route.to?'#e1eee9':p.id===route.from?'#edf3fc':'white'} stroke={p.id===route.to?'#146b5a':'#cdd9d1'}/>
        <text x={x(p)} y={roomTop+24} textAnchor="middle" fill={reference?'#52685b':'#263c34'} fontSize="17" fontWeight={reference?500:600}>{p.roomNumber}</text>
      </g>;
    })}
    {length>0&&<g data-route-segment="guided" aria-hidden="true">
      <path d={path} fill="none" stroke="#146b5a" strokeWidth="5" strokeOpacity=".2" strokeLinecap="round" strokeLinejoin="round"/>
      {Array.from({length:arrowCount},(_,i)=><g key={`${path}-${i}`} className="guided-route-arrow" style={{offsetPath:`path('${path}')`,offsetDistance:`${i/arrowCount*100}%`,animationDuration:`${duration}s`,animationDelay:`${-duration*i/arrowCount}s`}}><path d="M-3 -3 0 0 -3 3" fill="none" stroke="#146b5a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></g>)}
    </g>}
    {facilities.map(p=>{const context=!leg.points.includes(p),isNext=p.id===next?.id&&p.id!==current?.id;return <g key={p.id} data-map-context={context?'landmark':undefined} data-location-id={p.id}><rect x={x(p)-(context?6:9)} y={y(p)-(context?6:9)} width={context?12:18} height={context?12:18} rx="3" fill={isNext?'#e1eee9':'white'} stroke={isNext?'#146b5a':'#87998d'} strokeWidth={isNext?2:1}/></g>;})}
    {current&&<g aria-label="Vị trí hiện tại"><circle cx={x(current)} cy={y(current)} r="14" fill="#246bce" stroke="white" strokeWidth="3"/></g>}
    {leg.points.filter(p=>p.id===route.to&&p.id!==current?.id).map(p=><circle key={p.id} cx={x(p)} cy={y(p)} r="8" fill="#146b5a" stroke="#146b5a" strokeWidth="3" aria-label="Điểm đến"/>)}
    {labels.map(label=><g key={label.id} data-map-label={label.id}><line x1={label.id==='current-position'?x(current):x(visible.find(p=>p.id===label.id)!)} y1={label.pointY+13} x2={label.x} y2={label.y-17} stroke="#aebeb4" strokeWidth="1"/><rect x={label.x-label.width/2} y={label.y-16} width={label.width} height="21" rx="4" fill="#f7f9f8"/><text x={label.x} y={label.y} textAnchor="middle" fill={label.color} fontSize={label.fontSize} fontWeight={label.bold?700:400}>{label.text}</text></g>)}
  </svg>;
}

export function RouteMap({snapshot,view,api}:{snapshot:Snapshot;view:VisitView;api:SimulationApi;serviceId?:ServiceId|null}) {
  const {graph}=snapshot,{visit,route}=view;
  const destination=graph.locations.find(point=>point.id===route.to);
  const steps=navigationSteps(graph,route),step=steps[0];
  const [start,setStart]=useState('');
  const [history,setHistory]=useState<string[]>([]);
  const [moving,setMoving]=useState(false),[rerouted,setRerouted]=useState(false);
  const identity=JSON.stringify([snapshot.runId,visit.visitId,visit.journeyVersion,route.to]);
  const movement=useRef<{from:string;target:string;identity:string}|null>(null);
  const expectedPosition=useRef<{target:string;identity:string}|null>(null);
  const previousRoute=useRef({identity,from:route.from,path:route.nodeIds,mode:visit.transportMode});
  useEffect(()=>{
    const previous=previousRoute.current,expected=expectedPosition.current?.identity===identity&&expectedPosition.current?.target===route.from;
    const changed=previous.from!==route.from;
    if(previous.identity!==identity){
      setHistory([]);movement.current=null;expectedPosition.current=null;setMoving(false);setRerouted(false);
    }else if(changed&&!expected){
      setHistory([]);movement.current=null;expectedPosition.current=null;setMoving(false);
      setRerouted(!!route.from&&previous.path.indexOf(route.from)<0);
    }else if(changed||previous.mode!==visit.transportMode)setRerouted(false);
    if(changed&&expected)expectedPosition.current=null;
    if(changed||previous.identity!==identity)setStart('');
    previousRoute.current={identity,from:route.from,path:route.nodeIds,mode:visit.transportMode};
  },[identity,route.from,visit.transportMode]);
  useEffect(()=>{
    if(!rerouted)return;
    const timer=window.setTimeout(()=>setRerouted(false),6500);
    return()=>window.clearTimeout(timer);
  },[rerouted]);
  const disabled=api.pending||!api.connected||moving;
  const arrived=route.from===route.to;
  const confirm=(locationId:string)=>api.command('CONFIRM_LOCATION',visit.visitId,'patient',{locationId,outsideHospital:false});
  async function move(target:string,back=false){
    if(disabled||!route.from||movement.current)return;
    const request={from:route.from,target,identity};
    movement.current=request;expectedPosition.current=request;setMoving(true);
    let ok=false;
    try{
      ok=await confirm(target);
      if(movement.current===request&&ok)setHistory(previous=>back?previous.slice(0,-1):[...previous,request.from]);
    }catch{
      // The API owns connection feedback; keep the last confirmed step.
    }finally{
      if(!ok&&expectedPosition.current===request)expectedPosition.current=null;
      if(movement.current===request){movement.current=null;setMoving(false);}
    }
  }
  const backButton=<button className="secondary navigation-back" aria-label="Quay lại bước trước" disabled={disabled||history.length===0} onClick={()=>void move(history.at(-1)!,true)}><Icon name="arrow" size={17}/>Quay lại</button>;
  const speech=navigationSpeech(graph,route);
  if(!destination)return <section className="map-card"><h2>{view.nextAction.kind==='COMPLETE'?'Bạn đã hoàn tất lượt khám':'Hiện chưa cần di chuyển'}</h2><p className="muted">{view.nextAction.description}</p><Icon name="map" size={32}/></section>;
  return <section className="map-card navigation-map" aria-label="Chỉ đường tới bước tiếp theo">
    <div className="navigation-topline"><div className="route-endpoints"><small>{arrived?'Vị trí hiện tại':'Điểm cần đến'}</small><div className="destination-heading"><span className="destination-marker" aria-hidden="true"><Icon name="pin" size={24}/></span><div><h2>{destination.roomNumber&&<>Phòng <span className="destination-room">{destination.roomNumber}</span> · </>}{destination.name.split(' · ').at(-1)}</h2><p className="map-address">{destination.building} · Tầng {destination.floor}</p></div></div></div><NavigationGuide text={speech} resetKey={identity}/></div>
    {!arrived&&!route.requiresStartConfirmation&&<fieldset className="transport-options"><legend className="sr-only">Di chuyển giữa các tầng</legend><div>{(['lift','stairs'] as const).map(mode=><button key={mode} className="secondary" aria-pressed={(visit.transportMode??'lift')===mode} disabled={disabled} onClick={()=>void api.command('SET_TRANSPORT_MODE',visit.visitId,'patient',{transportMode:mode})}><Icon name={mode} size={19}/>{mode==='lift'?'Thang máy':'Thang bộ'}</button>)}</div></fieldset>}
    {route.requiresStartConfirmation?<div className="start-confirm"><h3>Chọn lại điểm xuất phát</h3><p>Chọn mốc gần bạn để bắt đầu chỉ đường.</p><label>Điểm xuất phát<select value={start} onChange={event=>setStart(event.target.value)}><option value="">Chọn mốc theo biển tên</option>{graph.locations.filter(point=>['entrance','reception','lift','stairs'].includes(point.kind)).map(point=><option key={point.id} value={point.id}>{point.name} · {point.building}, tầng {point.floor}</option>)}</select></label><button className="primary" disabled={disabled||!start} onClick={()=>void confirm(start)}>Tôi đang tại mốc này</button></div>:arrived?<div className="arrival-note"><Icon name="check" size={32}/><h3>Bạn đã đến {destination.roomNumber?`phòng ${destination.roomNumber} · ${destination.name.split(' · ').at(-1)}`:destination.name.toLocaleLowerCase('vi-VN')}</h3><p>{view.nextAction.kind==='WAIT_INITIAL'?`Mời ngồi chờ ngoài phòng ${destination.roomNumber}. Bác sĩ sẽ gọi bạn.`:view.nextAction.description}</p></div>:step?<>
      <div className="walking-instruction" aria-live="polite"><small>{rerouted?<span role="status">Đã cập nhật đường đi từ vị trí của bạn</span>:'Bước tiếp theo'}</small><h3>{step.instruction}</h3>{step.detail&&<p>{step.detail}</p>}</div>
      <div className="guided-stage"><div className="guided-stage-title"><strong>{`Tòa ${step.leg.buildingId} · Tầng ${step.leg.floor}`}</strong><span>Bước {history.length+1}/{history.length+steps.length}</span></div><GuidedFloor graph={graph} route={route} leg={step.leg}/><div className="map-legend"><span><i/> Đường đi</span><span className="current-location">{step.from.name}</span></div></div>
      <div className="navigation-actions">{backButton}<button className="primary navigation-advance" disabled={disabled} onClick={()=>void move(step.to.id)}>{step.action}<Icon name={step.kind==='destination'?'check':'arrow'} size={20}/></button></div>
    </>:<p>Chưa tìm thấy tuyến đường. Hãy hỏi nhân viên tiếp nhận.</p>}
  </section>;
}
