import type { DepartmentDefinition, MapGraph, Mode, Service, ServiceDefinition, ServiceId, SimulationRun } from './contracts';

// Illustrative room codes and geometry; these are not a surveyed facility map.
// Both campus and individual floor plans use a 620 × 345 view box.
export const graph: MapGraph = {
 buildings: [
  {id:'A',name:'Tòa A',subtitle:'Khám · Xét nghiệm',x:55,y:55,width:225,height:240},
  {id:'B',name:'Tòa B',subtitle:'Chẩn đoán hình ảnh · Nội soi',x:390,y:55,width:175,height:240}
 ],
 locations: [
  {id:'DEMO-ENTRANCE',name:'Cổng vào',building:'Tòa A',buildingId:'A',floor:1,kind:'entrance',x:75,y:275,campusX:75,campusY:270,landmark:'Cổng chính'},
  {id:'DEMO-RECEPTION',name:'Quầy tiếp nhận',building:'Tòa A',buildingId:'A',floor:1,kind:'reception',x:185,y:275,campusX:115,campusY:270,landmark:'Biển Tiếp nhận'},
  {id:'DEMO-LIFT-1',name:'Thang máy tầng 1',building:'Tòa A',buildingId:'A',floor:1,kind:'lift',x:310,y:275,campusX:170,campusY:270,landmark:'Sảnh thang máy'},
  {id:'DEMO-LIFT-2',name:'Thang máy tầng 2',building:'Tòa A',buildingId:'A',floor:2,kind:'lift',x:310,y:275,campusX:170,campusY:270,landmark:'Sảnh thang máy'},
  {id:'DEMO-NOI',name:'A201 · Nội',building:'Tòa A',buildingId:'A',floor:2,kind:'room',roomNumber:'A201',x:150,y:105,campusX:115,campusY:245,landmark:'Biển phòng A201'},
  {id:'DEMO-HALL-NOI',name:'Hành lang phía A201',building:'Tòa A',buildingId:'A',floor:2,kind:'connector',x:150,y:275,campusX:115,campusY:270,landmark:'Lối rẽ phòng A201'},
  {id:'DEMO-CONNECTOR-A',name:'Lối nối tòa A',building:'Tòa A',buildingId:'A',floor:1,kind:'connector',x:545,y:275,campusX:280,campusY:270,landmark:'Biển Tòa B'},
  {id:'DEMO-CONNECTOR-B',name:'Lối nối tòa B',building:'Tòa B',buildingId:'B',floor:1,kind:'connector',x:75,y:275,campusX:390,campusY:270,landmark:'Biển Tòa A'},
  {id:'DEMO-SIEUAM',name:'B105 · Siêu âm',building:'Tòa B',buildingId:'B',floor:1,kind:'room',roomNumber:'B105',x:450,y:275,campusX:515,campusY:270,landmark:'Biển phòng B105'},
  {id:'DEMO-HALL-SINHHOA',name:'Hành lang phía A205',building:'Tòa A',buildingId:'A',floor:2,kind:'connector',x:500,y:275,campusX:225,campusY:270,landmark:'Lối rẽ phòng A205'},
  {id:'DEMO-SINHHOA',name:'A205 · Sinh hóa',building:'Tòa A',buildingId:'A',floor:2,kind:'room',roomNumber:'A205',x:500,y:105,campusX:225,campusY:245,landmark:'Biển phòng A205'}
 ],
 edges:[
  {from:'DEMO-ENTRANCE',to:'DEMO-RECEPTION',weight:1},
  {from:'DEMO-RECEPTION',to:'DEMO-LIFT-1',weight:1},
  {from:'DEMO-LIFT-1',to:'DEMO-LIFT-2',weight:2},
  {from:'DEMO-LIFT-2',to:'DEMO-HALL-NOI',weight:0.5},
  {from:'DEMO-HALL-NOI',to:'DEMO-NOI',weight:0.5},
  {from:'DEMO-LIFT-1',to:'DEMO-CONNECTOR-A',weight:1},
  {from:'DEMO-CONNECTOR-A',to:'DEMO-CONNECTOR-B',weight:1},
  {from:'DEMO-CONNECTOR-B',to:'DEMO-SIEUAM',weight:1},
  {from:'DEMO-LIFT-2',to:'DEMO-HALL-SINHHOA',weight:0.5},
  {from:'DEMO-HALL-SINHHOA',to:'DEMO-SINHHOA',weight:0.5}
 ]
};

