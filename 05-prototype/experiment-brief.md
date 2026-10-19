# Experiment brief - hướng dẫn chuyển bước trong lượt khám

**Đã có prototype và kiểm tra phần mềm; chưa thử với người dùng. AI LIVE đang chờ cấu hình.** Cập nhật 19/10/2026 theo các quyết định mô phỏng người làm bài cung cấp trực tiếp. [Need statement](../03-need-statement/need-statement.md) lấy điểm bàn giao/chuyển bước làm khoảnh khắc đào sâu. Nguồn nghiên cứu vẫn là P1/P2 và P3 tự thuật; không ghi thành ba cuộc phỏng vấn. [Đặc tả mô phỏng](simulation-spec.md) là quy tắc hiện hành, có [cấu hình](data/simulation-config.json); các quyết định sản phẩm mới không biến thành dữ liệu phỏng vấn.

**Câu hỏi học hỏi**

Hướng dẫn liên tục theo trạng thái có giúp người đi khám biết đúng việc tiếp theo, điểm đến, cách di chuyển và khi nào cần chờ/quay lại, kể cả khi kết quả của các dịch vụ cập nhật trong lúc họ đang làm việc khác không?

Giả thuyết chính: tại từng điểm bàn giao, người dùng hiểu được thẻ việc cần làm ngay và phân biệt nó với các kết quả còn đang chờ. Giả thuyết cạnh tranh: dữ liệu chưa được cập nhật; hướng dẫn cũ đã đủ nhưng khó tìm; người dùng cần đi cùng; hoặc quy trình chưa cho phép đi tiếp. Không coi giao diện là cách tự giải quyết dữ liệu nghiệp vụ thiếu.

**Phạm vi và kịch bản xuyên suốt**

Mô phỏng khám Nội tại Vinmec ở Vinhomes Ocean Park 2, hai dịch vụ là Siêu âm ổ bụng và Xét nghiệm sinh hóa máu. Phòng/tầng và bản đồ vẫn dựng cho demo, chưa phải sơ đồ thật. Theo dõi toàn bộ chuỗi; A/B là hai dịch vụ theo thứ tự thực hiện của kịch bản, không phải hai phương án thí nghiệm. Việc thực hiện trước có kết quả trước theo quy tắc mô phỏng.

| Điểm bàn giao / sự kiện giả được xác nhận | Màn hình người bệnh | Hành động cần quan sát |
| --- | --- | --- |
| Tiếp nhận đã hoàn tất, có phòng khám đầu | Việc cần làm, tòa/tầng/phòng, điểm xuất phát xác nhận và xem đường | Tìm phòng đầu và xác định cách đi |
| Bác sĩ/phòng khám xác nhận danh sách dịch vụ A/B và điều kiện thực hiện | Danh sách việc, việc đang được hướng dẫn, lý do/thứ tự theo dữ liệu đã cấp | Chọn đúng điểm dịch vụ tiếp theo |
| Bộ phận A xác nhận thao tác đã xong, kết quả đang xử lý | A: Đang chờ kết quả, mốc dự kiến nếu có nguồn; B là việc tiếp khi được phép | Đi B nếu đủ điều kiện; không hiểu chờ A thành phải dừng mọi việc |
| A có kết quả khi người dùng đang tới/làm B | Nhãn A đổi, có thông báo lưu lại; thẻ việc hiện hành giữ phù hợp với quy trình | Biết cập nhật A, không tự bỏ B hoặc tới nhận giấy trong nhánh điện tử |
| B hoàn tất nhưng còn kết quả bắt buộc chưa sẵn sàng | Tiến độ tổng hợp và nơi chờ/hành động tiếp theo được xác nhận | Biết còn chờ điều gì và ở đâu |
| Xong cả hai dịch vụ, đủ hai kết quả và đủ hai bản cứng nếu chọn nhánh giấy | Hướng quay phòng Nội, tuyến từ vị trí vừa xác nhận | Tới đúng nơi; khi còn ngoài viện không coi là đã sẵn sàng |
| Người bệnh tới ngoài phòng và bấm Sẵn sàng gặp bác sĩ chẩn đoán | Xác nhận tự khai báo có mặt; hiện trạng thái chờ bác sĩ gọi | Một hàng ở cột phải bác sĩ, không tự vào ngay |
| Bác sĩ chọn người sẵn sàng và bấm gọi vào | Thông báo bệnh nhân; bác sĩ mở toàn bộ kết quả/lịch sử khám giả đúng người | Hiểu lời gọi, không nhầm với thông báo có kết quả |

Không thêm nhiệm vụ đặt/hủy lịch, thanh toán, thuốc hoặc tái khám. Màn hình chính là hướng dẫn lượt khám; hội thoại AI hỗ trợ giải thích/tìm lại thông tin.

**Hai chế độ bắt buộc, áp dụng cùng cho cả hai dịch vụ**

