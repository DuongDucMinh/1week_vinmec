# Một lần đi khám

**Exploration Sprint Vinmec · Dương Đức Minh · K3**

Prototype hỗ trợ người khám ngoại trú biết việc cần làm tiếp theo, phòng cần đến và thời điểm chuyển bước. Bài tập tập trung vào khoảnh khắc rời một điểm dịch vụ để tới điểm tiếp theo trong cùng lượt khám.

## Xem bài nộp

- [Slide PDF, 10 trang](slides.pdf)
- [PowerPoint có thể chỉnh sửa](outputs/slides-v6/mot-lan-di-kham-v6.pptx)
- [Slide trên Canva](https://www.canva.com/d/4aF4Wm_GJFV3Suq)
- [Kế hoạch coach, PDF một trang](07-coach-plan/coach-plan.pdf)
- [Đối chiếu yêu cầu và phần còn thiếu](REQUIREMENTS-STATUS.md)

## Vấn đề và phạm vi

Người khám ngoại trú qua nhiều điểm dịch vụ cần biết làm gì tiếp, tới đâu và khi nào. Nghiên cứu trong repo gồm hai cuộc phỏng vấn ẩn danh ngày 17/10/2026 và một trải nghiệm tự thuật của người làm bài. Ghi chép chủ yếu là diễn giải, không coi là lời nói nguyên văn. Hai người đã dùng thử prototype và phản hồi về chữ thừa, hướng rẽ và nhu cầu nghe chỉ đường.

Bối cảnh demo là Vinmec Ocean Park 2, với 5 khoa khám và 9 thủ tục. Người bệnh, phòng, tầng, sơ đồ và tiến độ là dữ liệu tự tạo. Quy trình demo cần bệnh viện xác minh trước khi áp dụng thực tế.

## Chạy prototype

Cần Node.js 24.x từ 24.11.1 và npm. SQLite tích hợp trong Node lưu tiến độ trên máy, không cần cài cơ sở dữ liệu riêng.

```powershell
cd 05-prototype
npm.cmd ci
npm.cmd run build
npm.cmd start
```

Mở [màn người bệnh](http://127.0.0.1:3001/patient), [lễ tân](http://127.0.0.1:3001/control), [bác sĩ](http://127.0.0.1:3001/doctor) và [phòng thủ tục](http://127.0.0.1:3001/procedure?service=DEMO-US-ABD) ở các tab trên cùng trình duyệt. Khi phát triển, dùng `npm.cmd run dev`, frontend mặc định ở cổng 5173.

### Đi hết một lượt demo

1. Tại màn lễ tân, chọn khoa khám ban đầu rồi xác nhận tiếp nhận.
2. Tại màn người bệnh, mở đường đi. Bật giọng chỉ đường, xác nhận từng mốc hoặc chặng. Thử nút “Tôi đi nhầm / không rõ hướng” để chọn lại mốc và tìm lại đường.
3. Tại màn bác sĩ, chọn đúng khoa, gọi vào khám, bắt đầu trao đổi rồi chọn và chốt chỉ định.
4. Tại từng phòng thủ tục, tìm người bệnh và xác nhận hoàn thành. App chỉ đường tới thủ tục còn lại.
5. Hoàn tất đủ thủ tục đưa người bệnh về danh sách sẵn sàng và chỉ đường quay lại khoa ban đầu. Demo dừng tại bước này. Reset hành trình để thử khoa khác.

Chi tiết cấu hình, hai chế độ trả kết quả, phòng thủ tục và cách kiểm tra: [README prototype](05-prototype/README.md).

## Sửa theo phản hồi người dùng

| Phản hồi | Bản sửa |
| --- | --- |
| T1 thấy giao diện khó nhìn, nhiều chữ thừa | Bỏ dòng lặp, chuyển xin quyền thông báo vào hỗ trợ, thu gọn giải thích và tóm tắt chặng. |
| T2 chưa rõ hướng rẽ, lo đi nhầm và đề nghị âm thanh | Chỉ dẫn từng mốc, hướng rẽ theo chiều vừa đi, chấm vị trí minh họa, bật/tắt giọng đọc, nghe lại và chọn lại vị trí. |

[Nhật ký phản hồi](05-prototype/user-test-log.md) ghi theo lời người làm bài cung cấp ngày 19/10. [Báo cáo sửa và kịch bản trình diễn](05-prototype/user-feedback-revision.md) tách phần đã làm với phần mô phỏng. Chưa thử lại sau sửa hoặc đo hiệu quả trước/sau.

Giọng đọc dùng text-to-speech `vi-VN` của trình duyệt, phụ thuộc giọng có trên thiết bị. Người dùng cần bấm bật trước. Google Maps chỉ mở liên kết tìm cơ sở, sau đó minh họa chuyển sang sơ đồ trong viện. Chưa có GPS trong nhà, la bàn hoặc tự phát hiện đi nhầm. Sơ đồ hiện có chưa phải bản đồ chính thức của bệnh viện.

## Mục lục bằng chứng

| Nội dung | Tài liệu |
| --- | --- |
| Câu hỏi và ghi chép phỏng vấn | [Guide](01-phong-van/interview-guide.md), [P1](01-phong-van/P1.md), [P2](01-phong-van/P2.md), [P3 tự thuật](01-phong-van/P3.md) |
| Phân tích và nguồn | [Pain point](01-phong-van/pain-points.md), [insight](01-phong-van/insights.md), [đối chiếu nguồn](01-phong-van/source-coverage.md) |
| Journey và workflow | [Journey map](02-journey-map/journey-map.md) |
| Nhu cầu trọng tâm | [Need statement](03-need-statement/need-statement.md) |
| Tham khảo quốc tế | [Ba best practice và nguồn](04-best-practice/best-practices.md) |
| Prototype | [Mã nguồn và cách chạy](05-prototype/README.md), [prompt](05-prototype/prompts.md), [changelog](05-prototype/CHANGELOG.md) |
| Kiểm tra | [Báo cáo phần mềm](05-prototype/test-report.md), [phản hồi 2 người thử](05-prototype/user-test-log.md) |
| Rủi ro và đạo đức | [Risk register](06-rui-ro-dao-duc/risk-register.md) |
| Kế hoạch coach | [Nguồn Markdown](07-coach-plan/coach-plan.md), [PDF một trang](07-coach-plan/coach-plan.pdf) |
| Sử dụng AI | [AI-USAGE.md](AI-USAGE.md) |

## Kiểm tra và giới hạn

TypeScript và Vite build đã đạt. Bộ kiểm tra hiện có gồm 143 tests đạt. Lần chạy lại trước commit có 116 tests đạt, 3 ca server timeout và 3 file UI không khởi động được worker, nên chưa đạt toàn bộ. Các bài kiểm tra mới cho giọng đọc và hướng rẽ đã thêm nhưng các lần chạy riêng gặp lỗi khởi động worker; kiểm tra trình duyệt mới gặp thiếu bộ nhớ và timeout tải trang. Xem báo cáo để phân biệt kết quả từng phiên bản. Chưa xác minh nghe giọng Việt thực tế trên mọi thiết bị.

Những phần chưa có bằng chứng đầy đủ:

- Đề gốc yêu cầu ít nhất 3 cuộc phỏng vấn. Bài sử dụng 2 phỏng vấn và 1 tự thuật, chưa có xác nhận tự thuật được tính tương đương.
- Chưa ghi nhật ký tự dùng MyVinmec. Tệp ghi chép hiện là mẫu chưa thực hiện.
- Có adapter và fallback cho trợ lý AI hành chính, chưa có bằng chứng gọi mô hình thật thành công. Text-to-speech dùng chức năng trình duyệt.
- Phản hồi 2 người ở mức định tính, chưa có thời gian, tỷ lệ hoàn thành hoặc kết quả thử lại sau sửa.
- Đường hỗ trợ khẩn cấp và quy trình bệnh viện cần xác minh trước khi thử tại cơ sở.

## Dữ liệu và công khai AI

Phỏng vấn và dùng thử do người làm bài thực hiện. Codex hỗ trợ tổng hợp, nghiên cứu nguồn, lập trình, kiểm tra và soạn tài liệu/slide. AI không tạo người tham gia, lời nói nguyên văn hoặc số đo thử nghiệm. Phần suy luận và mô phỏng được ghi riêng trong tài liệu.

Repo dùng mã ẩn danh cho nghiên cứu và dữ liệu tự tạo cho demo. Không đưa bản ghi phỏng vấn gốc, dữ liệu sức khỏe, khóa API, file `.env`, SQLite hoặc tệp tạm lên Git. Nếu bật AI thật, cấu hình khóa ở server theo `.env.example`, không đặt vào mã frontend.

## Thông tin nộp

Nguồn yêu cầu: mục 6 [tài liệu Exploration Sprint](https://docs.google.com/document/d/1f2XCxK1NnLgVlRF2VGL0dtoxBSOKcls6/view), đã đọc trong quá trình làm bài. Hạn theo đề là 23h59 ngày 19/10/2026, giờ Việt Nam. Việc hoàn tất repo và push diễn ra sau mốc này, không đồng nghĩa đã gửi email nộp bài.
