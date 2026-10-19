# Kế hoạch đánh giá hướng dẫn khám ngoại trú

Prototype đã có và đã nhận phản hồi định tính từ 2 người. Phần đánh giá dưới đây dành cho vòng thử tiếp theo của tính năng điều phối và lựa chọn thang; chưa có số đo hiệu quả mới.

## Câu hỏi học hỏi

Người bệnh có hiểu bước tiếp theo, tìm đúng phòng, nhận ra thứ tự thủ tục được tính lại và chuyển giữa thang máy / thang bộ khi cần không? Quy tắc chọn phòng ít người có giúp phân tán dòng người và giảm thời gian chờ trong điều kiện mô phỏng không?

## Giả thuyết và phạm vi

Gợi ý theo số người tại phòng và khoảng cách có thể giúp người bệnh tránh phòng đông. Mỗi phòng giả lập một bác sĩ; các thủ tục độc lập. Cần phân biệt hiểu giao diện với giảm chờ thực tế: một phòng ít người vẫn có thể xử lý lâu hơn phòng khác.

Dùng 3 thủ tục và 3 bệnh nhân tự tạo, sơ đồ hai tòa có thang máy / thang bộ. Tạo thay đổi lượng người sau khi người thử hoàn tất thủ tục đầu. Không chuyển yêu cầu sản phẩm thành lời người tham gia hoặc số đo nghiên cứu.

## Các tình huống

| Tình huống | Quan sát |
| --- | --- |
| Mới chốt chỉ định A / B / C | Biết phòng cần tới, phân biệt điểm đến chính với thứ tự dự kiến |
| C vắng hơn trong khi đang đi A | Người thử tiếp tục tới A, không hiểu dữ liệu cập nhật là phải quay đầu |
| Vừa làm xong A, C ít người hơn B | Nhận ra điểm đến đổi thành C và tuyến xuất phát từ A |
| Các phòng cùng lượng người | Hiểu gợi ý ưu tiên phòng gần theo đường đi |
| Thang máy đông, muốn dùng thang bộ | Tìm được lựa chọn, đọc đúng chặng và đi qua các tầng |
| Đi nhầm hoặc không rõ mốc | Xác nhận lại vị trí, nghe lại hướng dẫn hoặc nhờ nhân viên |
| Không dùng app | Nhân viên ghi nhận đến phòng và hoàn tất; giấy vẫn dùng được |

## Cách ghi nhận

Dùng cùng dữ liệu chuẩn bị cho từng người, đổi thứ tự tình huống khi cần để hạn chế ảnh hưởng học. Ghi thao tác, điểm nhầm, số lần cần gợi ý và thời gian quyết định từ quan sát thật. Chỉ đo thời gian chờ khi có dữ liệu đến / bắt đầu / hoàn tất đáng tin. Không dùng thời gian chạy tests thay cho thời gian người dùng.

Nguồn hiện có: [need statement](../03-need-statement/need-statement.md), [phản hồi T1/T2](user-test-log.md). Quy trình hiện tại: [simulation-spec](simulation-spec.md), [adaptive-routing](adaptive-routing.md).
