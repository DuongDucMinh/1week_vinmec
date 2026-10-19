> **Đã có luồng mới theo giấy / số tại cửa phòng.** Danh sách mọi chỉ định hiện ngay, tự sẵn sàng sau thủ tục cuối; demo dừng khi quay lại bác sĩ Nội. Dùng [hướng dẫn hiện tại](README.md#đi-hết-một-lượt-demo) và [báo cáo giấy/app](paper-workflow-revision.md). Nội dung bên dưới giữ làm lịch sử phiên bản trước.

# Hướng dẫn thử prototype sau khi có bằng chứng vấn đề

**Chưa tiến hành.** Bản AI hỗ trợ áp dụng ngày 18 P1–P3 trong [link học tập](https://chatgpt.com/share/6ad11a05-72dc-83ec-8ae6-66b228905da0); chưa xác nhận đã đọc ngày 19. Buổi này khác phỏng vấn tìm vấn đề.

## Chuẩn bị cho 2–3 người

- Câu hỏi học hỏi: sau mỗi điểm bàn giao, người bệnh có tự biết việc tiếp theo, nơi đến, cách đi và khi nào cần quay lại bác sĩ bằng giao diện điện thoại không?
- Giả định: thẻ việc tiếp theo, trạng thái kết quả tách khỏi thực hiện và sơ đồ có điểm xuất phát giúp người dùng quyết định đúng mà không phải hỏi lại nhân viên. Trợ lý AI giải thích câu hỏi tự nhiên có thêm giá trị so với chỉ đọc hướng dẫn cố định.
- Hành vi ủng hộ: người thử tự chọn đúng việc/nơi đến, hiểu kết quả còn chờ, không bỏ dịch vụ đang làm, không tự vào hàng chờ bác sĩ khi chưa tới nơi. Hành vi phản bác: cần nhắc liên tục, hiểu “đã thực hiện” là “đã có kết quả”, đi nhận giấy ở nhánh điện tử, hoặc bấm sẵn sàng khi vẫn ngoài viện. Ghi cả trường hợp AI không giúp thêm.
- Chuẩn bị dữ liệu giả, trạng thái ban đầu, nhiệm vụ, điều kiện thành công, thời điểm cần hỗ trợ. Không dùng tài khoản, giấy tờ hoặc kết quả khám thật.
- Nếu so sánh phương án, giữ bối cảnh, nhiệm vụ, nội dung và kết quả cần đạt tương đương; chỉ đổi cơ chế đang kiểm tra. Reset trạng thái; đổi thứ tự giữa người thử nếu khả thi và ghi ảnh hưởng do học từ phương án trước. Mẫu nhỏ không phải thí nghiệm A/B thống kê.
- Xin đồng ý cho thử và dùng ghi chép ẩn danh theo phạm vi chia sẻ repo. Công khai AI thật/mô phỏng, giới hạn và việc không có giao dịch/lịch hẹn thật.

## Kịch bản 15–20 phút

1. **Tạo thoải mái:** “Mình đang kiểm tra bản thiết kế, không đánh giá bạn. Chỗ nào khó dùng là thông tin hữu ích. Bạn có thể dừng bất cứ lúc nào.”
2. **Gợi bối cảnh:** “Bạn kể ngắn lần gần nhất thực hiện [khoảnh khắc] được không?” Không hỏi thông tin sức khỏe.
3. **Giao nhiệm vụ:** “Với thông tin giả trên màn hình, hãy [kết quả cần đạt].” Điền theo need statement; không nêu nút hoặc chỉ đường click.
4. **Quan sát:** người thử tự thao tác. Ghi hành động đầu, dừng lại, thông tin đọc/bỏ qua, hiểu nhầm, sửa lỗi và thoát. Không cứu ngay khi họ ngập ngừng; nếu phải giúp, ghi đã giúp gì và không tính là hoàn thành độc lập.
5. **Hỏi sau thao tác:** “Ở đoạn bạn dừng lại, lúc đó bạn tìm gì?”; “Bạn hiểu thông báo này nghĩa là gì?”; “Bạn dựa vào đâu để quyết định tiếp tục?”
6. **Kiểm tra quyền kiểm soát:** giao tình huống giả cần sửa thông tin hoặc từ chối gợi ý; quan sát họ tìm cách sửa/bỏ qua/chuyển kênh trước khi giải thích.
7. **Nếu có nhiều phương án:** “Sau khi thử, bạn chọn cách nào cho tình huống này, vì sao? Bạn chấp nhận mất điều gì? Khi nào bạn chọn cách khác?” Đối chiếu với hành vi, không chỉ đếm phiếu chọn.

Ghi vào [user-test-log.md](user-test-log.md). Kết thúc bằng quyết định thiết kế tiếp theo và bằng chứng dẫn tới quyết định; không kết luận đã xác thực chỉ vì 2–3 người thích giải pháp.

**Áp dụng cho kịch bản được người làm bài chốt ngày 19/10**

Theo [đặc tả](simulation-spec.md), dùng bối cảnh Ocean Park 2, Nội, Siêu âm ổ bụng và Xét nghiệm sinh hóa máu. Thử cả chế độ chuyển kết quả về phòng Nội và chế độ nhận đủ hai bản cứng. Giữ cùng dữ liệu/quy tắc ngoài cách nhận; đổi thứ tự giữa người thử khi khả thi và ghi ảnh hưởng học. Đây là hai chế độ nghiệp vụ cần dùng được, không tự coi là phép thử A/B tìm chế độ tốt hơn.

Quan sát người thử ở các điểm: biết tới đâu/đi thế nào; nhận ra kết quả khi đang làm việc khác; ở nhánh điện tử hiểu có thể chờ bên ngoài sau khi xong thủ tục nhưng chưa vào hàng chờ sẵn sàng; ở nhánh giấy nhận đúng nơi có trước; đủ điều kiện quay lại rồi mới tự xác nhận có mặt ngoài phòng; chờ bác sĩ gọi. Dùng màn hình bác sĩ để kiểm tra hai cột, cập nhật nền và bộ kết quả/lịch sử mở đúng người khi gọi.

Thêm một lỗi app giả để quan sát cách dùng giấy/nhờ nhân viên và đăng ký sẵn sàng thủ công. Không hướng người thử thật rời viện hoặc đi theo sơ đồ giả. Ca SIM-01–11 là tiêu chí chưa thử, chỉ ghi thành kết quả khi đã thực hiện.

## Bộ nhiệm vụ cụ thể trên điện thoại

Người điều phối dùng tab điều khiển/bác sĩ tạo sự kiện; người thử chỉ nhìn màn hình bệnh nhân. Đọc mục tiêu bên dưới, không đọc tên nút hoặc thao tác giúp họ. Đặt lại lượt trước khi đổi chế độ. Ghi thời điểm bắt đầu/kết thúc bằng quan sát thật, không lấy tốc độ chạy test tự động làm thời gian người dùng.

| Nhiệm vụ giao cho người thử | Trạng thái người điều phối chuẩn bị | Điều cần quan sát |
| --- | --- | --- |
| “Bạn vừa được tiếp nhận. Hãy tìm nơi cần đến và cách đến đó.” | Tiếp nhận đã xác nhận, chưa gọi khám đầu | Có nêu đúng phòng/tầng mô phỏng; có hiểu điểm bắt đầu tuyến và còn phải đợi bác sĩ gọi |
| “Bạn vừa làm xong một dịch vụ, kết quả đang chờ. Hãy quyết định bây giờ làm gì.” | Xong dịch vụ đầu, chưa có kết quả, dịch vụ hai chưa làm | Đi làm việc còn lại; không ngồi đợi kết quả chỉ vì bước đầu chưa có nhãn xanh |
| “Bạn đang làm dịch vụ còn lại và nhận thông báo. Hãy cho biết thông báo thay đổi điều gì.” | Công bố kết quả đầu khi dịch vụ hai đang thực hiện | Biết có một kết quả, vẫn cần hoàn tất việc đang làm; mở được kết quả giả nếu muốn |
| “Bạn đã làm xong cả hai dịch vụ nhưng chưa đủ kết quả. Bạn có thể làm gì và khi nào cần quay lại?” | Nhánh điện tử, hai dịch vụ xong, còn một kết quả chờ | Hiểu có thể làm việc khác theo giả định demo; chưa tự vào danh sách sẵn sàng; đủ kết quả mới quay về |
| “Bạn vừa biết đã đủ kết quả và đang ngoài viện. Hãy tìm đường về nơi cần gặp bác sĩ.” | Nhánh điện tử, xác nhận đang ngoài viện, công bố kết quả cuối | Chọn/xác nhận điểm xuất phát mới; không hiểu sơ đồ là định vị trực tiếp; tới ngoài phòng rồi mới khai báo sẵn sàng |
| “Bạn đã làm xong hai dịch vụ. Hãy nhận đủ hồ sơ và trở lại bác sĩ.” | Nhánh giấy, kết quả đầu có trước, kết quả hai công bố sau | Nhận đúng nơi có trước; hiểu phải đủ hai giấy; không nhầm quyền xem bản mềm với đã nhận giấy |
| “Mạng của app đang lỗi. Bạn cần tiếp tục và báo đã tới ngoài phòng thì làm thế nào?” | Ngắt kết nối riêng tab bệnh nhân, staff còn hoạt động | Tìm giấy/đầu mối hỗ trợ; không hiểu thao tác chưa xác nhận là đã vào hàng chờ; phục hồi thấy trạng thái đúng |

Để đánh giá AI riêng, chọn một tình huống người thử chưa chắc sau khi đọc màn hình và mời họ tự đặt câu hỏi. Ghi nguyên câu hỏi đã ẩn danh, trạng thái LIVE/FALLBACK thực tế, câu trả lời, quyết định sau đó và điều đã hiểu thêm. Nếu chỉ chạy FALLBACK thì ghi đúng như vậy; chưa dùng kết quả đó để kết luận chất lượng mô hình thật.