1. **RETURN_TO_DOCTOR:** không cần nhận bản cứng của từng dịch vụ. Sau khi thực hiện xong cả hai, người bệnh trong demo được rời viện/làm việc khác khi chờ; đủ hai kết quả thì thông báo quay lại, khuyến khích trở lại sớm. Không tự đặt hạn quay lại/mất lượt. Tới ngoài phòng mới bấm sẵn sàng.
2. **COLLECT_PAPER:** cả hai dịch vụ yêu cầu nhận giấy. Khi đã làm xong các dịch vụ, hướng tới nơi có kết quả sẵn sàng trước để nhận trước, rồi tới nơi còn lại khi có; đủ kết quả và đủ giấy mới hướng quay phòng Nội và bấm sẵn sàng khi có mặt.

Bộ phận dịch vụ xác nhận kết quả thì cả bác sĩ và người bệnh cùng truy cập được trong cả hai chế độ. Bệnh nhân có thông báo, bác sĩ chỉ cập nhật nền; không tự mở kết quả/ngắt người bác sĩ đang tiếp nhận. Không dùng chế độ trộn theo dịch vụ trong phiên bản này. Giấy hướng dẫn cũ vẫn giữ ở cả hai chế độ, khác với yêu cầu đi nhận từng bản kết quả. Đây là quyết định mô phỏng, chưa xác minh hiện trạng tại Vinmec; xem [nguồn và điều chưa biết](../01-phong-van/vinmec-result-workflow-notes.md).

**Giao diện, trạng thái và bản đồ**

- Thẻ chính trả lời: “Làm gì bây giờ - tới đâu - đi thế nào”; kèm điều kiện cần biết và nút hỗ trợ.
- Danh sách tiến độ giữ riêng trạng thái thực hiện và kết quả của từng việc. Có thể A đã thực hiện/đang chờ, B đang thực hiện. Nhãn có chữ và biểu tượng bên cạnh màu.
- Nhãn kết quả đi cùng hướng dẫn thích hợp: tiếp tục việc hiện tại, chờ, nhận giấy hoặc quay phòng đầu. Chỉ định mới/hủy việc/đổi phòng được phản ánh từ sự kiện được xác nhận.
- Sơ đồ có tòa/tầng/phòng, lối nối và điểm đổi tầng; đường đi từ vị trí vừa xác nhận tới đích. Có hướng dẫn chữ theo mốc và cách xác nhận lại điểm đầu nếu đã di chuyển. Không giả làm định vị trực tiếp.
- Dự kiến có nguồn và lần cập nhật; hết mốc chưa tự chuyển thành Đã có kết quả. Thông báo còn trong app nếu bỏ lỡ push; dữ liệu cũ/thiếu được ghi rõ và có đường hỏi hỗ trợ.

Mọi địa điểm, thời gian, kết quả trạng thái và nhân viên đều tự tạo, có nhãn mô phỏng. Không nhập PID, giấy tờ, tài khoản hoặc dữ liệu sức khỏe thật.

**Cơ chế xác nhận và vai trò AI**

Lễ tân/bộ phận thực hiện/phòng khám hoặc hệ thống tương ứng là nguồn sự kiện. Bảng điều khiển demo phát các xác nhận và cập nhật màn hình bệnh nhân. Giao diện bác sĩ có hai cột chính: trái là chờ khám lần đầu; phải là người đã đủ điều kiện và tự xác nhận có mặt, sẵn sàng nghe chẩn đoán. Người chỉ đủ kết quả hoặc đang ngoài viện chưa vào cột phải. Bác sĩ chủ động chọn người gọi, không tự đặt ưu tiên giữa hai cột; khi gọi mở bộ kết quả/lịch sử giả đúng người. Nút bệnh nhân không tự xác nhận thủ tục chuyên môn đã xong hoặc chứng minh vị trí vật lý.

Nếu app/mạng lỗi, người bệnh dùng giấy và báo lễ tân/điều phối/nhân viên phòng khám; nhân viên có thể xác nhận sẵn sàng thủ công sau kiểm tra điều kiện. Không báo đã vào hàng chờ khi gửi thất bại. Xem đường dự phòng và các ca SIM-01–11 trong [đặc tả](simulation-spec.md).

Notification, nhãn và tìm đường có thể làm bằng quy tắc/thuật toán. AI đọc cùng dữ liệu đã cấp để giải thích tiến độ, hướng dẫn hành chính và trả lời câu hỏi như “A chưa có kết quả thì tôi đi B được chưa?” hoặc “Tôi có phải quay lại lấy giấy không?”. AI không tự chọn chỉ định, thay thứ tự bắt buộc, suy đủ kết quả từ nội dung y khoa hoặc tự gọi lượt.

Đường đi giữa hai điểm thuộc demo. Tối ưu tổng đường/thời gian qua nhiều điểm là phần mở rộng: cần mục tiêu và ràng buộc rõ; chỉ so các thứ tự được phép. Không gọi một lựa chọn nơi gần nhất là tối ưu toàn lượt hoặc đồng nhất đường ngắn nhất với hoàn tất sớm nhất.

**Cách thử với 2–3 người, chưa thực hiện**

