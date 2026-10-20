# Lịch sử phát triển

## 21/10/2026 - thu gọn trạng thái kết nối

- Chuyển thanh thời gian thành biểu tượng Wi-Fi cạnh tên người bệnh, không chiếm dòng riêng. Chạm để xem thời điểm đồng bộ; mất mạng có biểu tượng gạch và cảnh báo.

## 21/10/2026 - cập nhật vị trí và trạng thái đồng bộ

- Thêm Cập nhật vị trí theo tòa/tầng/mốc, không chọn sẵn; giữ tiến độ và điểm đến, tính lại đường khi xác nhận thành công. Có lối nhờ nhân viên khi không nhận ra mốc.
- Luôn hiện thời điểm đồng bộ dưới tên người bệnh. Chi tiết tách lần nhận dữ liệu thành công và lần dữ liệu hệ thống thay đổi; mất kết nối giữ mốc cũ, khóa xác nhận và cho kết nối lại.
- Đồng bộ mô tả, ảnh và slide với hành vi hiện tại. Chưa có định vị tự động, quản lý giữ lượt khi tạm rời viện hoặc cache ngoại tuyến bền vững.

## 20/10/2026 - phủ giọng cho toàn bộ khoa và thủ tục

- Xác định tuyến thực tế A205 tới Da liễu A405 không nằm trong bộ 232 câu cho hai kịch bản ban đầu. Phân biệt thiếu bản ghi với lỗi phát để thông báo đúng nguyên nhân.
- Mở rộng lên 344 câu / 16 điểm đến / 1568 ca tuyến; thêm 112 câu, giữ lại 232 WAV. Công cụ local sinh phần thiếu rồi hợp nhất với WAV cũ sau kiểm tra nội dung / giọng / mô hình / SHA-256; chỉ kích hoạt khi bộ đầy đủ. Notebook độc lập vẫn xuất bộ đầy đủ.

## 20/10/2026 - cài đủ 232 WAV và sửa thay manifest trên Windows

- Phục hồi bộ 232 WAV từ kết quả đã tải, sửa quyền của manifest do sandbox tạo và cài bằng tài khoản chạy công cụ. Không sinh lại Kaggle.
- Thử lại khi Windows tạm khóa rename; giữ manifest đang hoạt động nếu thất bại và phân biệt lỗi cài trên máy với thiếu dữ liệu tải.

## 20/10/2026 - lời chỉ đường và lựa chọn loa

- Loa mặc định bật; ghi nhớ thao tác tắt / bật qua các bước, tab và lần tải lại. Lỗi tải hoặc kết thúc clip không tắt loa. Thông báo giọng được đặt trong dòng riêng, không che nút chọn thang.
- Giọng chỉ đọc mô tả của chặng hiện tại, bỏ tiêu đề và lời báo tuyến bị ghép thêm. Mô tả dùng cửa phòng / cửa thang, hướng rẽ theo chiều đi, chỉ nhắc phòng đích một lần và bỏ chỉ dẫn theo màu bản đồ.
- Xuất lại 232 câu Nhật Phong cho cùng 8 hành trình và 588 ca tuyến; cần sinh lại các WAV có nội dung thay đổi. Giữ bộ 140 WAV cũ trên đĩa, chỉ dùng khi mã nội dung khớp.

## 20/10/2026 - bộ câu Nhật Phong cho Tim mạch và Nội

- Xuất 140 câu riêng biệt, 8 thứ tự thủ tục và 224 tổ hợp đổi loại thang theo chặng; kiểm tra 588 trường hợp nguồn / đích / loại thang. Dùng chung hàm lời đọc giữa UI và công cụ xuất.
- Chuẩn bị OmniVoice trên Kaggle bằng luồng của video-studio: kernel riêng tư, GPU T4, giọng Nhật Phong, WAV từng câu và manifest gắn nội dung. Có notebook chạy tay hoặc công cụ local nhận kaggle.json trong bộ nhớ.
- Thêm kiểm tra / nhập WAV và ưu tiên phát file đã tạo sẵn trước Azure; khóa Azure không bắt buộc cho những câu đã có audio. Chưa có WAV thật cho tới khi job Kaggle hoàn tất.

## 20/10/2026 - giọng chỉ đường tiếng Việt trực tuyến

- Thay Web Speech trên thiết bị bằng Azure Speech, mặc định giọng nữ Việt `vi-VN-HoaiMyNeural`; có cấu hình giọng nam `vi-VN-NamMinhNeural`.
- Giữ khóa ở server, cố định ngôn ngữ / giọng Việt và đọc mã phòng theo tiếng Việt. Tái sử dụng tối đa 64 câu âm thanh trong bộ nhớ.
- Hủy yêu cầu / dừng âm thanh khi đổi bước, tuyến, tắt loa hoặc rời màn; có Nghe lại khi lỗi hoặc bị chặn tự phát. Không dùng giọng Anh làm dự phòng.
- Thêm kiểm thử provider, HTTP, vòng đời phát âm thanh và Chrome với âm thanh mẫu. Cần khóa Azure Speech để kiểm tra giọng thật.

## 20/10/2026 - giảm thao tác chỉ đường và thu gọn thông báo

