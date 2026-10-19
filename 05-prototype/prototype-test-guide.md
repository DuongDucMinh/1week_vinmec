# Hướng dẫn thử prototype với người dùng

Dành cho vòng thử tiếp theo, sau khi bổ sung điều phối thủ tục và lựa chọn thang. Đây là kế hoạch, không phải kết quả đã thực hiện. Phản hồi đã có được ghi riêng tại [user-test-log.md](user-test-log.md).

## Chuẩn bị

Xin đồng ý ghi chép ẩn danh, nói rõ sơ đồ và hồ sơ là mô phỏng. Dùng điện thoại hoặc viewport 360 / 390 px, người thử xem màn bệnh nhân; người điều phối vận hành các tab lễ tân, bác sĩ và phòng thủ tục. Đọc mục tiêu nhiệm vụ, không chỉ trước tên nút. Ghi thời gian và gợi ý thực sự đã dùng.

Chuẩn bị bệnh nhân P02 chờ siêu âm, P03 chờ nước tiểu, sau đó bác sĩ chỉ định siêu âm / nước tiểu / sinh hóa cho P01. [Các bước dựng tình huống](adaptive-routing.md#ví-dụ-a--b--c-đổi-thành-a--c--b).

| Nhiệm vụ giao người thử | Chuẩn bị / điều cần quan sát |
| --- | --- |
| “Bạn vừa được tiếp nhận. Hãy tìm phòng khám ban đầu.” | Chọn khoa và tiếp nhận; xem có hiểu phòng, tầng, tòa và điểm xuất phát |
| “Bác sĩ vừa chỉ định các thủ tục. Bạn cần tới đâu trước?” | P01 có ba thủ tục; xem có phân biệt điểm đến với các bước dự kiến |
| “Bạn đã làm xong thủ tục đầu. Bây giờ đi đâu?” | Hoàn tất nước tiểu P03 rồi sinh hóa P01; xem có nhận ra chuyển tới nước tiểu trước siêu âm |
| “Thang máy đang đông; bạn muốn đi thang bộ.” | Quan sát tìm lựa chọn, hiểu tuyến và các chặng qua từng tầng |
| “Bạn không nhận ra mốc hoặc vừa rẽ nhầm.” | Quan sát chọn lại vị trí, nghe lại chỉ dẫn hoặc nhờ hỗ trợ |
| “Bạn có thông báo kết quả khi đang làm việc khác.” | Công bố một kết quả; xem người thử có tiếp tục thủ tục đang làm |
| “Bạn đã xong tất cả thủ tục.” | Quan sát hiểu bước quay lại khoa đầu, không nhầm thông báo kết quả với lời gọi |

## Ghi kết quả

Ghi người thử bằng mã, thiết bị, ngày, nhiệm vụ, kết quả, điểm nhầm, thời gian, hỗ trợ và đề xuất. Tách diễn giải khỏi lời nguyên văn; không tự thêm số đo. Khi thử giọng đọc, ghi thiết bị và có nghe rõ tiếng Việt hay không. Với nhiệm vụ đổi thang, ghi rõ người dùng có nhận ra thang máy là mặc định không.

Tóm tắt mỗi thay đổi được đề xuất bằng bằng chứng quan sát, sau đó thử lại. Kết quả phần mềm tại [test-report.md](test-report.md) hỗ trợ chất lượng kỹ thuật, không thay thế vòng thử này.
