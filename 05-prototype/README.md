# Prototype hướng dẫn lượt khám MyVinmec

Web prototype theo bối cảnh Ocean Park 2, 5 khoa khám: Nội, Tim mạch, Răng - Hàm - Mặt, Tai - Mũi - Họng và Da liễu. Giao diện bệnh nhân dùng bố cục app trên điện thoại; bác sĩ và điều phối dùng màn hình máy tính. Dữ liệu, sơ đồ, phòng/tầng, thời gian chờ và lịch sử đều tự tạo. Không kết nối hệ thống bệnh viện.

Luồng hiện tại: lễ tân chọn khoa và xác nhận → app mới hiện khoa/phòng cần khám và chỉ đường → bác sĩ khoa đó tìm/chọn chỉ định → làm thủ tục theo giấy hoặc số tại cửa phòng → tự về cột **Sẵn sàng vào phòng** và chỉ đường quay lại đúng khoa ban đầu. **Demo dừng tại bước quay lại này.**

Có **5 khoa, 9 thủ tục**, bác sĩ có thể chọn hơn hai thủ tục. Mỗi khoa có danh sách người bệnh và lượt đang khám riêng. Trước tiếp nhận, bệnh nhân chưa được gán khoa; trước khi bác sĩ chốt, chưa có chỉ định thủ tục.

Nút **Reset hành trình** trong app và bên cạnh từng bệnh nhân ở màn lễ tân chỉ xóa tiến độ của người đó, đưa về quầy tiếp nhận để chọn khoa lại. Giữ nguyên bệnh nhân khác và cấu hình cách lấy lượt từng phòng. Tab cũ không được gửi thao tác sang hành trình mới sau reset.

**Thông báo kết quả:** người bệnh bấm **Bật thông báo kết quả** và cho phép thông báo của trình duyệt. Mỗi kết quả mới có thông báo hệ thống riêng; nhấn thông báo khi trang người bệnh còn mở sẽ mở kết quả tương ứng. Trạng thái quyền nằm trong nút **?**. Thông báo hoạt động khi trang còn mở và nhận cập nhật (kể cả tab nền); chưa có Web Push khi đóng toàn bộ trang. Cần HTTPS hoặc localhost và trình duyệt hỗ trợ Notifications. Nếu bị chặn, ứng dụng vẫn hiện nội dung kết quả mới trong thanh cập nhật và mục Thông báo. Không phát lại kết quả cũ khi tải trang hoặc đổi hành trình.

