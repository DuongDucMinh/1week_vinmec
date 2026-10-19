# Lịch sử phát triển

## 20/10/2026 - điều phối thủ tục và lựa chọn thang

- Ưu tiên phòng ít người đang chờ / thực hiện, cùng số người chọn phòng gần nhất. Tính lại sau mỗi thủ tục và giữ điểm đến trong lúc di chuyển.
- Tách thứ tự dự kiến của bệnh nhân khỏi danh sách chỉ định của bác sĩ.
- Thêm thang bộ ở mọi tầng; thang máy mặc định. Lựa chọn cập nhật tuyến, chỉ dẫn, giọng đọc và giấy hướng dẫn.
- Nhân viên ghi nhận đến phòng cho người dùng giấy và bắt đầu thực hiện để cập nhật lượng người tại phòng.
- Cập nhật README, tài liệu và slide; thu gọn nội dung nghiên cứu và giữ một bộ trình bày hiện hành.

[Chi tiết tính năng](adaptive-routing.md) · [Kiểm thử](test-report.md)

## 19/10/2026 - khoa khám, thủ tục và reset hành trình

- Mở rộng lên 5 khoa và 9 thủ tục, danh sách chỉ định riêng theo bệnh nhân.
- Mỗi khoa có danh sách chờ và lượt đang khám riêng.
- Reset riêng từng bệnh nhân; giữ bệnh nhân khác và cấu hình phòng.
- Hoàn tất mọi thủ tục tự cập nhật danh sách sẵn sàng và chỉ đường về khoa ban đầu.

## 19/10/2026 - dùng chung giấy và ứng dụng

- Phòng thủ tục thấy mọi chỉ định ngay sau khi bác sĩ chốt.
- Hỗ trợ gọi theo khay giấy hoặc số lấy tại cửa phòng.
- Tách thực hiện thủ tục, công bố kết quả và giao giấy.
- Giữ giấy hướng dẫn dự phòng và đồng bộ lại khi có kết nối.

## 19/10/2026 - cải tiến từ phản hồi người dùng

- Thu gọn chữ trên màn bệnh nhân, làm nổi bật việc tiếp theo.
- Thêm chỉ dẫn từng mốc, hướng rẽ theo chiều đi, giọng đọc và nghe lại.
- Chọn lại mốc khi đi nhầm; bổ sung liên kết tìm cơ sở trên Google Maps.

## Phiên bản nền tảng

Xây dựng React / Node / SQLite, API, SSE, bản đồ, thông báo kết quả, trợ lý hướng dẫn và bộ kiểm thử. Bổ sung kiểm soát lệnh lặp, dữ liệu cũ sau reset, khôi phục thao tác và hộp thoại hỗ trợ bàn phím.
