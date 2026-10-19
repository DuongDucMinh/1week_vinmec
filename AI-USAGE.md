# Nhật ký dùng AI

Phân biệt nội dung AI hỗ trợ với bằng chứng do người thực hiện thu thập. Không gửi dữ liệu cá nhân/sức khỏe vào AI.

| Ngày | Công cụ/mô hình | Phần được hỗ trợ | Đầu vào | Kiểm tra của người làm bài |
| --- | --- | --- | --- | --- |
| 16/10/2026 | Codex; chưa ghi định danh mô hình cụ thể | Sườn repo, mẫu ghi chép, câu hỏi nháp, checklist, khung kế hoạch | Tài liệu đề bài được cung cấp | [CẦN ĐIỀN: đã đọc và chỉnh gì] |
| 16/10/2026 | Codex | Viết lại `01-phong-van/interview-guide.md`; thêm `05-prototype/prototype-test-guide.md` | Đề bài và hội thoại do người dùng gửi: https://chatgpt.com/share/6ad11a05-72dc-83ec-8ae6-66b228905da0 ; đọc được ngày 17, ngày 18 P1–P3, chưa thấy ngày 19 | [CẦN ĐIỀN: chọn khoảnh khắc, rà soát câu hỏi và phạm vi đồng ý trước khi dùng] |
| 16/10/2026 | Codex | Mở rộng Q1 thành tổng quan từ đặt lịch/đến trực tiếp tới nhận kết quả; bổ sung đào sâu thao tác, xác nhận hoàn tất và chuyển bước | Yêu cầu trực tiếp của người dùng trong chat | [CẦN ĐIỀN: rà soát và dùng thử guide; chưa có kết quả phỏng vấn] |
| 18/10/2026 | Codex | Đọc đủ PDF cập nhật 7 trang; hệ thống hóa 48 mục P1 + 39 mục P2; pain/insight/journey/need sơ bộ; nguồn quốc tế; experiment brief; rủi ro và trạng thái bài nộp | `note_interview.pdf` và xác nhận trực tiếp của người phỏng vấn; nguồn CUH/Mayo Clinic ghi ở `04-best-practice/best-practices.md` | Đã kiểm tra ảnh cả 7 trang; người dùng xác nhận ngày/thời lượng, đồng ý sử dụng, ghi chú diễn giải, chủ thể ý tưởng map, ước lượng chờ, hủy qua điện thoại và phiên UI; chưa có P3/test/prototype |

Mỗi lần dùng tiếp: bổ sung ngày, công cụ/mô hình, prompt hoặc link prompt, file ảnh hưởng, nội dung giữ lại, nội dung sửa và cách kiểm chứng. Không dùng AI để bịa phỏng vấn hoặc số liệu.

## Bổ sung ngày 18/10/2026 - P3 tự thuật

Codex hệ thống hóa trải nghiệm người làm bài cung cấp trực tiếp trong chat thành P3, 14 mục; bổ sung PAIN-16/17 và I-10; cập nhật journey, need statement và experiment brief về chờ nhận kết quả. Nguồn mới là tự thuật, không phải phỏng vấn ngày 17/10 hoặc nhật ký MyVinmec. Các suy đoán/giả định được giữ đúng loại; chưa có timestamp để tính thời gian tiết kiệm, chưa có prototype/test.

## Bổ sung ngày 18/10/2026 - người làm bài làm rõ phạm vi sản phẩm

Codex đối chiếu ý tưởng với đề và tài liệu trong repo, lưu bản phân tích trong outputs/doi-chieu-y-tuong-huong-dan-kham.md. Sau phản hồi tiếp theo, cập nhật need statement, experiment brief và các mô tả phạm vi liên quan: hướng dẫn chuyển bước xuyên chuỗi khám tại viện, địa điểm/đường đi và kết quả song song; không chỉ một đoạn A vừa xong. Bản phân tích cũ giữ nhãn lịch sử. Thêm workflow đề xuất, không sửa dữ liệu P1/P2/P3.