Cho người dùng đi qua chuỗi đầy đủ để quan sát các điểm bàn giao; không chỉ khởi động từ A xong. Giao mục tiêu mà không chỉ nút bấm. Dùng sơ đồ và trạng thái giả, không đi thực địa theo sơ đồ demo.

1. Từ quầy, tìm được phòng đầu và cách đi; sau chỉ định, xác định việc tiếp theo.
2. Sau A, chọn làm B hay chờ đúng điều kiện. Ghi người dùng có hiểu A đang chờ nhưng B làm được không.
3. Nhận cập nhật A trong lúc làm B: nói được thay đổi và hành động tiếp theo.
4. Thử cả hai chế độ: điện tử cho phép chờ bên ngoài sau khi hoàn tất dịch vụ, giấy hướng nhận nơi có kết quả trước. Xác định còn thiếu kết quả/giấy gì; khi đủ mới tìm đường quay phòng đầu.
5. Tới ngoài phòng mới xác nhận sẵn sàng, quan sát cột phải và lời gọi của bác sĩ. Kiểm tra bác sĩ không bị ngắt hồ sơ khi kết quả người khác cập nhật.
6. Thử app lỗi và dùng giấy/nhân viên để tiếp tục, bao gồm đăng ký sẵn sàng thủ công. Đổi thứ tự hai chế độ giữa người thử khi khả thi; tình huống bỏ lỡ thông báo/đổi điểm đầu/dữ liệu cũ bổ sung theo thời gian buổi thử.

Có thể dùng phương án hướng dẫn tĩnh làm đối chiếu trên tình huống tương đương, giữ cùng dữ kiện và quy tắc, đổi thứ tự/reset và ghi ảnh hưởng học. Khi đó chỉ kết luận về gói thiết kế, chưa quy hiệu quả riêng cho map/push/nhãn. Phần AI cần nhiệm vụ hỏi hành chính riêng trên cùng trạng thái để kiểm tra có giúp hơn việc đọc hướng dẫn không.

| Chỉ số | Định nghĩa |
| --- | --- |
| Đúng bước tại mỗi bàn giao | Chọn đúng đi tiếp/chờ/nhận giấy/quay lại theo dữ liệu cấp |
| Đúng địa điểm và tuyến | Tòa/tầng/phòng, điểm đầu và đường trên sơ đồ giả |
| Thời gian quyết định | Từ nhiệm vụ/cập nhật tới hành động đúng; đo riêng từng điểm |
| Hiểu tiến độ | Nêu đúng việc hiện tại, kết quả đã có/đang chờ, giấy đã nhận/chưa nhận và điều kiện quay lại |
| Sẵn sàng và gọi vào | Chỉ xác nhận khi tự khai báo đang ngoài phòng, một hàng ở cột phải; phân biệt đủ kết quả với bác sĩ gọi |
| Dự phòng | Dùng giấy/nhân viên tiếp tục được khi app lỗi; không hiểu thao tác gửi thất bại thành đã vào hàng chờ |
| Trợ giúp và lỗi | Ghi nguyên nhân cần giúp; đi trước điều kiện, bỏ việc, tự vào, đi lấy giấy thừa |
| AI | Đúng dữ liệu, không tạo phòng/thời gian/điều kiện và biết chuyển hỗ trợ |

Mẫu nhỏ cung cấp phát hiện sử dụng, không là A/B thống kê hoặc bằng chứng tiết kiệm phút tại viện. Chưa đặt số phần trăm thành công như kết quả đã đạt.

**Prompt nháp và quyết định sau thử**

> Bạn hỗ trợ giải thích quy trình hành chính trong lượt khám mô phỏng. Chỉ dùng danh sách việc, điều kiện, trạng thái kết quả, quy tắc nhận kết quả/quay lại và hướng dẫn đường đã cấp. Nói rõ việc nên làm bây giờ, nơi đến, cách đi khi có dữ liệu và những gì còn chờ. Phân biệt đã thực hiện, kết quả được công bố, bác sĩ truy cập được, cần quay lại và được mời vào. Không tự đặt chỉ định, diễn giải y khoa, suy thứ tự hoặc hứa thời gian. Thiếu thông tin thì nêu phần thiếu và hướng đầu mối hỗ trợ. Giữ nguồn, lần cập nhật và nhãn mô phỏng.

Nếu người dùng nhầm chờ A là phải dừng mọi việc, sửa cách thể hiện tiến độ. Nếu nhầm có kết quả là bỏ B/được vào ngay hoặc đi lấy giấy thừa, sửa hành động gắn với trạng thái. Nếu chỉ đường không giúp xác định tuyến, sửa điểm đầu/mốc/hướng dẫn. Giữ AI ở nhiệm vụ có bằng chứng hữu ích và đúng dữ liệu.

Prompt/cấu hình và giới hạn eval đã lưu ở [prompts.md](prompts.md), bằng chứng kiểm tra phần mềm ở [test-report.md](test-report.md), sửa đổi ở [CHANGELOG.md](CHANGELOG.md). [user-test-log.md](user-test-log.md) vẫn chưa có buổi thử thật. Không tích hợp bệnh viện hoặc dùng kiểm tra tự động thay log người dùng.
