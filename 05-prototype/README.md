# Prototype trợ lý điều phối và dẫn đường khám ngoại trú

Ứng dụng web mô phỏng một lượt khám qua nhiều phòng: tiếp nhận → khám chuyên khoa → các thủ tục được chỉ định → quay lại khoa ban đầu. Gồm 5 khoa, 9 thủ tục, 3 hồ sơ tự tạo và bốn giao diện đồng bộ: người bệnh, bác sĩ, phòng thủ tục, điều phối.

## Tính năng chính

- Gợi ý phòng có ít người đang chờ / thực hiện nhất; cùng số người thì chọn phòng gần nhất. Tính lại sau mỗi thủ tục, giữ điểm đến đang di chuyển.
- Hiển thị thứ tự dự kiến riêng cho bệnh nhân; giữ nguyên danh sách chỉ định của bác sĩ.
- Dẫn đường trong một màn hình với phòng đến, mốc tiếp theo, bản đồ và một nút xác nhận. Chọn riêng thang máy / thang bộ; giọng đọc mặc định bật, biểu tượng loa để tắt / bật và ghi nhớ lựa chọn trên trình duyệt.
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

Ba màn nhân viên dùng khung cố định theo cửa sổ, không cuộn toàn trang. Danh sách dài cuộn bên trong; màn nhỏ chọn từng vùng bằng nút chuyển. Tại tiếp tân, chọn hồ sơ bên trái để tiếp nhận / reset; **Cài đặt & kiểm tra** mở cấu hình lấy lượt, chế độ trả kết quả và kết nối. Bác sĩ chuyển giữa **Chờ khám / Quay lại / Kết quả** trong cùng khung.

SQLite mặc định ở `data/local-demo.sqlite`, được Git bỏ qua. `.env.example` liệt kê `HOST`, `PORT`, `DATABASE_PATH` và cấu hình AI. Cổng dev proxy trong `vite.config.ts` mặc định trỏ API 3001.

## Đi hết một lượt demo

1. Tại `/control`, chọn bệnh nhân và khoa rồi bấm **Xác nhận tiếp nhận**. App hiện phòng khám ban đầu.
2. Tại `/doctor`, chọn khoa tương ứng, gọi người bệnh, bắt đầu trao đổi, chọn và chốt thủ tục. Thứ tự danh sách được giữ làm chỉ định; app tính thứ tự đi riêng.
3. Tại `/patient`, xem phòng được gợi ý và danh sách dự kiến. Bấm **Xem đường đi**, chọn **Thang máy / Thang bộ**; giọng chỉ đường tự bật nếu bệnh nhân chưa chọn tắt. Xác nhận khi đã đến tầng cần tới, sang tòa hoặc đến phòng; có thể quay lại bước vừa xác nhận.
4. Tại `/procedure`, chọn phòng và tìm bệnh nhân. Nhân viên có thể ghi nhận **Đã đến phòng** cho người dùng giấy, **Bắt đầu thực hiện**, rồi **Đã hoàn thành**. Mỗi phòng mô phỏng một bác sĩ, một người thực hiện tại một thời điểm. Gọi theo giấy / số thực tế tại cửa phòng.
5. Sau mỗi lần hoàn tất, app tính lại giữa các thủ tục chưa làm từ vị trí phòng vừa hoàn tất. Kết quả được công bố riêng và thông báo cho người bệnh, bác sĩ.
6. Xong tất cả thủ tục, bệnh nhân tự vào danh sách sẵn sàng của đúng khoa ban đầu. App hướng quay lại phòng đó; demo kết thúc tại đây. Kết quả hoặc bản giấy chưa công bố không chặn bước quay lại trong kịch bản hiện tại.
7. **Reset hành trình** đưa riêng bệnh nhân về quầy, xóa chỉ định / tiến độ và đưa lựa chọn thang về thang máy. Các bệnh nhân khác và cấu hình phòng được giữ.

## Bản đồ và điều phối

Mỗi tầng của hai tòa có thang máy và thang bộ nối độc lập vào hành lang. Tuyến chỉ dùng loại thang đã chọn làm mốc trung gian. Cả hai loại thang đều gộp việc đi tới thang và đổi tầng thành một bước; không yêu cầu xác nhận các tầng đi ngang qua. Hành lang và cửa phòng cũng là một bước đến phòng. Sau mỗi bước, vị trí được lưu cùng lượt khám; đổi thang hoặc tải lại trang tiếp tục từ vị trí đó, giữ nguyên điểm đến.

