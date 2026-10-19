# Pain point - hai cuộc phỏng vấn và P3 tự thuật, 18/10/2026

Nguồn: [P1](P1.md), [P2](P2.md) và [P3 tự thuật](P3.md), cùng [xác nhận của người phỏng vấn](clarification-questions.md). P1 ở Vinmec; P2 ở cơ sở khác. Cột số người nêu chỉ dùng nhận diện nguồn, không phải tỷ lệ phổ biến. P2 có phần kể tổng hợp/điều kiện; xem loại bằng chứng trước khi dùng. Không có điểm số severity hoặc số phút tiết kiệm tự tạo.

## Danh mục đầy đủ

| Mã | Tình huống - nhu cầu chưa được đáp ứng | Hành vi / hậu quả trong ghi chú | Nguồn | Phân loại và điều chưa biết |
| --- | --- | --- | --- | --- |
| PAIN-01 | Sau đặt web, cần xem lại đầy đủ cơ sở/khoa/bác sĩ/giờ nhưng thông tin xác nhận và đường xem lại không đáp ứng | Không nhớ lựa chọn; tìm kênh khác để xem | P1-05 đến P1-08 | P1; có SMS/email nhưng thiếu chi tiết, không phải không có xác nhận |
| PAIN-02 | Kỳ vọng cùng email giúp thấy lịch web trong app nhưng không tìm thấy | Tạo tài khoản app, tìm PID ở nhiều mục | P1-09 đến P1-12 | P1; chưa xác minh cơ chế liên kết/đồng bộ, PID không phải nguyên nhân chắc chắn |
| PAIN-03 | Khi bị kẹt cần hỗ trợ thao tác app nhưng bot không giải đáp được theo ghi chú | Hỏi bot rồi cảm thấy bất lực | P1-13 | P1; chưa có bản chat hoặc thử nghiệm chức năng hiện hành |
| PAIN-04 | Khi đổi cơ sở, không tìm được đường chủ động hủy lịch web | Google số, đợi sáng, hỏi tầng 1, gọi hai lần; được báo hủy qua điện thoại | P1-14, P1-17 đến P1-24 | P1; không tự gọi đặt app mới là hậu quả lỗi, vì còn muốn cơ sở gần hơn; không xác nhận hotline ngoài giờ |
| PAIN-05 | Khi tới nơi hoặc chuyển phòng, biết tên phòng/tầng chưa đủ để tự tới đúng điểm | P1 hỏi tầng 1 và được dẫn; P2 suy tầng từ số phòng, dùng hỏi người như cách xử lý | P1-19 đến P1-21, P1-32, P1-36; P2-04 đến P2-05, P2-09 | Hai nguồn, nhưng chưa có số lần đi sai; map là ý tưởng người phỏng vấn, không phải yêu cầu P1 |
| PAIN-06 | Chờ hỗ trợ tại quầy nhưng không biết ai sẽ giúp và khi nào | P1 ngồi đợi khoảng 10 phút ước lượng, kể lại bối cảnh khi người khác đến | P1-25 đến P1-27 | P1; đây là bàn giao hỗ trợ, không đồng nhất với thời gian xử lý y tế |
| PAIN-07 | Đã nhập trước trên app nhưng tại quầy cảm thấy vẫn làm lại, không hiểu giá trị của đặt trước | Cung cấp lại thông tin, băn khoăn app vô nghĩa | P1-28 đến P1-31 | P1; cần tách xác minh lần đầu khỏi nhập trùng và xác nhận lịch có được dùng giữ giờ không |
| PAIN-08 | Sau một bước dịch vụ, chưa tự biết bước tiếp theo, điểm đến hoặc điều kiện quay lại | P1 chờ/tìm điều phối; P2 nhớ phòng/lục giấy/nhờ người để quay phòng đầu | P1-34 đến P1-38; P2-14 đến P2-18 | Hai nguồn; P2 có nhánh điều kiện, không tính mọi nhánh như sự cố riêng |
| PAIN-09 | Trong lúc chờ gọi/nhận kết quả, khó chủ động thời gian vì thông tin chủ yếu nói miệng/gọi tên | P2 phải chú ý nghe, nêu đây là khâu lâu, muốn biết diễn tiến để sắp xếp việc khác | P2-06 đến P2-13, P2-24 đến P2-27 | P2; lo bỏ lỡ chưa phải đã lỡ; 30-60 phút là ví dụ chưa phải số đo; không hứa AI làm nhanh xét nghiệm |
| PAIN-10 | Quản lý giấy qua nhiều điểm, cần tìm đúng tờ để quay lại hoặc nộp | Lục tờ đầu/giấy kê, mang sổ/giấy gần nhất; chữ viết tay khó đọc | P2-15 đến P2-17, P2-22, P2-35 đến P2-38; P1-30, P1-36 | Khó quản lý rõ hơn ở P2; P1 chỉ cho biết dùng giấy, không nói đã mất/lục nhầm. “9 tờ” là ví dụ |
| PAIN-11 | Cuối lượt mới biết điều kiện ưu đãi/tài khoản khác | P1 chưa biết, chưa được duyệt và trả giá thường | P1-40 đến P1-41 | P1; chưa biết đủ điều kiện hay đã mất quyền lợi nào |
| PAIN-12 | Dùng con số phí lúc đặt để dự trù nhưng hiểu khác tổng thực trả | P1 thấy tổng cao hơn nhiều, đánh giá ước tính không đúng | P1-04, P1-42 đến P1-43 | P1; chưa biết phạm vi “phí khám” và tổng gồm gì; thiếu tiền chỉ là giả định |
| PAIN-13 | Đến bước thanh toán/nhận thuốc cần xác định địa điểm và giấy cần đưa | Dựa kinh nghiệm, hỏi nhân viên; P2 mô tả hỏi thêm người/bảo vệ và tìm đúng giấy | P1-38 đến P1-39, P1-44 đến P1-48; P2-19 đến P2-22 | Friction dịch vụ/điểm hỏi, mức ảnh hưởng chưa lượng hóa; P1 nhận thuốc không phải xếp hàng |
| PAIN-14 | Sau lượt khám, thông tin hẹn cần chủ động ghi/đọc lại, khó nhớ và bố trí công việc | Áng chừng ngày, không ghi thường xuyên, muốn nhắc sớm/Calendar | P2-28 đến P2-34 | P2; phải tách lịch cố định và hướng quay lại có điều kiện; chưa có ca trễ lịch cụ thể |
| PAIN-15 | Khó truy lại lịch sử qua bản giấy, lo thiếu/mất khi cần | Mang sổ và giấy gần nhất, muốn một nơi xem lại đầy đủ | P2-35 đến P2-39 | P2; mất giấy và thiếu hệ thống là nguy cơ/suy đoán, chưa chứng minh MyVinmec thiếu chức năng |

