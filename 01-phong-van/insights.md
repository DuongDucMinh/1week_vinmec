# Insight từ nghiên cứu trải nghiệm khám ngoại trú

Nghiên cứu gồm hai phỏng vấn và một tự thuật. Các phát hiện được tổng hợp từ hành vi, cảm nhận và cách người tham gia tự xử lý tình huống.

## Phát hiện chính

| Mã | Bằng chứng | Insight | Nguồn |
| --- | --- | --- | --- |
| I-01 | P1 có xác nhận lịch, giấy chỉ phòng và người dẫn; sau một bước vẫn không biết làm gì. P2 có giấy phòng nhưng phải tự nhớ, suy tầng, lục tờ đầu | **Có thông tin không đồng nghĩa tự biết hành động tiếp theo.** Cần ghép trạng thái hiện tại, việc tiếp và điểm đến thành chỉ dẫn dùng được | P1-05/30/34-38; P2-04/14-18 |
| I-02 | P1 đợi người khác hỗ trợ, kể lại bối cảnh; P2 trao/lục giấy giữa nhiều quầy | **Người dùng và giấy đang mang ngữ cảnh giữa các điểm bàn giao.** Gánh không chỉ là đi đường mà còn là biết đã xong gì và cần đưa gì | P1-25-30/36; P2-15-22 |
| I-03 | P1 khoảng 10 phút chờ hỗ trợ, không biết bao giờ; P2 phải chú ý nghe gọi, muốn chủ động việc khác | **Sự mơ hồ khi chờ là nhu cầu khác thời gian xử lý thực.** Làm rõ trạng thái có thể giúp chủ động mà không làm chuyên môn nhanh hơn | P1-26-27; P2-07/10-13/24-27 |
| I-04 | P1 dùng cùng email nhưng không thấy lịch, thử PID rồi bot | **Kỳ vọng về liên tục giữa web/app vượt quá điều P1 thấy được.** Hỗ trợ lúc lỗi cần giải thích bước khôi phục | P1-07-16 |
| I-05 | P1 làm thủ tục lại và cảm thấy đặt app vô nghĩa | **Giá trị của đặt trước cần được nhìn thấy trong bước tiếp nhận**, kể cả khi vẫn cần xác minh lần đầu | P1-28-31 |
| I-06 | Người điều phối chủ động dẫn P1; P2 có giấy, loa và người sẵn sàng chỉ lại | **Hỗ trợ con người là điểm mạnh hiện có.** Prototype cần kế thừa và hỗ trợ bàn giao khi không rõ, thay vì tự thay điều phối | P1-21/32/36; P2-02/05/07/17 |
| I-07 | P1 thấy tổng cao hơn số dự tính và mới biết điều kiện ưu đãi tại quầy | **Kỳ vọng chi phí/quyền lợi được hình thành trước khi người dùng hiểu đủ phạm vi** | P1-04/40-43 |
| I-08 | P2 không ghi đều, phải mở giấy/sổ; muốn nhắc để sắp xếp việc | **Nhớ ngày và bố trí công việc là hai job khác nhau của lời nhắc** | P2-28-34/39 |
| I-09 | P2 lục nhiều loại giấy, chữ khó đọc, muốn lịch sử trong app | **Giá trị cần kiểm tra là lấy đúng thông tin đúng lúc, không chỉ số hóa thật nhiều** | P2-15-22/35-39 |
| I-10 | P3 biết phòng cần quay lại nhưng chỉ nhận thông tin kết quả khi bác sĩ gặp; P2 muốn theo dõi diễn tiến chờ | **Biết điểm đến cần đi kèm tín hiệu về thời điểm có thể tiếp tục.** | P3-05–10; P2-11–13/24–27 |

## Định hướng thiết kế

- Nối **trạng thái hiện tại → việc cần làm → phòng cần đến → đường đi** trong cùng một hướng dẫn.
- Cập nhật tiến độ và kết quả để người bệnh biết điều gì đã thay đổi, ngay cả khi đang thực hiện việc khác.
- Giữ hỗ trợ của nhân viên và giấy hướng dẫn, đặc biệt khi người bệnh chưa quen quy trình hoặc không dùng app.
- Ưu tiên các lần chuyển bước trong lượt khám; các chức năng đặt lịch, thu phí và tái khám nằm ngoài phạm vi prototype.

## Điều cần đánh giá tiếp

Các khả năng cần phân biệt là thiếu thông tin, thông tin khó tìm hoặc dữ liệu nghiệp vụ chưa được cập nhật. Mẫu nghiên cứu còn nhỏ; chưa xác định mức phổ biến của từng vấn đề hay số phút có thể tiết kiệm. Tính năng chọn phòng theo lượng người và lựa chọn thang là bước phát triển sản phẩm cần được thử bằng nhiệm vụ cụ thể.

[Điểm đau](pain-points.md) · [Journey map](../02-journey-map/journey-map.md) · [Need statement](../03-need-statement/need-statement.md)