// Extra floors keep each guided plan leg readable: no more than two rooms per floor.
function addFloor(buildingId:string,floor:number,rooms:{id:string;code:string;name:string;label:string}[]) {
 const liftId=`DEMO-${buildingId}-LIFT-${floor}`;const building=graph.buildings.find(b=>b.id===buildingId)!;const campusX=(x:number)=>building.x+x/620*building.width;
 const previous=floor===2?`DEMO-${buildingId}-LIFT-1`:buildingId==='A'&&floor===3?'DEMO-LIFT-2':`DEMO-${buildingId}-LIFT-${floor-1}`;
 graph.locations.push({id:liftId,name:`Thang máy tầng ${floor}`,building:`Tòa ${buildingId}`,buildingId,floor,kind:'lift',x:310,y:275,campusX:campusX(310),campusY:270,landmark:'Sảnh thang máy'});
 graph.edges.push({from:previous,to:liftId,weight:2});
 rooms.forEach((room,index)=>{
  const x=index===0?150:500,hallId=`DEMO-HALL-${room.id}`;
  graph.locations.push({id:hallId,name:`Hành lang phía ${room.code}`,building:`Tòa ${buildingId}`,buildingId,floor,kind:'connector',x,y:275,campusX:campusX(x),campusY:270,landmark:`Lối rẽ phòng ${room.code}`});
  graph.locations.push({id:room.id,name:`${room.code} · ${room.name}`,mapLabel:room.label,building:`Tòa ${buildingId}`,buildingId,floor,kind:'room',roomNumber:room.code,x,y:105,campusX:campusX(x),campusY:245,landmark:`Biển phòng ${room.code}`});
  graph.edges.push({from:liftId,to:hallId,weight:.5},{from:hallId,to:room.id,weight:.5});
 });
}
addFloor('A',3,[{id:'DEMO-TIMMACH',code:'A301',name:'Tim mạch',label:'Tim mạch'},{id:'DEMO-RHM',code:'A305',name:'Răng - Hàm - Mặt',label:'Răng Hàm|Mặt'}]);
addFloor('A',4,[{id:'DEMO-TMH',code:'A401',name:'Tai - Mũi - Họng',label:'Tai Mũi|Họng'},{id:'DEMO-DALIEU',code:'A405',name:'Da liễu',label:'Da liễu'}]);
addFloor('A',5,[{id:'DEMO-NUOCTIEU',code:'A501',name:'Xét nghiệm nước tiểu',label:'Nước tiểu'},{id:'DEMO-DIENNAO',code:'A505',name:'Điện não đồ',label:'Điện não'}]);
addFloor('A',6,[{id:'DEMO-DIENTIM',code:'A601',name:'Điện tâm đồ',label:'Điện tim'}]);
graph.locations.push({id:'DEMO-B-LIFT-1',name:'Thang máy tầng 1',building:'Tòa B',buildingId:'B',floor:1,kind:'lift',x:310,y:275,campusX:440,campusY:270,landmark:'Sảnh thang máy tòa B'});
graph.edges.push({from:'DEMO-CONNECTOR-B',to:'DEMO-B-LIFT-1',weight:.5},{from:'DEMO-B-LIFT-1',to:'DEMO-SIEUAM',weight:1});
addFloor('B',2,[{id:'DEMO-XQUANG',code:'B201',name:'Chụp X-quang',label:'X-quang'},{id:'DEMO-CT-ROOM',code:'B205',name:'Chụp CT',label:'Chụp CT'}]);
addFloor('B',3,[{id:'DEMO-THUCQUAN',code:'B301',name:'Nội soi thực quản',label:'Nội soi|thực quản'},{id:'DEMO-DADAY',code:'B305',name:'Nội soi dạ dày',label:'Nội soi|dạ dày'}]);

