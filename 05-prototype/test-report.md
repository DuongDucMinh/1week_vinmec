# Kiểm tra bản mở rộng khoa và reset từng bệnh nhân — 19/10/2026

**131/131 Vitest, 12/12 Playwright đầy đủ và 1/1 ca bản đồ bổ sung đều đạt.** Build và TypeScript đạt. Xem [báo cáo bản hiện tại](departments-reset-revision.md), [JSON kiểm thử](outputs/departments-reset/vitest-results.json), [Playwright đầy đủ](outputs/departments-reset/playwright-full.json) và [bản đồ tên dài](outputs/departments-reset/playwright-map.json).

Phạm vi mới: 5 khoa, 9 thủ tục, tiếp nhận mới hiện khoa ở app, danh sách bác sĩ riêng, quay về đúng phòng ban đầu và reset riêng không ảnh hưởng người khác. Các báo cáo dưới đây giữ làm lịch sử phiên bản trước.

---

# Kiểm tra luồng giấy / app — 19/10/2026

Bản hiện tại dùng danh sách mọi chỉ định tại từng phòng, gọi theo giấy / số thực tế, tự sẵn sàng sau thủ tục cuối và dừng demo khi quay lại bác sĩ Nội. [Hướng dẫn](README.md) · [Báo cáo thay đổi](paper-workflow-revision.md) · [Bằng chứng tổng hợp](outputs/paper-workflow/verification.json).

| Kiểm tra | Kết quả |
| --- | --- |
| Vitest đầy đủ | **120/120 đạt**, 11 files; [JSON](outputs/paper-workflow/vitest-results.json) |
| Playwright đầy đủ | **10/10 đạt**, 59 giây |
| Sau sửa trình bày cuối | **16/16** Vitest liên quan và **2/2** Playwright liên quan đạt; báo cáo HTML mới nhất chứa hai ca tập trung này |
| TypeScript / build cuối | **Đạt**, 39 modules |
| Taste Skill lint | **0 FAIL**, 2 WARN overlay |
| Taste Skill inspect | **0 FAIL** trên cả 4 màn ở 1440 / 768 / 390 px; đã xem ảnh và ghi lý do WARN trong báo cáo |
| Cài đặt phòng mở ở 3 kích thước | Hai bộ chọn hiện đủ, không tràn ngang |
| AI LIVE / thử người dùng thật | Chưa có bằng chứng mới; mock AI và test phần mềm không thay thế việc này |

Ca mới bao gồm bệnh nhân không mở app, mọi phòng thấy ngay sau chỉ định, tìm tên có dấu / không dấu / viết hoa hoặc mã, thứ tự gọi theo giấy khác thứ tự danh sách, làm thủ tục khác thứ tự gợi ý, khay giấy / máy lấy số, tự về cột sẵn sàng trước kết quả, idempotency / cập nhật đồng thời, lưu cấu hình qua reset / restart và đọc dữ liệu lượt cũ.

## Báo cáo lịch sử bên dưới

Các con số và luồng bên dưới thuộc các phiên bản trước, được giữ để truy vết.

# Báo cáo kiểm tra prototype

Cập nhật 19/10/2026 sau vòng sửa bản đồ và giao diện. Đây là kiểm tra phần mềm; chưa có thử người dùng thật hoặc xác minh sơ đồ cơ sở Vinmec.

## Kết quả phiên bản hiện tại

| Kiểm tra thực | Kết quả | Bằng chứng/phạm vi |
| --- | --- | --- |
| Full suite Vitest 5.0.5 | **110/110 PASS, 10 files** | Điều phối chạy trực tiếp sau khi đóng băng lần sửa cuối; [JSON output](outputs/map-revision/test-results.json) |
| TypeScript | **PASS** | Typecheck riêng của hai executor và `tsc --noEmit` trong build cuối |
| Production build | **PASS, 37 modules** | Điều phối chạy sau full suite; Vite 7.3.7 |
| Review GPT-6 Astra | **Không còn finding P1/P2 trong phạm vi rà** | 39/39 SHA256 khớp [manifest cuối](outputs/review-manifest-map-ui.json) |
| Bản đồ xuất SVG/PNG | **Đã mở và kiểm tra 4 hình** | Tổng quan, tầng A1, A2, B1; xuất từ chính thành phần React SVG, không phải screenshot app |
| Cài lại dependency | **npm ci thành công, audit 0** | Registry chính thức, giữ nguyên package/lock; thư mục thư viện cũ bị lỗi quyền Windows được giữ trong runtime bỏ qua bởi Git |
| Browser/E2E bản mới | **CHƯA CHẠY** | Source E2E đã cập nhật; không dùng kết quả bản cũ để chứng minh UI mới |
| AI LIVE | **Chưa kết nối thành công** | 24 eval trước vẫn NOT_LIVE; mock không kiểm tra NLU thật |
| Thử 2–3 người | **Chưa thực hiện** | [Log người thử](user-test-log.md) chưa có dữ liệu thật |

