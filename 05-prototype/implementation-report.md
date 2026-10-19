> **Đã có luồng mới theo giấy / số tại cửa phòng.** Danh sách mọi chỉ định hiện ngay, tự sẵn sàng sau thủ tục cuối; demo dừng khi quay lại bác sĩ Nội. Dùng [hướng dẫn hiện tại](README.md#đi-hết-một-lượt-demo) và [báo cáo giấy/app](paper-workflow-revision.md). Nội dung bên dưới giữ làm lịch sử phiên bản trước.

> Cập nhật 19/10/2026: luồng chỉ định theo từng bệnh nhân, hàng đợi phòng thủ tục và map theo chặng đã thay thế thiết kế cũ. Xem [bản triển khai end-to-end hiện tại](end-to-end-revision.md). Nội dung bên dưới ghi lại phiên bản trước.

# Báo cáo triển khai và hướng dẫn chạy prototype

Cập nhật ngày 19/10/2026, giờ Việt Nam, sau vòng sửa bản đồ/giao diện. Cả hai executor dùng GPT-6.1 Sol, GPT-6 Astra review; giao diện bệnh nhân theo điện thoại. **110/110 tests, typecheck/build đạt; dependency cài theo lock và audit 0; review cuối khớp 39/39 file, không có finding P1/P2 trong phạm vi rà. AI LIVE và thử người dùng chưa hoàn tất; browser chưa chạy lại trên UI mới.**

Vòng sửa mới có **Tổng quan các tòa** và **Tầng & phòng**, hiển thị số phòng A201/A205/B105, đường nối giữa tòa và chỉ dẫn ngắn theo từng chặng. Đã bỏ nhãn demo, lời giải thích bối cảnh dựng và thông tin kỹ thuật khỏi luồng người bệnh thông thường; tăng cỡ chữ hướng dẫn và giữ công cụ kiểm tra riêng. [Báo cáo bản đồ/giao diện và hình mới](ui-map-revision.md) ghi chi tiết thay đổi, quy ước vị trí và cách mở.

## Những gì đã được xây dựng

| Yêu cầu của người làm bài | Hành vi đã triển khai | Bằng chứng/giới hạn |
| --- | --- | --- |
| Bệnh nhân dùng app trên điện thoại | Khung điện thoại, thanh điều hướng dưới, vùng chạm lớn, thẻ việc tiếp theo, timeline, bản đồ, thông báo và trợ lý | Ảnh 360/390 px và kiểm tra không tràn ngang; đây là web prototype, chưa phải APK/iOS |
| Tiếp nhận xác nhận là app đổi hướng dẫn | Quầy xác nhận → thông báo/inbox và phòng Nội, tòa/tầng/mốc, tuyến từ quầy | Thao tác qua API, cập nhật SSE; không chỉ bấm chuyển màn cục bộ |
| Bác sĩ chỉ định hai dịch vụ | Sau lượt khám đầu, xác nhận Siêu âm ổ bụng và Xét nghiệm sinh hóa máu → danh sách việc và chỉ đường | Chỉ định cố định trong demo; không nhập chỉ định y khoa thật |
| Vừa chờ kết quả vừa tiếp tục thủ tục | Hoàn tất dịch vụ đầu vẫn ghi chờ kết quả + ETA; thẻ tiếp theo hướng sang dịch vụ còn lại | ETA là giá trị kịch bản, hết giờ không tự có kết quả |
| Cập nhật kết quả tới người bệnh và bác sĩ | Bộ phận công bố → người bệnh có toast/inbox, nhãn đổi màu/chữ và mở bản kết quả giả; bác sĩ nhận cập nhật nền | Kết quả mới không giật hồ sơ bác sĩ đang xem; chỉ thông báo trong trang đang kết nối |
| Hai cách trả kết quả | Một lượt dùng toàn bộ RETURN_TO_DOCTOR hoặc COLLECT_PAPER | Nhánh điện tử không lấy từng bản; nhánh giấy phải nhận đủ hai bản; đổi mode tạo lượt mới |
| Được chờ bên ngoài ở nhánh điện tử | Làm xong hai dịch vụ mà còn chờ có thể khai báo ở ngoài; đủ kết quả hướng quay lại và chọn lại điểm xuất phát | Giả định mô phỏng đã chốt; không đặt hạn mất lượt |
| Nhận giấy nơi có trước | Chỉ sau cả hai thủ tục hoàn tất mới hướng nhận giấy; nơi được xác nhận kết quả trước được nhận trước | Đây là quy tắc demo; bản mềm vẫn xem được ở cả hai mode |
| Đủ điều kiện mới quay lại và bấm sẵn sàng | Gate yêu cầu đủ dịch vụ/kết quả/giấy theo mode; tới ngoài phòng tự khai có mặt rồi đăng ký sẵn sàng | Không tự đưa vào hàng khi đủ kết quả; không xác thực GPS |
| Bác sĩ có hai cột chính | Trái chờ khám đầu; phải đã sẵn sàng nghe chẩn đoán; một lượt đang tiếp nhận riêng | Bác sĩ chủ động gọi; khi gọi lượt gặp lại mới mở toàn bộ kết quả/lịch sử giả |
| Sơ đồ ở từng bước | Tổng quan hai tòa/lối nối + chi tiết từng tòa/tầng; Nội A201, Sinh hóa A205, Siêu âm B105; tuyến và chỉ dẫn từng chặng ngắn | Tìm tuyến ngắn theo trọng số giữa hai điểm; chưa tối ưu tổng hành trình toàn lượt |
| App lỗi vẫn có đường tiếp tục | Phiếu hướng dẫn in được ở cả hai mode; báo nhân viên; staff đăng ký sẵn sàng cùng gate; reconnect nhận snapshot mới | Giấy không tự cập nhật kết quả. Nếu toàn server ngừng thì dùng giấy/nhân viên |
| Có trợ lý AI | Responses adapter phía server, chọn intent/fact IDs, kiểm tra rồi dựng câu trả lời từ dữ kiện hiện tại; lỗi có FALLBACK | Chưa có request model thật thành công; 24 câu eval hiện NOT_LIVE |

Bối cảnh là Vinmec tại Vinhomes Ocean Park 2, chuyên khoa Nội. Tất cả người bệnh, lịch sử, kết quả, phòng/tầng và bản đồ được tự tạo; không khẳng định đây là sơ đồ hoặc quy trình thực tế của cơ sở. Nguồn P1/P2/P3 được giữ nguyên, không thêm phỏng vấn hay buổi thử giả.

## Kiến trúc và phần việc của agent

React/TypeScript/Vite cho giao diện; Node/Express/TypeScript cho API; SQLite lưu trạng thái, sự kiện và biên nhận lệnh; SSE cập nhật các tab. Server là nguồn trạng thái chuẩn. Các lệnh có commandId, runId và revision; reset có generation tăng bền để loại phản hồi cũ. Không dùng localStorage làm nguồn đồng bộ nghiệp vụ.

- Executor A: **GPT-6.1 Sol** — shared contracts, fixtures, domain/gates, route, SQLite, HTTP/SSE, reset, AI adapter và tests tương ứng.
- Executor B và vòng sửa frontend: **GPT-6.1 Sol** — patient mobile, doctor/control, SVG map, print/offline, client transport, dialogs và tests giao diện.
- Reviewer: **GPT-6 Astra** — rà kế hoạch, đọc code đóng băng, tái hiện findings, rà lại bản sửa.
- Điều phối: ghép việc, kiểm tra trực tiếp, chạy lại tests, kiểm tra backend restart, đọc ảnh và viết tài liệu/báo cáo.

Các thư mục chính: `src/shared`, `src/domain`, `src/server`, `src/client`, `tests/domain`, `tests/server`, `tests/ai`, `tests/client`, `tests/e2e`. [package.json](package.json) và [package-lock.json](package-lock.json) chốt dependency; [src/shared/fixtures.ts](src/shared/fixtures.ts) là dữ liệu runtime tự tạo. SQLite, khóa, logs/traces/runtime được Git bỏ qua.

## Kiểm tra, review và ảnh bằng chứng

Bản hiện tại có **110/110 tests trong 10 files**, TypeScript và build pass bằng Vitest 5.0.5; gồm 23 ca routing, 3 ca dữ liệu cũ và 9 ca UI bản đồ/ngôn ngữ/help mới. Điều phối đã chạy lại toàn bộ suite và production build sau lần sửa cuối. Npm ci từ registry chính thức giữ nguyên lock, audit **0 cảnh báo**. Xem [test-report.md](test-report.md), [JSON tests mới](outputs/map-revision/test-results.json) và [output tổng hợp](outputs/verification-summary.json).

Astra đã đóng **R1–R4** ở vòng trước: ACK cũ sau reset, AI facts theo phase, deadline fallback và thao tác modal. Vòng bản đồ/giao diện mới được review độc lập lại; reviewer xác nhận **39/39 hashes khớp, không có finding P1/P2 có thể hành động trong phạm vi đã rà**. [Manifest mới](outputs/review-manifest-map-ui.json), [review-log.md](review-log.md) và [CHANGELOG.md](CHANGELOG.md) giữ phạm vi/bằng chứng. Tests và review không thay thử người dùng thật.

Hình mới được xuất trực tiếp từ thành phần SVG của ứng dụng và đã mở kiểm tra: [Tổng quan](outputs/map-revision/overview.png), [tầng A1](outputs/map-revision/floor-a1.png), [A2](outputs/map-revision/floor-a2.png), [B1](outputs/map-revision/floor-b1.png). Đây là hình thành phần bản đồ, không phải screenshot toàn bộ app. Browser/E2E chưa chạy lại trên UI mới; 8/8 Chrome E2E của phiên bản trước chỉ là bằng chứng lịch sử. DOM tests có stub native dialog, không chứng minh focus/inert hoặc bố cục điện thoại trong trình duyệt.

Kiểm tra backend riêng đã khởi động/dừng hai tiến trình với cùng DB giả và giữ đúng run, generation, revision, trạng thái WAITING_INITIAL và inbox. [backend-restart-check.json](outputs/backend-restart-check.json) là output thực. Không dùng phép kiểm tra API này để khẳng định UI tự nối lại sau production restart; lần quan sát browser đó bị từ chối quyền. E2E mất kết nối riêng trang/đồng bộ lại đã pass ở vòng trình duyệt trước.

Ảnh chụp từ app thật chạy bằng Chrome **của giao diện trước vòng sửa bản đồ/ngôn ngữ**, giữ lại làm lịch sử; không dùng để minh họa UI mới:

| Ảnh | Thể hiện |
| --- | --- |
| [Điện thoại 390 px, một viewport](outputs/screenshots/patient-phone-390.png) | Thẻ việc tiếp theo, phòng/tầng/tòa, tiến độ, thanh điều hướng dưới |
| [Toàn trang 360 px](outputs/screenshots/patient-360.png), [390 px](outputs/screenshots/patient-390.png) | Các bước, nhãn thực hiện/kết quả, thông báo và giấy dự phòng |
| [Bản đồ 360 px](outputs/screenshots/map-360.png) | Tuyến riêng dịch vụ qua thang máy/lối nối, điểm đầu đã xác nhận và chỉ dẫn chữ |
| [Bác sĩ desktop](outputs/screenshots/doctor-desktop.png) | Hai cột chờ, lượt đang tiếp nhận, kết quả và lịch sử giả |
| [Điều khiển desktop](outputs/screenshots/control-desktop.png) | Chế độ, các sự kiện dịch vụ/kết quả/giấy và hỗ trợ staff |

Các ảnh cũ có trước feedback lỗi trong modal và trước vòng sửa bản đồ/giao diện hiện tại. Tests tự động/review không thay thử 2–3 người thật hoặc chứng minh tiết kiệm thờian.
 gi
## Từng bước chạy hệ thống trên máy này

1. Mở PowerShell bình thường. Kiểm tra `node --version`: dùng nhánh Node 24.x từ 24.11.1, đúng runtime đã kiểm tra. Máy này có Node 24.11.1 và Chrome. Package cũng cho Node 26+ nhưng chưa kiểm tra trên máy khác.
2. Chuyển vào thư mục ứng dụng:

   ```powershell
   Set-Location -LiteralPath 'D:\Python\lab_coach_vin\1week_vinmec\05-prototype'
   ```

3. Cài dependency ở lần đầu hoặc khi lấy bản source/lock mới:

   ```powershell
   npm.cmd ci
   ```

4. Chạy môi trường phát triển:

   ```powershell
   npm.cmd run dev
   ```

   Giữ terminal mở. Hai tiến trình được khởi động: API cổng 3001 và Vite mặc định 5173. Dùng đúng địa chỉ Local Vite in ra; nếu 5173 bận có thể là 5174 hoặc cổng tiếp theo.

5. Mở ba tab trên cùng địa chỉ frontend, ví dụ:

   - `http://127.0.0.1:5173/patient`: người bệnh.
   - `http://127.0.0.1:5173/doctor`: bác sĩ.
   - `http://127.0.0.1:5173/control`: quầy/bộ phận dịch vụ/điều phối.

   Màn bệnh nhân giữ khung điện thoại trên máy tính. Có thể bật chế độ thiết bị trong DevTools và đặt 390 × 844 hoặc 360 × 800 để xem cách hiển thị. Mặc định loopback, chưa truy cập từ điện thoại khác qua mạng LAN.

6. Đi hết một lượt theo phần kế tiếp. Khi muốn dừng, trở lại terminal và Ctrl+C. Khởi động lại giữ dữ liệu SQLite; dùng nút đặt lại ở màn điều khiển để bắt đầu kịch bản mới.

Có thể chạy bản build cùng một origin thay cho Vite:

```powershell
npm.cmd run build
npm.cmd start
```

Khi đó ba đường dẫn `/patient`, `/doctor`, `/control` đều ở `http://127.0.0.1:3001`. Không chạy đồng thời hai backend cùng cổng 3001. Cảnh báo SQLite experimental trên Node đã kiểm tra không chặn demo.

## Đi hết hai kịch bản demo

**Kịch bản điện tử**

1. Ở `/control`, mở **Cài đặt & kiểm tra**, chọn Kết quả điện tử và tạo lượt mới/đặt lại. Chọn **Nguyễn Minh Anh**, xác nhận tiếp nhận. Tên này là fixture tự tạo.
2. Ở `/patient`, xem phòng **A201 · Nội, tầng 2, tòa A**. Mở Đường đi → Tổng quan/Tầng & phòng; xem tuyến từ quầy, xác nhận đã tới ngoài phòng.
3. Ở `/doctor`, gọi khám ban đầu → bắt đầu trao đổi → xác nhận chỉ định hai dịch vụ.
4. Ở `/control`, bắt đầu rồi hoàn tất Siêu âm ổ bụng. Ở `/patient`, kiểm tra bước này đã thực hiện nhưng còn chờ kết quả/ETA, thẻ mới hướng tới xét nghiệm máu.
5. Bắt đầu Xét nghiệm sinh hóa máu. Trong khi đang thực hiện, công bố kết quả siêu âm. Quan sát toast/nhãn và mở kết quả giả mà không bỏ dở thủ tục hai.
6. Hoàn tất thủ tục máu, chưa công bố kết quả. Trên patient thử khai báo đang ngoài viện; lúc này chưa được đăng ký sẵn sàng.
7. Công bố kết quả máu. Patient nhận đủ kết quả và được hướng quay lại; nếu ngoài viện, chọn/xác nhận cổng hoặc điểm xuất phát mới để xem tuyến.
8. Tới ngoài phòng Nội, bấm sẵn sàng và đánh dấu xác nhận đang có mặt. Kiểm tra cột phải bác sĩ có đúng người.
9. Bác sĩ gọi người ở cột phải: mở đúng hai kết quả và phần lịch sử của lượt đó. Fixture mới chưa có lịch sử, giao diện ghi rõ chưa có; dữ liệu lịch sử có sẵn vẫn được hiển thị. Bắt đầu trao đổi rồi hoàn tất lượt.

**Kịch bản giấy**

1. Đặt lại với Nhận cả hai bản giấy. Lặp tiếp nhận và khám đầu. Có thể cho máu thực hiện trước để thử thứ tự ngược.
2. Làm xong cả hai thủ tục; công bố kết quả nơi thực hiện trước rồi nơi còn lại. Người bệnh xem bản mềm được nhưng chưa đủ giấy thì chưa hướng quay lại bác sĩ.
3. Theo hướng dẫn tới nơi có kết quả trước; control xác nhận giao bản giấy đầu. Tiếp tục bản thứ hai khi sẵn sàng.
4. Đủ hai kết quả và hai giấy mới hướng về Nội. Patient tự khai có mặt/sẵn sàng, bác sĩ gọi/bắt đầu/hoàn tất như trên.

**Thử dự phòng:** `/control` → **Cài đặt & kiểm tra** → **Mở ứng dụng để kiểm tra kết nối**. Trang `/patient?tools=1` có hỗ trợ → **Công cụ kiểm tra kết nối** → **Tạm ngắt kết nối trang này**; màn patient thông thường không hiện công cụ đó. Dùng giấy in được và báo nhân viên. Trên control xác nhận người bệnh ở ngoài phòng, đăng ký sẵn sàng khi đủ điều kiện. Kết nối lại patient để nhận snapshot mới. Đây là thử phần mềm, không hướng người thật đi theo sơ đồ dựng.

## Bật và kiểm tra AI

Đã có toàn bộ endpoint/context/schema/renderer/UI và 24 câu đánh giá. Model mặc định trong cấu hình là `gpt-5.6-terra`; đây là model API, khác model GPT-6.1 Sol của executor viết code.

Luồng OpenAI Platform đã yêu cầu xác thực và nhận chấp nhận, nhưng công cụ chọn project/tạo khóa chưa còn sẵn trong phiên tiếp theo. **Chưa tạo/ghi khóa, chưa có response LIVE**. Không coi việc xác thực tài khoản là đã bật AI.

Khi công cụ OpenAI Developers khả dụng, hoàn tất luồng chọn project/tên khóa và xác nhận lưu an toàn vào `05-prototype/.env` phía server. Không gửi khóa trong chat hoặc nhúng frontend. Sau khi có cấu hình, khởi động lại backend rồi hỏi trong tab Trợ lý. Giao diện dùng lời dễ hiểu về khả năng kết nối, không hiện nhãn kỹ thuật LIVE/FALLBACK; muốn chứng minh gọi model thật phải kiểm tra `source` của API và chạy `npm.cmd run eval:ai`. Báo cáo private nằm trong `.prototype-runtime/`. Lần chạy hiện có: 0 PASS, 0 FAIL, 24 NOT_LIVE.

[Prompt đầy đủ](prompts.md) ghi instruction, schema, facts, model/biến môi trường, deadlines và giới hạn. Trợ lý không chẩn đoán hoặc diễn giải xét nghiệm, không có quyền ghi trạng thái; khi thiếu kết nối/lỗi vẫn có FALLBACK và hướng dẫn cố định.

## Những việc chưa được đánh dấu hoàn tất

- AI LIVE và đánh giá NLU thật: đang chờ hoàn tất cấu hình an toàn/kết nối model.
- Thử 2–3 người: [guide](prototype-test-guide.md) đã cụ thể hóa nhiệm vụ, [log](user-test-log.md) chưa có dữ liệu thật.
- Xác minh sơ đồ, vị trí, ETA và quy trình trả kết quả tại cơ sở thật.
- Tối ưu tổng hành trình/đợi toàn lượt, push khi đóng app, app native và tích hợp HIS/LIS.
- Những phần nộp bài khác như nhật ký tự dùng MyVinmec, slides, thông tin người làm bài và việc nộp repo; xem [REQUIREMENTS-STATUS.md](../REQUIREMENTS-STATUS.md).