- Gộp đi tới thang và lên / xuống tầng đích thành một bước cho cả thang máy và thang bộ; không dừng xác nhận tầng trung gian hoặc hành lang trước phòng.
- Lưu vị trí sau từng bước để đổi loại thang không quay về điểm xuất phát; thêm nút Quay lại bước trước.
- Đồng nhất ô mã phòng nhỏ gọn, sát hành lang; xếp nhãn thang / lối nối / vị trí theo hàng để tránh chồng chữ.
- Chỉ hiển thị thẻ mời bật thông báo lần đầu; sau đó dùng biểu tượng chuông góc phải để bật / tắt và ghi nhớ lựa chọn.

## 20/10/2026 - tinh gọn không gian bác sĩ, tiếp tân và phòng thủ tục

- Giữ ba màn trong chiều cao cửa sổ; danh sách dài cuộn riêng, các nút thao tác chính luôn hiện. Màn nhỏ chuyển vùng làm việc bằng nút chọn thay vì xếp xuống dưới.
- Bác sĩ xem danh mục và chỉ định đã chọn song song; danh sách chờ, quay lại và kết quả chuyển bằng ba mục ngắn.
- Tiếp tân chọn hồ sơ từ danh sách, tiếp nhận và theo dõi thủ tục trong một khung; chỉ reset hồ sơ đang chọn. Chuyển cấu hình và công cụ kiểm tra vào hộp cài đặt.
- Phòng thủ tục tách thực hiện và công bố kết quả; rút gọn nhãn, chuyển hướng dẫn dài vào nút trợ giúp.

## 20/10/2026 - thống nhất khung người bệnh và giao diện chatbot

- Dùng cùng chiều cao, header và điều hướng dưới cho bốn tab; cuộn riêng vùng nội dung và thu gọn khoảng cách lượt khám / thông báo.
- Đổi trợ lý sang giao diện hội thoại với câu hỏi hiện ngay, trạng thái đang trả lời, thử lại và ô nhập cố định; giữ hội thoại / bản nháp khi đổi tab và xóa khi đổi lượt khám.
- Ghi rõ luồng SQLite → dữ kiện theo lượt khám → LLM → câu trả lời, cùng hướng mở rộng dữ liệu thủ tục.

## 20/10/2026 - rút gọn màn chỉ đường người bệnh

- Bổ sung các phòng lân cận, cổng và lối nối làm mốc tham chiếu để nhận biết hướng hành lang. Giữ tọa độ tương đối, làm nổi bật tuyến / vị trí hiện tại, không thêm bước xác nhận cho phòng tham chiếu.
- Gộp xác nhận mốc, đổi chặng và đến phòng thành một nút theo bước hiện tại.
- Đưa phòng đến, mốc tiếp theo và bản đồ vào một màn hình; chuyển bật / tắt giọng đọc thành biểu tượng loa góc phải.
- Bỏ các nội dung mô tả demo, tóm tắt trùng lặp và nút tự báo đi nhầm. Tự cập nhật tuyến theo nguồn vị trí mô phỏng, nhận ra lệch tuyến / đi ngược từ cập nhật vị trí.
- Nối thang bộ độc lập với hành lang, loại thang không được chọn khỏi các mốc trung gian.

## 20/10/2026 - điều phối thủ tục và lựa chọn thang

- Ưu tiên phòng ít người đang chờ / thực hiện, cùng số người chọn phòng gần nhất. Tính lại sau mỗi thủ tục và giữ điểm đến trong lúc di chuyển.
- Tách thứ tự dự kiến của bệnh nhân khỏi danh sách chỉ định của bác sĩ.
- Thêm thang bộ ở mọi tầng; thang máy mặc định. Lựa chọn cập nhật tuyến, chỉ dẫn, giọng đọc và giấy hướng dẫn.
- Nhân viên ghi nhận đến phòng cho người dùng giấy và bắt đầu thực hiện để cập nhật lượng người tại phòng.
- Cập nhật README, tài liệu và slide; thu gọn nội dung nghiên cứu và giữ một bộ trình bày hiện hành.

[Chi tiết tính năng](adaptive-routing.md) · [Kiểm thử](test-report.md)

## 19/10/2026 - khoa khám, thủ tục và reset hành trình

- Mở rộng lên 5 khoa và 9 thủ tục, danh sách chỉ định riêng theo bệnh nhân.
- Mỗi khoa có danh sách chờ và lượt đang khám riêng.
- Reset riêng từng bệnh nhân; giữ bệnh nhân khác và cấu hình phòng.
- Hoàn tất mọi thủ tục tự cập nhật danh sách sẵn sàng và chỉ đường về khoa ban đầu.

## 19/10/2026 - dùng chung giấy và ứng dụng

- Phòng thủ tục thấy mọi chỉ định ngay sau khi bác sĩ chốt.
- Hỗ trợ gọi theo khay giấy hoặc số lấy tại cửa phòng.
- Tách thực hiện thủ tục, công bố kết quả và giao giấy.
- Giữ giấy hướng dẫn dự phòng và đồng bộ lại khi có kết nối.

## 19/10/2026 - cải tiến từ phản hồi người dùng

- Thu gọn chữ trên màn bệnh nhân, làm nổi bật việc tiếp theo.
- Thêm chỉ dẫn từng mốc, hướng rẽ theo chiều đi, giọng đọc và nghe lại.
- Chọn lại mốc khi đi nhầm; bổ sung liên kết tìm cơ sở trên Google Maps.

## Phiên bản nền tảng

Xây dựng React / Node / SQLite, API, SSE, bản đồ, thông báo kết quả, trợ lý hướng dẫn và bộ kiểm thử. Bổ sung kiểm soát lệnh lặp, dữ liệu cũ sau reset, khôi phục thao tác và hộp thoại hỗ trợ bàn phím.
