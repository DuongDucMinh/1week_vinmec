# Cải tiến từ phản hồi T1/T2

Phản hồi được ghi ngày 19/10/2026; mô tả triển khai cập nhật 21/10/2026. [Phản hồi gốc](user-test-log.md).

| Phản hồi | Cách xử lý hiện tại |
| --- | --- |
| T1: khó nhìn, nhiều chữ thừa | Bỏ thông tin lặp, làm nổi bật việc tiếp theo, địa chỉ và tiến độ. |
| T2: khó xác định hướng rẽ, lo đi nhầm, đề nghị âm thanh | Hướng dẫn từng chặng, bản đồ có mốc tham chiếu, loa và nghe lại. Cập nhật vị trí cho chọn lại tòa/tầng/mốc để tính lại đường. |

Giọng đọc ưu tiên bản ghi tiếng Việt khớp câu, có Azure Speech dự phòng khi cấu hình; không dùng giọng trình duyệt. Mỗi chặng gộp tới thang và đổi tầng; nút Quay lại sửa bước vừa xác nhận.

## Thử các thay đổi

1. Mở Đường đi, theo chỉ dẫn và xác nhận mốc; nghe lại khi cần.
2. Chọn Cập nhật vị trí, đối chiếu biển tên rồi chọn tòa, tầng và mốc. Kiểm tra tuyến đổi nhưng tiến độ và điểm đến giữ nguyên.
3. Nếu không nhận ra mốc, chọn Tôi không xác định được vị trí để xem hướng dẫn nhờ nhân viên.
4. Chạm biểu tượng kết nối cạnh tên người bệnh để xem giờ đồng bộ; khi mất kết nối, có cảnh báo và nút kết nối lại.

Cập nhật vị trí chủ động và trạng thái đồng bộ được bổ sung từ rà soát tình huống ngày 21/10, không gán thành lời phản hồi mới của T1/T2. Điều phối và lựa chọn thang được mô tả tại [adaptive-routing](adaptive-routing.md).

## Giới hạn

Chưa thử lại các thay đổi với T1/T2; chưa có kết quả trước/sau hoặc bằng chứng phù hợp cho người thị lực kém. Sơ đồ vẫn mô phỏng; chưa có định vị tự động, QR hoặc tích hợp Google Maps. Cập nhật vị trí khi quay lại chưa xử lý giữ lượt khi tạm rời viện. Dữ liệu đang mở khi mất mạng không thay thế bộ nhớ ngoại tuyến bền vững.
