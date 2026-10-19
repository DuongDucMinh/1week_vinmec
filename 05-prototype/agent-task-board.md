# Bảng giao việc cho các agent thực thi prototype

Ngày 19/10/2026. **Đã hoàn tất vòng sửa bản đồ/giao diện, sau khi đóng R1–R4 ở vòng trước.** Executor A/B và vòng sửa đều dùng GPT-6.1 Sol; GPT-6 Astra review. Bản hiện tại có 110 tests/typecheck/build pass; cài dependency theo lock, audit 0. Review mới 39/39 hashes khớp, không có finding P1/P2 trong phạm vi rà. 8 E2E là bằng chứng giao diện cũ; UI mới chưa chạy browser lại. Xem [báo cáo](test-report.md), [review log](review-log.md) và [báo cáo bản đồ mới](ui-map-revision.md). AI LIVE và thử người dùng còn thiếu; giữ nguyên dữ liệu phỏng vấn.

**Cách dùng model theo yêu cầu người làm bài**

- gpt-6-astra: lập/phản biện kế hoạch và review code; đã xác nhận R1–R4 CLOSED sau vòng sửa cuối.
- gpt-6.1-sol A/B: viết code, tests và sửa findings, dùng reasoning high. Giao nhiệm vụ theo các gói dưới đây, không đưa cả repo cho hai agent cùng sửa.
- Điều phối giữ hợp đồng và đọc kết quả; thay đổi package/shared do A thực hiện sau khi thống nhất. Không cần tạo chat/worktree mới cho bảng phân công này.

| ID | Gói việc | Chủ sở hữu | Phụ thuộc | Điều kiện bàn giao | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| PLAN-01 | Plan, hợp đồng đề xuất và rà plan | Astra + điều phối | Nguồn hiện có | Chốt reset, doctor lifecycle, quyền xem kết quả, SSE handshake và ranh giới file | Đã lập/rà, đã sửa theo phản biện |
| BUILD-00 | Scaffold, package/lock, scripts, shared schemas, fixtures tối thiểu | Sol A | PLAN-01 | Cài/build được; schemas/command/API contract thống nhất | Đã có, build/lock checks pass |
| BUILD-10 | Domain, next action, queues, graph routing và tests | Sol A | BUILD-00 | Hai mode × hai thứ tự đúng; invalid transition bị chặn | Đã có, tests pass |
| BUILD-11 | SQLite, command transaction/receipt, snapshot/SSE/reset | Sol A | BUILD-10 | Retry/reset/reconnect/restart đúng; không làm hai engine | Hoàn tất; generation và regression đạt |
| BUILD-20 | Shell/ba màn, progress/inbox/readiness/doctor workflow | Sol B | BUILD-00 | UI dùng fixture đúng contract; xem kết quả giả và hai cột đầy đủ | Hoàn tất mobile 360/390; R4 đã đóng |
| BUILD-21 | SVG map/text route, paper print, kết nối/lỗi | Sol B | BUILD-20 | Điểm đầu rõ; tuyến cùng graph; giấy có lối hỗ trợ | Đã có, E2E/ảnh pass |
| BUILD-30 | Ghép API thật và ba tab | A: server; B: client | BUILD-11/21 | Hai chế độ xuyên suốt; state không lệch hoặc rollback | Hoàn tất; R1 CLOSED |
| BUILD-40 | AI adapter, context/fact selection/renderer, eval | A: server/tests AI; B: panel | Shared ổn; LIVE cần credential/model | Câu hỏi dựa trạng thái; LIVE có log thật, fallback có nhãn | Adapter/fallback hoàn tất, R2/R3 CLOSED; LIVE chưa đạt |
| TEST-50 | SIM-01–11, race/recovery, AI cases, responsive | A: domain/server/AI; B: client/E2E | BUILD-30/40 | Có output kiểm tra thực, ghi rõ phần chưa chạy | 110 tests đạt; E2E cũ 8 ca, bản mới chưa chạy browser; giới hạn LIVE đã ghi |
| REVIEW-60 | Đọc code độc lập tại snapshot ổn định | Astra | TEST-50 và source đã ghép | Findings có file/dòng/tái hiện; không còn P0/P1 hoặc vi phạm bắt buộc | R1–R4 CLOSED; không còn P1/P2 trong phạm vi fixes đã rà |
| FIX-61 | Sửa findings + regression có căn cứ | Sol A/B theo file | REVIEW-60 | Kiểm tra lại phần ảnh hưởng; Astra rà bản sửa liên quan | Hoàn tất |
| USER-70 | Thử 2–3 người và sửa theo quan sát | Người làm bài; Sol sửa | Bản ổn định; người có đồng ý | Log thật, trợ giúp/lỗi/thời gian quyết định; không bịa dữ liệu | Chưa thực hiện |
| DOC-80 | README/prompt/changelog/test report/review log/demo guide | Điều phối | Kết quả các gói trước | Chạy được theo hướng dẫn; không key/DB/log riêng trong repo | Hoàn tất báo cáo, cách chạy, ảnh và output xác minh |

