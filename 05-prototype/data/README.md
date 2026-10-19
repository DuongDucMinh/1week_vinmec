# Dữ liệu mô phỏng prototype

Dữ liệu chạy của ứng dụng được tạo tại [src/shared/fixtures.ts](../src/shared/fixtures.ts): 5 khoa, 9 thủ tục, 3 hồ sơ tự tạo và đồ thị hai tòa có thang máy / thang bộ. [simulation-config.json](simulation-config.json) mô tả quy tắc thiết kế hiện tại; server dùng contracts / fixtures / domain làm nguồn thực thi.

`mock-hospital.json` và `mock-visits.json` giữ mẫu dữ liệu của thiết kế ban đầu, không được nạp làm trạng thái runtime hiện tại. `ai-evaluation-cases.json` dùng cho bộ đánh giá câu hỏi hành chính.

SQLite lưu tiến độ chạy trên máy và được Git bỏ qua. Không nhập dữ liệu bệnh nhân thật, sơ đồ chưa được phép công khai hoặc khóa API. Vị trí dựa trên xác nhận của người bệnh / nhân viên; số người ở phòng không đồng nghĩa tổng danh sách chỉ định tương lai.

[Đặc tả](../simulation-spec.md) · [Điều phối và lựa chọn thang](../adaptive-routing.md)
