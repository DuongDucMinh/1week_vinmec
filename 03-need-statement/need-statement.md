# Need statement - biết làm gì tiếp và tới đâu trong lượt khám

**Cập nhật 19/10/2026 theo phạm vi và quy tắc mô phỏng người làm bài làm rõ:** hướng dẫn người bệnh qua các điểm bàn giao trong phần khám tại viện, kết hợp trạng thái từng việc và từng kết quả. Không giới hạn vào một lần chờ kết quả hoặc thời điểm thao tác A vừa xong. Chưa có prototype/test; chưa xác thực hiệu quả.

**Need statement chính**

> Cách để người đi khám ngoại trú phải qua nhiều điểm dịch vụ xác định đúng việc cần làm tiếp, nơi cần đến và thời điểm có thể tiếp tục theo tiến độ lượt khám, nhằm giảm việc phải hỏi lại, chờ và di chuyển không cần thiết.

| Thành phần | Nội dung |
| --- | --- |
| Problem | Thông tin về việc đã xong, việc còn lại, điểm đến và kết quả đang chờ chưa giúp người dùng tự nối được bước tiếp theo ở các điểm bàn giao |
| Population | Người đi khám ngoại trú phải qua nhiều điểm dịch vụ; nhóm giả thuyết cần thử, không đại diện mọi bệnh nhân Vinmec |
| Outcome chính | Xác định đúng hành động tiếp theo, điểm đến và điều kiện để tiếp tục |
| Outcome phụ | Giảm hỏi lại; hạn chế chờ hoặc di chuyển có thể tránh khi có đủ dữ liệu để đo |

Map, tuyến đường, nhãn màu, notification và AI là những cách giải quyết sẽ thử trong [experiment brief](../05-prototype/experiment-brief.md), không đưa vào câu need như giải pháp bắt buộc.

**Khoảnh khắc đào sâu và phạm vi trình diễn**

Khoảnh khắc nghiên cứu là **điểm bàn giao/chuyển bước trong lượt khám**: người bệnh cần quyết định làm gì tiếp, ở đâu và khi nào. Khoảnh khắc này lặp lại ở nhiều điểm; prototype thể hiện nhiều lần chuyển bước liên tiếp để kiểm tra tính liên tục của hướng dẫn. Đây là quyết định phạm vi của người làm bài, không phải xác nhận của ban tổ chức rằng cách diễn giải này chắc chắn đạt tiêu chí một khoảnh khắc.

Luồng demo: tiếp nhận đã xác nhận -> phòng Nội ban đầu -> Siêu âm ổ bụng và Xét nghiệm sinh hóa máu -> kết quả song song/nhận giấy tùy chế độ -> đủ kết quả và đủ giấy nếu cần -> quay phòng đầu -> người bệnh tự xác nhận có mặt, sẵn sàng -> bác sĩ gọi vào. Bối cảnh Vinmec tại Vinhomes Ocean Park 2; vị trí phòng/tầng và sơ đồ vẫn là dữ liệu dựng. Chọn một loại tình huống lặp lại để đào sâu, không mở thêm đặt/hủy lịch, thanh toán, đơn thuốc hoặc tái khám. Xem [đặc tả ngày 19/10](../05-prototype/simulation-spec.md).

**Bằng chứng dẫn tới need**

| Nguồn | Điều hỗ trợ | Giới hạn |
| --- | --- | --- |
| P1-19–21, 30, 32, 34–38 | Cần biết điểm đến; sau một bước chưa biết việc tiếp theo, được điều phối xem giấy và hướng dẫn | Người điều phối có hỗ trợ tốt; ý tưởng map/thiếu nhân lực lúc đông thuộc người phỏng vấn, không phải yêu cầu P1 |
| P2-04–18, 24–27 | Tìm phòng, giữ ngữ cảnh quay lại, chờ nhiều kết quả, mô tả khả năng làm việc khác và mong muốn kết quả về phòng đầu | Một số đoạn là nhánh có điều kiện; chưa có phép đo đường đi, thời gian hoặc tích hợp |
| P3-05–13 | Đã biết phòng quay lại nhưng cần tín hiệu khi trạng thái đổi | Không biết timestamp kết quả; không kết luận chờ thừa một giờ; không dùng P3 để loại nhu cầu vị trí của P1/P2 |

