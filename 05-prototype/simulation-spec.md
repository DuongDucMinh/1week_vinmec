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

Mỗi tầng có các nút `lift` và `stairs` riêng, nối với hành lang. Mặc định `transportMode` là `lift`, kể cả dữ liệu cũ chưa có trường này. Người bệnh gửi `SET_TRANSPORT_MODE` để đổi; lựa chọn lưu ở lượt khám và dùng cho mọi tuyến dịch vụ / quay lại. Chỉ cho cạnh đổi tầng đúng loại thang; không tự trộn hai loại. Đổi thang giữ điểm đến, tiếp tục hướng dẫn và giọng đọc từ vị trí đã xác nhận.

Cả thang máy và thang bộ gộp việc đi tới thang và đổi đến tầng cần tới thành một bước, bỏ xác nhận các tầng đi ngang qua. Hành lang tới cửa phòng không tách thành bước riêng. Mỗi bước xác nhận gửi CONFIRM_LOCATION để lưu vị trí đã xác nhận trong mô phỏng, giữ tiến độ khi đổi thang hoặc tải lại có kết nối. Nút Quay lại dùng lịch sử các bước đã xác nhận trong màn chỉ đường; thay điểm đến, reset lượt hoặc cập nhật vị trí bên ngoài sẽ xóa lịch sử cũ. Khi mô hình chưa biết vị trí hoặc ghi nhận ngoài viện thì yêu cầu xác nhận điểm xuất phát. Nếu vị trí thực tế khác vị trí đã lưu, người bệnh chủ động mở Cập nhật vị trí; app chưa tự phát hiện sai lệch.

Hai loại thang nối độc lập với hành lang; loại không được chọn không xuất hiện như mốc trung gian. Ngoại lệ là điểm xuất phát / đích khi người bệnh đã ở chính mốc đó. Màn chỉ đường ưu tiên mã phòng, hướng đi tiếp theo và bản đồ trong một khung nhìn. Loa là nút biểu tượng ở góc phải. Một nút xác nhận chính lần lượt đưa qua bước đổi tầng / tòa rồi đến phòng, kèm nút Quay lại. Ô mã phòng có cùng kích thước và sát hành lang; nhãn vị trí / thang / lối nối được xếp hàng tránh chồng chữ.

Sơ đồ hiển thị thêm phòng lân cận, cổng và lối nối trên cùng tầng để đối chiếu hướng đi. Các phòng tham chiếu nằm trong `graph.landmarks`, tách khỏi nút định tuyến và danh sách thủ tục. Cửa phòng được đặt theo tọa độ tương đối trên hành lang; màu trung tính cho phòng tham chiếu, xanh dương cho vị trí hiện tại và xanh lá cho tuyến / mốc tiếp theo. Không tự thêm phòng tham chiếu vào các bước cần xác nhận.

Khi snapshot cập nhật vị trí, server tính lại tuyến từ vị trí mới. Client đặt lại hướng dẫn khi vị trí thay đổi ngoài thao tác xác nhận đang chờ; nếu vị trí mới không thuộc tuyến trước đó thì hiện thông báo cập nhật đường đi. Giọng đọc dùng mô tả của tuyến mới. Đây là phản ứng với vị trí được cấp, chưa phải phát hiện đi lạc ngoài thực tế. Nút Cập nhật vị trí gửi `CONFIRM_LOCATION`; chưa tích hợp cảm biến vị trí thật.

## Tiến độ, kết quả và giấy

`executionStatus`, `resultStatus` và `paperStatus` tách riêng. Hoàn tất thủ tục không tự công bố kết quả. Phòng công bố kết quả thì bệnh nhân và bác sĩ cùng xem được, người bệnh có thông báo. Người bệnh được mời bật banner một lần tại tab Thông báo; bật rồi sẽ thay thẻ mời bằng chuông bật / tắt, lưu lựa chọn trong localStorage. Kết quả có thể đến độc lập thứ tự làm thủ tục và không ngắt thủ tục đang thực hiện.

`RETURN_TO_DOCTOR` dùng kết quả điện tử; `COLLECT_PAPER` theo dõi thêm giấy kết quả. Cả hai chế độ tự sẵn sàng sau thủ tục cuối trong kịch bản hiện tại; việc công bố kết quả và giao giấy là thao tác riêng. Mọi người vẫn dùng phiếu chỉ định hoặc số tại cửa phòng. Cấu hình `PAPER_TRAY` / `TAKE_NUMBER` áp dụng chung cho người có app và dùng giấy.

`CHECK_IN_SERVICE` cho nhân viên ghi nhận người đã đến phòng mà không cần họ mở app. `START_SERVICE` ghi nhận đang thực hiện. Cả hai cập nhật nguồn đếm lượng người tại phòng; `COMPLETE_SERVICE` đưa người ra khỏi lượng người chờ / thực hiện ở phòng vừa làm.

## Đồng bộ và dữ liệu

Server là nguồn trạng thái chuẩn. SQLite lưu lượt, sự kiện và biên nhận; SSE đồng bộ các màn. Lệnh có command ID, run ID, revision và journey version để loại thao tác cũ / lặp. Reset toàn lượt tăng generation; reset một bệnh nhân tăng journey version, xóa chỉ định, lựa chọn điểm đến và đưa loại thang về mặc định, giữ các bệnh nhân khác và cấu hình phòng.

