> Cập nhật 19/10/2026: luồng chỉ định theo từng bệnh nhân, hàng đợi phòng thủ tục và map theo chặng đã thay thế thiết kế cũ. Xem [bản triển khai end-to-end hiện tại](end-to-end-revision.md). Nội dung bên dưới ghi lại phiên bản trước.

# Bản đồ và giao diện hướng dẫn lượt khám

Cập nhật theo yêu cầu ngày 19/10/2026: sơ đồ tổng quan theo tinh thần ảnh tham chiếu do người làm bài cung cấp, đồng thời có chi tiết tầng/phòng và hướng dẫn ngắn. Đây là vòng sửa sản phẩm, không phải kết quả thử người dùng.

## Mục tiêu của vòng sửa

- Người bệnh nhìn được các tòa và lối di chuyển giữa các tòa trước khi xem chi tiết.
- Điểm đến có tên dịch vụ, số phòng, tầng và tòa nhất quán giữa thẻ hướng dẫn, bản đồ, phiếu in và thông báo.
- Chỉ dẫn được tách thành từng chặng ngắn: vị trí xuất phát, thang máy, đổi tầng, lối nối, phòng đích. Các hướng trái/phải phải khớp hình học tuyến và hướng vừa di chuyển; không đoán hướng người dùng đang quay mặt.
- Giao diện điện thoại ưu tiên việc cần làm và một hành động tiếp theo. Không lặp các đoạn giải thích về kỹ thuật hoặc bối cảnh thử nghiệm.
- Thông tin về dữ liệu dựng được ghi trong tài liệu bàn giao; không đặt nhãn cảnh báo mô phỏng ở mỗi thẻ, bản đồ hoặc hộp thoại người bệnh.

## Quy ước bản đồ trong prototype

| Điểm | Tòa | Tầng | Số phòng |
| --- | --- | --- | --- |
| Khám Nội ban đầu và trao đổi kết quả | A | 2 | A201 |
| Xét nghiệm sinh hóa máu | A | 2 | A205 |
| Siêu âm ổ bụng | B | 1 | B105 |
| Quầy tiếp nhận, sảnh và lối nối | A/B theo điểm | 1 | Theo tên mốc |

**Các mã phòng, hình học tòa nhà, vị trí và lối nối trên đây do dự án quy ước để mô phỏng, chưa được bệnh viện xác nhận.** Tên người bệnh, lịch sử và nội dung phiếu kết quả cũng là dữ liệu tự tạo; không có chỉ số xét nghiệm, chẩn đoán hoặc hồ sơ người bệnh thật. Việc bỏ nhãn demo khỏi giao diện nhằm thử trải nghiệm như một ứng dụng hoàn chỉnh, không biến dữ liệu dựng thành thông tin cơ sở thật. Ảnh tham chiếu chỉ định hướng cách thể hiện sơ đồ; không dùng tên, địa hình hoặc nhận diện của HMU làm sơ đồ Vinmec.

## Những quy tắc nghiệp vụ cần giữ

Hai chế độ trả kết quả tiếp tục áp dụng cho toàn lượt. Hoàn tất một dịch vụ vẫn có thể đi tiếp khi đang chờ kết quả; thời gian dự kiến không tự phát kết quả. Nhánh giấy cần nhận đủ hai bản. Nhánh điện tử có thể chờ bên ngoài sau khi làm xong hai dịch vụ và cần xác nhận lại điểm xuất phát khi trở lại.

Đủ kết quả chưa tự đăng ký sẵn sàng. Người bệnh chỉ xác nhận khi đã ở ngoài phòng A201; bác sĩ chủ động gọi. Khi mất phản hồi xác nhận, giao diện giữ trạng thái chưa rõ kết quả và cho gửi lại đúng lệnh cũ. Feedback lỗi phải nằm trong hộp thoại đang mở. Phiếu in và hỗ trợ nhân viên vẫn là đường tiếp tục khi ứng dụng lỗi.

## Phạm vi bằng chứng

Kiểm tra tự động, review code và hình xuất từ SVG chỉ chứng minh phần mềm và cách thể hiện dữ liệu dựng trong phạm vi đã kiểm tra. Không dùng chúng để khẳng định sơ đồ thực tế, độ chính xác định vị, thời gian tiết kiệm hoặc hiệu quả lâm sàng. Chưa có thử người dùng thật và chưa có request AI LIVE thành công.

## Các thay đổi đã triển khai

