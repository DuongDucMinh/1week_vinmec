# Điều phối thủ tục và lựa chọn thang

Cập nhật 20/10/2026. Đây là mô tả tính năng hiện hành, bổ sung từ yêu cầu sản phẩm; không gán thành phản hồi của người tham gia phỏng vấn.

## Ưu tiên phòng ít người, cùng số người thì gần nhất

Bác sĩ quyết định **cần làm gì**; ứng dụng gợi ý **đi đâu trước** trong những thủ tục chưa hoàn tất. Thứ tự bác sĩ chọn vẫn được lưu nguyên trong hồ sơ. Người bệnh thấy thủ tục đã hoàn tất theo thứ tự thực hiện, phòng đang được hướng dẫn và các phòng dự kiến tiếp theo.

Nguồn đếm là người đang thực hiện ở phòng và người đã xác nhận / được nhân viên ghi nhận đang chờ ở phòng. Loại người đang xét, người đã hoàn tất tại phòng và chỉ định tương lai của người ở nơi khác. Nhân viên có nút **Đã đến phòng** để ghi nhận người dùng giấy; **Bắt đầu thực hiện** ghi trạng thái đang phục vụ. Mỗi phòng mô phỏng một bác sĩ, tối đa một người đang thực hiện.

Khi chốt chỉ định hoặc hoàn tất một thủ tục, so sánh các phòng còn lại theo thứ tự:

1. Số người tại phòng tăng dần.
2. Độ dài đường ngắn nhất từ vị trí hiện tại theo loại thang đã chọn.
3. Thứ tự danh sách bác sĩ, khi hai tiêu chí trên đều bằng nhau.

Khoảng cách là trọng số đồ thị mô phỏng, không phải mét. Nếu chưa rõ vị trí thì tiêu chí khoảng cách chưa dùng được; app yêu cầu chọn mốc trước khi chỉ đường. Không đổi đích trong lúc đang đi chỉ vì phòng khác vừa vắng hơn. Các bước phía sau là dự kiến theo tải hiện tại, sẽ được xét lại tại điểm quyết định tiếp theo.

## Ví dụ A → B → C đổi thành A → C → B

A = xét nghiệm sinh hóa máu A205; B = siêu âm B105; C = xét nghiệm nước tiểu A501.

| Thời điểm | Người khác tại A / B / C | Hướng dẫn |
| --- | --- | --- |
| Chốt chỉ định ở phòng Nội | 0 / 1 / 1 | Đến A. Dự kiến B rồi C vì cùng một người và B gần hơn từ A |
| Người ở C đã làm xong, bệnh nhân vẫn đang đi A | 0 / 1 / 0 | Giữ điểm đến A; thứ tự phía sau có thể cập nhật |
| Bệnh nhân làm xong A | — / 1 / 0 | Tính lại từ A205; đến C rồi B |

Để tự thử, chỉ định siêu âm cho P02 và ghi nhận đến phòng; chỉ định nước tiểu cho P03 và ghi nhận đến phòng. Sau đó chỉ định siêu âm, nước tiểu, sinh hóa cho P01. Hoàn tất nước tiểu của P03 rồi sinh hóa của P01. App của P01 sẽ chuyển đích sang nước tiểu. Có thể xác nhận hoàn tất theo thứ tự giấy khác gợi ý; app tính tiếp từ phòng thực sự vừa hoàn tất.

## Lựa chọn thang

Tab **Đường đi** có hai nút **Thang máy / Thang bộ**. Mặc định chọn thang máy. Khi thang đông, người bệnh có thể chọn thang bộ; sơ đồ, chỉ dẫn chữ và giọng đọc dùng cùng tuyến mới. Chưa mô phỏng cảm biến phát hiện thang quá tải hoặc thời gian đợi thang.

Mỗi tầng ở tòa A và B có cả hai mốc. Cạnh đổi tầng chỉ đi theo loại đã chọn. Thang máy gộp các tầng đi xuyên qua; thang bộ hướng dẫn từng tầng. Đổi thang giữ điểm đến, đặt lại chặng từ vị trí đã xác nhận, lưu lựa chọn cùng lượt và đưa vào giấy hướng dẫn. Reset bệnh nhân trở về thang máy.

## Tổ chức mã nguồn

| Thành phần | Trách nhiệm |
| --- | --- |
| `src/domain/procedure-planning.ts` | Đếm người tại phòng, xếp thứ tự dự kiến, giữ đích hiện tại |
| `src/shared/routing.ts` | Đường ngắn nhất theo loại thang và chỉ dẫn chữ |
| `src/shared/fixtures.ts` | Nút thang máy / thang bộ và cạnh nối từng tầng |
| `src/domain/engine.ts` | Tính lại khi chỉ định / hoàn tất, xử lý lệnh và snapshot |
| `src/client/Patient.tsx`, `Map.tsx`, `Clinicians.tsx` | Hành trình, chọn thang, ghi nhận đến phòng / thực hiện |

`recommendedServiceId` và `transportMode` lưu cùng `Visit` trong SQLite. `procedurePlan` là dữ liệu trình bày theo snapshot; không sửa danh sách chỉ định. Dữ liệu cũ thiếu loại thang được hiểu là thang máy; nếu chưa có điểm đến đã lưu thì tính gợi ý từ trạng thái hiện tại.

## Giới hạn và hướng phát triển

Chưa tính thời gian phục vụ, nhiều bác sĩ song song, lịch hẹn, mức ưu tiên hoặc phụ thuộc chuyên môn giữa thủ tục. Quy tắc ít người trước nhằm hỗ trợ tránh phòng đông; chưa chứng minh tối ưu tổng thời gian chờ. Muốn áp dụng thực tế cần dữ liệu đến / rời phòng đáng tin và các ràng buộc do cơ sở xác nhận.

Kiểm thử và ảnh thực tế của bản này nằm trong [test-report.md](test-report.md) và `outputs/adaptive-routing/`.
