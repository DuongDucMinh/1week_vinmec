# Trả kết quả tại Vinmec - nguồn công khai và giả định thiết kế

Nguồn công khai đọc ngày 18/10/2026; cập nhật quyết định mô phỏng ngày 20/10/2026. Đây là nghiên cứu tài liệu và ghi nhận lựa chọn sản phẩm do Codex hỗ trợ, không phải phỏng vấn, nhật ký tự dùng app hoặc quy trình nội bộ được Vinmec xác nhận.

**Nguồn chính thức đã đọc**

| Nguồn | Nội dung liên quan | Giới hạn |
| --- | --- | --- |
| [Vinmec - Sức khỏe tổng quát](https://www.vinmec.com/vie/chuyen-khoa/suc-khoe-tong-quat), phần quản lý dữ liệu trực tuyến | Mô tả có thông báo tự động và xem kết quả qua MyVinmec sau thăm khám | Không đặc tả từng xét nghiệm ngoại trú, thời điểm bác sĩ truy cập, nơi trả bản cứng hoặc quyền rời nơi thực hiện |
| [Hướng dẫn xem kết quả Covid-19 trên MyVinmec](https://www.vinmec.com/vie/bai-viet/theo-doi-ket-qua-xet-nghiem-covid-19-tai-vinmec-tren-ung-dung-myvinmec-vi), cập nhật 22/07/2024 | Có truy cập kết quả loại xét nghiệm được nêu qua hồ sơ kết nối; tài liệu phân biệt bản trên app với bản cứng khi cần giấy xác nhận | Chỉ áp dụng phạm vi bài hướng dẫn đó; không suy mọi xét nghiệm cần giấy hay mọi quy trình hiện hành giống năm 2024 |

Có bằng chứng công khai cho khả năng xem kết quả và thông báo ở một số bối cảnh. Chưa đủ để xác nhận mọi kết quả ngoại trú tự về phòng khám đầu, bệnh nhân không cần nhận giấy hoặc tất cả cập nhật theo thời gian thực. Vì vậy không mô tả sản phẩm là bổ sung khả năng xem/thông báo kết quả hoàn toàn chưa tồn tại; điểm giá trị cần thử là nối trạng thái với hành động, địa điểm và đường đi trong lượt khám.

**Thiết kế mô phỏng hiện hành, cập nhật 20/10/2026**

| Nội dung | Quy tắc trong prototype |
| --- | --- |
| Bối cảnh | 5 khoa, 9 thủ tục; bác sĩ chọn riêng theo từng bệnh nhân |
| Thứ tự đi | Ưu tiên ít người tại phòng, bằng nhau chọn gần nhất; tính lại sau mỗi thủ tục |
| Đường đi | Thang máy mặc định, có thể chọn thang bộ; sơ đồ từng chặng và giọng đọc |
| Kết quả | Phòng xác nhận công bố, bệnh nhân / bác sĩ cùng xem; cập nhật nền và thông báo |
| Quay lại | Hoàn tất toàn bộ thủ tục tự vào danh sách sẵn sàng của khoa đầu; kết quả / giấy là thao tác riêng |
| Người dùng giấy | Nhân viên ghi nhận đến phòng / thực hiện; giữ giấy chỉ định hoặc số tại cửa phòng |

[Đặc tả hiện tại](../05-prototype/simulation-spec.md). Các quy tắc trên là lựa chọn thiết kế phục vụ thử nghiệm, không phải kết luận về vận hành hiện có của Vinmec. Nguồn công khai ở phần đầu không xác nhận các quy tắc điều phối này.

**Những gì còn phải xác minh nếu triển khai thật**

- Sơ đồ/tầng/phòng thực tế, cách trả từng loại kết quả, thời điểm công bố/quyền xem và hệ thống cung cấp sự kiện ở cơ sở mục tiêu.
- Điều kiện được rời viện, thời gian tiếp nhận quay lại, điều kiện bác sĩ cần đủ kết quả và quy tắc điều phối hai nhóm chờ.
- Người chịu trách nhiệm cập nhật/giao giấy/hỗ trợ khi lỗi; khả năng tiếp tục bằng giấy, đăng ký sẵn sàng thủ công và đồng bộ sau lỗi.
- Cách ghi nhận người đến / rời phòng và kiểm tra hiện diện; app hiện dùng xác nhận của người bệnh hoặc nhân viên, chưa có định vị tự động.

Các ví dụ người làm bài kể về cơ sở khác là thông tin bối cảnh, chưa được chuyển thành kết luận chung về bệnh viện lớn/nhỏ hoặc bằng chứng hiện trạng Vinmec.