| Phần | Hành vi mới |
| --- | --- |
| Tổng quan | Khối tòa A/B, lối nối, cổng, nhãn phòng và đường đi giữa các tòa; nút mở chi tiết từng tòa |
| Tầng & phòng | Chọn tòa/tầng, hiển thị A201/A205/B105, hành lang và thang máy; chỉ tô đoạn đường nằm đúng tòa/tầng đang xem |
| Chỉ dẫn | Cùng tuyến graph với đường tô, tách lên/xuống tầng và qua lối nối; trái/phải dựa hướng đi của chặng trước |
| Điểm xuất phát | Dùng vị trí đã xác nhận. Khi ở ngoài viện, chưa vẽ đường cho tới khi chọn lại mốc xuất phát |
| Lượt khám | Bỏ dải demo, đoạn bối cảnh dựng, lời giải thích kỹ thuật lặp lại; tăng cỡ chữ hướng dẫn chính lên 13–14 px |
| Kết quả/thông báo | Nhãn và nội dung hành chính ngắn; không tạo chỉ số y khoa để làm phiếu trông thật |
| Bác sĩ/điều phối | Bỏ mã trạng thái/mã người bệnh nội bộ khỏi luồng chính; cài đặt và thông tin kỹ thuật thu vào công cụ điều phối |
| Dữ liệu đang lưu | Chỉ đổi cách trình bày các câu fixture cũ đã nhận diện chính xác; không xóa lượt, thay trạng thái, biên nhận lệnh hoặc nội dung tự nhập |
| Trợ lý | Dùng lời giải thích dễ hiểu khi AI chưa kết nối; không hiển thị LIVE/FALLBACK như nhãn sản phẩm |

Ví dụ tuyến từ Sinh hóa đến Siêu âm:

1. Từ phòng A205 · Sinh hóa, tầng 2, tòa A.
2. Ra hành lang.
3. Rẽ phải, ra sảnh thang máy.
4. Đi thang máy xuống tầng 1.
5. Theo hành lang tới lối nối.
6. Qua lối nối sang tòa B.
7. Tới phòng B105 · Siêu âm.

## Hình xuất từ thành phần bản đồ

Các tệp sau được dựng trực tiếp từ `CampusMapSvg`/`FloorMapSvg` của ứng dụng bằng React server renderer rồi xuất PNG. Điều phối đã mở và kiểm tra từng hình. Đây là **hình của thành phần bản đồ, không phải screenshot toàn bộ app trong trình duyệt**.

- [Sơ đồ tổng quan](outputs/map-revision/overview.png), [SVG](outputs/map-revision/overview.svg).
- [Tòa A, tầng 1](outputs/map-revision/floor-a1.png), [SVG](outputs/map-revision/floor-a1.svg).
- [Tòa A, tầng 2](outputs/map-revision/floor-a2.png), [SVG](outputs/map-revision/floor-a2.svg).
- [Tòa B, tầng 1](outputs/map-revision/floor-b1.png), [SVG](outputs/map-revision/floor-b1.svg).

## Cách mở bản sửa

1. Mở PowerShell tại `D:\Python\lab_coach_vin\1week_vinmec\05-prototype`.
2. Lần đầu chạy `npm.cmd ci`; sau đó chạy `npm.cmd run dev`.
3. Mở địa chỉ Vite in ra, mặc định `http://127.0.0.1:5173/patient`. Nếu đang mở sẵn, tải lại trang để nhận mã giao diện mới.
4. Chọn **Đường đi** ở thanh dưới, xem **Tổng quan** rồi **Tầng & phòng**. Chọn tòa/tầng để đối chiếu phòng và chặng đang tô.
5. Dùng `/control` để xác nhận tiếp nhận/dịch vụ/kết quả, `/doctor` để gọi và chỉ định. Hướng dẫn và bản đồ của bệnh nhân cập nhật theo các xác nhận đó.

Hướng dẫn đầy đủ cho hai chế độ, chạy production và AI nằm trong [báo cáo triển khai](implementation-report.md). Bản build cùng origin: `npm.cmd run build`, rồi `npm.cmd start`, mở `http://127.0.0.1:3001/patient`.

Để thử mất kết nối mà không thêm công cụ thử nghiệm vào màn người bệnh: `/control` → **Cài đặt & kiểm tra** → **Mở ứng dụng để kiểm tra kết nối**. Trang `/patient?tools=1` có hỗ trợ → **Công cụ kiểm tra kết nối**; `/patient` thông thường không có phần này.

## Kết quả kiểm tra cuối

- **110/110 tests trong 10 files đạt**, điều phối chạy lại toàn bộ sau khi đóng băng lần sửa cuối. [Output Vitest](outputs/map-revision/test-results.json).
- Typecheck và production build **đạt**, 37 modules. Cài lại thư viện theo package-lock qua registry chính thức, audit 0; không đổi dependency.
- GPT-6 Astra rà độc lập và kiểm tra **39/39 hashes khớp**, không có finding P1/P2 có thể hành động trong phạm vi rà. [Manifest](outputs/review-manifest-map-ui.json), [review log](review-log.md).
- Reviewer và điều phối đã mở cả bốn hình SVG xuất ra để kiểm tra. Browser/E2E của UI mới **chưa chạy lại** vì giới hạn quyền quan sát đã nêu trong [test-report.md](test-report.md); không dùng static render/DOM để thay bằng chứng browser.

Executor A/B của vòng sửa này đều dùng GPT-6.1 Sol; reviewer dùng GPT-6 Astra theo phân công của người làm bài. Không sửa dữ liệu phỏng vấn P1/P2/P3 hoặc ghi thêm kết quả nghiên cứu chưa có.
