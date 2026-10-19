# Đối chiếu yêu cầu nộp bài

Dương Đức Minh · K3. Rà soát đóng gói ngày 20/10/2026 theo mục 6 tài liệu đề bài đã đọc. Bảng này ghi trạng thái bằng chứng trong repo, không phải xác nhận đạt yêu cầu của ban tổ chức.

| Yêu cầu | Bằng chứng trong repo | Trạng thái / giới hạn |
| --- | --- | --- |
| Tự dùng MyVinmec | 01-phong-van/myvinmec-app-notes.md | Chưa thực hiện thành nhật ký. Tệp hiện là mẫu. |
| Ít nhất 3 phỏng vấn ẩn danh, guide, ghi chép | Guide, P1/P2, P3 trong 01-phong-van | Có 2 phỏng vấn ngày 17/10 và 1 tự thuật. Khác đề gốc, chưa có xác nhận tương đương phỏng vấn thứ ba. |
| Insight có nguồn | pain-points.md, insights.md, source-coverage.md | Đã có phân tích và nguồn, giữ riêng diễn giải và giả thuyết. |
| Journey/workflow có cảm xúc, điểm đau | 02-journey-map/journey-map.md | Có journey của phỏng vấn và tự thuật tách riêng. Không tự gán số đo cảm xúc. |
| Biodesign need statement | 03-need-statement/need-statement.md | Đã có problem-population-outcome. Chưa chứng minh hiệu quả giải pháp. |
| 3 best practice quốc tế | 04-best-practice/best-practices.md | Có nguồn chính thức, ngày đọc và giới hạn áp dụng. |
| Prototype click được, mã nguồn và prompt | 05-prototype/README.md, src, prompts.md | Có luồng demo, adapter AI và fallback. Chưa có bằng chứng gọi AI hội thoại thật thành công. TTS dùng trình duyệt. |
| Log thử 2–3 người, phản hồi, sửa đổi | user-test-log.md, user-feedback-revision.md, CHANGELOG.md | Đã ghi phản hồi định tính của 2 người do người làm bài thuật lại ngày 19/10. Chưa có số đo, log thao tác hoặc thử lại sau sửa. |
| Rủi ro/đạo đức và hỗ trợ khẩn cấp | 06-rui-ro-dao-duc/risk-register.md | Có 11 rủi ro và biện pháp. Đường khẩn cấp cần hoàn thiện và kiểm chứng tại cơ sở. |
| Coach plan một trang | 07-coach-plan/coach-plan.pdf | Đã xuất PDF một trang. Đây là kế hoạch dự kiến. |
| README, danh tính, khóa, công khai AI | README.md, AI-USAGE.md | Đã ghi Dương Đức Minh, K3, mục lục, cách chạy, phạm vi mô phỏng và hạn chế. |
| slides.pdf không quá 10 trang | slides.pdf, outputs/slides.pdf | Đã xuất 10 trang. Đã kiểm tra trực quan hai trang sửa. Có PPTX v6 chỉnh sửa được. Chưa có bằng chứng tập trình bày trong 10 phút. |
| Form/CV, 5 bài học, gửi email | Ngoài phạm vi repo | Người làm bài tự xác nhận. Không suy ra từ việc có repo. |
| Commit và push GitHub | Git origin: DuongDucMinh/1week_vinmec | Đang đóng gói theo yêu cầu người làm bài. Chỉ xác nhận push sau khi remote khớp commit. |

## Lưu ý khi đánh giá

- Bản đồ, vị trí, phòng/tầng và hồ sơ demo là dữ liệu tự tạo. Liên kết Google Maps chỉ minh họa tìm cơ sở, chưa tích hợp GPS trong nhà hoặc tự phát hiện đi nhầm.
- Phản hồi T1/T2 là diễn giải từ thông tin người làm bài cung cấp, không phải trích dẫn nguyên văn hoặc quan sát trực tiếp của AI.
- 143 kiểm tra phần mềm hiện có đã đạt, TypeScript và Vite build đã đạt. Kiểm tra mới cho giọng đọc/hướng rẽ gặp lỗi tài nguyên và timeout; chưa coi là xác minh E2E. Chi tiết trong 05-prototype/test-report.md.
- Bản ghi phỏng vấn thô, file môi trường, khóa, SQLite, thư mục runtime và tệp tạm bị loại khỏi Git.
- Hạn theo đề là 23h59 ngày 19/10/2026 giờ Việt Nam. Lượt đóng gói/push này diễn ra sau mốc đó; chưa có bằng chứng đã gửi email nộp bài.
