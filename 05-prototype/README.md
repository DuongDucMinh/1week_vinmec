# Prototype trợ lý điều phối và dẫn đường khám ngoại trú

Ứng dụng web mô phỏng một lượt khám qua nhiều phòng: tiếp nhận → khám chuyên khoa → các thủ tục được chỉ định → quay lại khoa ban đầu. Gồm 5 khoa, 9 thủ tục, 3 hồ sơ tự tạo và bốn giao diện đồng bộ: người bệnh, bác sĩ, phòng thủ tục, điều phối.

## Tính năng chính

- Gợi ý phòng có ít người đang chờ / thực hiện nhất; cùng số người thì chọn phòng gần nhất. Tính lại sau mỗi thủ tục, giữ điểm đến đang di chuyển.
- Hiển thị thứ tự dự kiến riêng cho bệnh nhân; giữ nguyên danh sách chỉ định của bác sĩ.
- Dẫn đường qua thang máy mặc định hoặc thang bộ theo lựa chọn; có sơ đồ từng chặng, hướng rẽ, giọng đọc và tìm lại mốc.
- Ghi nhận đến phòng cho cả người cầm giấy, bắt đầu / hoàn tất thủ tục, công bố kết quả, thông báo và in hướng dẫn dự phòng.
- Chọn khoa riêng, danh sách bác sĩ riêng và reset từng hành trình; SQLite giữ tiến độ khi khởi động lại.

[Quy tắc điều phối và kịch bản A → C → B](adaptive-routing.md) · [Đặc tả hiện tại](simulation-spec.md)

## Chạy trên Windows

Dùng Node.js 24.x từ 24.11.1 và npm. Trong thư mục `05-prototype`:

```powershell
npm.cmd ci
npm.cmd run build
npm.cmd start
```

Mở `http://127.0.0.1:3001/patient`. Khi phát triển dùng `npm.cmd run dev`; frontend mặc định tại `http://127.0.0.1:5173`, API tại cổng 3001.

| Đường dẫn | Công việc |
| --- | --- |
| `/patient` | Bước tiếp theo, hành trình, đường đi, thông báo, kết quả và trợ lý |
| `/doctor` | Chọn khoa, gọi khám, chốt chỉ định và theo dõi người quay lại |
| `/procedure` | Chọn phòng, tìm người bệnh, ghi nhận đến phòng và cập nhật thủ tục |
| `/control` | Tiếp nhận, chọn khoa, reset từng bệnh nhân và cấu hình phòng |

SQLite mặc định ở `data/local-demo.sqlite`, được Git bỏ qua. `.env.example` liệt kê `HOST`, `PORT`, `DATABASE_PATH` và cấu hình AI. Cổng dev proxy trong `vite.config.ts` mặc định trỏ API 3001.

## Đi hết một lượt demo

1. Tại `/control`, chọn bệnh nhân và khoa rồi bấm **Xác nhận tiếp nhận**. App hiện phòng khám ban đầu.
2. Tại `/doctor`, chọn khoa tương ứng, gọi người bệnh, bắt đầu trao đổi, chọn và chốt thủ tục. Thứ tự danh sách được giữ làm chỉ định; app tính thứ tự đi riêng.
3. Tại `/patient`, xem phòng được gợi ý và danh sách dự kiến. Bấm **Xem đường đi**, chọn **Thang máy / Thang bộ**, bật giọng chỉ đường khi cần. Xác nhận mốc / chặng rồi xác nhận đến phòng.
4. Tại `/procedure`, chọn phòng và tìm bệnh nhân. Nhân viên có thể ghi nhận **Đã đến phòng** cho người dùng giấy, **Bắt đầu thực hiện**, rồi **Đã hoàn thành**. Mỗi phòng mô phỏng một bác sĩ, một người thực hiện tại một thời điểm. Gọi theo giấy / số thực tế tại cửa phòng.
5. Sau mỗi lần hoàn tất, app tính lại giữa các thủ tục chưa làm từ vị trí phòng vừa hoàn tất. Kết quả được công bố riêng và thông báo cho người bệnh, bác sĩ.
6. Xong tất cả thủ tục, bệnh nhân tự vào danh sách sẵn sàng của đúng khoa ban đầu. App hướng quay lại phòng đó; demo kết thúc tại đây. Kết quả hoặc bản giấy chưa công bố không chặn bước quay lại trong kịch bản hiện tại.
7. **Reset hành trình** đưa riêng bệnh nhân về quầy, xóa chỉ định / tiến độ và đưa lựa chọn thang về thang máy. Các bệnh nhân khác và cấu hình phòng được giữ.