Đã đọc nguồn Vinmec chính thức về dữ liệu trực tuyến/MyVinmec và hướng dẫn kết quả Covid-19, ghi tại 01-phong-van/vinmec-result-workflow-notes.md. Phân biệt chức năng được mô tả công khai với quy trình ngoại trú chưa xác minh; nhánh điện tử là giả định ưu tiên của demo, nhận giấy cấu hình theo dịch vụ. Chưa có prototype, tích hợp, người thử hoặc số liệu hiệu quả mới.

## Bổ sung ngày 19/10/2026 - quy tắc mô phỏng được người làm bài cung cấp

Nguồn mới là câu trả lời trực tiếp của người làm bài về Ocean Park 2, Nội, Siêu âm ổ bụng/Xét nghiệm sinh hóa máu; hai chế độ cho cả lượt; kết quả đồng thời cho hai vai trò nhưng bác sĩ cập nhật nền; đủ toàn bộ kết quả mới quay lại; người bệnh tới ngoài phòng tự xác nhận sẵn sàng; hai cột bác sĩ và lời gọi mở kết quả/lịch sử giả; giấy hướng dẫn dự phòng.

Codex hệ thống hóa thành 05-prototype/simulation-spec.md, 05-prototype/data/simulation-config.json, CONF-14–21 và đồng bộ brief/need/workflow/nguồn/README/trạng thái/rủi ro/hướng dẫn thử. Cụ thể hóa nhánh giấy phải nhận đủ hai bản, chống hàng chờ trùng, lối đăng ký sẵn sàng thủ công và lưu ý nút sẵn sàng chưa xác thực vị trí; các lựa chọn này được ghi đúng là thiết kế. Không sửa dữ liệu P1/P2/P3 hoặc coi câu trả lời về mô phỏng là xác minh từ bệnh viện.

Chưa có ứng dụng, dữ liệu bệnh nhân, kết quả thật, buổi thử hoặc số liệu hiệu quả mới. JSON chỉ chứa cấu hình mô phỏng; các ca SIM-01–11 là tiêu chí chưa chạy. Đã rà cấu trúc cấu hình và liên kết tài liệu, không gọi đó là kiểm thử ứng dụng.

**Rà điểm đau và mức sẵn sàng xây prototype ngày 19/10:** theo câu hỏi người làm bài, Codex kiểm tra journey đã có cột Pain/nguồn; bổ sung nhãn mô tả và màu trên workflow hiện trạng, bảng truy điểm đau → thiết kế → cách thử, giữ riêng nhánh điều kiện của P2 và workflow giải pháp. Kiểm tra đặc tả/cấu hình đã đủ nghiệp vụ để bắt đầu; src vẫn chỉ có .gitkeep, prompt/cấu hình mô hình còn chưa triển khai. Chưa có ứng dụng hoặc kết quả thử AI. Không thu thập hay ghi giá trị khóa API; thông tin bí mật không được đưa vào repo/chat.

**Lập kế hoạch multi-agent ngày 19/10:** người làm bài cho phép model lớn lập plan/rà code và model nhỏ thực thi. Codex dùng subagent gpt-6-astra (reasoning high) đọc nguồn/phản biện kiến trúc, sau đó đọc lại draft implementation-plan; đã sửa các điểm reset idempotent, vòng đời activeEncounter, bệnh nhân xem kết quả giả và SSE handshake. Lưu implementation-plan.md và agent-task-board.md trong 05-prototype. Hai agent gpt-6-luna được phân công tương lai, chưa chạy code; review code sau triển khai chưa diễn ra.

Đã đọc OpenAI Docs, tài liệu Node/Vite/Vitest/Playwright/MDN chính thức cho các quyết định kỹ thuật, dẫn tại plan. Kiểm tra Node v24.11.1 và SQLite in-memory thành công, ghi nhận cảnh báo experimental. Chưa cài dependency, gọi model API, tạo Site/host, chạy app/browser tests hoặc thử người dùng. Kết quả rà plan và smoke runtime không thay bằng chứng kiểm thử ứng dụng. Không tạo/đọc/in giá trị khóa API.

## Bắt đầu thực thi ngày 19/10/2026