**Mẫu giao cho Sol A**

Phạm vi: package/build config, src/shared, src/domain, src/server, data, tests/domain, tests/server, tests/ai. Thực hiện đúng gói hiện được giao, không đổi quy tắc mô phỏng. Mọi trạng thái do server xác nhận; mọi giao diện dùng cùng domain. Reset có receipt bền qua reset, command có run/revision và kiểm tra trùng/nghiệp vụ. Không sửa src/client hoặc tests/e2e. Nếu cần đổi contract/dependency, báo điều phối trước để B không tiếp tục theo bản cũ. Bàn giao file sửa, hành vi đã có, kiểm tra thực đã chạy, lỗi/giới hạn; không báo hoàn tất AI thật nếu chưa có request model.

**Mẫu giao cho Sol B**

Phạm vi: src/client/assets, tests/client, tests/e2e. Dùng contract/fixtures từ A; không tự tạo luật canReturn/ready/queue riêng hoặc sửa package/shared/data. Bản đồ vẽ từ graph được cấp, hướng dẫn chữ cùng tuyến. Bệnh nhân mở từng kết quả giả sau công bố trong cả hai mode. Doctor giữ active selection khi người khác có kết quả. Gửi pending/unknown/confirmed đúng phản hồi server, không xác nhận ready bằng local state. Mock transport chỉ để phát triển; nối transport thật ở BUILD-30. Bàn giao ảnh/kiểm tra theo thiết bị đại diện, kết quả E2E thực và giới hạn.

**Mẫu giao cho Astra khi rà code**

Chỉ đọc/phân tích source và bằng chứng ở snapshot đã ngừng sửa. Đối chiếu simulation spec, implementation plan, SIM-01–11 và các ca concurrency/AI bổ sung. Ưu tiên sai gate, trùng lượt/thông báo, reset và SSE mất sự kiện, doctor lifecycle, mất ACK, quyền xem kết quả, AI stale context và lối giấy khi lỗi. Findings phải hành động được, có file/dòng/điều kiện/tác động; không mở scope. Việc sửa trả đúng Sol sở hữu file. Đây là review code, không thay kiểm thử người dùng hoặc xác nhận hệ thống bệnh viện.

**Quy tắc tích hợp**

Chỉ mở BUILD-20 khi BUILD-00 đã chốt shared contracts. A/B có thể chạy song song trong ranh giới file, không cùng sửa package.json/lock/entry/shared. Khi một bên cần đổi contract, điều phối thông báo phiên bản mới cho bên còn lại. Trước REVIEW-60 ghi manifest các file/revision kiểm tra và tạm dừng writes; review không chạy trên code liên tục đổi.

Chưa có kết nối AI thì tiếp tục gói độc lập, đánh dấu BUILD-40-LIVE chưa đạt, không thay bằng canned answer rồi đổi nhãn. Chưa có browser runner thì ghi TEST-E2E chưa chạy và giải quyết setup; không coi build pass là UI đã được kiểm tra. Không tạo người thử hoặc log người dùng giả để đóng USER-70.