export const departmentCatalog: DepartmentDefinition[] = [
 {id:'DEMO-INTERNAL',name:'Khoa Nội',shortName:'Nội',locationId:'DEMO-NOI'},
 {id:'DEMO-CARDIOLOGY',name:'Khoa Tim mạch',shortName:'Tim mạch',locationId:'DEMO-TIMMACH'},
 {id:'DEMO-DENTISTRY',name:'Khoa Răng - Hàm - Mặt',shortName:'Răng - Hàm - Mặt',locationId:'DEMO-RHM'},
 {id:'DEMO-ENT',name:'Khoa Tai - Mũi - Họng',shortName:'Tai - Mũi - Họng',locationId:'DEMO-TMH'},
 {id:'DEMO-DERMATOLOGY',name:'Khoa Da liễu',shortName:'Da liễu',locationId:'DEMO-DALIEU'}
];

export const fixtureNames: Record<string,string> = {'DEMO-P01':'Nguyễn Minh Anh','DEMO-P02':'Trần Hoàng Nam','DEMO-P03':'Lê Thu Hà'};
export const resultEtaLabel = 'Dự kiến 30 phút sau khi thực hiện';
export const resultContent = 'Kết quả đã được chuyển tới bác sĩ. Bác sĩ sẽ trao đổi với bạn khi khám lại.';
export const serviceCatalog: ServiceDefinition[] = [
 { id: 'DEMO-US-ABD', name: 'Siêu âm ổ bụng', locationId: 'DEMO-SIEUAM', department: 'Chẩn đoán hình ảnh', keywords: 'sieu am o bung ultrasound' },
 { id: 'DEMO-BLOOD-BIOCHEM', name: 'Xét nghiệm sinh hóa máu', locationId: 'DEMO-SINHHOA', department: 'Xét nghiệm', keywords: 'xet nghiem sinh hoa mau lay mau blood' },
 {id:'DEMO-URINE',name:'Xét nghiệm nước tiểu',locationId:'DEMO-NUOCTIEU',department:'Xét nghiệm',keywords:'xet nghiem nuoc tieu urine'},
 {id:'DEMO-XRAY',name:'Chụp X-quang',locationId:'DEMO-XQUANG',department:'Chẩn đoán hình ảnh',keywords:'chup x quang xquang xray'},
 {id:'DEMO-CT',name:'Chụp CT',locationId:'DEMO-CT-ROOM',department:'Chẩn đoán hình ảnh',keywords:'chup ct cat lop'},
 {id:'DEMO-EEG',name:'Đo điện não đồ',locationId:'DEMO-DIENNAO',department:'Thăm dò chức năng',keywords:'do dien nao do eeg'},
 {id:'DEMO-ECG',name:'Đo điện tâm đồ (điện tim)',locationId:'DEMO-DIENTIM',department:'Thăm dò chức năng',keywords:'do dien tam do dien tim ecg ekg'},
 {id:'DEMO-ENDO-ESOPHAGUS',name:'Nội soi thực quản',locationId:'DEMO-THUCQUAN',department:'Nội soi',keywords:'noi soi thuc quan esophagus'},
 {id:'DEMO-ENDO-STOMACH',name:'Nội soi dạ dày',locationId:'DEMO-DADAY',department:'Nội soi',keywords:'noi soi da day stomach gastroscopy'}
];
export function createService(id: ServiceId, mode: Mode): Service {
 const definition=serviceCatalog.find(s=>s.id===id)!;
 return {id,name:definition.name,locationId:definition.locationId,enqueuedAt:null,estimatedWaitMinutes:30,resultEtaLabel,executionStatus:'NOT_STARTED',performanceOrder:null,resultStatus:'NOT_AVAILABLE',resultConfirmedAt:null,paperStatus:mode==='COLLECT_PAPER'?'NOT_COLLECTED':'NOT_REQUIRED',result:null};
}

export function createRun(mode: Mode = 'RETURN_TO_DOCTOR', seed = 'demo', runId = crypto.randomUUID(), now = new Date().toISOString()): SimulationRun {
 return {runId,generation:0,revision:0,mode,seed,createdAt:now,activeEncounter:null,activeEncounters:{},departmentTicketCounters:{},encounterHistory:[],visits:[['DEMO-P01',35],['DEMO-P02',48],['DEMO-P03',29]].map(([id,age])=>({visitId:String(id),displayName:fixtureNames[String(id)],age:Number(age),journeyVersion:0,departmentId:null,queueNumber:null,phase:'UNREGISTERED',locationId:'DEMO-RECEPTION',outsideHospital:false,returning:false,presenceConfirmed:false,readySource:null,inbox:[],history:[],services:[]}))};
}