Mỗi thời điểm chỉ có một nút xác nhận chính và nút Quay lại để sửa bước vừa xác nhận. Khi vị trí mô phỏng trong snapshot thay đổi, tuyến được tính lại từ vị trí mới; nếu vị trí nằm ngoài tuyến cũ, giao diện báo cập nhật đường đi và giọng đọc dùng hướng dẫn mới. Điều này không đồng nghĩa app tự phát hiện người bệnh đi nhầm: nguồn vị trí là dữ liệu mô phỏng qua `CONFIRM_LOCATION`, chưa kết nối cảm biến định vị trong nhà. Nút **Cập nhật vị trí** cho người bệnh chọn tòa, tầng và mốc đang đứng khi đi lạc hoặc quay lại viện. Không chọn sẵn mốc; chỉ gửi sau khi xác nhận. App giữ thủ tục đã hoàn tất và điểm đến, tính lại tuyến từ mốc mới. Không xác định được vị trí thì nhờ nhân viên; khi mất kết nối chỉ xem được hướng dẫn hỗ trợ. Nút Quay lại chỉ sửa lịch sử xác nhận trong màn chỉ đường.

Sơ đồ còn hiển thị các phòng lân cận, cổng và lối nối để đối chiếu hướng đi. Các ô mã phòng cùng kích thước, nối sát hành lang; nhãn mốc tự tách hàng khi nằm gần nhau. Phòng tham chiếu lưu riêng trong `graph.landmarks`, không tham gia định tuyến, điều phối thủ tục hay các bước xác nhận. Màu xanh làm nổi bật tuyến và mốc tiếp theo; vị trí hiện tại dùng màu xanh dương.

Lượng người tại phòng tính người đang thực hiện và người đã được bệnh nhân / nhân viên xác nhận ở phòng, loại người đang xét và người đã hoàn tất. Danh sách mọi chỉ định của phòng là danh sách công việc, không phải số người đang chờ hay thứ tự gọi. Khi số người và khoảng cách đều bằng nhau, thứ tự chỉ định dùng làm tiêu chí ổn định cuối cùng.

Trong lúc di chuyển, app giữ điểm đến để tránh thay đổi liên tục. Các thủ tục phía sau là dự kiến theo dữ liệu hiện tại. Tính lại điểm đến khi chốt chỉ định và sau mỗi thủ tục hoàn tất. Thông báo kết quả, xác nhận mốc, thay đổi lượng người ở phòng khác hoặc đổi thang không tự đổi đích đang đi.

## Kết quả, thông báo và dự phòng

Hai chế độ trả kết quả: `RETURN_TO_DOCTOR` (điện tử) và `COLLECT_PAPER` (thêm trạng thái nhận giấy). Chế độ chọn khi tạo lượt và giữ nguyên trong lượt. Mỗi kết quả công bố được cập nhật tới bệnh nhân và bác sĩ. Tab Thông báo chỉ mời bật một lần. Sau khi bật, thẻ mời biến mất, thay bằng biểu tượng chuông góc phải để bật / tắt; lựa chọn được lưu trên trình duyệt. Kết quả mới hiện bằng banner bên trong khung điện thoại mô phỏng; chạm banner để xem kết quả, không dùng thông báo hoặc quyền thông báo của Chrome. Banner hoạt động khi ứng dụng còn mở và nhận dữ liệu.

Khi tất cả thủ tục đã có kết quả, ứng dụng gửi một thông báo tổng hợp, hướng dẫn quay lại phòng khám ban đầu và chờ bác sĩ gọi vào nghe chẩn đoán. Nếu đã ở phòng khám, bước hiện tại chuyển sang **Sẵn sàng nghe chẩn đoán**. Hướng dẫn này cũng có trong tab Thông báo và được giữ khi tải lại trang.

Biểu tượng kết nối nằm cạnh tên người bệnh trên cùng hàng với logo, không chiếm dòng riêng. Chạm biểu tượng để xem lần đồng bộ thành công và lần dữ liệu hệ thống thay đổi. Khi mất kết nối, biểu tượng đổi màu và có nét gạch; giữ mốc đồng bộ cũ, hiện cảnh báo cùng nút **Kết nối lại**. Các xác nhận vị trí/đổi thang bị khóa đến khi nhận lại dữ liệu.

Có **In / lưu giấy hướng dẫn dự phòng** theo thứ tự dự kiến và loại thang đang chọn. Giấy không tự cập nhật; quy trình giấy / số tại phòng vẫn dùng được khi bệnh nhân không mở app. Thử mất kết nối qua `/patient?tools=1` → hỗ trợ → công cụ kiểm tra kết nối.

## Giọng chỉ đường tiếng Việt