## Bản đồ và điều phối

Mỗi tầng của hai tòa có nút thang máy và thang bộ riêng trong đồ thị. Tuyến chỉ dùng cạnh đổi tầng của loại thang được chọn. Thang máy đi thẳng tới tầng cần đến; thang bộ có chỉ dẫn qua từng tầng. Đổi lựa chọn đặt lại chặng hướng dẫn từ vị trí đã xác nhận, giữ nguyên điểm đến và được lưu cùng lượt khám.

Lượng người tại phòng tính người đang thực hiện và người đã được bệnh nhân / nhân viên xác nhận ở phòng, loại người đang xét và người đã hoàn tất. Danh sách mọi chỉ định của phòng là danh sách công việc, không phải số người đang chờ hay thứ tự gọi. Khi số người và khoảng cách đều bằng nhau, thứ tự chỉ định dùng làm tiêu chí ổn định cuối cùng.

Trong lúc di chuyển, app giữ điểm đến để tránh thay đổi liên tục. Các thủ tục phía sau là dự kiến theo dữ liệu hiện tại. Tính lại điểm đến khi chốt chỉ định và sau mỗi thủ tục hoàn tất. Thông báo kết quả, xác nhận mốc, thay đổi lượng người ở phòng khác hoặc đổi thang không tự đổi đích đang đi.

## Kết quả, thông báo và dự phòng

Hai chế độ trả kết quả: `RETURN_TO_DOCTOR` (điện tử) và `COLLECT_PAPER` (thêm trạng thái nhận giấy). Chế độ chọn khi tạo lượt và giữ nguyên trong lượt. Mỗi kết quả công bố được cập nhật tới bệnh nhân và bác sĩ. Quyền thông báo nằm trong mục hỗ trợ; thông báo hệ thống hoạt động khi trang còn mở và nhận dữ liệu, kể cả tab nền.

Có **In / lưu giấy hướng dẫn dự phòng** theo thứ tự dự kiến và loại thang đang chọn. Giấy không tự cập nhật; quy trình giấy / số tại phòng vẫn dùng được khi bệnh nhân không mở app. Thử mất kết nối qua `/patient?tools=1` → hỗ trợ → công cụ kiểm tra kết nối.

## Trợ lý AI và cấu hình

Trợ lý trả lời câu hỏi hành chính theo dữ kiện lượt khám. Server kiểm tra intent và facts, không cho AI ghi trạng thái hoặc diễn giải kết quả y khoa. Khi chưa kết nối AI, thẻ hướng dẫn theo tiến độ vẫn hoạt động.

Cấu hình `OPENAI_API_KEY` và `AI_MODEL` trong `.env` phía server rồi khởi động lại. Tên biến tại [.env.example](.env.example); prompt, schema và cách đánh giá tại [prompts.md](prompts.md). Chưa xác minh kết nối mô hình thật trong bộ kiểm thử phần mềm.

## Kiểm tra và phát triển

```powershell
npm.cmd run typecheck
npm.cmd test -- --maxWorkers=1
npm.cmd run test:e2e
```

Playwright dùng Chrome, server riêng cổng 3101 và `data/e2e-demo.sqlite`; không đổi dữ liệu demo cổng 3001. [Báo cáo kiểm thử](test-report.md) chứa kết quả theo phiên bản và bằng chứng. [Báo cáo triển khai](implementation-report.md) mô tả kiến trúc; [CHANGELOG](CHANGELOG.md) ghi thay đổi.

## Điểm còn hạn chế

Đồ thị, vị trí và hồ sơ là mô phỏng. Gợi ý giả định các thủ tục độc lập và mỗi phòng một bác sĩ, chưa tính thời lượng hoặc năng lực phục vụ song song. Chưa đo hiệu quả giảm thời gian chờ với bệnh nhân thật. Vị trí dựa trên xác nhận, chưa có định vị trong nhà. Xem phạm vi sản phẩm trong [README dự án](../README.md) và [rủi ro](../06-rui-ro-dao-duc/risk-register.md).