Xem [hướng dẫn cập nhật khoa và reset](departments-reset-revision.md). Luồng giấy/số được giữ như [bản giấy/app trước](paper-workflow-revision.md). Giao diện tiếp tục hướng `framed-sheet` theo [Taste Skill](https://github.com/Leonxlnx/taste-skill/blob/main/skills/taste-skill/SKILL.md), nhánh app screens.

## Chạy trên Windows

Dùng Node **24.x từ 24.11.1** và npm, đúng nhánh runtime đã kiểm tra. Package cũng cho Node 26+, chưa kiểm tra trên máy khác; `node:sqlite` ở Node 24.11.1 báo experimental. Mở terminal trong thư mục `05-prototype`:

```powershell
npm.cmd ci
npm.cmd run dev
```

Mở địa chỉ **Local** do Vite in ra, mặc định `http://127.0.0.1:5173`. Nếu cổng bận, Vite dùng cổng tiếp theo. API mặc định ở `127.0.0.1:3001`. Mở ba tab trên cùng địa chỉ frontend:

| Đường dẫn | Vai trò | Cách dùng |
| --- | --- | --- |
| `/patient` | Người bệnh | Bố cục điện thoại, việc tiếp theo, tiến độ, bản đồ, thông báo, trợ lý |
| `/doctor` | Bác sĩ Nội | Chọn khoa làm việc, khám ban đầu, tìm/chọn một hoặc nhiều thủ tục, theo dõi người quay lại |
| `/procedure?service=DEMO-US-ABD` | Phòng siêu âm | Mọi chỉ định siêu âm; tìm tên/mã theo giấy hoặc số được gọi; xác nhận hoàn thành |
| `/procedure?service=DEMO-BLOOD-BIOCHEM` | Phòng xét nghiệm máu | Mọi chỉ định xét nghiệm máu; tìm tên/mã theo giấy hoặc số được gọi; xác nhận hoàn thành |
| `/control` | Điều phối/bộ phận dịch vụ | Chọn khoa tiếp nhận, reset từng bệnh nhân, cấu hình lấy lượt từng phòng, theo dõi kết quả/giấy |

Chạy bản build cùng một origin:

```powershell
npm.cmd run build
npm.cmd start
```

Sau đó mở `http://127.0.0.1:3001/patient`. Dừng server bằng Ctrl+C. Mặc định chỉ truy cập trên máy này; xem giao diện điện thoại bằng viewport 360/390 px trong trình duyệt. Đây là web prototype, chưa có APK hoặc ứng dụng iOS cài đặt.

SQLite mặc định tại `data/local-demo.sqlite`, được Git bỏ qua; khởi động lại giữ tiến độ. Đặt lại lượt bằng màn điều khiển khi muốn bắt đầu lại hoặc đổi chế độ. `.env` cũng được bỏ qua; có thể sao chép `.env.example` để đổi `HOST`, `PORT`, `DATABASE_PATH`. Vite proxy đang trỏ API cổng 3001 trong môi trường dev.

## Đi hết một lượt demo

1. Mở `/control`, chọn người bệnh và **Khoa khám ban đầu**. Nút xác nhận tiếp nhận chỉ bật khi đã chọn khoa. Trước khi xác nhận, app chưa hiện khoa vừa chọn.
2. Bấm **Xác nhận tiếp nhận**. App hiện tên khoa, số khám, địa chỉ phòng và đường đi từ quầy. Số khám ban đầu được xếp riêng trong từng khoa. Không cần bệnh nhân báo đã đến để bác sĩ thấy tên.
3. Mở `/doctor`, chọn **Khoa làm việc** tương ứng; hoặc dùng liên kết như `/doctor?department=DEMO-CARDIOLOGY`. Bác sĩ chỉ thấy danh sách của khoa đó; các khoa có thể khám độc lập.
4. Gọi vào khám → bắt đầu trao đổi → tìm/chọn thủ tục. Có thể chọn một, ba hoặc cả chín thủ tục, sắp thứ tự gợi ý đường đi rồi chốt. Không có thủ tục thì hoàn tất ngay tại khám ban đầu.
5. Mọi phòng được chỉ định thấy người bệnh ngay. App chỉ dẫn tới thủ tục được gợi ý tiếp theo và nhắc xếp giấy lên trên cùng khay hoặc lấy số mới tại cửa phòng, theo cài đặt từng phòng.
6. Tại `/procedure`, chọn phòng làm việc. Gọi theo giấy / số thực tế; tìm người bệnh theo tên hoặc mã rồi bấm **Đã hoàn thành**. Thứ tự danh sách không phải thứ tự gọi. Có thể làm khác thứ tự app gợi ý; app tiếp tục dẫn từ phòng vừa hoàn tất tới thủ tục còn lại.
7. Hoàn tất thủ tục cuối tự đưa người bệnh vào cột **Sẵn sàng vào phòng** của đúng khoa ban đầu và dẫn quay lại phòng đó. Công bố kết quả và giao giấy kết quả vẫn là thao tác riêng, không chặn trạng thái quay lại trong demo này.
8. Muốn thử lại, bấm **Reset hành trình** trên app, hoặc ở danh sách **Thử lại từng hành trình** trên `/control`. Người bệnh trở về chưa tiếp nhận, không còn khoa/chỉ định/kết quả/tiến độ/thông báo cũ. Các bệnh nhân khác vẫn giữ nguyên. Lễ tân có thể chọn khoa khác cho lượt thử mới.

Có ba hồ sơ tự tạo. Bản đồ, số phòng và tầng là dữ liệu minh họa; chưa phải sơ đồ bệnh viện khảo sát thực tế. Cài đặt cách lấy lượt từng phòng nằm trong **Cài đặt & kiểm tra** và được giữ qua các lần reset.

## Bản đồ, thông báo và dự phòng

Tab **Đường đi** luôn dẫn từ vị trí hiện tại tới bước cần làm tiếp theo. Sơ đồ tự mở đúng chặng, nút **Đã tới tầng… / Đã sang Tòa…** chuyển tiếp qua thang máy hoặc lối nối; chặng cuối có nút **Tôi đã đến…**. Không còn lựa chọn Tổng quan / Tầng & phòng. Khi phòng thủ tục xác nhận hoàn thành, vị trí xuất phát đổi về phòng vừa làm xong và đích đổi sang bước tiếp theo, kể cả khi đang mở bản đồ. Các phòng/tầng là dữ liệu minh họa, chưa phải sơ đồ khảo sát thực tế.

Thông báo là toast và hộp thông báo trong app khi trang đang kết nối. Thông báo mới không tự mở hồ sơ hay ngắt lượt bác sĩ. Không có push native khi đã đóng trang.

Người bệnh vẫn có **In / lưu giấy hướng dẫn dự phòng** và phần hỗ trợ ở biểu tượng góc phải. Giấy hướng dẫn có tên/mã và cách lấy lượt từng phòng. Xác nhận hoàn thành từ phòng thủ tục tiếp tục cập nhật hệ thống dù người bệnh không có app; không có thao tác nhập sẵn sàng thủ công. Mạng phục hồi thì lấy snapshot mới. Nếu toàn server ngừng, dùng giấy/nhân viên; giấy không tự cập nhật kết quả mới. Để thử lỗi mạng: `/control` → **Cài đặt & kiểm tra** → **Mở ứng dụng để kiểm tra kết nối**, mở `/patient?tools=1`; vào hỗ trợ → **Công cụ kiểm tra kết nối** → **Tạm ngắt kết nối trang này**. Công cụ này không xuất hiện ở màn người bệnh thông thường.

## Trợ lý AI

Trợ lý hiểu câu hỏi hành chính rồi chọn intent và fact IDs từ trạng thái lượt khám. Server kiểm tra lựa chọn và dựng câu trả lời từ dữ kiện đã cho phép. AI không ghi trạng thái, xác nhận kết quả hoặc diễn giải chỉ số y khoa. Không gửi kết quả/lịch sử khám vào model.

Để bật gọi thật, cấu hình khóa qua OpenAI Developers vào **`05-prototype/.env`** ở phía server, hoặc tự nhập an toàn trên máy; không gửi khóa vào chat. `.env.example` có tên biến:

```dotenv
OPENAI_API_KEY=
AI_MODEL=gpt-5.6-terra
```

Khởi động lại server sau cấu hình. Chỉ thấy **LIVE** khi một request thật thành công và lựa chọn hợp lệ. Khi thiếu khóa, lỗi/timeout hoặc đầu ra không hợp lệ, UI ghi **FALLBACK** và vẫn có thẻ hướng dẫn cố định. Câu trả lời tới sau khi tiến độ/reset thay đổi sẽ bị từ chối để hỏi lại.

Prompt, schema, đầu vào và giới hạn eval ở [prompts.md](prompts.md). Kiểm tra 24 câu bằng `npm.cmd run eval:ai`; báo cáo lưu trong `.prototype-runtime/` (Git bỏ qua). Mỗi câu có thể là PASS, FAIL hoặc NOT_LIVE. Mock provider trong tests không phải bằng chứng hiểu ngôn ngữ của model thật.

## Kiểm tra và tài liệu

```powershell
npm.cmd run typecheck
npm test
npm.cmd run test:e2e
```

E2E build ứng dụng, dùng Chrome đã cài trên máy và server riêng cổng 3101 với DB `data/e2e-demo.sqlite`; không đổi dữ liệu lượt demo cổng 3001. Báo cáo trình duyệt ở `outputs/playwright-report/`, ảnh minh họa và giấy in ở `outputs/paper-workflow/`. Nếu chưa có Chrome, cài từ nguồn chính thức hoặc đổi browser channel trong `playwright.config.ts` phù hợp máy.

- [Báo cáo kiểm tra](test-report.md), [review code](review-log.md), [changelog](CHANGELOG.md).
- [Nhiệm vụ thử với 2–3 người](prototype-test-guide.md), [phản hồi 2 người dùng](user-test-log.md).
- [Need statement](../03-need-statement/need-statement.md), [journey và điểm đau](../02-journey-map/journey-map.md), [nguồn/giả định Vinmec](../01-phong-van/vinmec-result-workflow-notes.md).

Chỉ dùng dữ liệu giả trong bản demo. Vai trò là mô phỏng local, chưa có xác thực tài khoản bệnh viện. Kết quả kiểm tra phần mềm không chứng minh hiệu quả với người bệnh thật hoặc xác nhận quy trình cơ sở.



## Bản sửa từ phản hồi 2 người

Màn đường đi có giọng đọc và từng mốc. Xem [hướng dẫn demo](user-feedback-revision.md), [phản hồi](user-test-log.md). Google Maps chỉ là liên kết minh họa tìm cơ sở. Vị trí trong viện do người dùng chọn/xác nhận, chưa có GPS hoặc la bàn thật.