Khi loa bật, ứng dụng gửi **chỉ dòng mô tả của chặng hiện tại** tới `POST /api/speech`, không ghép thêm tiêu đề hoặc lời báo cập nhật tuyến. Mô tả nêu cửa phòng xuất phát, hướng rẽ và phòng cần tới một lần; không nhắc màu đường trên bản đồ hoặc các chặng đã hoàn tất. Tại cửa thang, câu hướng dẫn yêu cầu quay mặt về dãy phòng trước khi rẽ vì bản đồ mô phỏng chưa có hướng cửa thang thực tế. Server ưu tiên WAV đã tạo bằng OmniVoice / Nhật Phong, không gọi dịch vụ TTS khi đã có file. Nếu chưa có câu đó, có thể dùng Azure Speech khi đã cấu hình. Không phụ thuộc giọng cài trong Windows / Chrome. Mã phòng được đọc theo tiếng Việt, ví dụ A201 → “a hai không một”.

### Bộ giọng Nhật Phong qua Kaggle

Đã chuẩn bị [8 hành trình](voice/navigation-nhat-phong/README.md) và [344 câu để đọc](voice/navigation-nhat-phong/REVIEW.md): Tim mạch với sinh hóa máu / điện tim; Nội với sinh hóa máu / nước tiểu / siêu âm ổ bụng. Bao phủ mọi thứ tự thủ tục, thang máy / thang bộ, đi từ tiếp nhận, quay lại khoa, xác nhận giữa chặng, đi lùi và cập nhật tuyến từ mọi vị trí trong đồ thị tới tất cả 16 điểm đến trong ứng dụng (các khoa, phòng thủ tục, tiếp nhận và cổng vào). “Xét nghiệm máu” của khoa Nội dùng thủ tục sinh hóa máu A205 hiện có. Đang có 232 WAV đã cài; bộ mở rộng cho tất cả khoa / thủ tục cần sinh thêm 112 câu. Công cụ local dùng lại các WAV có nội dung và SHA-256 khớp, chỉ gửi 112 câu còn thiếu lên Kaggle. Các câu không khớp mã nội dung không được thay bằng bản đọc cũ.

```powershell
npm.cmd run voice:prepare
npm.cmd run voice:studio
```

Mở `http://127.0.0.1:3104`, chọn file `kaggle.json` rồi bấm **Bắt đầu sinh trên Kaggle**. Công cụ dùng Kaggle CLI đã cài của `video-studio`; có thể đặt `VIDEO_STUDIO_ROOT` nếu repo ở nơi khác. Key chỉ truyền qua bộ nhớ / môi trường tiến trình, không ghi vào bộ câu hoặc log; không gửi key vào chat. Thao tác bắt đầu dùng quota GPU của tài khoản, tạo kernel riêng tư với GPU T4 và trần chạy 2 giờ. Dừng công cụ chỉ dừng theo dõi; kiểm tra kernel trên Kaggle nếu muốn hủy job đã đẩy.

Công cụ kiểm tra kết nối công khai tới Kaggle lúc khởi động và trước khi gửi job, không cần key cho phép thử này. Nếu gặp `WinError 10013` / `NETWORK_BLOCKED`, tiến trình bị chặn quyền mở kết nối (ví dụ chạy trong sandbox của agent); khởi động công cụ từ PowerShell thông thường hoặc cho phép tiến trình chạy ngoài sandbox. Không cần đổi key chỉ vì lỗi này. Sau khi khởi động lại, tải lại trang và chọn lại `kaggle.json` vì key không được lưu. Thông báo lỗi phân biệt mạng, xác thực và quota.

Sau khi xong, công cụ tải các WAV, kiểm tra manifest khớp đúng bộ câu / voice, file và thời lượng rồi cài vào `data/navigation-voice/`. App nhận bộ mới mà không cần sửa khóa Azure. Cần nghe thử phát âm, đặc biệt mã phòng, hướng rẽ và tên thủ tục; kiểm tra tự động không thay thế nghe thực tế.

Trạng thái tải xuống được quyết định bằng manifest và đủ WAV hợp lệ, kể cả khi Kaggle CLI trả mã thoát khác 0 sau khi đã tải đủ file. Nếu tải thiếu / sai bộ, công cụ giữ kết quả để xử lý tiếp và không kích hoạt bộ lỗi. Khi khởi động lại, công cụ kiểm tra nội dung / mã SHA-256 của bộ đã cài và khôi phục trạng thái hoàn tất thay vì yêu cầu sinh lại.

Cũng có thể tải `voice/navigation-nhat-phong/vinmec-navigation.ipynb` lên một notebook Kaggle riêng tư, bật Internet / GPU T4 rồi Run All. Cách này không cần `kaggle.json`. Tải ZIP kết quả, giải nén và nhập:

```powershell
npm.cmd run voice:import -- --from D:\duong-dan\thu-muc-WAV
```