Giấy hướng dẫn in theo thứ tự dự kiến và loại thang đang chọn, có thời điểm cập nhật. Khi app mất mạng, giấy / nhân viên tiếp tục hỗ trợ; giấy không tự cập nhật. AI chỉ diễn đạt hướng dẫn hành chính dựa trên facts, không quyết định bước chuyển hoặc ghi dữ liệu.

## Đi lạc, tạm rời viện và mất kết nối

Cập nhật 21/10/2026.

### Cập nhật vị trí chủ động

Màn Đường đi có nút **Cập nhật vị trí**, dùng khi đi lạc hoặc quay lại viện. Người bệnh đối chiếu biển tên, chọn tòa, tầng và mốc đang đứng rồi xác nhận. Mốc không được chọn sẵn; đổi tòa/tầng xóa lựa chọn phụ thuộc. Chỉ chọn các mốc có trong đồ thị định tuyến, không dùng phòng tham chiếu chưa có đường nối.

Xác nhận gửi `CONFIRM_LOCATION`, giữ thủ tục đã hoàn tất và điểm đến, tính lại đường từ mốc mới và xóa lịch sử Quay lại cũ. Lỗi cập nhật giữ hộp chọn và không báo thành công. Khi chưa rõ kết quả lệnh, dùng cơ chế gửi lại cùng xác nhận. Lựa chọn không biết vị trí mở hướng dẫn nhờ nhân viên, không đổi vị trí. Trong lúc đang thực hiện thủ tục hoặc đã được gọi vào khám, không hiện nút cập nhật trên bản đồ.

Đây là xác nhận vị trí, không phải theo dõi tự động. Chưa có QR, định vị trong nhà hoặc phát hiện người bệnh đi lệch tuyến khi không cung cấp vị trí mới.

### Quay lại viện giữa hai thủ tục

Sau khi quay lại, người bệnh cập nhật vị trí tại cổng/quầy/mốc nhận diện được rồi tiếp tục thủ tục còn lại. Không reset hành trình hoặc xác nhận hoàn tất thủ tục chỉ vì đổi điểm xuất phát.

Chưa có luồng ghi nhận tạm rời giữa các thủ tục. Trạng thái `outsideHospital` hiện chỉ cho ghi nhận ngoài viện sau khi làm xong mọi thủ tục, ở phase READY và chế độ kết quả điện tử. Cập nhật vị trí khi trở về giải quyết đường đi; giữ số, giữ lượt, lấy lại lượt và điều kiện rời viện cần quy trình cơ sở xác nhận.

### Trạng thái và thời điểm đồng bộ

Biểu tượng kết nối nằm trong header cạnh tên người bệnh trên mọi tab, không chiếm dòng riêng. Khi online dùng biểu tượng Wi-Fi và chấm xanh; thời gian hiển thị trong tooltip và hộp chi tiết khi chạm:

- **Đồng bộ thành công lần cuối:** thời gian trên điện thoại khi nhận snapshot được chấp nhận; không cập nhật từ phản hồi cũ bị loại.
- **Dữ liệu hệ thống thay đổi gần nhất:** `snapshot.updatedAt`, thời điểm sự kiện gần nhất của toàn mô phỏng; không riêng bệnh nhân đang xem.

Khi nhận lỗi luồng cập nhật, sự kiện offline của trình duyệt hoặc bật công cụ ngắt kết nối, biểu tượng chuyển màu hổ phách, có nét gạch và giữ nguyên mốc đồng bộ cuối. Cảnh báo đặt ngoài vùng cuộn của tab, giải thích chưa nhận được tiến độ mới, hướng dẫn dùng giấy đã lưu/nhờ nhân viên và có nút **Kết nối lại**. Nút này dùng được cả khi mất kết nối thực và khi mô phỏng. Chỉ báo đã đồng bộ lại sau khi nhận snapshot hợp lệ, không dựa riêng vào việc điện thoại báo online.

Khi ngắt kết nối, khóa xác nhận vị trí và đổi thang. Có thể mở hướng dẫn nhờ nhân viên nhưng không gửi vị trí mới. Lệnh đã gửi mà chưa có phản hồi được báo chưa rõ kết quả, có thể gửi lại cùng xác nhận. EventSource tự thử kết nối lại; thời gian nhận biết lỗi phụ thuộc trình duyệt và mạng, chưa có cam kết phát hiện tức thời.

Chưa có cache ngoại tuyến bền vững cho ứng dụng/lượt khám; tải lại hoặc đóng trang không bảo đảm khôi phục được hướng dẫn. Âm thanh chưa có sẵn vẫn cần kết nối tới server. Sau khi kết nối lại, nhận tiến độ mới; nếu đã di chuyển thì cần cập nhật vị trí, không mặc định vị trí cũ vẫn đúng.

## Giới hạn mô phỏng

Vị trí cần người bệnh / nhân viên xác nhận. Chưa có bản đồ khảo sát, định vị trong nhà hay dữ liệu bệnh viện thật. Chưa chứng minh giảm tổng thời gian chờ; quy tắc ít người trước là giả thuyết điều phối cần đo. Nghiên cứu nguồn, phản hồi dùng thử và kiểm thử phần mềm được lưu riêng, không coi kết quả tự động là bằng chứng thử nghiệm lâm sàng hoặc trải nghiệm thực địa.