Nguồn hiện có hai phỏng vấn và một tự thuật. Các tình huống bổ sung cho nhau: hành động, địa điểm và thời điểm. Không biến yêu cầu sản phẩm mới của người làm bài thành lời người tham gia hoặc bằng chứng đã kiểm chứng.

**Quy tắc đã chốt cho demo, chưa phải xác minh hiện trạng Vinmec**

- Thử bắt buộc hai chế độ cho cả lượt: cả hai dịch vụ chuyển kết quả về bác sĩ, hoặc cả hai yêu cầu lấy bản cứng; không trộn từng dịch vụ trong phiên bản này.
- Bộ phận thực hiện xác nhận có kết quả thì bệnh nhân và bác sĩ cùng được xem/nhận. Bệnh nhân được thông báo, bác sĩ cập nhật nền. Việc làm trước có kết quả trước theo kịch bản, không phải dự báo thực tế.
- Phải thực hiện xong hai dịch vụ và có đủ hai kết quả mới hướng quay phòng đầu. Nhánh bản cứng cần nhận đủ hai bản; sau khi xong các thủ tục, hướng tới nơi có kết quả trước để nhận trước.
- Nhánh điện tử cho phép làm việc khác/rời viện khi đã thực hiện xong cả hai nhưng còn chờ. Đủ kết quả thì thông báo quay lại sớm; chỉ tới ngoài phòng mới tự xác nhận sẵn sàng.
- Người bệnh bấm nút sẵn sàng mới vào cột phải của bác sĩ; bác sĩ chủ động gọi vào rồi mở bộ kết quả/lịch sử giả. Có đủ kết quả không tự đưa người bệnh vào hàng chờ này.
- Giấy hướng dẫn vẫn giữ ở cả hai chế độ; app lỗi thì dùng giấy và nhờ nhân viên. Xem [đặc tả mô phỏng](../05-prototype/simulation-spec.md) và [nguồn chính thức/giả định](../01-phong-van/vinmec-result-workflow-notes.md).

Nút sẵn sàng là tự khai báo đang ngoài phòng, chưa xác thực vị trí. Các điều kiện đủ kết quả/rời viện ở trên do người làm bài chọn cho demo, không phải quy tắc y khoa áp dụng chung. Câu need chính giữ nguyên vì các quyết định này cụ thể hóa giải pháp và phép thử.

**Chỉ số dự kiến, chưa đo**

| Chỉ số | Cách đo |
| --- | --- |
| Chuyển bước đúng | Chọn đúng việc/đợi/quay lại theo dữ liệu từng điểm bàn giao |
| Đúng điểm đến và cách đi | Xác định đúng tòa/tầng/phòng, điểm xuất phát và tuyến trên sơ đồ giả |
| Thời gian quyết định | Từ khi nhận nhiệm vụ/cập nhật tới quyết định đúng; không tính thành thời gian chờ xét nghiệm |
| Hiểu tiến độ | Phân biệt việc đã thực hiện, kết quả đang chờ/đã có và những việc còn lại |
| Cần hỏi lại / cần giúp | Ghi từng lần và lý do; tách hỗ trợ hợp lý khỏi thông tin thiết kế thiếu |
| Sai chuyển bước | Đi trước điều kiện, nhận giấy không cần thiết, bỏ việc đang làm hoặc tự vào phòng |
| Chờ/di chuyển có thể tránh | Chỉ đo ngoài đời khi có timestamp, tuyến và điều kiện tiếp nhận đáng tin; trong demo chỉ báo kết quả mô phỏng |

Không tuyên bố giảm 50%, tiết kiệm một giờ, đường ngắn nhất thực tế hoặc AI rút ngắn xử lý xét nghiệm khi chưa có bằng chứng.
