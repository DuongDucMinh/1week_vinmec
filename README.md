# Trợ lý điều phối và dẫn đường khám ngoại trú

**Giúp người bệnh biết việc cần làm tiếp theo, phòng cần đến và cách di chuyển trong một lượt khám. Đồng thời thông báo ngay cho người bệnh khi có kết quả sau khi làm các thủ tục lâm sàng**

Dương Đức Minh · K3 · Exploration Sprint Vinmec

Dự án tập trung vào **khoảnh khắc chuyển bước sau khi rời một phòng khám hoặc phòng thủ tục**. Người bệnh thường phải tự ghép thông tin từ phiếu chỉ định, biển phòng và lời hướng dẫn để tiếp tục hành trình. Prototype nối tiến độ với hành động và đường đi, hướng tới giảm hỏi lại, chờ và di chuyển không cần thiết.

Repo là hồ sơ bài làm theo [mục 6 của đề Exploration Sprint](https://docs.google.com/document/d/1f2XCxK1NnLgVlRF2VGL0dtoxBSOKcls6/view). Các phần nghiên cứu, thiết kế, dùng thử và trình bày được sắp theo flow dưới đây.

## Xem hệ thống qua ảnh — không cần chạy dự án

**[Mở thư mục 00-luong-he-thong-qua-anh →](00-luong-he-thong-qua-anh/)**

Tiếp nhận → bác sĩ chỉ định → người bệnh xem việc tiếp theo và đường đi → phòng thủ tục cập nhật tiến độ → quay lại khoa → nhận thông báo khi đủ kết quả.

Thư mục ở ngay root, có README hiển thị luồng 7 bước và ảnh đánh số tương ứng trong `anh/`. Các ảnh giao diện khác được gom vào `bo-sung/` theo chức năng; bộ ảnh cũ nằm trong `luu-tru/` để đối chiếu. Có thêm ảnh cập nhật vị trí, cảnh báo mất kết nối và giấy hướng dẫn dự phòng.

## Quy trình thực hiện và hồ sơ bài làm

| Bước theo đề bài | Nội dung trong dự án | Tài liệu |
| --- | --- | --- |
| **1. Chọn khoảnh khắc và chuẩn bị nghiên cứu** | Chuẩn bị bộ câu hỏi về hành vi, cách tìm thông tin và xử lý vướng mắc; rà nguồn công khai về MyVinmec. | [Bộ câu hỏi phỏng vấn](01-phong-van/interview-guide.md), [nguồn về MyVinmec và trả kết quả](01-phong-van/vinmec-result-workflow-notes.md) |
| **2. Phỏng vấn, vẽ journey và tìm điểm đau** | Tổng hợp hai cuộc phỏng vấn ẩn danh và một trải nghiệm tự thuật; nối từng tình huống với hành động, cảm nhận, điểm đau và insight. | [P1](01-phong-van/P1.md), [P2](01-phong-van/P2.md), [P3 tự thuật](01-phong-van/P3.md), [điểm đau](01-phong-van/pain-points.md), [insight](01-phong-van/insights.md), [journey map / workflow](02-journey-map/journey-map.md) |
| **3. Viết need statement và tìm thực hành tham khảo** | Xác định vấn đề – nhóm người dùng – kết quả mong muốn; đối chiếu ba thực hành quốc tế và rút ra bài học cho bối cảnh Vinmec. | [Need statement theo Biodesign](03-need-statement/need-statement.md), [3 best practice và nguồn](04-best-practice/best-practices.md) |
| **4. Làm prototype có AI, thử và cải tiến** | Xây dựng ứng dụng web, lưu prompt, ghi nhận phản hồi từ hai người dùng thử và theo dõi các thay đổi sau thử. | [Mã nguồn và hướng dẫn](05-prototype/README.md), [prompt AI](05-prototype/prompts.md), [log dùng thử và phản hồi](05-prototype/user-test-log.md), [bản sửa sau thử](05-prototype/user-feedback-revision.md), [kiểm thử phần mềm](05-prototype/test-report.md) |
| **5. Tổng hợp rủi ro, kế hoạch coach và trình bày** | Phân tích an toàn, đạo đức và cách giảm thiểu; lập kế hoạch dẫn dắt nhóm K4; tổng hợp bài làm thành bộ slide 10 trang. | [Rủi ro và hỗ trợ khẩn cấp](06-rui-ro-dao-duc/risk-register.md), [kế hoạch coach một trang](07-coach-plan/coach-plan.pdf), [slides.pdf](slides.pdf) |

Bản trình bày có [PowerPoint chỉnh sửa được](outputs/slides/tro-ly-kham-ngoai-tru.pptx) và [dàn ý slide](slides-outline.md). [Nguồn kế hoạch coach](07-coach-plan/coach-plan.md) được lưu cùng bản PDF để thuận tiện chỉnh sửa.

## Prototype và giá trị sử dụng

Bối cảnh mô phỏng là Vinmec Ocean Park 2, gồm **5 khoa khám và 9 thủ tục**. Các năng lực chính:

- **Hướng dẫn theo tiến độ:** màn bệnh nhân làm nổi bật việc cần làm, địa chỉ phòng, các bước đã xong và những việc còn lại.
- **Gợi ý thứ tự để tránh phòng đông:** ưu tiên phòng ít người đang chờ hoặc đang thực hiện; cùng số người thì chọn phòng gần nhất. App tính lại sau mỗi thủ tục và giữ điểm đến ổn định khi đang di chuyển. [Quy tắc và ví dụ chi tiết](05-prototype/adaptive-routing.md).
- **Chỉ đường linh hoạt:** mặc định đi thang máy, có thể chọn thang bộ; sơ đồ và chỉ dẫn từng chặng đổi theo lựa chọn. Có giọng đọc, nghe lại, quay lại bước vừa xác nhận và cập nhật vị trí khi đi lạc hoặc quay lại viện.
- **Phối hợp giữa các vai trò:** lễ tân tiếp nhận, bác sĩ chỉ định, phòng thủ tục xác nhận tiến độ và công bố kết quả; người bệnh và bác sĩ nhận thông tin đồng bộ.
- **Hỗ trợ cả người dùng giấy:** nhân viên có thể ghi nhận đến phòng mà không cần bệnh nhân mở app; có giấy hướng dẫn in hoặc lưu để dự phòng.

## Chạy và trải nghiệm

Cần Node.js 24.x từ 24.11.1 và npm. SQLite tích hợp lưu tiến độ trên máy, không cần cài cơ sở dữ liệu riêng.

```powershell
cd 05-prototype
npm.cmd ci
npm.cmd run build
npm.cmd start
```

Mở bốn tab trên cùng máy: [tiếp nhận và điều phối](http://127.0.0.1:3001/control), [bác sĩ](http://127.0.0.1:3001/doctor), [phòng thủ tục](http://127.0.0.1:3001/procedure) và [người bệnh](http://127.0.0.1:3001/patient).

### Một lượt demo

1. Lễ tân chọn khoa và xác nhận tiếp nhận.
2. Bác sĩ tại khoa đó gọi vào khám, bắt đầu trao đổi và chốt các thủ tục cần làm.
3. Người bệnh mở **Đường đi**; thử lựa chọn loại thang (thang bộ/thang máy), có giọng đọc hướng dẫn đường đi và xác nhận mốc.
4. Tại phòng thủ tục, nhân viên bấm **Bắt đầu thực hiện**, rồi **Đã hoàn thành** để xem hướng dẫn bệnh nhân cập nhật.
5. Khi hoàn tất toàn bộ thủ tục, người bệnh được hướng về khoa ban đầu và xuất hiện trong danh sách sẵn sàng của bác sĩ. Luồng demo kết thúc khi bệnh nhân đã quay lại phòng.

Cấu hình phát triển, kết quả điện tử / bản giấy, thông báo và cách chạy kiểm thử được mô tả trong README của prototype ở bước 4.

## Điểm còn hạn chế và hướng hoàn thiện

- **Giả định điều phối:** mỗi phòng được mô phỏng có một bác sĩ phục vụ một người tại một thời điểm. Chưa tính thời lượng, phục vụ song song, lịch hẹn hoặc ràng buộc chuyên môn giữa thủ tục; hiệu quả tối ưu tổng thời gian chờ cần được đánh giá thêm.
- **Mức độ tích hợp:** sơ đồ, phòng, tầng và hồ sơ là dữ liệu mô phỏng, chưa nối hệ thống bệnh viện. Vị trí dựa trên xác nhận; xác thực tài khoản, định vị trong nhà và thông báo khi đóng toàn bộ trang sẽ được phát triển tiếp.
- **Vị trí:** đã cho người bệnh cập nhật tòa, tầng và mốc đang đứng để tính lại đường, giữ tiến độ và điểm đến. Nhưng chưa có định vị trong nhà, phát hiện đi sai tự động; vị trí vẫn phụ thuộc việc người dùng xác nhận.
- **Trợ lý AI:** Điều phối và bản đồ hoạt động độc lập với chatbot AI; tương lai sẽ tích hợp với AI chatbot hỏi đáp để khi người dùng không rõ có thể hỏi chatbot để chỉ đường