## Ưu tiên trước bổ sung P3 (cập nhật ở cuối tài liệu)

Đây là phán đoán của người phân tích, chưa phải quyết định của người làm bài và không phải xếp hạng do hai người bỏ phiếu.

| Cụm | Căn cứ ưu tiên | Hạn chế | Đề xuất |
| --- | --- | --- | --- |
| PAIN-08, liên quan PAIN-05/10 | Có hành vi tìm người/nhớ phòng/lục giấy ở cả hai bối cảnh; có thể thử một chuyển bước bằng dữ liệu giả | Nhu cầu riêng từng người khác nhau; P3 được bổ sung sau bảng này; vẫn thiếu sơ đồ/quy trình chính thức | **Hướng sơ bộ nên đào sâu:** một thời điểm chuyển bước sau khi nhận giấy/kết thúc tại một phòng |
| PAIN-09 | P2 tự xếp chờ kết quả/tiếp nhận là lâu nhất; cần chủ động thời gian | Không có trạng thái hàng chờ trực tiếp, P1 đợi hỗ trợ là việc khác; khó xác nhận ai được rời chỗ | Phương án cạnh tranh; chỉ hiển thị trạng thái được xác nhận, không tự dự báo |
| PAIN-01 đến PAIN-04 | Chuỗi hành vi nhiều kênh ở P1 khá cụ thể | Chỉ P1; phụ thuộc liên kết hồ sơ/quyền tài khoản | Phương án cạnh tranh từ một phỏng vấn; xem ưu tiên cập nhật sau P3 |
| PAIN-07 | Giá trị cảm nhận giảm, có hỏi/nhập lại | Chưa tách thủ tục hợp lệ và dư thừa; cần dữ liệu quy trình | Ghi nhận, chưa hứa AI xóa thủ tục |
| PAIN-11/12 | Bất ngờ cuối lượt có ý nghĩa trải nghiệm | Chính sách và phạm vi giá chưa rõ, một nguồn | Giữ ngoài MVP sơ bộ; kiểm tra thông tin trước khi đề xuất |
| PAIN-14/15 | P2 nêu gánh nhớ/lưu giấy và đề xuất rõ | Nhiều phần điều kiện; MyVinmec có thể đã có chức năng; đụng dữ liệu sức khỏe | Chưa chọn cho MVP, cần làm rõ và khảo sát app |

