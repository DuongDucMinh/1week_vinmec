# Bộ giọng chỉ đường · Nhật Phong

Đã xuất 344 câu riêng biệt cho 8 thứ tự thủ tục, 224 tổ hợp chọn thang theo từng chặng.
Bao phủ 1568 trường hợp từ 49 vị trí trong đồ thị tới 16 điểm đến, cả thang máy / thang bộ, đến nơi và cập nhật tuyến.

Bao gồm tất cả khoa khám, phòng thủ tục, tiếp nhận và cổng vào trong ứng dụng. Công cụ local chỉ cần sinh 112 câu còn thiếu, dùng lại 232 WAV đã kiểm tra; notebook vẫn sinh bộ đầy đủ để chạy độc lập.

## Các hành trình

| Mã | Thứ tự đầy đủ |
|---|---|
| tim-mach-1 | Quầy tiếp nhận → Tim mạch A301 → Sinh hóa máu A205 → Điện tim A601 → Tim mạch A301 |
| tim-mach-2 | Quầy tiếp nhận → Tim mạch A301 → Điện tim A601 → Sinh hóa máu A205 → Tim mạch A301 |
| noi-1 | Quầy tiếp nhận → Nội A201 → Sinh hóa máu A205 → Nước tiểu A501 → Siêu âm ổ bụng B105 → Nội A201 |
| noi-2 | Quầy tiếp nhận → Nội A201 → Sinh hóa máu A205 → Siêu âm ổ bụng B105 → Nước tiểu A501 → Nội A201 |
| noi-3 | Quầy tiếp nhận → Nội A201 → Nước tiểu A501 → Sinh hóa máu A205 → Siêu âm ổ bụng B105 → Nội A201 |
| noi-4 | Quầy tiếp nhận → Nội A201 → Nước tiểu A501 → Siêu âm ổ bụng B105 → Sinh hóa máu A205 → Nội A201 |
| noi-5 | Quầy tiếp nhận → Nội A201 → Siêu âm ổ bụng B105 → Sinh hóa máu A205 → Nước tiểu A501 → Nội A201 |
| noi-6 | Quầy tiếp nhận → Nội A201 → Siêu âm ổ bụng B105 → Nước tiểu A501 → Sinh hóa máu A205 → Nội A201 |

## Giả định

- Xét nghiệm máu của khoa Nội dùng thủ tục sinh hóa máu DEMO-BLOOD-BIOCHEM hiện có tại A205.
- Đồ thị và phòng lấy từ dữ liệu mô phỏng của ứng dụng; không phải sơ đồ viện thực tế.
- Chỉ có hướng dẫn di chuyển / hành chính; không thêm hướng dẫn chuẩn bị hoặc diễn giải y khoa.

## Sinh giọng

Chạy `npm.cmd run voice:studio` trong thư mục 05-prototype rồi mở trang được in ra. Tải kaggle.json trực tiếp vào trang local và bấm Bắt đầu sinh. Key chỉ đi qua bộ nhớ; không gửi file key vào chat.
Hoặc tạo notebook riêng tư trên Kaggle, chọn File → Import Notebook và tải vinmec-navigation.ipynb; bật Internet, GPU T4 rồi Run All. Cách này không cần kaggle.json.

Kaggle chạy theo lô, dùng quota GPU của tài khoản. Sau khi xong, tải vinmec-navigation-voice.zip và giải nén. Chạy `npm.cmd run voice:import -- --from <thư-mục-giải-nén>` để kiểm tra và cài vào app.

Trước khi dùng thật, nghe các WAV ở cả 8 hành trình; việc kiểm tra file / thời lượng không thay thế kiểm tra phát âm. Các câu hành trình / chờ / kết quả là kho câu bổ sung; nút loa hiện phát những câu navigation/reroute theo đúng UI.

Danh sách đọc: REVIEW.md. Tất cả mã phòng và chữ số trong lời đọc đã chuyển sang cách đọc tiếng Việt. Sinh lại bộ câu bằng `npm.cmd run voice:prepare` khi sửa bản đồ hoặc câu chỉ dẫn.
