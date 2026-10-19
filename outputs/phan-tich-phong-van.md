# Phân tích hai cuộc phỏng vấn và P3 tự thuật - 18/10/2026

**Ghi chú phiên bản:** phần ưu tiên chờ kết quả bên dưới phản ánh quyết định phân tích trước khi người làm bài làm rõ phạm vi. Hướng hiện hành là hướng dẫn chuyển bước trong phần khám tại viện, địa điểm/đường đi và kết quả song song; xem [need statement](../03-need-statement/need-statement.md), [experiment brief](../05-prototype/experiment-brief.md) và [nguồn Vinmec/giả định](../01-phong-van/vinmec-result-workflow-notes.md). Bằng chứng P1/P2/P3 không được sửa theo quyết định sản phẩm mới.

Đã đọc toàn bộ bản `note_interview.pdf` cập nhật **7 trang**, kiểm tra ảnh từng trang và kết hợp xác nhận của người phỏng vấn. Trang 7 trống ngoài chân trang. Có hai cuộc ngày 17/10, mỗi cuộc khoảng 60-90 phút, đã được đồng ý dùng ghi chép/trích dẫn ẩn danh; phần lớn lời trong nguồn là diễn giải.

## Kết quả chính

- **101 mục nguồn được hệ thống hóa:** 48 ở P1, 39 ở P2 và 14 ở P3 tự thuật, giữ cả tình tiết thuận lợi, cảm xúc, workaround, đề xuất và nhánh chưa chắc. Đây là số mục phân tích, không phải 101 sự cố.
- **17 pain point**, kèm nguồn và giới hạn. P1 nổi bật ở xem lại/liên kết/hủy lịch, chờ hỗ trợ, hỏi/nhập lại, chuyển bước và kỳ vọng phí. P2 nổi bật ở gọi tên/chờ kết quả, tự tìm phòng, lục giấy, nhớ lịch và truy lịch sử.
- **10 insight** với phản chứng và câu hỏi cần thử. Điểm chung là người dùng phải nối ngữ cảnh giữa các bước bằng giấy, trí nhớ và người hỗ trợ.
- **Hai journey phỏng vấn và một journey P3 tự thuật tách riêng**, một workflow chuyển bước, need statement sơ bộ, 3 thực hành quốc tế có nguồn và experiment brief cho hướng prototype.

## Đề xuất phạm vi cập nhật sau P3, chưa thử

Ưu tiên **chờ nhận kết quả: biết trạng thái đã được xác nhận và khi nào được thực hiện bước tiếp theo**. P3 đã biết phòng cần quay lại nhưng chưa có tín hiệu khi kết quả sẵn sàng; biết nhờ bác sĩ gặp và báo trực tiếp. P2 cung cấp bối cảnh chờ/gọi tên. Không biết timestamp kết quả hoặc thời gian chờ thừa; map không tự giải quyết tình huống này.

Need statement cập nhật: “Cách để người đi khám ngoại trú đang chờ kết quả nhận biết kịp thời trạng thái kết quả đã được cơ sở xác nhận và bước tiếp theo cần thực hiện, khi thời gian dự kiến chưa phản ánh diễn tiến thực tế, nhằm hạn chế chờ không cần thiết và chủ động sắp xếp thời gian.”

## Các hiệu chỉnh để không kết luận quá mức

- Thiếu nhân lực lúc đông và ý tưởng map là **nhận xét của người phỏng vấn**, không phải yêu cầu P1.
- 10 phút chờ P1 là ước lượng; xác nhận hủy chỉ qua người nhận cuộc gọi; máy bận không chứng minh hotline đóng cửa.
- Không thấy lịch trong app không chứng minh nguyên nhân đồng bộ/PID; phiên UI sau 1-2 ngày không đồng nhất với lúc đi khám.
- P2 trộn một lượt thực với trường hợp có thể xảy ra. “3 chỗ → 9 tờ”, 30-60 phút và nguy cơ mất giấy/lỡ lượt/trễ hẹn chưa phải các số liệu sự cố đã xác minh.
- Giá tổng cao hơn số ban đầu chưa chứng minh báo giá sai; giấy được dùng chưa chứng minh thiếu hệ thống số; ý kiến P2 về MyVinmec chưa là kiểm tra chức năng.
- Có đồng ý dùng ẩn danh không biến ghi chép diễn giải thành lời nói nguyên văn; nguồn PDF thô giữ ở máy và không tự đưa lên Git.

## Đọc bằng chứng trong repo

| Nội dung | Tài liệu |
| --- | --- |
| Hai phỏng vấn và một tự thuật | [P1](../01-phong-van/P1.md), [P2](../01-phong-van/P2.md), [P3 tự thuật](../01-phong-van/P3.md) |
| Đối chiếu từng đoạn nguồn | [Source coverage](../01-phong-van/source-coverage.md) |
| Xác nhận và điều còn mở | [Clarifications](../01-phong-van/clarification-questions.md) |
| 17 pain point / 10 insight | [Pain points](../01-phong-van/pain-points.md), [Insights](../01-phong-van/insights.md) |
| P1/P2, P3 tự thuật và workflow | [Journey map](../02-journey-map/journey-map.md) |
| Need statement và đo lường | [Need statement](../03-need-statement/need-statement.md) |
| Nghiên cứu nguồn quốc tế | [Best practices](../04-best-practice/best-practices.md) |
| Các phương án prototype và phép thử | [Experiment brief](../05-prototype/experiment-brief.md) |
| Việc còn lại theo đề | [Requirement status](../REQUIREMENTS-STATUS.md), [Next steps](../NEXT-STEPS.md) |

## Việc bạn cần làm ngay

1. Đã dùng P3 tự thuật theo lựa chọn người làm bài: ghi đúng hai phỏng vấn + một tự thuật, không tự xác nhận đã đáp ứng ≥3 cuộc phỏng vấn theo đề.
2. Rà need statement về chờ nhận kết quả; phân biệt kết quả sẵn sàng với phòng đã cho phép tiếp nhận, không tự tính tiết kiệm 1 giờ.
3. Tự dùng app, làm prototype AI click được, thử 2-3 người, lưu log và sửa; chưa có kết quả các phần này.
4. Hoàn thiện coach plan/rủi ro và slides.pdf ≤10 slide; rà quyền repo, nộp trước 23h59 ngày 19/10/2026.

AI hỗ trợ hệ thống hóa/phân tích, không thực hiện phỏng vấn hoặc tạo kết quả thử nghiệm. Các đề xuất chưa được người làm bài duyệt và chưa được người dùng kiểm chứng phải giữ nhãn tương ứng.
