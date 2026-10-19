# Đặc tả mô phỏng điều phối khám ngoại trú

Phiên bản hiện hành: 20/10/2026. Đặc tả này mô tả hành vi ứng dụng; dữ liệu và sơ đồ phục vụ prototype, cần được cơ sở xác minh trước triển khai.

## Phạm vi và vai trò

5 khoa khám: Nội, Tim mạch, Răng - Hàm - Mặt, Tai - Mũi - Họng, Da liễu. 9 thủ tục được chọn theo từng bệnh nhân sau khám đầu; không tự gán trước. Hai tòa A / B có thang máy, thang bộ và lối nối. Dữ liệu runtime tại [fixtures.ts](src/shared/fixtures.ts); hợp đồng tại [contracts.ts](src/shared/contracts.ts).

| Vai trò | Quyền nghiệp vụ |
| --- | --- |
| Tiếp nhận / điều phối | Chọn khoa, tiếp nhận, cấu hình lấy lượt và reset |
| Bác sĩ | Gọi khám đầu, bắt đầu trao đổi, chỉ định hoặc hoàn tất khám không có thủ tục |
| Phòng thủ tục | Ghi nhận đến phòng, bắt đầu / hoàn tất, công bố kết quả và giao giấy |
| Người bệnh | Xem hướng dẫn, xác nhận vị trí, chọn loại thang, đọc kết quả và reset hành trình |

## Hành trình

`UNREGISTERED` → `WAITING_INITIAL` → `INITIAL_ENCOUNTER` → `SERVICES` → `READY`.

Lễ tân chọn khoa và xếp số riêng theo khoa. Bác sĩ chốt chỉ định sau khi bắt đầu trao đổi. Mọi phòng được chỉ định thấy tên ngay; danh sách này không quyết định thứ tự gọi tại cửa phòng. Xong tất cả thủ tục đưa người bệnh vào cột sẵn sàng của khoa ban đầu và chỉ đường quay lại. Demo dừng khi người bệnh quay lại phòng; không cần nút tự khai báo sẵn sàng. Không có thủ tục thì bác sĩ có thể kết thúc ngay sau khám đầu.

## Chọn phòng tiếp theo

1. Lấy các thủ tục chưa hoàn tất của riêng bệnh nhân; nếu đang thực hiện thì giữ thủ tục đó.
2. Với mỗi phòng, đếm bệnh nhân khác đang thực hiện, hoặc chưa bắt đầu nhưng đã được xác nhận ở phòng. Bỏ người ngoài viện và người đã hoàn tất tại phòng. Người đang ở nơi khác nhưng có chỉ định tương lai không được tính.
3. Ưu tiên số người ít nhất. Nếu bằng nhau, dùng độ dài đường ngắn nhất trên đồ thị từ vị trí hiện tại, theo loại thang đã chọn. Trọng số đồ thị là đơn vị mô phỏng, không phải mét hoặc phút.
4. Nếu cả số người và khoảng cách đều bằng nhau, dùng thứ tự danh sách chỉ định để giữ kết quả ổn định. Khi chưa xác nhận vị trí, giữ tiêu chí số người và thứ tự danh sách; yêu cầu chọn mốc trước khi vẽ tuyến.
5. Lưu `recommendedServiceId` khi chốt chỉ định và tính lại sau mỗi `COMPLETE_SERVICE`. Trong lúc di chuyển, thay đổi ở phòng khác không tự đổi điểm đến. Các thủ tục phía sau được xếp thành dự kiến từ vị trí từng phòng theo số người hiện tại.

`services` lưu nguyên danh sách bác sĩ. `procedurePlan` là thứ tự hướng dẫn; các thủ tục đã hoàn tất hiển thị theo `performanceOrder`. Có thể thực hiện khác gợi ý theo thứ tự gọi giấy / số, rồi tính lại từ phòng vừa hoàn tất. [Chi tiết và ví dụ](adaptive-routing.md).

