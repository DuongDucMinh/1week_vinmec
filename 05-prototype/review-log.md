# Nhật ký rà code

Ngày 19/10/2026. Reviewer dự kiến: GPT-6 Astra; Executor A/B: GPT-6.1 Sol theo yêu cầu người làm bài.

Rà kế hoạch đã hoàn tất trước triển khai. Rà code vòng đầu đã thực hiện trên source đóng băng trong [manifest](outputs/review-manifest.json), sau build và 54 tests/5 E2E pass. Reviewer đọc shared/domain/server/client, tests/config/data, chạy reproduction helper/bộ nhớ và kiểm tra UI bằng Chrome. Không gọi model thật hoặc sửa DB demo.

| ID | Mức | Finding và bằng chứng | Phần sửa được giao | Trạng thái |
| --- | --- | --- | --- | --- |
| R1 | P1 | `client/api.ts:4`: chuỗi A → reconnect C → ACK B tới muộn → C1 làm client nhận B, retire C và kẹt ở lượt cũ. Reviewer thực thi chính helper và nhận current B0, retired A/C. | Generation bền trong transaction reset; retry không tăng; client chặn generation cũ/cùng generation khác ID; skipped-run/late-ACK regression | **CLOSED** sau Astra rà bản sửa |
| R2 | P2 | `server/ai/assistant.ts:11`: facts RETURN/READINESS còn hướng quay lại/tự sẵn sàng ở READY, REVIEW_ENCOUNTER hoặc COMPLETED. Reviewer chạy buildFacts trong bộ nhớ. | Facts theo phase, phân biệt CALLED/IN_PROGRESS; 9 tổ hợp phase–intent và case đang trao đổi | **CLOSED** sau Astra rà bản sửa |
| R3 | P2 | `client/api.ts:66` và provider đều timeout 20 giây; client bắt đầu trước nên có thể abort trước khi backend gửi fallback. | Provider 15 giây/client 25 giây; HTTP slow-provider nhận FALLBACK trong khoảng chờ | **CLOSED** sau Astra rà bản sửa |
| R4 | P2 | `Patient.tsx:75` cùng mẫu Result/ready/reset: mở modal vẫn giữ focus ngoài; Tab tới nền; Escape không đóng. Reviewer tái hiện bằng Chrome. | Native Dialog có focus/Tab/Escape/restore; hai keyboard E2E pass. Shared CommandFeedback trong modal sửa pending/error/retry bị inert; 4 DOM integration tests thêm | **CLOSED** sau Astra rà vòng sửa cuối |

Số dòng trên thuộc snapshot ban đầu; sau sửa dùng source hiện hành. Reviewer chưa thấy lỗi material khác ở gates hai mode, thứ tự kết quả/giấy, hàng chờ, transaction/receipt hoặc subscribe-first SSE. Sự cố giữ SSE cũ trong lúc dev watcher sửa server chưa được tái hiện riêng ở production; tiếp tục kiểm tra trước kết luận.

Vòng rà bản sửa đã xác minh **37/37 hashes** ở [manifest sau fixes](outputs/review-manifest-after-fixes.json). R1–R3 được đóng. R4 có regression từ native top layer: App đặt error/pending/retry ngoài dialog, còn ready/reset chỉ đóng khi thành công. Khi request lỗi hoặc mất ACK, modal vẫn mở làm feedback/retry phía nền không tiếp cận được. Phát hiện bằng source; chưa tái hiện UI vòng này. Giao GPT-6.1 Sol sửa feedback trong modal hoặc đóng/chuyển focus phù hợp, thêm DOM component regression lỗi/mất ACK.

Browser đã từ chối quyền quan sát trang QA 3201 khi tiếp tục phiên sau; không dùng browser/Playwright khác để vượt quyền. Kiểm tra backend restart riêng bằng tiến trình và API tự tạo đã giữ trạng thái qua hai lần chạy; điều này không xác nhận UI tự reconnect sau production restart. Review không thay thử người dùng, đánh giá NLU thật hoặc xác minh quy trình bệnh viện.

## Kết luận vòng cuối

GPT-6 Astra xác nhận **R1–R4 CLOSED**, không thấy P1/P2 còn lại liên quan các bản sửa. [Manifest reviewer](outputs/review-manifest-final.json) khớp 39/39 hashes. CommandFeedback đặt alert/pending/retry trong ready/reset; unknown outcome khóa xác nhận mới, giữ retry nguyên commandId/envelope và chỉ đóng modal khi ACK thành công. Bốn DOM tests dùng real App/useSimulation, có stub native dialog; reviewer không nhận đó là browser test.

Sau closure, chỉ `package.json` và lock đổi để nâng Vitest lên 5.0.5 và engines Node tương thích. [Manifest release](outputs/review-manifest-release.json) xác nhận source/tests/config không đổi. Điều phối chạy lại **75/75 tests**, typecheck pass, npm audit 0; executor build pass. **8 E2E đã pass trước bổ sung feedback cuối**, không có browser retest bản cuối. LIVE AI và thử người dùng chưa đạt. Review closure không xóa các giới hạn này.

## Vòng bản đồ và giao diện v0.3

Người làm bài yêu cầu sơ đồ tổng quan các tòa/lối nối theo ảnh tham chiếu, giữ chi tiết số phòng, chỉ dẫn ngắn theo chặng và bỏ các nhãn/đoạn demo không cần thiết khỏi giao diện. Executor A/B GPT-6.1 Sol sửa shared/domain/server và client theo ranh giới file; điều phối giữ tài liệu và chạy QA. Không coi nhãn cảnh báo mô phỏng lặp lại trong UI là điều kiện review; tính chất dữ liệu dựng được công khai trong tài liệu dự án.

GPT-6 Astra rà source đóng băng, kiểm tra graph/hình học trái–phải, chuyển tầng/tòa, nhãn phòng, projection chính xác các chuỗi fixture cũ, AI availability/fallback, các gate và hành vi retry trong dialog. Điều phối đề nghị thêm một vòng nhỏ: bỏ câu ETA lặp, bỏ mốc “Biển phòng…” dưới số phòng đã hiện, và chuyển công cụ thử mạng khỏi help thông thường sang `/patient?tools=1`. Reviewer đọc lại bốn file liên quan sau khi sửa.

Kết luận cuối: **không có finding P1/P2 có thể hành động trong phạm vi rà; 39/39 hashes khớp, không có mismatch** ở [manifest hiện tại](outputs/review-manifest-map-ui.json). Reviewer xác minh [JSON output 110/110 tests](outputs/map-revision/test-results.json), không có fail/pending. Điều phối chạy production build cuối đạt, 37 modules. Không đổi source sau manifest; tài liệu/bằng chứng xuất ảnh được cập nhật tiếp.

Reviewer và điều phối mở cả bốn PNG xuất trực tiếp từ thành phần SVG: tổng quan, A1, A2 và B1. Không dùng browser trong vòng này. Bố cục thật trên điện thoại, native focus/inert và print trong browser vẫn cần kiểm tra lại; DOM tests có stub dialog và hình thành phần không chứng minh các hành vi đó. Review không chứng minh vị trí thật, AI LIVE, thử người dùng hoặc hiệu quả tiết kiệm thời gian.