Người làm bài yêu cầu đổi cả Executor A và B sang GPT-6.1 Sol và bắt đầu theo plan; giao diện bệnh nhân phải theo màn hình điện thoại. Hai subagent GPT-6.1 Sol, reasoning high đã được giao backend/domain/AI và frontend/bản đồ/E2E theo ranh giới file; GPT-6 Astra tiếp tục là reviewer sau khi có bản ghép. Điều phối cập nhật tài liệu và kiểm tra tích hợp. Shared contracts/scaffold đầu tiên đã được bàn giao giữa hai executor. Thông tin model cũ ở phần lập kế hoạch là lịch sử, không phải model đang viết code.

Đã đọc skill Sites để thực hiện local theo kế hoạch được duyệt và OpenAI Docs để chuẩn bị adapter phía server. Chưa tạo Site hoặc triển khai công khai. Việc chuẩn bị kết nối AI không bao gồm đưa khóa vào chat/source; LIVE chỉ được ghi khi có request thật thành công. Tiến độ và bằng chứng cuối được cập nhật sau kiểm tra, không coi code sinh ra là kết quả thử người dùng.

## Triển khai, kiểm tra và review ngày 19/10/2026

Executor A GPT-6.1 Sol viết shared/domain/backend/SQLite/Responses adapter và tests; Executor B GPT-6.1 Sol viết patient mobile, doctor/control, SVG map, print/offline, client/E2E. Điều phối kiểm tra trực tiếp luồng quầy → Nội → dịch vụ/kết quả bằng browser và chạy lại 54 tests ở bản đầu. B chạy Chrome E2E thật 5/5 pass, xuất ảnh 360/390/desktop. Các đối tượng đều tự tạo; không sửa P1/P2/P3 hoặc tạo log thử người dùng.

GPT-6 Astra review source đóng băng theo manifest, tái hiện bốn findings: client nhận ACK cũ sau reset, AI facts sai sau ready/hoàn tất, timeout fallback và focus keyboard modal. A/B đang sửa theo ranh giới sở hữu và thêm regression; kết quả cuối ở test-report/review-log. Điều phối đọc ảnh và cập nhật hướng dẫn/prompt/changelog/trạng thái bài nộp, không dùng build pass thay bằng chứng user study.

Model API mặc định `gpt-5.6-terra` được kiểm tra ở trang model OpenAI chính thức, không suy từ tên model executor. Người làm bài chọn dùng OpenAI Developers; kết nối/credential chưa được xác nhận. Điều phối chạy CLI eval 24 câu thật khi chưa có key: cả 24 NOT_LIVE, không gọi provider thành công. Tests 24 ca dùng mock chỉ xác nhận facts/renderer. Không tạo, đọc hoặc in khóa bí mật; `.env`/DB/runtime/test traces được Git bỏ qua. Chưa host/push/gửi bài hoặc gửi tin cho người khác.

## Kết quả bàn giao code ngày 19/10/2026

GPT-6 Astra xác nhận R1–R4 CLOSED sau vòng bổ sung feedback lỗi/mất ACK bên trong native dialog. Vòng sửa frontend tiếp tục dùng GPT-6.1 Sol; thêm 4 DOM integration tests với real App/useSimulation và SSE/fetch giả, có stub native dialog. Trước đó Chrome E2E đạt 8/8; browser không chạy lại sau feedback nhỏ do cơ chế quyền từ chối quan sát trang QA. Không dùng browser khác để vượt quyền, không gọi các DOM tests là browser proof.

Npm audit phát hiện 3 cảnh báo dev tooling, executor nâng riêng Vitest 3.2.7 → 5.0.5 sau kiểm tra tài liệu/metadata chính thức tương thích Node24/Vite7. Điều phối chạy lại **75/75 tests, typecheck và audit 0**; executor build pass 37 modules. Source/tests/config đã review không đổi sau đó, chỉ package/lock; có manifest release và output tổng hợp. Backend QA hai lần process restart giữ trạng thái DB giả; không suy thành UI reconnect production đã quan sát.

Vòng sửa bản đồ/giao diện tiếp theo theo ảnh tham chiếu và yêu cầu trực tiếp của người làm bài: hai executor GPT-6.1 Sol triển khai sơ đồ tổng quan tòa/lối nối, chi tiết tầng/phòng A201/A205/B105, chỉ dẫn từng chặng và giao diện ít chữ hơn. Đây là các vị trí/mã phòng tự quy ước, không phải thông tin bệnh viện đã xác minh. GPT-6 Astra rà lại source đóng băng 39/39 hashes khớp và không có finding P1/P2 trong phạm vi rà. Điều phối chạy 110/110 tests, typecheck/build đạt và kiểm tra bốn hình xuất từ thành phần SVG; không chạy browser/E2E UI mới. Chưa thêm buổi thử người dùng, kết quả nghiên cứu hoặc request AI LIVE. Chi tiết: [báo cáo vòng sửa](05-prototype/ui-map-revision.md).