Môi trường đã kiểm tra: Windows, Node 24.11.1, React 19.3.1, TypeScript 5.9.3. Các dependency được chốt trong package-lock. Chưa thử cài trên máy khác.

## 110 tests bao phủ những gì

| File | Số ca | Phạm vi |
| --- | --- | --- |
| `tests/domain/engine.test.ts` | 9 | Hai mode × hai thứ tự, gate thực hiện/kết quả/giấy/ready, doctor lifecycle, notification và route |
| `tests/domain/routes.test.ts` | 23 | 20 tuyến có hướng giữa cổng/quầy/A201/A205/B105; chi phí ngắn nhất đã biết, cạnh nối liên tục, đổi tầng/tòa, hướng trái/phải, cùng điểm và điểm đầu chưa xác nhận |
| `tests/domain/presentation.test.ts` | 3 | Đổi đúng câu fixture cũ; không sửa stored run, workflow, revision, nội dung tự nhập hoặc biên nhận lệnh |
| `tests/server/repository.test.ts` | 6 | Receipts, retry/hash conflict, reset generation, legacy migration, lưu bền SQLite |
| `tests/server/http.test.ts` | 11 | HTTP + SQLite, race ready/call/withdraw/reset, SSE/reconnect, staff fallback, timeout provider |
| `tests/ai/assistant.test.ts` | 17 | Context/schema/facts, refusal/fallback/stale, hướng dẫn đúng phase, deadline |
| `tests/ai/evaluation.test.ts` | 24 | Provider mock chọn intent/fact theo fixture; facts/renderer, không phải 24 ca model thật |
| `tests/client/snapshot.test.ts` | 4 | Monotonic generation, late ACK và revision cũ |
| `tests/client/dialog-feedback.test.tsx` | 4 | Pending/rejection/mất ACK trong ready/reset dialog; retry đúng envelope và command ID, chỉ đóng khi ACK thành công |
| `tests/client/map-ui.test.tsx` | 9 | Hai mức bản đồ, số phòng và segment đúng tầng, service destination, điểm xuất phát chưa biết, ngôn ngữ ba vai trò, AI chưa kết nối, help thường/tùy chọn công cụ, bỏ chữ lặp |

Các DOM tests dùng jsdom. Native dialog platform được stub ở các ca cần mở hộp thoại, nên chúng không chứng minh top-layer/inert, bẫy focus hoặc bố cục thật trên điện thoại. Test routing đối chiếu thêm bảng khoảng cách cố định; không chỉ gọi lại cùng implementation để tạo expected output.

## Kiểm tra hình và tính nhất quán bản đồ

Điều phối và reviewer mở trực tiếp các PNG trong [outputs/map-revision](outputs/map-revision). Số phòng và tên ngắn đọc được trong bản xuất; route không đè lên nhãn phòng. Sơ đồ A2 thể hiện Sinh hóa → hành lang → thang máy; A1 tiếp tục tới lối nối; B1 tiếp tục tới B105. Chỉ dẫn chữ dùng cùng nodeIds với đường tô. Không suy hướng quay mặt sau khi ra thang máy để gán rẽ trái/phải.

[Ảnh tổng quan](outputs/map-revision/overview.png), [A1](outputs/map-revision/floor-a1.png), [A2](outputs/map-revision/floor-a2.png), [B1](outputs/map-revision/floor-b1.png) là hình xuất từ `CampusMapSvg`/`FloorMapSvg` bằng React server renderer và Sharp; không phải ảnh chụp toàn bộ UI trong trình duyệt. Xem [báo cáo vòng sửa](ui-map-revision.md).

## Bằng chứng trình duyệt và restart của phiên bản trước

