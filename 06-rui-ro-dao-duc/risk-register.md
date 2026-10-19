# Rủi ro an toàn, đạo đức và cách giảm thiểu

Cập nhật 20/10/2026. Phạm vi: prototype hướng dẫn chuyển bước ngoại trú, điều phối theo lượng người, lựa chọn thang, hai chế độ nhận kết quả và các vai trò bệnh nhân, bác sĩ, phòng thủ tục, điều phối. Lượt khám, kết quả, phòng và sơ đồ đều mô phỏng. Đây là đánh giá thiết kế cho bài tập, chưa phải quy trình được Vinmec phê duyệt.

## Nguyên tắc và trách nhiệm

Người làm bài chịu trách nhiệm rà dữ liệu trước chia sẻ, giải thích giới hạn cho người thử và dừng thử khi có vấn đề an toàn hoặc riêng tư. Trước khi áp dụng tại viện, cần đầu mối vận hành xác nhận quy trình/phòng/điều kiện chuyển bước và đầu mối y tế xác nhận luồng khẩn cấp. Các đầu mối này chưa được chỉ định.

AI chỉ chọn thông tin hành chính từ dữ kiện hiện có. Quy tắc nghiệp vụ quyết định trạng thái; nhân viên xác nhận sự kiện chuyên môn. AI không được chọn dịch vụ, giải thích kết quả, thay đổi chỉ định hoặc đưa người dùng vào hàng chờ.

## Bảng rủi ro ưu tiên

Mức ảnh hưởng là đánh giá định tính nếu xảy ra, chưa phải tần suất đã đo. Chưa đủ dữ liệu ước lượng xác suất. Kiểm tra phần mềm dùng dữ liệu giả chưa chứng minh an toàn thực tế.

| Mã / ảnh hưởng | Tình huống và hậu quả | Cách giảm thiểu | Bằng chứng và việc còn thiếu |
| --- | --- | --- | --- |
| R01 / Cao | Nhầm đã thực hiện với đã có kết quả, quay lại sớm hoặc thiếu giấy. Nguồn P1-35–36, P2-25–27. | Tách thực hiện, kết quả và nhận từng giấy; chặn chuyển bước khi chưa đủ điều kiện. | Có domain/server tests cho hai mode; cần quan sát người thử hiểu các trạng thái và lý do chặn. |
| R02 / Cao | Sơ đồ giả, điểm đầu cũ hoặc tuyến khó tiếp cận dẫn đi sai. Nguồn P1-19–21/32/36, P2-04–05. | Nhãn mô phỏng, xác nhận điểm đầu, chỉ dẫn chữ theo mốc; chưa rõ thì hỏi nhân viên. | Có 23 tests tuyến và kiểm tra ảnh thành phần. Chưa xác minh mặt bằng/lối tiếp cận thật; không cho người thử đi theo bản đồ ngoài đời. |
| R03 / Cao | Model hiểu sai, chọn thông tin không phù hợp hoặc làm theo yêu cầu bỏ quy tắc. | Chỉ cho chọn intent/fact ID hợp lệ; server kiểm tra và dựng câu từ facts. Trợ lý không có quyền ghi trạng thái. | Có mock tests schema/facts/lỗi; 24 eval thật hiện NOT_LIVE. Cần thử LIVE câu mơ hồ, ngoài phạm vi và yêu cầu đổi trạng thái. |
| R04 / Rất cao | Người cần trợ giúp khẩn cấp tiếp tục hỏi AI hoặc nhận hướng dẫn bước khám thường, gây chậm tìm hỗ trợ. | Lối hỗ trợ trực tiếp luôn truy cập được, không chờ AI phân loại. Dừng nhiệm vụ thử khi có nhu cầu hỗ trợ thật. | Chưa có luồng khẩn cấp đã kiểm chứng. Fallback hiện trả việc tiếp theo; chưa thể coi là xử lý khẩn cấp. |
| R05 / Cao | Nhầm đủ kết quả với được vào phòng; xác nhận có mặt khi vẫn ngoài viện. | Tách đủ điều kiện, có mặt/sẵn sàng và bác sĩ gọi; nút sẵn sàng ghi đúng là tự khai báo; nhân viên có thể kiểm tra và xác nhận thủ công. | Có tests gate/staff fallback; chưa xác thực vị trí hoặc thử cách hiểu của người dùng. |
| R06 / Cao | Mất mạng, phản hồi cũ hoặc gửi lại lệnh gây sai trạng thái/hàng chờ trùng. | Kiểm tra run/revision/generation, chống lệnh trùng; hiển thị chờ xác nhận/lỗi; giữ giấy và hỗ trợ con người. | Có tests stale/reset/retry/server/UI lỗi. Browser/E2E giao diện mới chưa chạy; cần quan sát lại phục hồi mạng. |
| R07 / Cao | Hiểu quy tắc demo chờ bên ngoài, ETA hoặc trả kết quả là chính sách bệnh viện, gây bỏ lỡ bước. | Công khai mô phỏng; không cam kết thời gian, định vị hoặc gọi thật. Chỉ dùng quy tắc đã được cơ sở xác nhận khi áp dụng thật. | Có đặc tả demo; chưa xác minh quy trình Vinmec, chưa đo thời gian chờ hoặc bỏ lượt. |
| R08 / Cao | Lộ danh tính, sức khỏe hoặc khóa API qua repo, prompt, log, ảnh, Canva. | Dùng P1/P2/P3, T1/T2/T3 và dữ liệu giả. Chỉ chia sẻ ghi chép dịch vụ đã khái quát. Khóa ở server ngoài Git; không tải ghi chú thô lên Canva. | Có .gitignore và facts không chứa lịch sử lâm sàng; chưa phải rà riêng tư toàn repo/lịch sử Git. Cần rà trước push và chia sẻ. |
| R09 / Trung bình | Người ít quen điện thoại, thị lực kém không đọc được hoặc hiểu nhầm màu. | Nhãn chữ đi cùng màu, câu ngắn theo chặng, giấy và hỗ trợ trực tiếp. | Có DOM tests/ảnh thành phần; chưa thử nhóm đa dạng hoặc khả năng tiếp cận trên điện thoại thật. |
| R10 / Cao | Nhầm người/lượt ở màn bác sĩ hoặc cập nhật kết quả làm gián đoạn hồ sơ đang xem. | Gắn sự kiện với lượt, cập nhật nền; bác sĩ chủ động mở lượt. Áp dụng thật cần xác thực, phân quyền và đối chiếu danh tính của cơ sở. | Có mô phỏng encounter/cập nhật nền. Ba vai trò demo chưa phải phân quyền production; không dùng dữ liệu bệnh nhân thật. |
| R11 / Trung bình | Biến diễn giải thành lời nguyên văn, tính tự thuật là phỏng vấn hoặc công bố tiết kiệm chưa đo. | Truy nguồn từng phát hiện; ghi phương pháp/giới hạn; tách QA, eval AI và thử người dùng. | Có 2 phỏng vấn + 1 tự thuật, chưa thử người dùng. Không dùng ví dụ 9 tờ/30–60 phút hay ước lượng P3 làm KPI. |

