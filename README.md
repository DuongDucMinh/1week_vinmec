# Trợ lý điều phối và dẫn đường khám ngoại trú

**Hướng dẫn người bệnh tới đúng phòng, gợi ý thứ tự thủ tục theo lượng người chờ và theo dõi xuyên suốt một lượt khám.**

Dương Đức Minh · K3 · Exploration Sprint Vinmec

Khi một lượt khám có nhiều xét nghiệm và phòng thủ thuật, người bệnh phải tự ghép thông tin từ phiếu chỉ định, biển phòng và lời hướng dẫn. Dự án đưa các thông tin đó vào một hành trình: **làm gì tiếp theo, đi tới đâu và đi bằng đường nào**. Bối cảnh prototype là Vinmec Ocean Park 2, với 5 khoa khám và 9 thủ tục.

## Dự án giúp ích gì?

- **Chủ động chọn điểm đến phù hợp:** sau khi bác sĩ chốt chỉ định, app ưu tiên phòng có ít người đang chờ hoặc đang thực hiện nhất. Nếu bằng nhau, app chọn phòng gần nhất theo đường đi trên sơ đồ. Hoàn tất mỗi thủ tục là một lần tính lại cho những việc còn lại.
- **Linh hoạt khi di chuyển:** sơ đồ có cả thang máy và thang bộ. Thang máy được chọn mặc định; người bệnh có thể chuyển sang thang bộ khi thang máy đông. Tuyến đường, chỉ dẫn từng chặng và giọng đọc cập nhật theo lựa chọn.
- **Dễ theo dõi bước tiếp theo:** màn bệnh nhân làm nổi bật việc cần làm, địa chỉ phòng, tiến độ và thứ tự dự kiến; có hướng rẽ, nghe lại chỉ dẫn và chọn lại mốc khi đi nhầm.
- **Thông tin liền mạch giữa các vai trò:** lễ tân tiếp nhận, bác sĩ chỉ định, phòng thủ tục cập nhật tiến độ; các màn hình đồng bộ ngay. Kết quả mới có thông báo và được chuyển tới người bệnh, bác sĩ.
- **Hỗ trợ cả người dùng giấy:** nhân viên ghi nhận người đã đến phòng và xác nhận hoàn tất; bệnh nhân vẫn có thể in hoặc lưu giấy hướng dẫn dự phòng.

Mục tiêu là giúp người bệnh bớt phải hỏi lại, hạn chế di chuyển không cần thiết và tránh tập trung vào phòng đang đông. Hiệu quả giảm thời gian chờ sẽ được đo khi thử nghiệm thực tế.

## Thứ tự thủ tục thay đổi như thế nào?

Ví dụ người bệnh được chỉ định A, B, C. Lúc xuất phát, A ít người nhất nên app hướng tới A; B và C được hiển thị theo thứ tự dự kiến. Khi làm xong A, hệ thống kiểm tra lại: nếu C đang ít người hơn B, bước tiếp theo đổi thành C, rồi B.

Điểm đến đang đi được giữ ổn định. Danh sách bác sĩ chỉ định vẫn được lưu nguyên vẹn; app tính thứ tự di chuyển riêng cho người bệnh. Số người so sánh là người thực sự đang chờ hoặc đang làm tại phòng, không phải toàn bộ chỉ định sẽ đến phòng trong tương lai. Mỗi phòng hiện được mô phỏng có một bác sĩ phục vụ một người tại một thời điểm.

## Trải nghiệm prototype

Cần Node.js 24.x từ 24.11.1 và npm. SQLite tích hợp lưu tiến độ, không cần cài cơ sở dữ liệu riêng.

```powershell
cd 05-prototype
npm.cmd ci
npm.cmd run build
npm.cmd start
```

Mở các màn hình trong cùng trình duyệt:

| Màn hình | Vai trò |
| --- | --- |
| [Người bệnh](http://127.0.0.1:3001/patient) | Xem việc tiếp theo, thứ tự dự kiến, đường đi và kết quả |
| [Tiếp nhận và điều phối](http://127.0.0.1:3001/control) | Chọn khoa, tiếp nhận và thử lại từng hành trình |
| [Bác sĩ](http://127.0.0.1:3001/doctor) | Khám ban đầu, tìm và chốt chỉ định, theo dõi tiến độ |
| [Phòng thủ tục](http://127.0.0.1:3001/procedure) | Ghi nhận đến phòng, bắt đầu, hoàn tất và công bố kết quả |

### Đi hết một lượt demo

1. Lễ tân chọn khoa và xác nhận tiếp nhận. Người bệnh được hướng tới phòng khám ban đầu.
2. Bác sĩ chọn đúng khoa, gọi vào khám, bắt đầu trao đổi rồi chốt các thủ tục cần làm.
3. App tính thứ tự gợi ý và chỉ đường tới phòng đầu tiên. Trong tab **Đường đi**, thử đổi **Thang máy / Thang bộ** hoặc bật giọng chỉ đường.
4. Phòng thủ tục ghi nhận **Đã đến phòng**, **Bắt đầu thực hiện** và **Đã hoàn thành**. Sau mỗi lần hoàn tất, app tính lại điểm đến trong các thủ tục còn lại.
5. Khi xong toàn bộ thủ tục, app hướng về khoa khám ban đầu; bác sĩ thấy người bệnh trong danh sách sẵn sàng. Luồng demo kết thúc khi quay lại phòng.

[Hướng dẫn kỹ thuật và cấu hình](05-prototype/README.md) · [Kịch bản kiểm tra tính năng mới](05-prototype/adaptive-routing.md)

## Nghiên cứu và cải tiến

Hai cuộc phỏng vấn ẩn danh và một trải nghiệm tự thuật giúp xác định những điểm vướng khi chuyển bước trong lượt khám. Hai người đã dùng thử và phản hồi về khả năng đọc, hướng rẽ và nhu cầu nghe chỉ đường. Từ đó, giao diện được thu gọn và bổ sung hướng dẫn từng mốc, giọng đọc, chọn lại vị trí. Tính năng chọn phòng theo lượng người chờ và lựa chọn thang được phát triển tiếp từ yêu cầu sản phẩm.

| Nội dung | Tài liệu |
| --- | --- |
| Phỏng vấn và phân tích | [Guide](01-phong-van/interview-guide.md), [P1](01-phong-van/P1.md), [P2](01-phong-van/P2.md), [P3 tự thuật](01-phong-van/P3.md), [insights](01-phong-van/insights.md) |
| Hành trình và nhu cầu | [Journey map](02-journey-map/journey-map.md), [need statement](03-need-statement/need-statement.md) |
| Thực hành tham khảo | [Ba best practice và nguồn](04-best-practice/best-practices.md) |
| Thiết kế và triển khai | [Đặc tả hiện tại](05-prototype/simulation-spec.md), [báo cáo triển khai](05-prototype/implementation-report.md), [changelog](05-prototype/CHANGELOG.md) |
| Dùng thử và chất lượng | [Phản hồi người dùng](05-prototype/user-test-log.md), [báo cáo kiểm thử](05-prototype/test-report.md) |
| Rủi ro và cách giảm thiểu | [Risk register](06-rui-ro-dao-duc/risk-register.md) |
| Kế hoạch coach | [Markdown](07-coach-plan/coach-plan.md), [PDF một trang](07-coach-plan/coach-plan.pdf) |

## Tài liệu trình bày

- [Slide PDF, 10 trang](slides.pdf)
- [PowerPoint có thể chỉnh sửa](outputs/slides/tro-ly-kham-ngoai-tru.pptx)
- [Dàn ý và nội dung slide](slides-outline.md)

## Điểm còn hạn chế của dự án

- Sơ đồ, phòng, tầng, hồ sơ và tiến độ là dữ liệu mô phỏng; chưa tích hợp hệ thống hoặc bản đồ chính thức của bệnh viện. Vị trí dựa trên xác nhận của người bệnh hoặc nhân viên.
- Gợi ý ưu tiên theo số người và khoảng cách; chưa tính thời lượng từng thủ tục, nhiều bác sĩ phục vụ song song, lịch hẹn hay các ràng buộc chuyên môn giữa thủ tục. Vì vậy chưa khẳng định đây là thứ tự có tổng thời gian chờ ngắn nhất.
- Mẫu nghiên cứu và dùng thử còn nhỏ. Chưa có số đo giảm chờ, giảm hỏi đường hoặc kết quả thử lại với người dùng sau các cải tiến mới.
- Trợ lý AI có adapter và hướng dẫn dự phòng; chưa có bằng chứng kết nối mô hình thật thành công. Chức năng điều phối và bản đồ chạy độc lập với AI. Giọng đọc phụ thuộc hỗ trợ của trình duyệt.
- Đây là web prototype với các vai trò mô phỏng; xác thực bệnh viện, định vị trong nhà và thông báo khi đóng toàn bộ trang cần được phát triển thêm.

## Dữ liệu và công khai AI

Nghiên cứu dùng mã ẩn danh; demo dùng hồ sơ tự tạo. Codex hỗ trợ tổng hợp, lập trình, kiểm thử và biên soạn tài liệu/slide. Nguồn và phạm vi hỗ trợ được ghi tại [AI-USAGE.md](AI-USAGE.md). Khóa API, file môi trường, SQLite và bản ghi phỏng vấn thô được loại khỏi Git.