Bản trước vòng sửa giao diện có 8/8 Chrome E2E đạt, gồm hai mode, cập nhật nền, offline/reconnect, reset/late ACK, map/print/mobile và native dialog keyboard. Các ảnh tại `outputs/screenshots` cũng thuộc **giao diện cũ**. Sau đó bổ sung feedback modal rồi sửa UI/bản đồ hiện tại; không chạy lại browser vì công cụ quan sát trang QA bị từ chối quyền ở phiên trước. Không dùng browser khác hoặc CDP để vượt quyền đó.

Source [workflow.spec.ts](tests/e2e/workflow.spec.ts) đã đổi selectors theo nhãn/nút mới và tùy chọn `/patient?tools=1`, nhưng source được cập nhật không có nghĩa các ca đó đã chạy. Độ rộng 360/390 px, font trong browser, native focus/inert và in thực tế cần được quan sát lại trên phiên bản hiện tại.

Kiểm tra hai tiến trình backend trước đây giữ cùng run/generation/revision/phase/inbox sau restart: [backend-restart-check.json](outputs/backend-restart-check.json). Không dùng phép kiểm tra API đó để khẳng định đã thấy UI nối lại sau production restart.

## Review và giới hạn còn lại

Vòng trước, Astra đóng R1–R4: generation reset, facts AI theo phase, deadline provider/client và native dialog/inline error recovery. Vòng hiện tại, reviewer đọc lại graph/turns/đổi tầng, nhãn phòng, projection dữ liệu cũ, AI fallback, các gate và retry. Reviewer xác nhận 39/39 file khớp manifest cuối, không có finding P1/P2 có thể hành động trong phạm vi đã rà. [Review log](review-log.md).

AI LIVE chưa được cấu hình/kiểm tra thành công. Không có dữ liệu lâm sàng gửi model hoặc được tạo để thay kết quả thật. Chưa xác minh mã phòng, ETA, quy trình trả kết quả hoặc bản đồ tại bệnh viện; chưa đo hiệu quả giảm thời gian hay tối ưu tổng hành trình. [Guide thử người dùng](prototype-test-guide.md) và log vẫn tách khỏi QA phần mềm.


## 19/10/2026: sửa theo phản hồi T1/T2

TypeScript noEmit đạt; Vite build đạt. Bộ kiểm tra hiện có: 13 file, 143 tests đạt. Bài kiểm tra mới cho hướng rẽ và TTS đã thêm. Lần chạy riêng bị timeout khởi động worker, lần thử pool threads cũng timeout khởi động worker. Playwright luồng giọng đọc/rẽ/tìm lại đường chưa đạt: lần đầu server báo ENOMEM, lần thử dùng server hiện có timeout ở page.goto trước khi thao tác. Không nhận là đã kiểm tra nghe âm thanh thật hoặc đã xác minh E2E. Cần chạy lại voice-navigation.spec.ts khi máy đủ tài nguyên. Chưa thử lại với người dùng.

## Rà repo trước commit, 20/10/2026

TypeScript noEmit chạy lại đạt. Lần chạy lại toàn bộ Vitest gặp 3 ca server báo lỗi trong quá trình chạy: reset generation/persist (25,9 giây), slow provider fallback (8,4 giây), paper-only readiness (5,2 giây). Sau khi yêu cầu dừng, tiến trình trả tổng kết: 116 tests đạt, 3 tests timeout ở mức 5 giây, 3 file UI không khởi động được worker. Tổng thời gian báo cáo 197,86 giây. Không coi lần chạy này là đạt; chưa có đủ thông tin kết luận lỗi chức năng hay chỉ do tài nguyên. Kết quả 143 tests đạt ở phần trên là của lượt trước, không thay thế kết quả lượt này. Hai bài kiểm tra mới về TTS/hướng rẽ vẫn cần chạy lại.

Đóng gói: slides.pdf 10 trang, coach-plan.pdf 1 trang, PDF tại root khớp bản trong outputs. Đã kiểm tra trực quan hai trang PDF sửa. Git attributes giữ PDF/PPTX/ảnh dạng binary. Đã so khớp các tệp PDF/PPTX trong Git index với tệp gốc. Không thấy mẫu khóa phổ biến trong các tệp văn bản chuẩn bị đưa lên Git; đây là kiểm tra theo mẫu, không phải cam kết không thể có dữ liệu nhạy cảm.
