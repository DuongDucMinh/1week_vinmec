> **Đã có luồng mới theo giấy / số tại cửa phòng.** Danh sách mọi chỉ định hiện ngay, tự sẵn sàng sau thủ tục cuối; demo dừng khi quay lại bác sĩ Nội. Dùng [hướng dẫn hiện tại](README.md#đi-hết-một-lượt-demo) và [báo cáo giấy/app](paper-workflow-revision.md). Nội dung bên dưới giữ làm lịch sử phiên bản trước.

> Cập nhật 19/10/2026: luồng chỉ định theo từng bệnh nhân, hàng đợi phòng thủ tục và map theo chặng đã thay thế thiết kế cũ. Xem [bản triển khai end-to-end hiện tại](end-to-end-revision.md). Nội dung bên dưới ghi lại phiên bản trước.

# Đặc tả mô phỏng lượt khám Nội - Ocean Park 2

Ngày 19/10/2026. Nguồn: các quyết định mô phỏng người làm bài cung cấp trực tiếp trong chat. Đây là đặc tả nghiệp vụ; source đã triển khai, tình trạng kiểm tra phần mềm ở [test-report.md](test-report.md), thử người dùng chưa thực hiện. Không phải xác nhận quy trình thực tế của Vinmec, khuyến cáo trình tự khám hoặc kết luận từ P1/P2/P3. Cấu hình máy đọc được: [simulation-config.json](data/simulation-config.json).

**Bối cảnh đã chốt cho mô phỏng**

- Cơ sở bối cảnh: Vinmec tại Vinhomes Ocean Park 2; chuyên khoa Nội.
- Hai dịch vụ do bác sĩ trong kịch bản chỉ định: **Siêu âm ổ bụng** và **Xét nghiệm sinh hóa máu**; cả hai là bắt buộc trong lượt demo.
- Sơ đồ, vị trí, số phòng/tầng và các mốc thời gian là dữ liệu dựng cho demo. Chưa có sơ đồ cơ sở được xác minh; không gán vị trí phòng giả thành phòng thật.
- Quy ước bản đồ cập nhật: Nội A201 và Sinh hóa A205 ở tầng 2 tòa A; Siêu âm B105 ở tầng 1 tòa B. Có sơ đồ tổng quan các tòa/lối nối và sơ đồ chi tiết từng tầng/phòng. Giao diện sản phẩm dùng nhãn phòng bình thường, chỉ dẫn từng chặng ngắn; thông tin về dữ liệu dựng tập trung tại tài liệu dự án. Xem [vòng sửa bản đồ/giao diện](ui-map-revision.md).
- Chỉ dùng người bệnh, nhân viên, kết quả và lịch sử khám tự tạo. Tên dịch vụ là nhãn kịch bản; không nhập xét nghiệm thật hoặc dùng AI diễn giải kết quả.
- Phần hướng dẫn chạy xuyên chuỗi: tiếp nhận -> phòng Nội ban đầu -> hai dịch vụ -> nhận/theo dõi kết quả -> quay lại -> sẵn sàng -> bác sĩ gọi vào.

**Hai chế độ bắt buộc, áp dụng cho cả lượt**

| Chế độ | Hai dịch vụ | Điều kiện trước khi hướng quay phòng Nội |
| --- | --- | --- |
| RETURN_TO_DOCTOR | Kết quả chuyển điện tử về nơi khám đầu, không cần bệnh nhân đi nhận bản cứng | Đã thực hiện cả hai và đã xác nhận đủ hai kết quả |
| COLLECT_PAPER | Cả hai dịch vụ yêu cầu nhận bản cứng tại nơi thực hiện | Đã thực hiện cả hai, đủ hai kết quả và đã nhận đủ hai bản cứng |

Cả hai chế độ vẫn có cập nhật và quyền xem kết quả trên các giao diện theo quy tắc mô phỏng bên dưới. Nhận giấy là một nhiệm vụ quy trình thêm trong COLLECT_PAPER, không có nghĩa app hoặc bác sĩ không được xem kết quả.

Chọn chế độ ở đầu kịch bản, giữ nguyên cùng lượt; chuyển chế độ thì tạo/reset lượt demo để tránh mang trạng thái nhận giấy hoặc hàng chờ cũ sang chế độ mới. Không làm chế độ trộn theo từng dịch vụ trong phiên bản này. Việc mô phỏng hai chế độ xuất phát từ chưa xác minh cách trả thực tế, không khẳng định cơ sở thực tế chỉ có hai khả năng.

**Trạng thái tách riêng**

| Đối tượng | Trạng thái cần phân biệt |
| --- | --- |
| Thực hiện từng dịch vụ | Chưa thực hiện / Đang thực hiện / Đã thực hiện |
| Kết quả từng dịch vụ | Chưa có / Đang chờ kết quả / Đã có kết quả |
| Bản cứng từng dịch vụ | Không yêu cầu / Chưa nhận / Đã nhận |
| Quay lại phòng Nội | Chưa đủ điều kiện / Có thể quay lại / Đang quay lại / Đã tự xác nhận có mặt và sẵn sàng |
| Tiếp nhận của bác sĩ | Chưa gọi / Đã gọi vào / Đang trao đổi / Đã hoàn tất |

Các nhãn có chữ/biểu tượng đi cùng màu. Hoàn tất thao tác không tự tạo kết quả; đủ kết quả không tự tạo trạng thái đã nhận giấy, sẵn sàng hoặc được bác sĩ gọi.

**Nguồn sự kiện và cập nhật**

| Hành động | Người/nguồn trong demo | Tác động |
| --- | --- | --- |
| Xác nhận tiếp nhận và nơi khám đầu | Lễ tân/bảng điều khiển giả | Đưa người bệnh vào danh sách khám lần đầu, hướng tới phòng Nội |
| Gọi khám ban đầu và xác nhận hai dịch vụ | Bác sĩ | Kết thúc lượt ở cột trái khi chuyển làm dịch vụ; tạo danh sách việc và hướng đi |
| Xác nhận bắt đầu/hoàn tất thao tác | Bộ phận dịch vụ giả | Cập nhật tiến độ, hướng dịch vụ tiếp; kết quả vẫn đang chờ |
| Xác nhận có kết quả | Bộ phận dịch vụ giả | Cùng một sự kiện làm kết quả sẵn sàng cho bác sĩ và bệnh nhân; thông báo cho bệnh nhân, cập nhật nền bên bác sĩ |
| Xác nhận đã giao/nhận bản cứng | Bộ phận dịch vụ giả | Chỉ đổi trạng thái giấy của dịch vụ đó; không tự vào hàng chờ bác sĩ |
| Sẵn sàng gặp bác sĩ chẩn đoán | Người bệnh tự xác nhận đang ngoài phòng | Khi đủ điều kiện, đưa đúng lượt vào cột phải một lần |
| Xác nhận gọi vào phòng | Bác sĩ chọn người ở cột phải | Thông báo người bệnh, mở trọn bộ kết quả của lượt và lịch sử khám giả tương ứng |

Thứ tự có kết quả trong demo theo thứ tự thực hiện dịch vụ: nơi làm trước có kết quả trước. Cho phép đổi thứ tự thực hiện khi dựng kịch bản, nhưng không phát kết quả của việc làm sau trước việc làm trước. Quy tắc này phục vụ mô phỏng, không phải dự báo thời gian xét nghiệm thực tế. Thời gian dự kiến, nếu hiển thị, được ghi rõ do kịch bản cấp; không tự xác nhận có kết quả khi đồng hồ hết.

Kết quả có thể tới trong lúc người bệnh đang thực hiện việc khác. App báo và cập nhật nhãn nhưng không bắt bỏ dịch vụ đang làm để đi nhận giấy hoặc quay lại bác sĩ. Thông báo được lưu lại để xem khi phù hợp; việc tiếp theo dựa cả trạng thái thực hiện lẫn kết quả.

**Chế độ kết quả chuyển về phòng Nội**

1. Người bệnh làm hai dịch vụ, app hướng bước tiếp và đường đi ở mỗi điểm bàn giao.
2. Khi đã hoàn tất cả hai thao tác nhưng còn chờ kết quả, trong kịch bản này được rời viện/làm việc khác. Hiển thị rõ đang chờ và số kết quả đã có trên tổng hai.
3. Khi đủ hai kết quả, thông báo có thể quay về phòng Nội; người bệnh quay lại khi sẵn sàng, khuyến khích trở lại sớm. Demo không tự đặt thêm hạn trả lời, thời gian giữ lượt hoặc điều kiện mất lượt.
4. Nếu đang ngoài viện, không vẽ tuyến từ phòng dịch vụ cũ như vị trí trực tiếp. Cho chọn/xác nhận điểm xuất phát hoặc mốc vào viện trước khi chỉ đường.
5. Tới ngoài phòng Nội, người bệnh bấm **Sẵn sàng gặp bác sĩ chẩn đoán** và xác nhận đang có mặt. Chỉ sau thao tác này mới xuất hiện trong cột phải của bác sĩ.

Quyền rời viện và quay lại như trên là giả định được người làm bài chọn cho demo. Trước triển khai thật cần xác minh theo cơ sở/dịch vụ và điều kiện tiếp nhận. Không dùng nó như lời khuyên y khoa hoặc chính sách hiện hành Vinmec.

**Chế độ nhận bản cứng tại hai dịch vụ**

1. Trong lúc còn thực hiện dịch vụ, ưu tiên hoàn tất việc đang làm; các kết quả đã có vẫn được hiển thị/thông báo.
2. Khi cả hai dịch vụ đã thực hiện xong, hướng tới nơi có kết quả đã sẵn sàng nhưng chưa nhận giấy. Nếu có nhiều nơi, chọn nơi được xác nhận có kết quả trước.
3. Sau khi nhận giấy đầu tiên, nếu giấy tiếp theo chưa sẵn sàng, hiển thị còn chờ ở dịch vụ nào; nếu đã sẵn sàng, hướng tới đó. Mỗi chuyến có bản đồ từ vị trí vừa xác nhận.
4. Nhận đủ hai bản và đủ hai kết quả mới hướng quay phòng Nội. Điều kiện nhận đủ giấy là cách cụ thể hóa nhánh cần bản cứng trong bản demo, tách khỏi chỉ số kết quả đã có.
5. Tới ngoài phòng, người bệnh bấm nút sẵn sàng; bác sĩ chủ động gọi như chế độ điện tử.

Ưu tiên nhận nơi có kết quả trước là quy tắc hiện hành của demo, không hứa tối ưu tổng quãng đường. Tối ưu đường đi giữa hai điểm là phần chỉ đường; tối ưu thứ tự toàn lượt giữ ở hướng mở rộng và không ghi đè quy tắc này.

**Giao diện bác sĩ: hai cột chính**

| Cột trái: Khám lần đầu | Cột phải: Sẵn sàng nghe chẩn đoán |
| --- | --- |
| Người bệnh đang chờ khám ban đầu | Chỉ những người đã đủ điều kiện và tự xác nhận có mặt ngoài phòng, sẵn sàng gặp lại |
| Bác sĩ chọn và gọi khám ban đầu | Bác sĩ chọn và bấm xác nhận gọi vào |
| Sau chỉ định, người bệnh rời danh sách chờ này để làm dịch vụ | Sau gọi, chuyển sang lượt đang tiếp nhận, không để lại hàng chờ trùng |

Người đang làm dịch vụ, đợi kết quả hoặc ở ngoài viện chưa sẵn sàng không tự xuất hiện ở cột phải. Kết quả của họ vẫn lưu/cập nhật nền trong lượt khám, không tự bật cửa sổ, phát lời gọi hoặc ngắt hồ sơ bác sĩ đang xem. Khi bác sĩ gọi một người sẵn sàng, mới tự mở bộ kết quả và lịch sử khám giả của đúng người đó.

Không tự đặt quy tắc ưu tiên giữa hai cột; bác sĩ quyết định người cần gọi. Không để một người bệnh chiếm hai hàng chờ hoặc gọi lặp chỉ vì bấm nút nhiều lần. Chọn “tôi đã rời khu chờ” là lối thoát thiết kế đề xuất để gỡ trạng thái sẵn sàng trước khi được gọi; chưa phải một chính sách tiếp nhận của bệnh viện.

Nút sẵn sàng là **tự khai báo có mặt**, không chứng minh vị trí vật lý. Màn hình cần viết rõ “Tôi đang ở ngoài phòng Nội và sẵn sàng vào khi được gọi”. Bản này chưa có định vị, QR xác thực tại phòng hoặc kiểm tra hiện diện.

**Giấy hướng dẫn và lỗi app**

- Tiếp tục giữ giấy được phát theo cách cũ ở cả hai chế độ. Trong RETURN_TO_DOCTOR, giấy hướng dẫn/phiếu chỉ định vẫn có dù không bắt bệnh nhân đi lấy từng bản kết quả.
- Giấy thể hiện phòng khám đầu, hai dịch vụ, địa điểm mô phỏng và cách tìm nhân viên hỗ trợ; không coi là ảnh chụp hoặc bản giấy thật của Vinmec.
- Nếu app/mạng lỗi, người bệnh dùng giấy và hỏi lễ tân/nhân viên điều phối hoặc nhân viên phòng khám. Khi không dùng được nút sẵn sàng, báo trực tiếp nhân viên; nhân viên nhập xác nhận sẵn sàng thủ công sau khi kiểm tra các điều kiện của lượt demo.
- Không hiện “đã vào danh sách” khi thao tác gửi chưa được xác nhận. Khi phục hồi, đồng bộ theo lượt, không tạo hàng chờ/thông báo trùng; dữ liệu cũ có nhãn lần cập nhật.
- Đây là thiết kế dự phòng cần thử; chưa khẳng định giấy một mình báo được kết quả mới hoặc thay được toàn bộ thông báo.

**Những tình huống cần kiểm tra khi có prototype**

| Mã | Tình huống | Kết quả cần có |
| --- | --- | --- |
| SIM-01 | Chọn mỗi chế độ từ lượt mới | Cả hai dịch vụ cùng cách trả của chế độ, không có chế độ trộn |
| SIM-02 | Xong một thao tác, chưa có xác nhận kết quả | Nhãn đang chờ, hướng việc tiếp nếu còn; không tự báo đã có |
| SIM-03 | Xác nhận kết quả đầu tiên | Bệnh nhân nhận thông báo, bác sĩ cập nhật nền, không tự mở hồ sơ/đưa vào cột phải |
| SIM-04 | Đổi thứ tự thực hiện hai dịch vụ | Kết quả theo thứ tự thực hiện trong kịch bản, không suy hiệu quả y khoa |
| SIM-05 | Còn một kết quả bắt buộc chưa có | Chưa hướng quay phòng đầu để nghe chẩn đoán, chưa đủ điều kiện sẵn sàng |
| SIM-06 | Điện tử: xong thủ tục, rời viện, đủ hai kết quả | Thông báo quay lại, chưa vào cột phải, xác nhận lại điểm đầu khi chỉ đường |
| SIM-07 | Giấy: hai thủ tục xong, kết quả lần lượt sẵn sàng | Đi lấy ở nơi có kết quả trước; thiếu một bản giấy thì chưa đủ điều kiện gặp lại |
| SIM-08 | Tới ngoài phòng, bấm sẵn sàng hai lần | Một hàng ở cột phải; tự khai báo có mặt được ghi rõ |
| SIM-09 | Bác sĩ đang xem người khác khi kết quả cập nhật | Không ngắt hồ sơ; chỉ khi chọn gọi người sẵn sàng mới mở bộ kết quả/lịch sử đúng người |
| SIM-10 | App lỗi hoặc gửi sẵn sàng thất bại | Giấy/nhân viên là lối tiếp tục; không báo thành công giả; đồng bộ lại không trùng |
| SIM-11 | Reset để đổi chế độ | Không mang trạng thái giấy, cột chờ hoặc thông báo từ lượt trước sang |

Các mục trên là tiêu chí thiết kế, **chưa phải log thử**. Thử cả hai chế độ với người dùng, đổi thứ tự giữa người thử khi khả thi và ghi ảnh hưởng học. Đo đúng bước/điểm đến, hiểu trạng thái, sử dụng nút sẵn sàng đúng thời điểm và khả năng dùng giấy khi app lỗi; không quy kết số phút tiết kiệm thực tế từ demo.