Mỗi phòng giả lập một bác sĩ, phục vụ tối đa một bệnh nhân tại một thời điểm. Không cho một người thực hiện ở hai phòng cùng lúc. Gợi ý hiện chưa tính thời lượng, lịch hẹn, nhiều bác sĩ hoặc phụ thuộc chuyên môn giữa các thủ tục.

## Thang máy và thang bộ

Mỗi tầng có các nút `lift` và `stairs` riêng, nối với hành lang. Mặc định `transportMode` là `lift`, kể cả dữ liệu cũ chưa có trường này. Người bệnh gửi `SET_TRANSPORT_MODE` để đổi; lựa chọn lưu ở lượt khám và dùng cho mọi tuyến dịch vụ / quay lại. Chỉ cho cạnh đổi tầng đúng loại thang; không tự trộn hai loại. Đổi thang giữ điểm đến, khởi động lại chặng và nội dung giọng đọc từ vị trí đã xác nhận.

Thang máy gộp các tầng đi xuyên qua thành một chặng. Thang bộ hướng dẫn qua từng tầng. Xác nhận vị trí hoặc hoàn tất thủ tục cập nhật mốc xuất phát. Chưa biết vị trí hoặc đang ngoài viện thì yêu cầu xác nhận điểm xuất phát, không vẽ từ một phòng cũ.

## Tiến độ, kết quả và giấy

`executionStatus`, `resultStatus` và `paperStatus` tách riêng. Hoàn tất thủ tục không tự công bố kết quả. Phòng công bố kết quả thì bệnh nhân và bác sĩ cùng xem được, người bệnh có thông báo. Kết quả có thể đến độc lập thứ tự làm thủ tục và không ngắt thủ tục đang thực hiện.

`RETURN_TO_DOCTOR` dùng kết quả điện tử; `COLLECT_PAPER` theo dõi thêm giấy kết quả. Cả hai chế độ tự sẵn sàng sau thủ tục cuối trong kịch bản hiện tại; việc công bố kết quả và giao giấy là thao tác riêng. Mọi người vẫn dùng phiếu chỉ định hoặc số tại cửa phòng. Cấu hình `PAPER_TRAY` / `TAKE_NUMBER` áp dụng chung cho người có app và dùng giấy.

`CHECK_IN_SERVICE` cho nhân viên ghi nhận người đã đến phòng mà không cần họ mở app. `START_SERVICE` ghi nhận đang thực hiện. Cả hai cập nhật nguồn đếm lượng người tại phòng; `COMPLETE_SERVICE` đưa người ra khỏi lượng người chờ / thực hiện ở phòng vừa làm.

## Đồng bộ và dữ liệu

Server là nguồn trạng thái chuẩn. SQLite lưu lượt, sự kiện và biên nhận; SSE đồng bộ các màn. Lệnh có command ID, run ID, revision và journey version để loại thao tác cũ / lặp. Reset toàn lượt tăng generation; reset một bệnh nhân tăng journey version, xóa chỉ định, lựa chọn điểm đến và đưa loại thang về mặc định, giữ các bệnh nhân khác và cấu hình phòng.

Giấy hướng dẫn in theo thứ tự dự kiến và loại thang đang chọn, có thời điểm cập nhật. Khi app mất mạng, giấy / nhân viên tiếp tục hỗ trợ; giấy không tự cập nhật. AI chỉ diễn đạt hướng dẫn hành chính dựa trên facts, không quyết định bước chuyển hoặc ghi dữ liệu.

## Giới hạn mô phỏng

Vị trí cần người bệnh / nhân viên xác nhận. Chưa có bản đồ khảo sát, định vị trong nhà hay dữ liệu bệnh viện thật. Chưa chứng minh giảm tổng thời gian chờ; quy tắc ít người trước là giả thuyết điều phối cần đo. Nghiên cứu nguồn, phản hồi dùng thử và kiểm thử phần mềm được lưu riêng, không coi kết quả tự động là bằng chứng thử nghiệm lâm sàng hoặc trải nghiệm thực địa.
