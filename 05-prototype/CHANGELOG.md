## 19/10/2026 — Reset từng người, chọn khoa tiếp nhận và 9 thủ tục

Thêm reset riêng trong app và ở từng người bệnh tại lễ tân; chặn thao tác cũ sau reset. Lễ tân chọn khoa trước tiếp nhận; app chỉ hiện khoa sau xác nhận. Có 5 khoa, danh sách / lượt khám riêng và điểm quay lại tương ứng. Thêm xét nghiệm nước tiểu, X-quang, CT, điện não đồ, điện tâm đồ, nội soi thực quản và dạ dày; bác sĩ có thể chọn hơn hai chỉ định. Mở rộng bản đồ và giữ luồng giấy / số tại phòng thủ tục. Xem [báo cáo](departments-reset-revision.md).

## 19/10/2026 — Dùng chung giấy và app tại phòng thủ tục

Mọi phòng được chỉ định thấy người bệnh ngay. Bác sĩ tìm tên/mã theo giấy hoặc số lấy tại cửa phòng, xác nhận hoàn thành bằng một nút; bỏ thứ tự gọi điện tử và điều kiện app báo đã đến. Thêm cấu hình khay giấy / máy lấy số từng phòng, hướng dẫn đồng nhất trên app, map, giấy in và trợ lý. Hoàn tất thủ tục cuối tự chuyển vào cột Sẵn sàng vào phòng, dẫn về A201 và dừng demo tại đây. Kết quả công bố riêng, không chặn trạng thái này. Xem [báo cáo](paper-workflow-revision.md).

# Các lần thay đổi

Các thay đổi dưới đây theo yêu cầu người làm bài, kiểm tra phần mềm và review source. Chưa có buổi thử người dùng; không ghi chúng thành quan sát từ người bệnh thật.

| Ngày | Phiên bản | Vấn đề và nguồn log | Đã sửa gì | Kiểm tra lại / kết quả | Còn tồn tại |
| --- | --- | --- | --- | --- | --- |
| 19/10/2026 | v0.1 | Yêu cầu thực thi plan, đổi Executor A/B thành GPT-6.1 Sol và patient theo điện thoại | React/Node/SQLite/SSE, hai mode, ba vai trò, route hai tòa/tầng, tiến độ/kết quả, giấy/ready, AI adapter/fallback | Build/typecheck pass; 54 tests + 5 E2E trước review pass; ảnh 360/390/desktop | AI LIVE và user study chưa có |
| 19/10/2026 | v0.1 QA | Điều phối click tiếp nhận thấy thẻ đổi nhưng thiếu thông báo; từng card dịch vụ có thể mở tuyến việc hiện tại | Thêm inbox ID ổn định cho tiếp nhận/chỉ định/xong thủ tục/giấy; toast mới; serviceRoutes riêng từng dịch vụ; ETA rõ | Domain duplicate/HTTP/E2E pass; đã quan sát toast và kết quả đầu tới khi đang làm dịch vụ hai | Sơ đồ/ETA là tự tạo |
| 19/10/2026 | v0.2 review | R1 P1 và R2–R4 P2 trong [review log](review-log.md) | Generation bền qua reset; AI facts theo phase; deadline 15/25 giây; native dialog cho keyboard | 71 tests, build/typecheck và 8 E2E pass; R1–R3 được đóng, phát hiện thêm feedback của R4 | Feedback lỗi native modal được sửa tiếp dòng sau |
| 19/10/2026 | v0.2.1 | Astra thấy error/retry phía ngoài native dialog bị inert khi gửi lỗi/mất ACK | Shared CommandFeedback inline cho ready/reset; khóa xác nhận mới khi chưa rõ kết quả; retry cùng envelope/ID, ACK true mới đóng | 4 DOM integration tests mới, tổng 75 pass; typecheck/build pass; Astra đóng R4, source manifest 39/39 khớp | Browser chưa chạy lại sau sửa nhỏ; AI LIVE/user study còn thiếu |
| 19/10/2026 | v0.2.2 | Npm audit báo 3 cảnh báo dev tooling ở Vitest/mocker/tinypool | Chỉ package/lock: Vitest 5.0.5, engines Node tương thích; giữ nguyên source/tests đã review | Điều phối chạy 75/75 pass bằng Vitest 5.0.5, typecheck pass, audit 0; executor build pass | Không có request AI thật; không coi audit là thử người dùng |
| 19/10/2026 | v0.3 | Người làm bài yêu cầu bản đồ tổng quan như ảnh tham chiếu, số phòng chi tiết, chỉ dẫn từng chặng và giao diện ít chữ hơn | Tổng quan tòa/lối nối + chi tiết từng tầng, A201/A205/B105, chỉ dẫn ngắn nhất quán với graph; bỏ demo/techcopy và chữ lặp khỏi UI; tăng cỡ chữ; công cụ thử mạng chỉ ở tools view; projection các câu fixture cũ giữ nguyên tiến độ | Điều phối chạy 110/110 tests, typecheck/build pass; Astra review 39/39 hashes khớp, không có finding P1/P2 trong phạm vi rà; đã xem 4 hình xuất từ thành phần SVG | UI mới chưa chạy browser/E2E; sơ đồ thực chưa xác minh; AI LIVE và user study vẫn chưa có |


## 19/10/2026: phản hồi 2 người và sửa chỉ đường

Người làm bài cung cấp phản hồi T1/T2. Codex hỗ trợ ghi log diễn giải, giảm chữ thừa, thêm TTS trình duyệt, chỉ dẫn từng mốc, phục hồi khi đi nhầm và liên kết Google Maps minh họa. Không tạo số đo hoặc lời nói nguyên văn. Xem 05-prototype/user-feedback-revision.md.