## Những điều không phải pain đã xác thực

- Năng lực điều phối sẽ không đáp ứng khi đông: giả thuyết của người phỏng vấn, chưa có dữ liệu tải.
- Bỏ lỡ tên, mất giấy, thiếu tiền, trễ lịch: rủi ro/nhánh mô tả, chưa có ca định lượng.
- Bệnh viện không có hệ thống dữ liệu: suy đoán; không suy từ việc dùng giấy.
- “Phải có AI/map/thông báo” là hướng giải pháp, không phải need statement.
- Hai người nói về hai bối cảnh; không thể suy ra phần trăm bệnh nhân Vinmec hoặc tuyên bố đã validated.

## Bổ sung P3 tự thuật: hai pain cụ thể

| Mã | Tình huống | Hành vi/hậu quả được kể | Nguồn | Giới hạn |
| --- | --- | --- | --- | --- |
| PAIN-16 | Mới đến không biết bắt đầu lấy số bằng cách nào | Đi loanh quanh, hỏi bác sĩ/nhân viên rồi được hướng dẫn | P3-02-03 | Chưa biết mất bao lâu; không chứng minh không có máy/biển chỉ dẫn |
| PAIN-17 | Chờ ngoài phòng với mốc dự kiến nhưng không có tín hiệu khi trạng thái kết quả thay đổi | Khoảng 1 giờ sau, bác sĩ gặp, báo có kết quả và mời vào; trước đó chỉ biết ngồi đợi | P3-05-10 | Có thông báo trực tiếp trong lần này; không biết có chờ thừa hay thời lượng tiết kiệm |

PAIN-17 là tình huống cụ thể làm mạnh thêm cụm PAIN-09, không tính như một người phỏng vấn độc lập. P3 đã biết phòng; map riêng lẻ không giải quyết thời điểm nhưng không loại nhu cầu vị trí trong P1/P2. **Ưu tiên hiện hành theo phạm vi người làm bài làm rõ:** PAIN-08 gắn PAIN-05/09/17 — hướng dẫn chuyển bước, địa điểm/đường đi và tiến độ kết quả trong phần khám tại viện. PAIN-10 hỗ trợ bối cảnh giảm gánh nhớ/giấy. Demo trình diễn nhiều điểm bàn giao liên tiếp; không mở thêm đặt/hủy, thu phí, thuốc hoặc tái khám. Xem need statement và experiment brief cập nhật; đây chưa là kết quả xác thực giải pháp.

Phương pháp: 2 phỏng vấn + 1 tự thuật. Không gán các giả định “kết quả đã có từ lâu”, “nếu không gặp sẽ chờ hết 2 giờ” thành sự kiện; không nói có thể tiết kiệm đúng 1 giờ.