Luồng OpenAI Platform yêu cầu xác thực và được chấp nhận, nhưng tool chọn project/key không còn khả dụng trong phiên để tiếp tục. Không tạo/ghi khóa; kiểm tra boolean cho biết `.env` chưa có và API key chưa cấu hình. AI LIVE/NLU thật vẫn chưa đạt, log người dùng vẫn trống. [Báo cáo đầy đủ và cách chạy](05-prototype/implementation-report.md) ghi phần đã làm, ảnh thật và phần còn thiếu; không coi đây là bài nộp hoàn chỉnh.

## Hoàn thiện rủi ro, coach và nội dung slide ngày 19/10/2026

Theo yêu cầu người làm bài, Codex viết lại risk-register thành 11 rủi ro cụ thể theo thiết kế/code và bằng chứng kiểm tra hiện có; tách biện pháp đã có với phần chưa kiểm chứng. Nêu rõ fallback hành chính chưa bảo đảm xử lý khẩn cấp, nút sẵn sàng chưa xác thực vị trí và ba vai trò demo chưa phải phân quyền production. Đọc trang Vinmec Ocean Park 2 chính thức, xác minh số liên hệ chung 024 3975 1800; không coi là số cấp cứu trực tiếp. Chưa liên hệ cơ sở hoặc kiểm thử đường chuyển.

Codex viết coach plan dưới dạng kế hoạch tương lai, không tạo kinh nghiệm cá nhân; xuất PDF một trang, kiểm tra số trang và ảnh render. Soạn nội dung và ghi chú cho 10 slide, hoàn thiện 1–6 và 9–10 theo bằng chứng hiện có, giữ 7–8 chờ thử người dùng và sửa sau thử. Tên/khóa chưa được cung cấp; không suy từ tài khoản. Nội dung nghiên cứu thiếu và AI chưa LIVE vẫn công khai.

Đã tìm/cài Canva qua Plugin Management và thử tạo thiết kế bằng brief đã ẩn danh. Ba lần gọi trả thông báo xác thực được chấp nhận rồi yêu cầu thử lại, chưa có job_id/design ID/link thiết kế. Chưa tạo thành công deck Canva hoặc slides.pdf; giữ outputs/slides-content.md và outputs/canva-brief.md để tiếp tục. Không dùng ảnh người bệnh, ghi chú thô, dữ liệu sức khỏe hoặc khóa API trong brief; không tạo nghiên cứu, kết quả thử hoặc số liệu hiệu quả mới. Không push hoặc gửi email trong lần này.


## Tiếp tục Canva sau khi kết nối thành công

Người dùng xác nhận đã kết nối và yêu cầu tiếp tục. Canva tạo thiết kế DAHYcDprhkU, đúng 10 trang. Codex đọc lại richtexts và kiểm tra ảnh xem trước của cả 10 trang; sửa lỗi chữ/nguồn, gắn link nguồn chính thức, bỏ hình giao diện tự dựng và sơ đồ ngoài phạm vi; giữ trang 7–8 chờ bằng chứng. Có ảnh xem trước tổng hợp tại outputs/canva-preview.png. Các sửa đổi đang trong transaction 4350996691828529069, chờ người dùng xem trước và xác nhận theo yêu cầu công cụ Canva, chưa commit. Không tạo số liệu hoặc log người dùng.

Đã thử tải ảnh bản đồ mô phỏng từ prototype lên Canva để dùng minh họa, nhưng lượt truyền bị lỗi mạng/HTTP 403, chưa nhận asset ID. Không coi là ảnh đã tải lên hoặc đã chèn vào slide. Chưa xuất slides.pdf, không thay đổi chia sẻ hoặc gửi bài. Trạng thái mới thay mô tả lỗi kết nối trước đó.


