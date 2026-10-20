# Kiểm thử prototype khám ngoại trú

Cập nhật 21/10/2026. Kiểm thử phần mềm với hồ sơ và sơ đồ mô phỏng; phản hồi người dùng lưu riêng tại [user-test-log](user-test-log.md).

## Kết quả hiện hành

Hồi quy toàn bộ trước khi commit và push ngày 21/10/2026:

| Kiểm tra | Kết quả |
| --- | --- |
| TypeScript và production build | Đạt |
| Vitest: nghiệp vụ, API, giao diện và trợ lý | 230/230 ca, 23 tệp |
| Công cụ tạo và nhập bộ giọng | 13/13 ca |
| Chrome: toàn bộ luồng nhân viên và bệnh nhân | 35/35 kịch bản |

Biểu tượng ở cùng hàng logo/tên người bệnh, không tạo dòng riêng; kiểm tra cả bốn tab ở 360×640, 390×844 và 1440×900. Hộp chi tiết vẫn tách hai mốc thời gian; mất mạng giữ cảnh báo và khóa xác nhận.

Kiểm thử dùng server/SQLite riêng, không reset dữ liệu demo cổng 3001; AI và âm thanh dùng phản hồi mô phỏng, không gọi dịch vụ tính phí.

## Cập nhật vị trí

- Chọn tòa, tầng và mốc theo biển tên; không có mốc mặc định. Đổi tòa xóa lựa chọn tầng/mốc phụ thuộc.
- Từ tòa khác, xác nhận vị trí mới tạo tuyến đúng điểm xuất phát, giữ điểm đến và các chỉ định.
- Sau thủ tục đầu, cập nhật tại cổng giữ trạng thái đã hoàn tất; tải lại có kết nối vẫn giữ vị trí mới.
- Không xác định được mốc thì có hướng dẫn nhờ nhân viên. Cập nhật thất bại giữ hộp chọn; mất kết nối khóa xác nhận.

[Chọn vị trí](outputs/navigation-recovery/choose-location.png) · [Tuyến từ tòa B](outputs/navigation-recovery/rerouted-from-building-b.png) · [Quay lại từ cổng](outputs/navigation-recovery/return-from-entrance.png).

## Đồng bộ và mất kết nối

- Biểu tượng kết nối nằm trong header trên mọi tab, không chiếm dòng riêng; chạm để xem thời gian đồng bộ.
- Tách thời điểm nhận snapshot hợp lệ và thời điểm dữ liệu hệ thống thay đổi. Snapshot cũ bị loại không làm mới mốc đồng bộ.
- Mất mạng thực hoặc ngắt kết nối mô phỏng đều hiện cảnh báo; giữ mốc cuối và khóa xác nhận vị trí/đổi thang.
- Kết nối lại chỉ được xác nhận khi nhận dữ liệu hợp lệ. Lệnh chưa rõ kết quả dùng cơ chế gửi lại cùng xác nhận.

[Đang kết nối](outputs/navigation-recovery/online-sync.png) · [Chi tiết thời gian](outputs/navigation-recovery/sync-details.png) · [Mất kết nối](outputs/navigation-recovery/offline-warning.png).

## Phạm vi hồi quy

Điều phối theo lượng người; chọn khoa và reset riêng; thang máy/thang bộ; bản đồ có phòng tham chiếu; tiến độ, kết quả và giấy; bốn tab bệnh nhân; hội thoại; bố cục ba màn nhân viên; giọng đọc, nghe lại và đổi tuyến. Kiểm tra bản đồ từ 360×640 tới 1440×900, không tràn nhãn hoặc phát sinh thêm bước hành lang.

## Chưa được xác minh

- Chưa có định vị tự động, QR, quản lý giữ lượt khi tạm rời viện hoặc cache lượt khám ngoại tuyến bền vững. Khả năng phát hiện ngắt kết nối phụ thuộc trình duyệt/mạng.
- Chưa xác minh kết nối LLM thật. Kiểm thử âm thanh không thay thế nghe phát âm trên thiết bị thật; câu chưa có bản ghi cần bổ sung hoặc dịch vụ giọng dự phòng.
- Chưa thử lại với T1/T2; chưa đo giảm chờ, giảm đi nhầm hoặc mức phù hợp cho người thị lực kém. Chưa xác nhận sơ đồ và quy trình bệnh viện.
