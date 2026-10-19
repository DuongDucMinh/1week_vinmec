# Kiểm thử prototype khám ngoại trú

Cập nhật 20/10/2026, sau khi bổ sung điều phối theo lượng người và lựa chọn thang máy / thang bộ.

| Kiểm tra | Kết quả | Bằng chứng |
| --- | --- | --- |
| TypeScript và production build | Đạt | `npm.cmd run build`; 45 modules |
| Vitest toàn bộ | 155/155 đạt, 15 files | [JSON](outputs/adaptive-routing/vitest-results.json) |
| Kiểm tra lại sau thu gọn phép tính lặp | 19/19 đạt | Các ca điều phối và toàn bộ khoa; build chạy lại đạt |
| Playwright trên Chrome | 16/16 đạt, không bỏ qua | [JSON](outputs/adaptive-routing/playwright-results.json) |
| Slide PowerPoint và PDF | 10 trang | Kiểm tra cấu trúc / bố cục / font, mở lại PPTX, xem từng trang; PDF mở lại và render trang thay đổi |

## Các hành vi đã kiểm tra

- Chọn phòng ít người trước; cùng số người chọn phòng gần theo đường đi, giữ danh sách bác sĩ.
- Dự kiến A → B → C chuyển thành A → C → B sau khi hoàn tất A; giữ A trong lúc đang di chuyển, cập nhật tuyến từ phòng vừa làm xong.
- Đếm người đang thực hiện và người thực sự chờ tại phòng; loại bản thân, người đã xong và chỉ định tương lai ở nơi khác. Nhân viên ghi nhận đến phòng cho người dùng giấy.
- Thang máy mặc định; chọn thang bộ chỉ dùng cạnh thang bộ khi đổi tầng, lên / xuống nhiều tầng và qua tòa. Đổi lựa chọn đặt lại chặng, được giữ khi tải lại trang; reset trở về mặc định.
- Giọng chỉ đường theo từng bước và hủy khi rời màn; sơ đồ điện thoại 360 / 390 px, hướng rẽ và tìm lại mốc.
- Luồng xuyên suốt bốn vai trò, 5 khoa, 9 thủ tục, reset riêng, đồng bộ, kết quả / giấy riêng và phục hồi khi kết nối lại.
- Hộp hỗ trợ giữ focus bàn phím, Escape đóng và trả focus; giấy hướng dẫn theo thứ tự dự kiến.

## Ảnh của bản hiện tại

[Thang bộ ở 390 px](outputs/adaptive-routing/stairs-390.png) · [Trước khi hoàn tất A](outputs/adaptive-routing/plan-before-390.png) · [Sau khi tính lại](outputs/adaptive-routing/plan-after-390.png).

Ảnh các luồng hồi quy nằm trong `outputs/adaptive-routing/regression/`.

## Phạm vi và giới hạn

Đây là kiểm thử phần mềm với dữ liệu mô phỏng. Bộ giọng đọc dùng stub để xác minh cách gọi API và đổi nội dung; không xác nhận chất lượng giọng Việt trên mọi thiết bị. Tests AI dùng adapter / mock, không chứng minh kết nối mô hình thật. Không dùng các kết quả trên để khẳng định giảm thời gian chờ thực tế hoặc xác nhận quy trình bệnh viện.

Phản hồi người dùng được ghi riêng tại [user-test-log.md](user-test-log.md).