## Đường chuyển sang hỗ trợ con người

Khi app lỗi hoặc thông tin không khớp, thông điệp đề xuất: “Hãy dùng giấy hướng dẫn và nhờ quầy tiếp nhận hoặc nhân viên phòng khám xác nhận bước tiếp theo.” Không tự đoán phòng, điều kiện hoặc giờ chờ. Nhân viên kiểm tra trước khi xác nhận sẵn sàng thủ công.

Trang cơ sở công bố **hotline Vinmec Ocean Park 2: 024 3975 1800**, kiểm tra ngày 19/10/2026: [nguồn chính thức](https://www.vinmec.com/vie/co-so-y-te/benh-vien-da-khoa-vinmec-ocean-park-2). Đây là số liên hệ của cơ sở; chưa xác minh là kênh cấp cứu trực tiếp hoặc có thời gian đáp ứng cụ thể. Không gắn nhãn cấp cứu cho số này.

## Đường chuyển khẩn cấp đề xuất

1. Cho mở mục “Cần hỗ trợ y tế khẩn cấp” trực tiếp, không phụ thuộc câu trả lời AI. Prototype hiện chưa chứng minh có luồng này đầy đủ.
2. Hiển thị: “Hãy báo ngay cho nhân viên y tế gần bạn hoặc nhờ người bên cạnh tìm nhân viên y tế. Ứng dụng này không gọi hỗ trợ thay bạn.” Khi thử tại nhà có nhu cầu hỗ trợ thật, người điều phối dừng demo và hỗ trợ tiếp cận dịch vụ y tế thực tế phù hợp.
3. Dừng gợi ý hành chính trong luồng này; không chẩn đoán/phân loại mức khẩn cấp hoặc yêu cầu tiếp tục chờ đủ kết quả. Chỉ thêm số gọi và điểm hỗ trợ cụ thể khi cơ sở có thẩm quyền đã xác nhận.
4. Nếu có nút gọi, chỉ báo “mở ứng dụng gọi điện”. Không ghi “đã gọi cứu trợ” hoặc “đã có người tiếp nhận” khi chưa có xác nhận thực.

Chưa có số cấp cứu chuyên biệt, vị trí điểm trực/tầng/phòng, thời gian đáp ứng hoặc đầu mối được cơ sở xác nhận; chưa kiểm thử chuyển khẩn cấp. Đầu mối y tế cần duyệt trước thử trong viện. Không lấy hotline chung để lấp khoảng trống này.

## Quản lý dữ liệu nghiên cứu

Xin đồng ý trước phỏng vấn/thử và giải thích ghi chép ẩn danh dùng trong repo bài nộp. Chỉ hỏi trải nghiệm dịch vụ; không hỏi chẩn đoán/bệnh án/tình trạng sức khỏe, không chụp người/giấy tờ và không ghi âm khi chưa có đồng ý riêng.

Chỉ người làm bài giữ bản thô và thông tin liên hệ, tách khỏi repo. Người chấm nhận bản đã khái quát; Canva chỉ nhận nội dung đã ẩn danh và hình mô phỏng. Đồng ý phỏng vấn không tự đồng nghĩa đồng ý ghi âm hoặc công khai rộng.

Kế hoạch lưu giữ đề xuất: xóa bản thô và bảng nối mã trong 30 ngày sau vòng tuyển chọn, hoặc sớm hơn khi rút đồng ý; cần xác nhận với người tham gia và tuân theo phạm vi đã thỏa thuận nếu khác. Khi có yêu cầu rút dữ liệu: xác định mã qua kênh riêng, bỏ nội dung liên quan khỏi repo/slide, cập nhật phân tích và bản chia sẻ; giải thích giới hạn thu hồi bản người khác đã tải. Không ghi danh tính trong issue/commit.

## Các kiểm tra trước bản cuối

| Ca dùng dữ liệu giả | Kết quả chấp nhận | Hiện trạng |
| --- | --- | --- |
| Thiếu một kết quả/giấy | Chặn quay lại/sẵn sàng, lý do rõ | Có tests, cần thử người dùng |
| Câu hỏi y khoa/yêu cầu bỏ quy tắc | Giữ phạm vi, không tự đổi trạng thái | Mock đã kiểm tra, LIVE chưa xác minh |
| API lỗi và yêu cầu khẩn cấp | Phân biệt fallback hành chính với lối trợ giúp khẩn cấp trực tiếp | Fallback có test, đường khẩn cấp chưa đầy đủ |
| Mất mạng/phản hồi trễ sau reset | Không nhận dữ liệu cũ/báo thành công giả; có lối hỏi người | Có tests, browser bản mới chưa chạy |
| Đủ kết quả khi ngoài viện | Chưa tự vào hàng chờ, chỉ xác nhận khi có mặt | Có tests nghiệp vụ, chưa thử người dùng |
| Rà repo/log/ảnh/nội dung gửi Canva | Không có dữ liệu nhận dạng/sức khỏe thật hoặc khóa | Cần rà trước chia sẻ cuối |

Các kiểm tra kỹ thuật làm giảm một số lỗi mô phỏng; chưa đủ để kết luận an toàn triển khai tại bệnh viện.

Nguồn nội bộ: [P1](../01-phong-van/P1.md), [P2](../01-phong-van/P2.md), [P3 tự thuật](../01-phong-van/P3.md), [đặc tả](../05-prototype/simulation-spec.md), [prompt](../05-prototype/prompts.md), [báo cáo kiểm tra](../05-prototype/test-report.md). Codex hỗ trợ biên soạn; người làm bài rà và chịu trách nhiệm bản cuối.

## Bổ sung cho điều phối và lựa chọn thang

| Rủi ro thiết kế | Cách xử lý trong prototype và bước cần xác minh |
| --- | --- |
| Số người ít chưa đồng nghĩa thời gian chờ ngắn | Nêu rõ mỗi phòng một bác sĩ, chưa tính thời lượng / phục vụ song song; đo khi có dữ liệu thực tế |
| Dữ liệu đến / rời phòng thiếu hoặc chậm | Nhân viên có ghi nhận đến phòng cho người dùng giấy; loại người hoàn tất khỏi phép đếm; cần nguồn dữ liệu đáng tin khi triển khai |
| Hướng dẫn đổi liên tục khi phòng khác bớt người | Giữ đích khi đang đi, chỉ tính lại điểm đến sau chỉ định hoặc hoàn tất thủ tục |
| Thủ tục thực tế có điều kiện chuyên môn | Prototype giả lập thủ tục độc lập; cần cơ sở xác nhận ràng buộc và thứ tự bắt buộc trước khi dùng với bệnh nhân thật |
| Lựa chọn thang chưa phù hợp khả năng di chuyển | Thang máy mặc định; người bệnh chủ động đổi và có thể đổi lại. Cần đánh giá khả năng tiếp cận và quy tắc tại cơ sở |

[Hành vi hiện tại](../05-prototype/simulation-spec.md) · [Chi tiết thuật toán](../05-prototype/adaptive-routing.md).