## Cập nhật slide theo yêu cầu trực quan hóa ngày 19/10/2026

Người làm bài yêu cầu flow trực quan có dấu X đánh dấu điểm đau, bỏ mã bằng chứng khỏi mặt slide, thêm sơ đồ/biểu đồ và không phỏng vấn thêm người thứ ba. Codex giữ mô tả đúng 2 phỏng vấn + 1 tự thuật; không tự đổi yêu cầu đề gốc. Bản v2 dùng sơ đồ quy trình, quan hệ và timeline, không tạo số liệu đo hoặc biểu đồ hiệu quả giả.

Dựng 10 slide bằng Artifact Tool với chữ/đối tượng sơ đồ native, font Arial, xuất và kiểm tra đầy đủ PNG, chạy finalizer đạt cấu trúc/font/geometry và import lại. Nhập PPTX qua plugin Canva thành design DAHYcVtqfcw, 10 trang, đã lưu; đọc lại nội dung Canva thấy 146 richtexts và không có mã nghiên cứu trên mặt slide, xem ảnh trang 3/6/10 sau nhập. Trang 7–8 giữ kế hoạch/chờ bằng chứng. Source và validation trong outputs/slides-v2 và work/canva-v2. Bản cũ giữ lịch sử. Không có kết quả AI LIVE hoặc buổi thử người dùng mới.


## Phong cách doanh nghiệp và chuyển cảnh ngày 19/10/2026

Người làm bài yêu cầu giảm sơ đồ, thay đổi bố cục và dùng ít hiệu ứng để tiết kiệm token. Codex dựng v3 với bìa navy, số liệu lớn, need statement dạng tuyên bố, nội dung editorial, chỉ giữ sơ đồ ở 3/6/10. Nội dung nghiên cứu và hai trang chờ giữ đúng trạng thái. Artifact Tool xuất native PPTX, render và finalizer báo pass cấu trúc/font/geometry/import. Canva nhập design DAHYdBY5bRA thành công, 10 trang.

Sau khi người dùng đăng nhập Canva trong IAB, Codex thao tác trực tiếp: Add transition, chọn Dissolve, đặt duration 0.4 giây, Apply between all pages. UI xác nhận Transition applied to all pages, Dissolve value 1 và duration 0.4. Ảnh bằng chứng outputs/slides-v3/canva-transition-proof.png. Không thêm hiệu ứng từng đối tượng. Thay đổi trực tiếp Canva tự lưu; file PPTX cục bộ không tự có hiệu ứng mới này. Không có dữ liệu nghiên cứu hoặc test người dùng mới.


### Minh họa Canva v4 — 19/10/2026

ImageGen tạo hai minh họa ý tưởng (người bệnh suy nghĩ, bác sĩ trao đổi), không phải ảnh nghiên cứu. Icon dùng Lucide v1.8.0 (ISC), nét đơn xanh lam. Prompt và nguồn: `outputs/slides-v4/assets/provenance.md`. Codex bố trí hình trên 10 trang bằng artifact-tool, kiểm tra render và cấu trúc PPTX, nhập bản mới lên Canva; đặt Dissolve 0.4 giây giữa toàn bộ trang và xác nhận UI. Trang 7–8 vẫn chờ kết quả thử thật.


### Canva v5 — bổ sung rủi ro và minh họa

Tổng hợp 5 nhóm rủi ro và biện pháp từ risk-register.md, giữ giới hạn chưa triển khai thực tế. ImageGen tạo thêm 4 hình ý tưởng cho trang 2,4,8,10; hình không phải ảnh người tham gia hoặc sự kiện thực tế. Prompt: outputs/slides-v5/assets/provenance-v5.md. Native PPTX qua artifact-tool, kiểm tra render và các validator đạt; nhập Canva để chỉnh sửa.


## 19/10/2026: phản hồi 2 người và sửa chỉ đường

Người làm bài cung cấp phản hồi T1/T2. Codex hỗ trợ ghi log diễn giải, giảm chữ thừa, thêm TTS trình duyệt, chỉ dẫn từng mốc, phục hồi khi đi nhầm và liên kết Google Maps minh họa. Không tạo số đo hoặc lời nói nguyên văn. Xem 05-prototype/user-feedback-revision.md.
