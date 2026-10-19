# Need statement - biết làm gì tiếp và tới đâu trong lượt khám

Cập nhật 20/10/2026. Nhu cầu nghiên cứu tập trung vào việc chuyển bước trong khám ngoại trú. Prototype đã có và đã nhận phản hồi định tính từ 2 người; hiệu quả giảm chờ / di chuyển chưa được đo.

**Need statement chính**

> Cách để người đi khám ngoại trú phải qua nhiều điểm dịch vụ xác định đúng việc cần làm tiếp, nơi cần đến và thời điểm có thể tiếp tục theo tiến độ lượt khám, nhằm giảm việc phải hỏi lại, chờ và di chuyển không cần thiết.

| Thành phần | Nội dung |
| --- | --- |
| Problem | Thông tin về việc đã xong, việc còn lại, điểm đến và kết quả đang chờ chưa giúp người dùng tự nối được bước tiếp theo ở các điểm bàn giao |
| Population | Người đi khám ngoại trú phải qua nhiều điểm dịch vụ; nhóm giả thuyết cần thử, không đại diện mọi bệnh nhân Vinmec |
| Outcome chính | Xác định đúng hành động tiếp theo, điểm đến và điều kiện để tiếp tục |
| Outcome phụ | Giảm hỏi lại; hạn chế chờ hoặc di chuyển có thể tránh khi có đủ dữ liệu để đo |

Các phương án thiết kế và cách đánh giá được mô tả trong [kế hoạch thử](../05-prototype/experiment-brief.md).

**Khoảnh khắc đào sâu và phạm vi trình diễn**

Khoảnh khắc nghiên cứu là **điểm bàn giao/chuyển bước trong lượt khám**: người bệnh cần quyết định làm gì tiếp, ở đâu và khi nào. Khoảnh khắc này lặp lại ở nhiều điểm; prototype thể hiện nhiều lần chuyển bước liên tiếp để kiểm tra tính liên tục của hướng dẫn.

Luồng demo: tiếp nhận chọn khoa → khám đầu → bác sĩ chốt các thủ tục → app chọn phòng ít người / gần nhất → thực hiện và tính lại sau mỗi lần hoàn tất → quay lại đúng khoa ban đầu. Có lựa chọn thang máy / thang bộ, kết quả cập nhật riêng và hỗ trợ giấy. [Đặc tả hiện tại](../05-prototype/simulation-spec.md) mô tả các giả định thiết kế.

**Bằng chứng dẫn tới need**

| Nguồn | Điều hỗ trợ | Giới hạn |
| --- | --- | --- |
| P1-19–21, 30, 32, 34–38 | Cần biết điểm đến; sau một bước chưa biết việc tiếp theo, được điều phối xem giấy và hướng dẫn | Người điều phối có hỗ trợ tốt; ý tưởng map/thiếu nhân lực lúc đông thuộc người phỏng vấn, không phải yêu cầu P1 |
| P2-04–18, 24–27 | Tìm phòng, giữ ngữ cảnh quay lại, chờ nhiều kết quả, mô tả khả năng làm việc khác và mong muốn kết quả về phòng đầu | Một số đoạn là nhánh có điều kiện; chưa có phép đo đường đi, thời gian hoặc tích hợp |
| P3-05–13 | Đã biết phòng quay lại nhưng cần tín hiệu khi trạng thái đổi | Không biết timestamp kết quả; không kết luận chờ thừa một giờ; không dùng P3 để loại nhu cầu vị trí của P1/P2 |

Nguồn hiện có hai phỏng vấn và một tự thuật. Các tình huống bổ sung cho nhau: hành động, địa điểm và thời điểm.

**Cụ thể hóa thành thiết kế hiện tại**

Lễ tân chọn khoa; bác sĩ chốt chỉ định; app gợi ý phòng ít người đang chờ / thực hiện, cùng số người thì chọn gần nhất. Hoàn tất mỗi thủ tục là một lần tính lại những việc còn lại. Người bệnh chọn thang máy mặc định hoặc thang bộ, nhận chỉ dẫn từng mốc / giọng đọc và quay về đúng khoa khi xong thủ tục.

Kết quả công bố riêng, cùng xem được ở app và màn bác sĩ. Hai chế độ điện tử / giấy dùng để thử cách theo dõi kết quả; hoàn tất đủ thủ tục tự cập nhật danh sách sẵn sàng trong demo. [Đặc tả hiện hành](../05-prototype/simulation-spec.md) và [quy tắc điều phối](../05-prototype/adaptive-routing.md) mô tả chi tiết; không đại diện quy trình chuyên môn đã được cơ sở xác nhận.

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

Hiệu quả giảm chờ và di chuyển sẽ được đánh giá bằng dữ liệu thực tế ở vòng thử tiếp theo.
