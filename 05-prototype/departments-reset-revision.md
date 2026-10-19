# Reset riêng từng bệnh nhân, chọn khoa và mở rộng thủ tục

## Cách dùng

- **Reset hành trình** xuất hiện trong app người bệnh và tại từng dòng trong phần **Thử lại từng hành trình** của màn lễ tân. Nút đưa đúng người đó về trạng thái chưa tiếp nhận; giữ hồ sơ, tuổi và dữ liệu người khác. Chỉ định, kết quả, vị trí, thông báo và lượt khám đang hoạt động của người đó được xóa. Nhật ký chung vẫn giữ sự kiện để truy vết.
- Lễ tân chọn **Khoa khám ban đầu**, rồi xác nhận tiếp nhận. App chỉ hiện khoa đã chọn sau xác nhận; trước đó hiển thị tiếp nhận và khám chuyên khoa chung, không mặc định hiện Nội.
- Màn bác sĩ có bộ chọn **Khoa làm việc** và hỗ trợ URL `?department=...`. Danh sách chờ / sẵn sàng và lượt đang khám riêng cho từng khoa. Hai khoa có thể làm việc đồng thời; một khoa vẫn chỉ có một người đang khám.
- Sau các thủ tục, app quay lại đúng phòng của khoa ban đầu. Mọi phòng thủ tục vẫn thấy chỉ định ngay; thứ tự gọi theo giấy / số thực tế như yêu cầu đã chốt.

## Khoa trong demo

| Khoa | Mã | Phòng minh họa |
| --- | --- | --- |
| Nội | DEMO-INTERNAL | A201, tầng 2, tòa A |
| Tim mạch | DEMO-CARDIOLOGY | A301, tầng 3, tòa A |
| Răng - Hàm - Mặt | DEMO-DENTISTRY | A305, tầng 3, tòa A |
| Tai - Mũi - Họng | DEMO-ENT | A401, tầng 4, tòa A |
| Da liễu | DEMO-DERMATOLOGY | A405, tầng 4, tòa A |

Số khám ban đầu được tăng riêng theo từng khoa. Reset một bệnh nhân không làm đổi số / thứ tự của người khác. Nếu tiếp nhận lại cùng khoa, người đó nhận số mới.

## Danh mục 9 thủ tục

Siêu âm ổ bụng; xét nghiệm sinh hóa máu; **xét nghiệm nước tiểu; chụp X-quang; chụp CT; đo điện não đồ; đo điện tâm đồ (điện tim); nội soi thực quản; nội soi dạ dày**. Bỏ giới hạn hai chỉ định: có thể tìm tên có dấu / không dấu, chọn nhiều mục và sắp thứ tự gợi ý trên app.

Đã bổ sung các phòng và kết nối thang máy / hành lang trong sơ đồ minh họa. Mỗi mặt bằng hướng dẫn có tối đa hai phòng để đọc rõ trên điện thoại. Tên dài trên SVG dùng hai dòng ngắn; tên đầy đủ luôn hiện ở thông tin điểm đến. Các phòng này là dữ liệu demo, chưa xác minh vị trí thực tế.

## Reset và đồng bộ

Mỗi lượt bệnh nhân có `journeyVersion`. Reset tăng phiên bản của riêng người đó, xóa dữ liệu hành trình và giải phóng lượt khám / thủ tục đang thực hiện. Các yêu cầu gửi từ tab cũ bị chặn bằng `STALE_VISIT`; client không tự gửi lại trên phiên bản hành trình mới. Retry cùng mã thao tác không reset thêm lần nữa và không áp chỉ định cũ lên lượt mới. SQLite giữ phiên bản hành trình qua khởi động lại.

Hội thoại trợ lý, popup kết quả, tab hiện tại và lựa chọn chỉ định được làm mới theo phiên bản bệnh nhân. Cấu hình khay giấy / máy lấy số giữ nguyên. Lượt dữ liệu cũ đã tiếp nhận được hiểu là khoa Nội; người chưa tiếp nhận vẫn chưa có khoa.

## Kiểm tra

- **131/131 Vitest đạt**, 12 files: gồm chọn đủ 9 thủ tục ở cả 5 khoa, đường đi / điểm quay lại, bác sĩ nhiều khoa độc lập, reset khi đang khám / thủ tục, bảo toàn bệnh nhân khác, reset bền vững / retry và chặn tab cũ.
- **12/12 ca Playwright đầy đủ đạt**; thêm **1/1 ca** kiểm tra tên dài và tuyến Răng Hàm Mặt → nội soi qua 6 chặng ở điện thoại / tablet. Có bằng chứng đi Tim mạch → ba thủ tục → quay lại A301, reset chọn Da liễu → A405; và Răng Hàm Mặt / Tai Mũi Họng hoạt động độc lập.
- Production build và TypeScript đạt. Bộ ID dùng module nhẹ riêng, không đưa thư viện kiểm tra request vào bundle trình duyệt.
- [Báo cáo Vitest](outputs/departments-reset/vitest-results.json), [12 ca trình duyệt](outputs/departments-reset/playwright-full.json), [ca bản đồ](outputs/departments-reset/playwright-map.json).

Ảnh đã xem: [chọn ba chỉ định ở Tim mạch](outputs/departments-reset/cardiology-orders.png), [app Răng Hàm Mặt](outputs/departments-reset/dentistry-patient-390.png), [bản đồ nội soi](outputs/departments-reset/endoscopy-map-390.png), [điểm đến Da liễu sau reset](outputs/departments-reset/dermatology-route.png).

Đây là kiểm tra phần mềm trên dữ liệu tự tạo, không phải thử với người dùng thật hoặc xác nhận quy trình cơ sở.

Taste Skill: lint **0 FAIL**, 2 WARN ở shadow của overlay / menu cũ; inspect màn tiếp nhận sau thay đổi tại 1440 / 768 / 390 px **0 FAIL, 0 WARN**. Đã mở ảnh cuối để rà nút reset của từng bệnh nhân và bộ chọn khoa. Tiếp tục giữ kiểu framed-sheet, không thêm thẻ chỉ số trang trí. [Bằng chứng tổng hợp](outputs/departments-reset/verification.json).