`GET /api/health` có `speechSource: "recorded-omnivoice"` và `speechRecordings: 344` khi đã cài đủ bộ mở rộng. Trước lần sinh bổ sung, ứng dụng vẫn dùng 232 câu đã có. Bộ câu chờ / kết quả / giới thiệu hành trình được xuất để dùng thêm; nút loa hiện đọc các mô tả chỉ đường theo UI. WAV và kết quả job không được đưa vào Git. Khi sửa bản đồ / lời đọc, chạy lại prepare và sinh bộ có mã nội dung mới.

### Azure Speech dự phòng

Tạo tài nguyên **Azure Speech**, chọn **Free F0** cho demo, rồi điền các biến phía server trong `.env` (xem [.env.example](.env.example)):

```dotenv
AZURE_SPEECH_KEY=khóa-của-tài-nguyên-Speech
AZURE_SPEECH_REGION=southeastasia
AZURE_SPEECH_VOICE=vi-VN-HoaiMyNeural
```

`AZURE_SPEECH_REGION` phải trùng vùng của tài nguyên đã tạo; `southeastasia` chỉ là ví dụ. Có thể đổi sang giọng nam `vi-VN-NamMinhNeural`. Khởi động lại server sau khi cấu hình. Khóa không được đưa vào frontend hoặc biến `VITE_`; cấu hình AI chatbot độc lập với cấu hình giọng đọc.

`GET /api/health` có `speechConfigured: true` khi đã cài file giọng hoặc có đủ cấu hình Azure; riêng `speechSource: "azure"` chưa xác nhận khóa có quyền truy cập dịch vụ. Cần bật loa để kiểm tra kết nối và nghe thử thực tế.

Loa mặc định bật. Nút loa lưu lựa chọn vào localStorage; đổi bước, đổi tab, đổi hành trình hoặc tải lại trang không làm mất lựa chọn tắt / bật. Đổi bước / tuyến, tắt loa hoặc rời màn sẽ hủy yêu cầu đang chờ và dừng âm thanh cũ; khi trở lại màn chỉ đường với loa bật, ứng dụng phát mô tả hiện tại. Hết một clip hoặc lỗi tải không làm tắt loa. Có nút Nghe lại khi lỗi mạng hoặc trình duyệt cần thao tác chạm để phát. Nếu bộ đã cài thiếu câu cho một chặng và chưa cấu hình Azure, API báo `SPEECH_RECORDING_MISSING`, giao diện giải thích chặng này chưa có bản ghi âm. Các lỗi mạng / dịch vụ / phát âm thanh khác vẫn hiện thông báo thử lại; không chuyển sang giọng Anh. Riêng Azure lưu tối đa 64 câu đã tổng hợp trong bộ nhớ để giảm gọi dịch vụ lặp lại; mất bộ nhớ đệm khi khởi động lại. WAV đã nhập được giữ trên đĩa. App vẫn cần kết nối tới server của ứng dụng để lấy file âm thanh.

F0 có hạn mức miễn phí; Standard tính phí theo lượng sử dụng. Xem [bảng giá Azure Speech](https://azure.microsoft.com/en-us/pricing/details/speech/), [giọng Việt được hỗ trợ](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts) và [REST API](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/rest-text-to-speech). Kiểm thử tự động dùng âm thanh mẫu và giả lập Azure, không gọi dịch vụ tính phí. Chỉ xác nhận chất lượng giọng thực tế sau khi có khóa hợp lệ và nghe thử.

## Trợ lý AI và cấu hình

Các tab người bệnh dùng chung một khung màn hình. Nội dung lượt khám / thông báo cuộn bên trong, thanh logo / hỗ trợ và điều hướng dưới luôn giữ vị trí. Trợ lý có bong bóng hội thoại, câu hỏi gợi ý, trạng thái đang trả lời, thử lại và ô nhập cố định; giữ hội thoại / bản nháp khi chuyển tab.

Thiết kế cấp dữ liệu từ SQLite và cách mở rộng hướng dẫn thủ tục: [Ngữ cảnh chatbot](assistant-context.md).

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

- **Đi lạc:** đã có cập nhật vị trí chủ động; chưa có QR, cảm biến vị trí hoặc phát hiện sai đường tự động.
- **Tạm rời viện giữa các thủ tục:** cập nhật vị trí khi quay lại giữ tiến độ và tính lại đường. Chưa có quản lý tạm rời, giữ lượt hoặc lấy lại lượt; cần nhân viên xác nhận quy tắc tiếp nhận.
- **Mất kết nối:** đã tách mốc đồng bộ trên điện thoại và mốc thay đổi dữ liệu hệ thống. Chưa có cache lượt khám ngoại tuyến bền vững; dữ liệu đang mở không bảo đảm còn sau khi tải lại/đóng trang. Giấy phải được in/lưu từ trước.

[Hiện trạng và phương án xử lý ba tình huống](simulation-spec.md#đi-lạc-tạm-rời-viện-và-mất-kết-nối).
