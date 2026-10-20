# Báo cáo triển khai trợ lý khám ngoại trú

Cập nhật 21/10/2026. [Hướng dẫn chạy](README.md) · [Đặc tả](simulation-spec.md) · [Kiểm thử](test-report.md)

## Hành vi sản phẩm

Ứng dụng hỗ trợ hành trình từ tiếp nhận, khám chuyên khoa, làm thủ tục tới quay về đúng khoa ban đầu. Có 5 khoa và 9 thủ tục. Bác sĩ chốt danh sách riêng cho từng bệnh nhân; app ưu tiên phòng ít người đang chờ / thực hiện, cùng số người thì chọn gần nhất, tính lại sau mỗi thủ tục. Điểm đến được giữ ổn định trong lúc đi.

Bản đồ có thang máy và thang bộ ở các tầng của cả hai tòa. Thang máy mặc định; lựa chọn được lưu cùng lượt và dùng cho tuyến vẽ, hướng dẫn chữ, giọng đọc, đường tới từng dịch vụ và giấy in. Phòng thủ tục ghi nhận đến phòng cho người dùng giấy, bắt đầu / hoàn tất, công bố kết quả và giao giấy. Các màn đồng bộ theo cùng trạng thái.

## Kiến trúc

React / TypeScript / Vite cho giao diện; Node / Express cho API; SQLite lưu lượt, sự kiện và biên nhận lệnh. Server là nguồn dữ liệu chuẩn, SSE truyền snapshot tới các tab. Lệnh dùng command ID, run ID, revision và journey version để chống lặp và thao tác cũ; generation phân biệt các lượt reset toàn hệ thống.

| Phần | Trách nhiệm |
| --- | --- |
| `src/shared` | Hợp đồng dữ liệu, danh mục, sơ đồ, đường đi và hướng dẫn lấy lượt |
| `src/domain` | Điều kiện nghiệp vụ, điều phối thủ tục và dữ liệu hiển thị |
| `src/server` | HTTP, SQLite, SSE và adapter trợ lý AI |
| `src/client` | Màn bệnh nhân, bác sĩ, phòng thủ tục, điều phối, bản đồ và giấy in |
| `tests` | Domain, API, lưu trữ, giao diện, AI adapter và trình duyệt |

Thuật toán chọn phòng chỉ dùng dữ liệu xác định trên server. AI hỗ trợ diễn đạt câu hỏi hành chính từ facts đã cho phép; không quyết định thủ tục, sửa trạng thái hoặc giải thích kết quả y khoa. Khi AI chưa kết nối, hướng dẫn theo tiến độ vẫn hoạt động.

## Đồng bộ và dự phòng

Reset một bệnh nhân xóa khoa / chỉ định / tiến độ riêng, đưa loại thang về mặc định và giữ các bệnh nhân khác. SQLite giữ trạng thái qua khởi động lại. Kết quả được công bố riêng với hoàn tất thủ tục, xuất hiện cho người bệnh và bác sĩ. Thông báo là banner trong app khi còn kết nối, không phải thông báo của hệ điều hành. Giấy hướng dẫn có thời điểm cập nhật.

Nhân viên vẫn gọi theo giấy hoặc số tại cửa phòng. Danh sách chỉ định không phải thứ tự gọi hoặc lượng người thực tế đang chờ. Mất kết nối trên máy bệnh nhân không ngăn máy nhân viên còn kết nối cập nhật hoàn tất; kết nối lại nhận snapshot mới. Biểu tượng kết nối nằm cùng hàng logo và tên người bệnh; chạm để xem thời điểm nhận dữ liệu thành công và thời điểm dữ liệu hệ thống thay đổi. Khi ngắt kết nối, giữ mốc cũ, hiện cảnh báo và nút kết nối lại; chưa có cache ngoại tuyến bền vững.

Cập nhật vị trí cho chọn tòa/tầng/mốc theo biển tên, không chọn sẵn. Xác nhận giữ tiến độ và điểm đến, tính lại tuyến; không xác định được mốc thì nhờ nhân viên. Chưa có phát hiện đi lạc tự động hoặc quản lý giữ lượt khi tạm rời viện.

## Phạm vi kiểm chứng

[Báo cáo kiểm thử](test-report.md) ghi riêng kết quả phần mềm theo phiên bản. [Nhật ký dùng thử](user-test-log.md) ghi phản hồi định tính từ 2 người; không suy kết quả tests thành hiệu quả với bệnh nhân thật. Dữ liệu, vị trí và sơ đồ là mô phỏng; các giả định về một bác sĩ mỗi phòng và thủ tục độc lập được nêu tại [thiết kế điều phối](adaptive-routing.md).

Hành vi hiện tại được mô tả trong README, simulation-spec và adaptive-routing; CHANGELOG tóm tắt các lần phát triển.
