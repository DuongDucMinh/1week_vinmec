# Luồng dùng chung giấy và app — 19/10/2026

Yêu cầu vận hành do người làm bài cung cấp: mỗi người bệnh giữ giấy chỉ định; phòng thủ tục gọi theo giấy trong khay ngoài phòng hoặc số lấy tại cửa phòng. Không bố trí thêm nhân viên tiếp nhận / quét mã. Đây là mô phỏng theo yêu cầu, không phải khảo sát xác nhận quy trình bệnh viện.

## Hành vi đã triển khai

- Khám Nội ban đầu giữ luồng tiếp nhận và gọi từ danh sách của lễ tân; không phụ thuộc app xác nhận đến.
- Bác sĩ chỉ định sau khám bằng tìm kiếm, chọn một hoặc hai thủ tục; chưa chỉ định thì app không hiển thị sẵn thủ tục.
- Khi chốt chỉ định, mọi phòng được chỉ định đều có tên người bệnh ngay. API `procedureQueues` giữ tên cũ để tương thích, nhưng mang nghĩa danh sách chỉ định chưa hoàn tất, không phải hàng gọi theo thứ tự số.
- Phòng thủ tục tìm tên có dấu / không dấu, tên viết hoa hoặc mã P01 / DEMO-P01. Danh sách không đánh số thứ tự và không khóa người đứng đầu. Bác sĩ chọn đúng người được gọi theo giấy / số và bấm **Đã hoàn thành**.
- Vẫn chặn cùng một phòng đang thực hiện đồng thời cho hai người và một người đang thực hiện đồng thời ở hai phòng. Thao tác một nút không được vượt qua thủ tục đang thực hiện này.
- Thứ tự do bác sĩ chọn dùng gợi ý đường đi. Có thể xác nhận thủ tục khác thứ tự gợi ý khi thực tế người bệnh được gọi theo giấy / số; app chuyển từ phòng vừa làm xong đến thủ tục còn lại.
- Cấu hình từng phòng ở Điều phối → Cài đặt & kiểm tra: khay giấy hoặc máy lấy số. Cấu hình được lưu SQLite và giữ khi đặt lại tiến độ. Đây là hướng dẫn thao tác tại cửa phòng, chưa tích hợp phần cứng máy lấy số.
- Hướng dẫn tại thẻ bước tiếp theo, bản đồ, giấy in và trợ lý dùng cùng dữ kiện: đặt giấy **lên trên cùng khay ngoài phòng**, hoặc lấy **số mới tại cửa phòng**, giữ giấy chỉ định và chờ gọi. Người dùng app làm giống người chỉ cầm giấy.
- Xác nhận thủ tục cuối tự chuyển `phase=READY`, `readySource=system`. Cột **Sẵn sàng vào phòng** có tên ngay, kể cả khi người bệnh còn ở phòng thủ tục và chưa công bố kết quả. Không giả định đã có mặt ở A201; màn bác sĩ ghi Đang quay lại / Đã quay lại theo vị trí cuối được ghi nhận.
- App dẫn từ phòng vừa hoàn tất về A201. Nút Đã đến chỉ cập nhật vị trí, không thêm / bớt người bệnh trong danh sách bác sĩ hoặc phòng thủ tục.
- Demo dừng khi hướng dẫn quay lại phòng Nội, không có nút gọi khám lại / hoàn tất kết luận. Các lệnh sẵn sàng thủ công, rút sẵn sàng và gọi khám lại cũ bị chặn ở server để tab cũ không làm sai luồng.
- Công bố kết quả và giao bản giấy kết quả vẫn là các thao tác riêng. Không ép kết quả của thủ tục làm trước phải được công bố trước; các phòng độc lập. Chúng không chặn chuyển về cột sẵn sàng trong phạm vi demo được chốt.
- SQLite cũ có lượt đã hoàn tất mọi thủ tục nhưng đang SERVICES được đọc thành READY, giữ nguyên vị trí và kết quả đang chờ. Retry / revision / receipts vẫn bảo vệ thao tác lặp và cập nhật đồng thời.

## Kiểm tra

