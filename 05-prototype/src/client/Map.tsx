import { useEffect, useState } from 'react';
import type { Location, MapGraph, Route, ServiceId, Snapshot, VisitView } from '../shared/contracts';
import type { SimulationApi } from './api';
import { clinicForVisit, departmentForVisit } from '../shared/journey';
import { Icon } from './icons';
import { NavigationGuide, walkingInstruction } from './NavigationGuide';

/** A route is presented as consecutive places, never a floor browser. */
function routeLegs(graph: MapGraph, route: Route) {
  const legs: { buildingId: string; floor: number; points: Location[] }[]=[];
  for(const id of route.nodeIds) {
    const point=graph.locations.find(p=>p.id===id);
    if(!point)continue;
    const previous=legs.at(-1);
    if(previous?.buildingId===point.buildingId&&previous.floor===point.floor)previous.points.push(point);
    else legs.push({buildingId:point.buildingId,floor:point.floor,points:[point]});
  }
  // Passing a floor inside the lift is not a stop in the walking guidance.
  return legs.filter((leg,index)=>index===0||index===legs.length-1||!leg.points.every(point=>point.kind==='lift'));
}

function GuidedFloor({graph,route,leg,step}:{graph:MapGraph;route:Route;leg:ReturnType<typeof routeLegs>[number];step:number}) {
  const all=graph.locations.filter(p=>p.buildingId===leg.buildingId&&p.floor===leg.floor);
  const x=(p:Location)=>24+p.x/620*312;
  const y=(p:Location)=>p.y<200?76:142;
  const path=leg.points.map((p,i)=>`${i?'L':'M'}${x(p)},${y(p)}`).join(' ');
  const length=leg.points.slice(1).reduce((total,p,i)=>total+Math.hypot(x(p)-x(leg.points[i]),y(p)-y(leg.points[i])),0);
  const arrowCount=Math.max(1,Math.round(length/10));
  const duration=length/22;
  return <svg className="guided-floor" viewBox="0 0 360 190" role="img" aria-label={`Đường đi tại Tòa ${leg.buildingId}, tầng ${leg.floor}`}>
    <rect x="4" y="7" width="352" height="176" rx="8" fill="#f7f9f8"/>
    {graph.edges.map((e,i)=>{const a=all.find(p=>p.id===e.from),b=all.find(p=>p.id===e.to);return a&&b?<line key={i} x1={x(a)} y1={y(a)} x2={x(b)} y2={y(b)} stroke="#e4eae7" strokeWidth="16" strokeLinecap="round"/>:null;})}
    {all.filter(p=>p.kind==='room').map(p=>{const labels=(p.mapLabel||p.name.split(' · ').at(-1)!).split('|');return <g key={p.id}><rect x={x(p)-37} y={p.y<200?22:88} width="74" height="61" rx="4" fill={p.id===route.to?'#e1eee9':'white'} stroke="#d8dfdc"/><text x={x(p)} y={p.y<200?43:109} textAnchor="middle" fill="#263c34" fontSize="16" fontWeight="600">{p.roomNumber}</text><text x={x(p)} y={(p.y<200?62:128)-(labels.length>1?8:0)} textAnchor="middle" fill="#56685f" fontSize={labels.length>1?10.5:12}>{labels.map((label,i)=><tspan x={x(p)} dy={i?11:0} key={i}>{label}</tspan>)}</text></g>;})}
    {length>0&&<g data-route-segment="guided" aria-hidden="true">
      {Array.from({length:arrowCount},(_,i)=><g key={`${path}-${i}`} className="guided-route-arrow" style={{offsetPath:`path('${path}')`,offsetDistance:`${i/arrowCount*100}%`,animationDuration:`${duration}s`,animationDelay:`${-duration*i/arrowCount}s`}}><path d="M-3 -3 0 0 -3 3" fill="none" stroke="#146b5a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></g>)}
    </g>}
    {leg.points.filter(p=>p.kind!=='room'&&(!p.id.includes('HALL'))).map(p=><g key={p.id}><rect x={x(p)-9} y={y(p)-9} width="18" height="18" rx="3" fill="white" stroke="#61776b"/><text x={x(p)} y={y(p)-(p.kind==='reception'?42:22)} textAnchor="middle" fill="#44594e" fontSize="12">{p.kind==='lift'?'Thang máy':p.kind==='reception'?'Tiếp nhận':p.kind==='entrance'?'Cổng':'Lối nối'}</text></g>)}
    {leg.points[step]&&<g aria-label="Vị trí hiện tại mô phỏng"><circle cx={x(leg.points[step])} cy={y(leg.points[step])} r="14" fill="#246bce" stroke="white" strokeWidth="3"/><text x={x(leg.points[step])} y={y(leg.points[step])+40} textAnchor="middle" fill="#174b91" fontSize="13" fontWeight="700">Bạn ở đây</text></g>}
    {leg.points.filter(p=>p.id===route.from||p.id===route.to).map(p=><g key={p.id}><circle cx={x(p)} cy={y(p)} r="8" fill={p.id===route.from?'white':'#146b5a'} stroke="#146b5a" strokeWidth="3"/><text x={p.y<200?x(p)+(p.x>350?-14:14):x(p)} y={p.y<200?100:y(p)+28} textAnchor={p.y<200?(p.x>350?'end':'start'):'middle'} fill="#263c34" fontSize="12" fontWeight="600">{p.id===route.to?'Điểm đến':'Xuất phát'}</text></g>)}
  </svg>;
}

export function RouteMap({ snapshot, view, api }: { snapshot: Snapshot; view: VisitView; api: SimulationApi; serviceId?: ServiceId | null }) {
  const {graph}=snapshot;
  const {visit,route}=view;
  const destination=graph.locations.find(p=>p.id===route.to);
  const origin=graph.locations.find(p=>p.id===route.from);
  const [start,setStart]=useState('DEMO-ENTRANCE');
  const [legIndex,setLegIndex]=useState(0);
  const [step,setStep]=useState(0);
  const [lost,setLost]=useState(false);
  const legs=routeLegs(graph,route);
  const index=Math.min(legIndex,Math.max(0,legs.length-1));
  const leg=legs[index], next=legs[index+1];
  const arrived=route.from===route.to;
  useEffect(()=>{setLegIndex(0);setStep(0);setLost(false);setStart(route.from||'DEMO-ENTRANCE');},[route.from,route.to,snapshot.runId,visit.journeyVersion]);
  useEffect(()=>setStep(0),[legIndex]);
  const currentStep=Math.min(step,Math.max(0,(leg?.points.length||1)-1));
  const instruction=lost?'Dừng lại tại mốc có biển tên. Chọn mốc gần bạn bên dưới để tìm lại đường. Nếu chưa rõ vị trí, hãy nhờ nhân viên gần nhất.':arrived?`Bạn đã đến ${destination?.name}. ${view.nextAction.description}`:leg?walkingInstruction(leg.points,currentStep):'Chọn mốc hiện tại để bắt đầu.';
  const disabled=api.pending||!api.connected;
  const confirm=(locationId:string)=>api.command('CONFIRM_LOCATION',visit.visitId,'patient',{locationId,outsideHospital:false});
  const transition=next ? next.buildingId!==leg.buildingId ? `Qua lối nối sang Tòa ${next.buildingId}` : `Đi thang máy ${next.floor>leg.floor?'lên':'xuống'} tầng ${next.floor}` : '';
  if(!destination)return <section className="map-card"><h2>{view.nextAction.kind==='COMPLETE'?'Bạn đã hoàn tất lượt khám':'Hiện chưa cần di chuyển'}</h2><p className="muted">{view.nextAction.description}</p><Icon name="map" size={32}/></section>;
  return <section className="map-card" aria-label="Chỉ đường tới bước tiếp theo">
    <div className="route-endpoints"><div><span className="origin-dot"/><div><small>Đi từ</small><strong>{origin?.name||'Chưa xác nhận vị trí'}</strong></div></div><div><Icon name="pin" size={18}/><div><small>Điểm đến tiếp theo</small><h2>{destination.name}</h2><p className="map-address">{destination.building} · Tầng {destination.floor}{destination.roomNumber&&` · Phòng ${destination.roomNumber}`}</p></div></div></div>
    <p className="navigation-demo-label">Định vị minh họa · Chưa theo dõi vị trí thật</p>
    <NavigationGuide text={leg&&currentStep===leg.points.length-1&&next&&!lost?`${instruction} ${transition}.`:instruction} resetKey={`${snapshot.runId}-${visit.visitId}-${visit.journeyVersion}-${route.from}-${route.to}`}/>
    {route.requiresStartConfirmation?<div className="start-confirm"><h3>Chọn lại điểm xuất phát</h3><p>Khi trở lại viện, chọn mốc gần bạn để bắt đầu chỉ đường.</p><label>Điểm xuất phát<select value={start} onChange={e=>setStart(e.target.value)}>{graph.locations.filter(p=>['entrance','reception','lift'].includes(p.kind)).map(p=><option key={p.id} value={p.id}>{p.name} · {p.building}, tầng {p.floor}</option>)}</select></label><button className="primary" disabled={disabled} onClick={()=>confirm(start)}>Tôi đang tại mốc này</button></div>:arrived?<div className="arrival-note"><Icon name="check" size={24}/><h3>Bạn đã ở điểm đến</h3><p>{view.nextAction.kind==='WAIT_INITIAL'?`Mời ngồi chờ ngoài phòng ${destination.roomNumber}. Bác sĩ sẽ gọi bạn.`:view.nextAction.description}</p></div>:leg?<><div className="guided-stage"><div className="guided-stage-title"><strong>{`Tòa ${leg.buildingId} · Tầng ${leg.floor}`}</strong><span>Chặng {index+1}/{legs.length}</span></div><GuidedFloor graph={graph} route={route} leg={leg} step={currentStep}/><div className="map-legend"><span><i/> Tuyến cần đi</span><span>Sơ đồ hướng dẫn</span></div></div><div className="walking-instruction" aria-live="polite"><small>Bước {currentStep+1}/{leg.points.length}</small><h3>{instruction}</h3>{currentStep>0&&<p>Hướng rẽ tính theo chiều bạn vừa đi từ {leg.points[currentStep-1].name}.</p>}{currentStep<leg.points.length-1&&<button className="primary" onClick={()=>setStep(currentStep+1)}>Đã tới mốc tiếp theo</button>}</div><details className="leg-instruction"><summary>Tóm tắt chặng</summary><strong>{index===0?`Bắt đầu từ ${leg.points[0].name}`:`Tiếp tục tại Tòa ${leg.buildingId}, tầng ${leg.floor}`}</strong><p>{next?`Đi đến ${leg.points.at(-1)?.kind==='lift'?'sảnh thang máy':'lối nối'}. ${transition}.`:`Theo đường màu xanh đến ${destination.name}.`}</p></details><div className="leg-controls"><button className="secondary" disabled={index===0} onClick={()=>setLegIndex(i=>Math.max(0,i-1))}>Quay lại</button>{next?<button className="primary" onClick={()=>setLegIndex(index+1)}>{next.buildingId!==leg.buildingId?`Đã sang Tòa ${next.buildingId}`:`Đã tới tầng ${next.floor}`}<Icon name="arrow" size={16}/></button>:<button className="primary map-arrived" disabled={disabled} onClick={()=>confirm(destination.id)}>{destination.id===clinicForVisit(visit)?.id?`Tôi đã đến ngoài phòng ${departmentForVisit(visit)?.shortName} ${destination.roomNumber}`:`Tôi đã đến ${destination.roomNumber||destination.name}`}</button>}</div><details className="all-directions"><summary>Xem toàn bộ chỉ dẫn</summary><ol className="route-steps">{route.instructions.map((text,i)=><li key={i}>{text}</li>)}</ol></details></>:<p>Chưa tìm thấy tuyến đường. Hãy hỏi nhân viên tiếp nhận.</p>}
    {view.nextAction.kind==='GO_SERVICE'&&!arrived&&<div className="map-arrival-instruction"><strong>Khi đến cửa phòng</strong><p>{view.nextAction.description}</p></div>}
    <button className="secondary lost-button" aria-expanded={lost} onClick={()=>setLost(v=>!v)}>{lost?'Đóng hỗ trợ tìm đường':'Tôi đi nhầm / không rõ hướng'}</button>
    {lost&&<p className="lost-message" role="status">Dừng tại mốc có biển tên, chọn lại vị trí bên dưới. Tuyến sẽ tính lại sau khi bạn xác nhận. Nếu chưa nhận ra mốc, hãy hỏi nhân viên gần nhất.</p>}
    <details className="location-update" open={lost||undefined}><summary>Tôi đang ở vị trí khác</summary><label>Vị trí hiện tại<select value={start} onChange={e=>setStart(e.target.value)}>{graph.locations.filter(p=>p.kind!=='connector').map(p=><option key={p.id} value={p.id}>{p.name} · {p.building}, tầng {p.floor}</option>)}</select></label><button className="secondary" disabled={disabled} onClick={()=>confirm(start)}>Xác nhận vị trí của tôi</button></details>
    <details className="campus-demo"><summary>Google Maps và sơ đồ trong viện</summary><p>Minh họa hành trình: Google Maps tới cơ sở, sau đó chuyển sang sơ đồ trong viện. Vị trí và tầng hiện tại do bạn xác nhận theo mốc.</p><a className="secondary" target="_blank" rel="noreferrer" href="https://www.google.com/maps/search/?api=1&query=Vinmec%20Ocean%20Park%202">Mở Google Maps tìm cơ sở</a><p className="small">Sơ đồ phòng, tầng là dữ liệu demo, chưa phải bản đồ chính thức của bệnh viện.</p><button className="text-button" disabled={disabled} onClick={()=>confirm('DEMO-ENTRANCE')}>Mô phỏng: tôi đã tới cổng viện</button></details>
  </section>;
}
