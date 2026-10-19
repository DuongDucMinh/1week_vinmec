import type { SimulationRun } from '../shared/contracts';
import { fixtureNames, resultContent, resultEtaLabel } from '../shared/fixtures';

const legacyNames: Record<string,string> = {'DEMO-P01':'Người bệnh giả A','DEMO-P02':'Người bệnh giả B','DEMO-P03':'Người bệnh giả C'};
const legacyNotifications: Record<string,string> = {
 'Quầy đã xác nhận tiếp nhận. Mời đến ngoài phòng Nội mô phỏng, tòa A tầng 2, chờ bác sĩ gọi.':'Đã tiếp nhận. Mời đến phòng A201 · Nội, tầng 2, tòa A và chờ gọi.',
 'Bác sĩ đã gọi khám lần đầu. Mời vào phòng Nội mô phỏng.':'Bác sĩ đã gọi khám lần đầu. Mời vào phòng A201 · Nội.',
 'Bác sĩ đã gọi vào nghe chẩn đoán. Mời vào phòng Nội mô phỏng.':'Bác sĩ đã gọi vào nghe chẩn đoán. Mời vào phòng A201 · Nội.',
 'Đã đủ điều kiện quay lại phòng Nội. Tự xác nhận sẵn sàng sau khi có mặt ngoài phòng.':'Đã hoàn tất các thủ tục. Mời quay lại phòng Nội A201. Bạn đã có trong danh sách sẵn sàng của bác sĩ.',
 'Đã đủ kết quả. Mời quay lại phòng A201 · Nội và xác nhận sẵn sàng.':'Đã hoàn tất các thủ tục. Mời quay lại phòng Nội A201. Bạn đã có trong danh sách sẵn sàng của bác sĩ.',
 'Đã nhận đủ giấy và kết quả. Có thể quay lại phòng Nội.':'Đã nhận đủ giấy và kết quả. Mời quay lại phòng A201 · Nội.'
};

// Present only recognized old fixture copy using the current product language.
// The stored run, clinical/free-form text, workflow, revision and receipts stay intact.
export function presentRun(stored: SimulationRun): SimulationRun {
 const run=structuredClone(stored);
 for(const visit of run.visits){
  const oldName=legacyNames[visit.visitId];
  if(oldName&&visit.displayName===oldName)visit.displayName=fixtureNames[visit.visitId];
  visit.history=visit.history.filter(h=>h.content!=='Lịch sử tự tạo cho demo: lần khám trước, không có dữ liệu lâm sàng thật.');
  for(const service of visit.services){
   if(service.resultEtaLabel==='Dự kiến 30 phút sau thủ tục (giá trị kịch bản, không tự công bố kết quả)')service.resultEtaLabel=resultEtaLabel;
   if(service.result){
    if(service.result.title===`Kết quả giả: ${service.name}`)service.result.title=`Kết quả ${service.name}`;
    if([oldName,visit.displayName].filter(Boolean).some(name=>service.result!.content===`Đây là dữ liệu mô phỏng cho ${name}. Không phải kết quả xét nghiệm hoặc chẩn đoán thật. Trao đổi với bác sĩ trong kịch bản.`))service.result.content=resultContent;
   }
  }
  for(const notification of visit.inbox)notification.message=legacyNotifications[notification.message]??notification.message;
 }
 return run;
}