Bằng chứng chạy phần mềm, không thay thế thử người dùng thật. Báo cáo kiểm tra và ảnh được cập nhật sau lần chạy cuối tại `outputs/paper-workflow/`; xem [test-report.md](test-report.md).

Các tình huống trình duyệt gồm: năm màn hình đồng bộ, tìm/chọn chỉ định, cả hai phòng thấy ngay, người chỉ cầm giấy không gửi lệnh patient nào, gọi người khác thứ tự danh sách, làm máu trước siêu âm dù app gợi ý ngược lại, hướng dẫn khay / máy và giấy in, sẵn sàng trước kết quả, mất mạng / đồng bộ lại, reset đồng thời và focus bàn phím.

## Giữ thiết kế gọn để làm việc

Tiếp tục hướng framed-sheet của Taste Skill. Phòng thủ tục có thông tin cách gọi, ô tìm kiếm, danh sách chỉ định và phần công bố kết quả. Không thêm số chờ điện tử giả. Bản đồ chỉ hiển thị chặng đi hiện tại tới bước kế tiếp.

## Kết quả chạy và đánh giá giao diện

- Full Vitest: **120/120 đạt, 11 files**; [JSON](outputs/paper-workflow/vitest-results.json). Sau chỉnh thông báo cũ và thu gọn hướng dẫn phụ ở phòng thủ tục, chạy lại **16/16** kiểm thử client / presentation liên quan, đều đạt.
- Full Playwright: **10/10 đạt** (59 giây). Sau thay đổi trình bày cuối, chạy lại hai ca tìm người theo giấy / số và cấu hình lấy lượt: **2/2 đạt**. Báo cáo HTML hiện tại là lần chạy hai ca tập trung, không phải báo cáo đủ 10 ca trước đó.
- TypeScript và production build cuối: **đạt**, 39 modules.
- Taste Skill lint: **0 FAIL**, hai WARN shadow thuộc menu / overlay sẵn có.
- Taste Skill inspect patient / doctor / procedure / control, mỗi màn ở **1440 / 768 / 390 px**: **0 FAIL**. Đã mở ảnh desktop, tablet và mobile để rà; mở riêng cài đặt cách lấy lượt tại cả ba kích thước và không có tràn ngang. [Tổng hợp bằng chứng](outputs/paper-workflow/verification.json).
- Chỉnh cụ thể sau xem ảnh: thu gọn chỉ dẫn phụ của màn phòng thủ tục vào mục mở rộng; giữ cách gọi và ô tìm kiếm rõ ràng. Làm mới CSS cache của Vite ở bản demo đang mở; xác nhận thực tế table dùng grid trên tablet và ẩn tiêu đề cột trên điện thoại.

Các WARN được giữ có lý do: `panel-void` ở phòng thủ tục là canvas còn trống với một chỉ định, không kéo giãn hàng bệnh nhân; `hero-void` ở patient là khung xem app điện thoại trên desktop; `icon-chips` là dấu hoàn tất tiến độ; `no-data-hue` không nhận diện màu tiến độ CSS. `tiny-text` trên doctor chủ yếu ở metadata / mô tả phụ; tên và hành động chính vẫn rõ. Control không có WARN.

Tự đánh giá theo rubric nhánh app của Taste Skill: thiết kế **7,5**, sử dụng **8**, ý tưởng **7**, nội dung **8**; tổng **7,6/10**. Đây là tự rà của người triển khai, không phải điểm thử người dùng. Nội dung và hành động bám việc tiếp nhận, chỉ định, gọi theo giấy / số và quay lại; không thêm chỉ số trang trí hoặc số chờ điện tử giả. Màn bác sĩ ưu tiên desktop; trên điện thoại cần cuộn tới danh sách.

Ảnh cuối: [phòng thủ tục desktop](outputs/paper-workflow/procedure-final-desktop.jpg), [tablet](outputs/paper-workflow/procedure-final-tablet.jpg), [mobile](outputs/paper-workflow/procedure-final-mobile.jpg), [bác sĩ có người sẵn sàng](outputs/paper-workflow/doctor-ready.png), [người bệnh quay lại](outputs/paper-workflow/patient-returned.png), [giấy in](outputs/paper-workflow/printed-guide.pdf).
