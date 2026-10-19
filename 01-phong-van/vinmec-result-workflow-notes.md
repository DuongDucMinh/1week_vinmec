# Trả kết quả tại Vinmec - nguồn công khai và giả định thiết kế

Nguồn công khai đọc ngày 18/10/2026; cập nhật quyết định mô phỏng ngày 19/10/2026. Đây là nghiên cứu tài liệu và ghi nhận lựa chọn sản phẩm do Codex hỗ trợ, không phải phỏng vấn, nhật ký tự dùng app hoặc quy trình nội bộ được Vinmec xác nhận.

**Nguồn chính thức đã đọc**

| Nguồn | Nội dung liên quan | Giới hạn |
| --- | --- | --- |
| [Vinmec - Sức khỏe tổng quát](https://www.vinmec.com/vie/chuyen-khoa/suc-khoe-tong-quat), phần quản lý dữ liệu trực tuyến | Mô tả có thông báo tự động và xem kết quả qua MyVinmec sau thăm khám | Không đặc tả từng xét nghiệm ngoại trú, thời điểm bác sĩ truy cập, nơi trả bản cứng hoặc quyền rời nơi thực hiện |
| [Hướng dẫn xem kết quả Covid-19 trên MyVinmec](https://www.vinmec.com/vie/bai-viet/theo-doi-ket-qua-xet-nghiem-covid-19-tai-vinmec-tren-ung-dung-myvinmec-vi), cập nhật 22/07/2024 | Có truy cập kết quả loại xét nghiệm được nêu qua hồ sơ kết nối; tài liệu phân biệt bản trên app với bản cứng khi cần giấy xác nhận | Chỉ áp dụng phạm vi bài hướng dẫn đó; không suy mọi xét nghiệm cần giấy hay mọi quy trình hiện hành giống năm 2024 |

Có bằng chứng công khai cho khả năng xem kết quả và thông báo ở một số bối cảnh. Chưa đủ để xác nhận mọi kết quả ngoại trú tự về phòng khám đầu, bệnh nhân không cần nhận giấy hoặc tất cả cập nhật theo thời gian thực. Vì vậy không mô tả sản phẩm là bổ sung khả năng xem/thông báo kết quả hoàn toàn chưa tồn tại; điểm giá trị cần thử là nối trạng thái với hành động, địa điểm và đường đi trong lượt khám.

**Đã chốt cho mô phỏng ngày 19/10, chưa xác minh như hiện trạng Vinmec**

| Câu hỏi | Quyết định do người làm bài cung cấp |
| --- | --- |
| Bối cảnh và dịch vụ | Vinmec tại Vinhomes Ocean Park 2, Nội; Siêu âm ổ bụng và Xét nghiệm sinh hóa máu |
| Cách trả | Thử bắt buộc hai lượt/chế độ: cả hai cần giấy hoặc cả hai chuyển kết quả về bác sĩ; không dùng chế độ trộn trong bản này |
| Xác nhận kết quả | Bộ phận thực hiện xác nhận thì cả bác sĩ và người bệnh xem được; thông báo cho bệnh nhân, cập nhật nền cho bác sĩ |
| Thứ tự kết quả | Dịch vụ làm trước có kết quả trước trong kịch bản |
| Điều kiện quay lại | Xong cả hai dịch vụ và đủ cả hai kết quả; nhánh cần giấy nhận đủ hai bản |
| Chờ bên ngoài | Nhánh điện tử cho rời viện sau khi xong thủ tục, quay lại khi đủ kết quả, khuyến khích quay sớm |
| Sẵn sàng và gọi vào | Người bệnh ở ngoài phòng tự xác nhận sẵn sàng; bác sĩ chọn ở cột phải, gọi vào rồi mở bộ kết quả/lịch sử giả |
| Dự phòng | Giữ giấy hướng dẫn; khi app lỗi dùng giấy và nhờ nhân viên hỗ trợ, gồm đăng ký sẵn sàng thủ công |

Xem [đặc tả mô phỏng](../05-prototype/simulation-spec.md). Các câu trả lời đã đủ để dựng kịch bản, không còn là thông tin cần hỏi lại để tiếp tục thiết kế. Chúng là lựa chọn cho demo, không phải dữ liệu vận hành được cơ sở xác nhận. Câu need chính không cần đổi vì các quyết định này cụ thể hóa giải pháp.

**Những gì còn phải xác minh nếu triển khai thật**

- Sơ đồ/tầng/phòng thực tế, cách trả từng loại kết quả, thời điểm công bố/quyền xem và hệ thống cung cấp sự kiện ở cơ sở mục tiêu.
- Điều kiện được rời viện, thời gian tiếp nhận quay lại, điều kiện bác sĩ cần đủ kết quả và quy tắc điều phối hai nhóm chờ.
- Người chịu trách nhiệm cập nhật/giao giấy/hỗ trợ khi lỗi; khả năng tiếp tục bằng giấy, đăng ký sẵn sàng thủ công và đồng bộ sau lỗi.
- Cách kiểm tra người bệnh có mặt: nút sẵn sàng hiện chỉ tự khai báo, chưa có xác thực vị trí.

Các ví dụ người làm bài kể về cơ sở khác là thông tin bối cảnh, chưa được chuyển thành kết luận chung về bệnh viện lớn/nhỏ hoặc bằng chứng hiện trạng Vinmec.
