> **Đã có luồng mới theo giấy / số tại cửa phòng.** Danh sách mọi chỉ định hiện ngay, tự sẵn sàng sau thủ tục cuối; demo dừng khi quay lại bác sĩ Nội. Dùng [hướng dẫn hiện tại](README.md#đi-hết-một-lượt-demo) và [báo cáo giấy/app](paper-workflow-revision.md). Nội dung bên dưới giữ làm lịch sử phiên bản trước.

# Luồng khám và giao diện — 19/10/2026

## Luồng đã triển khai

- Lượt mới chưa có thủ tục. Lễ tân xác nhận tiếp nhận, app chỉ đường từ quầy đến Nội A201, gồm thang máy lên tầng 2.
- Bác sĩ Nội gọi khám và bắt đầu trao đổi, rồi tìm thủ tục theo tên/chuyên khoa (có tìm không dấu), chọn, bỏ chọn và đổi thứ tự. Chốt chỉ định mới tạo các bước trên app và đưa người bệnh vào hàng phòng đầu tiên. Danh mục demo có siêu âm ổ bụng và xét nghiệm sinh hóa máu; có thể chỉ chọn một hoặc kết thúc khám không cần thủ tục.
- Mỗi phòng thủ tục có màn riêng qua `/procedure?service=…`, hàng chờ riêng theo thời điểm được chuyển tới. B chưa thấy tên bệnh nhân khi A chưa hoàn tất. Người đầu hàng có nút **Đã hoàn thành**; một lần bấm ghi nhận thực hiện, cập nhật vị trí, chuyển bước, thêm tên sang hàng phòng kế tiếp và thông báo cho người bệnh.
- Xác nhận thực hiện và công bố kết quả là hai thao tác riêng. Bác sĩ thủ tục công bố khi có kết quả; người bệnh và bác sĩ Nội nhận cập nhật cùng lúc. Chế độ giấy tiếp tục yêu cầu nhận đủ giấy đã chỉ định.
- Đủ kết quả thì app hướng dẫn về A201 từ vị trí hiện tại. Xác nhận có mặt/sẵn sàng mới vào hàng khám lại. Bác sĩ gọi, trao đổi kết quả và hoàn tất.

## Bản đồ

Chỉ có tuyến hiện tại → bước kế tiếp. Không còn duyệt tổng quan/tầng/phòng hoặc mở tuyến tới một thủ tục tương lai. Tuyến lấy từ cùng graph có trọng số ở domain. Các chặng cùng tầng/tòa ghép liên tiếp, sơ đồ tự đi theo thứ tự qua thang máy/lối nối; chặng cuối xác nhận đã đến. Có chỉ dẫn đầy đủ và sửa điểm đứng trong mục mở rộng.

Khi hoàn tất thủ tục, điểm xuất phát được ghi về phòng vừa làm xong. Nếu đang mở bản đồ, tuyến và chặng tự cập nhật. Khi chờ kết quả hoặc hoàn tất lượt, màn hình giải thích chưa cần di chuyển. Người đang ngoài viện phải xác nhận điểm xuất phát trước khi có tuyến.

## Thiết kế và Taste Skill

Nguồn: [design-taste-frontend / SKILL.md](https://github.com/Leonxlnx/taste-skill/blob/main/skills/taste-skill/SKILL.md), nhánh `references/app-screens.md`. Không đổi framework hoặc thêm thư viện giao diện. Đã đọc skill và dùng script `draw`, `lint`, `inspect` của repository nguồn.

- Hướng được chọn: **Framed sheet**, seed **1152854118**. Giữ Be Vietnam Pro và màu xanh thương hiệu; nền khung xanh xám rất nhạt, trang làm việc trắng, không bóng/gradient trên khung nghỉ. Không redraw.
- Bản sắc: mã phòng A201/B105/A205 đi cùng chỉ dẫn tuyến khám và hàng đợi chuyển phòng. Không dùng số liệu trang trí.
- Câu hỏi chính của từng màn: người bệnh “giờ đi đâu/làm gì?”; bác sĩ Nội “đang khám ai, cần chỉ định gì?”; bác sĩ thủ tục “ai đến lượt ở phòng này?”; lễ tân “người bệnh đã được tiếp nhận và đang ở bước nào?”.
- Kiểm tra hình trước thay đổi: quá nhiều nền màu, khung lồng nhau, chữ phụ nhỏ, thủ tục có sẵn dù chưa khám, bản đồ đòi chọn cấp/tầng/tòa. Thiết kế mới tập trung vào bước hiện tại, nội dung thật và thao tác cần làm.
- Bản mobile cho nhân viên có menu thu gọn. Bản bệnh nhân giữ thanh điều hướng dưới với bốn mục; thao tác chạm chính từ 44px.

Ảnh trước/sau và các thời điểm của luồng ở `outputs/e2e-redesign/`. Sơ đồ, địa điểm và ba người bệnh là dữ liệu tự tạo; chưa xác thực với sơ đồ/quy trình cơ sở thật. Đây là prototype local chưa có xác thực vai trò theo tài khoản.

## Các điểm tương thích

Lượt cũ trước khám có hai thủ tục mặc định chưa đụng tới sẽ được bỏ các mục giữ chỗ đó khi đọc. Các lượt đã thực hiện thủ tục được giữ tiến độ. API vẫn nhận lệnh demo cũ cho fixture/kịch bản kiểm tra; UI bác sĩ dùng `ASSIGN_SERVICES` với danh sách cụ thể, không dùng chỉ định cứng.

SQLite lưu thứ tự và thời điểm chuyển hàng; tải lại trang hoặc khởi động lại server vẫn giữ tiến độ. Giới hạn revision và command ID tiếp tục chống thao tác trùng/xung đột.

## Kiểm tra

- Typecheck và build: đạt.
- Vitest: **118/118 ca đạt**, gồm domain, SQLite/HTTP/SSE, dữ kiện trợ lý và React client. Chạy với tối đa hai worker để giảm tải khởi động tiến trình trên Windows.
- Playwright: **10/10 ca đạt** trên Chrome thật. Bao gồm luồng đủ 5 màn hình, chưa có thủ tục trước khám, tìm không dấu, chốt 1/2 chỉ định, không cần thủ tục, phòng B chưa có tên trước khi A hoàn tất, chuyển tuyến khi đang mở map, kết quả điện tử/giấy, ra ngoài viện/quay lại, hỗ trợ nhân viên, hai lần reset, mất/kết nối lại và focus bàn phím trong dialog.
- Phát hiện và sửa lỗi revision cũ giữa tab người bệnh và phòng thủ tục: khi server xác nhận từ chối do stale revision, client kiểm tra lại cùng ý định một lần trên trạng thái mới; không tự gửi lại nếu đã đổi lượt, reset hoặc chưa biết kết quả yêu cầu trước. Có test hồi quy cho cơ chế này.
- Có ca domain kiểm tra thứ tự khi hai lần chuyển hàng có cùng timestamp; revision là mốc phân biệt được lưu cùng chỉ định.

### Nhận xét hình theo nhánh app screens

1. Bước hiện tại/điểm đến là nội dung dẫn đầu của người bệnh. Hàng đang khám và nơi nhập chỉ định là phần lớn nhất của bác sĩ Nội. Hàng chờ phòng và nút hoàn thành đứng đầu màn thủ tục.
2. Màn nhân viên dùng khung 228px và trang trắng, gutter 24px; điện thoại dùng lề 20px và menu thu gọn. Hàng đợi ít người giữ đúng độ dài dữ liệu; khoảng trống dưới là canvas của ứng dụng, không thêm hàng hoặc số liệu giả để lấp.
3. Xanh dùng cho thương hiệu, tuyến và trạng thái tiến độ; nút chính màu mực đậm. Đã bỏ gradient, bóng trên card nghỉ và khung dịch vụ lồng nhau.
4. Số thủ tục/kết quả và số người chờ lấy từ cùng snapshot; không còn mẫu số 2 cố định trên UI, domain hoặc dữ kiện trợ lý. Tìm lại nguồn xác nhận không còn lựa chọn Tổng quan/Tầng & phòng ở client.
5. Chưa có chỉ định được ghi bằng nội dung tương ứng; hàng chờ rỗng in số 0. Không dùng số liệu tham chiếu thay cho số 0.
6. Tuyến và hướng dẫn dùng cùng graph; nhãn xuất phát/đích đã được dịch khỏi đường đứng để không đè chữ. Ký hiệu hoàn thành nằm trên timeline là trạng thái công việc, không phải icon trang trí.
7. Đã xem bản desktop, tablet, mobile; nút chạm chính từ 44px, không tràn ngang trong các ca E2E 360/390/768px.

Các cảnh báo được chấp nhận có lý do: `hero-void`/`panel-void` trên canvas ít người hoặc hai lề của app bệnh nhân rộng 440px là bố cục ứng dụng/khung điện thoại; `icon-chips` là dấu hoàn thành trên timeline; `no-data-hue` không nhận diện nét/trạng thái timeline CSS; `shadow` chỉ nằm ở menu, dialog và thông báo lỗi nổi. Nhãn giờ/mã/tuổi là thông tin phụ 11–12px; dữ liệu và hướng dẫn chính đã được tăng cỡ chữ. Không bật cờ bỏ qua phép đo.

Lượt xem hình cuối đã chuyển thông báo cập nhật thành thanh nhỏ trong bố cục phía trên nội dung, để không che tuyến/nút chỉ đường; menu mobile đặt cùng hàng với thương hiệu. Nhật ký điều phối hiện tên hành động cụ thể thay cho dòng xác nhận chung.
