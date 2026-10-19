# Đối chiếu ý tưởng hướng dẫn khám với bằng chứng và đề bài

Ngày: 18/10/2026, giờ Việt Nam. Bản phân tích do Codex hỗ trợ, dựa trên yêu cầu mới của người làm bài, tài liệu trong repo và đề gốc đọc qua Google Drive. Đây là đánh giá và đề xuất chỉnh hướng; không phải kết quả phỏng vấn, kiểm thử, tích hợp hoặc phê duyệt của Vinmec.

**Ghi chú phiên bản sau khi người làm bài làm rõ tiếp:** đề xuất giới hạn demo vào A đang chờ/B tiếp tục ở mục 5–6 là phương án trước đó. Phạm vi hiện hành bao gồm hướng dẫn liên tục quầy → phòng đầu → dịch vụ → quay lại, cùng kết quả song song, không chỉ một chuyển bước A/B. Need statement và experiment brief đã được cập nhật theo quyết định này; xem [need hiện hành](../03-need-statement/need-statement.md), [brief hiện hành](../05-prototype/experiment-brief.md) và [nguồn Vinmec/giả định](../01-phong-van/vinmec-result-workflow-notes.md). Giữ phần dưới để truy lịch sử lập luận.

**Kết luận**

Need statement và experiment brief hiện tại đúng cho một bài toán nhỏ về thông báo khi chờ kết quả. Chúng chưa đại diện đủ cho tính năng người làm bài vừa mô tả. Phần bị thiếu là hướng dẫn chuyển bước theo trạng thái của cả nhóm việc, vị trí cụ thể, tuyến đường, tiếp tục việc khác trong khi chờ và phối hợp kết quả điện tử. Tối ưu thứ tự di chuyển còn là một hướng phát triển cần thêm dữ liệu và ràng buộc.

Việc chọn hẹp phù hợp đề bài; việc mặc định chỉ được chọn chờ kết quả, loại chỉ đường khỏi thử nghiệm, là một lựa chọn phân tích trước đây. Đề không bắt buộc lựa chọn cụ thể đó. Có thể giữ tầm nhìn sản phẩm rộng và thử một đoạn chuyển bước có ranh giới rõ.

**Phạm vi tài liệu đã đối chiếu**

- [Đề gốc](https://docs.google.com/document/d/1f2XCxK1NnLgVlRF2VGL0dtoxBSOKcls6/view), đặc biệt mục 6.1–6.4, bảng sản phẩm và cấu trúc repo. Tệp trên Drive được nhận diện là Word dù URL có dạng Google Docs.
- [P1](../01-phong-van/P1.md), [P2](../01-phong-van/P2.md), [P3 tự thuật](../01-phong-van/P3.md); [kiểm kê nguồn](../01-phong-van/source-coverage.md) và [xác nhận bổ sung](../01-phong-van/clarification-questions.md).
- [Need statement](../03-need-statement/need-statement.md), [experiment brief](../05-prototype/experiment-brief.md), [pain point](../01-phong-van/pain-points.md), [insight](../01-phong-van/insights.md), [journey](../02-journey-map/journey-map.md), [bản phân tích trước](phan-tich-phong-van.md).
- README, REQUIREMENTS-STATUS, NEXT-STEPS, SUBMISSION-CHECKLIST, slides-outline, AI-USAGE; interview-guide, myvinmec-app-notes; các README, hướng dẫn thử, prompt, log và changelog trong 05-prototype; best-practices, risk-register và coach-plan.
- PDF ghi chú `note_interview.pdf`: 7 trang, hash trùng bản được kiểm kê; đọc chữ, xem lại trọn các trang 3–5 liên quan trực tiếp chuyển phòng/chờ kết quả. Bản PDF bộ câu hỏi có 6 trang, là tài liệu chuẩn bị; không phải một cuộc phỏng vấn mới.
- PDF viết tay `Người pv và bộ câu hỏi_261016_174203.pdf`: đã xem 14 trang. Nội dung chủ yếu là khung hỏi và ghi chú sơ bộ P1; hai trang cuối không có nội dung nghiên cứu đáng kể. Không đếm bản viết tay và bản hệ thống hóa thành các người tham gia khác nhau. Không dùng chi tiết riêng tư trong bản này để mở rộng bài nộp.
- Đã mở lại ba nguồn CUH/Mayo Clinic trong best-practices và đọc thêm trang MyChart chính thức của CUH. Các mô tả quốc tế không xác minh tính năng hay backend Vinmec.

**1. Ý tưởng thực sự gồm những gì?**

Job chung của người bệnh là: “Với tình trạng hiện tại của lượt khám, tôi cần làm gì bây giờ, tới đâu, đi thế nào, còn chờ gì và lúc nào phải đổi kế hoạch?”

| Thành phần người làm bài yêu cầu | Vai trò trong sản phẩm | Điều cần phân biệt |
| --- | --- | --- |
| Nhân viên xác nhận một sự kiện, app cập nhật và báo người bệnh | Nối vận hành bệnh viện với màn hình bệnh nhân | Xác nhận từ hệ thống khác với bệnh nhân tự bấm đã xong |
| Hướng dẫn từng bước, phòng/tầng/tòa | Chuyển dữ liệu thành hành động cụ thể | Một danh sách dịch vụ chưa đủ để biết bước làm ngay |
| Đã thực hiện, đang chờ kết quả, đã có kết quả, mốc dự kiến | Theo dõi tiến độ từng việc | Hoàn tất thao tác khác với hoàn tất kết quả |
| Đi làm B trong lúc chờ kết quả A | Tận dụng thời gian ở những việc được phép làm độc lập | “A chưa có kết quả” không luôn chặn B |
| Tuyến từ điểm xuất phát đến điểm đích | Giúp thực hiện quyết định chuyển bước | Điểm vừa được xác nhận không tự động là vị trí thực tại mọi thời điểm |
| Sắp thứ tự nhiều địa điểm để giảm đi lại | Lập kế hoạch trong tập lựa chọn hợp lệ | Tuyến ngắn nhất và tổng thời gian khám ngắn nhất là hai mục tiêu khác nhau |
| Ưu tiên kết quả điện tử tới bệnh nhân/bác sĩ | Bỏ lượt đi chỉ để nhận giấy khi cơ sở cho phép | Có kết quả trong hệ thống, được công bố và bác sĩ đã mời quay lại là các trạng thái riêng |

Đây là hướng dẫn quy trình gắn với trạng thái thực hiện và địa điểm. Chatbot có thể hỗ trợ hiểu hướng dẫn; một màn hình chat đơn lẻ chưa thể hiện hết ý tưởng.

**2. Đối chiếu từng yêu cầu với need statement và brief hiện tại**

| Mong muốn | Tài liệu hiện tại | Đánh giá / khoảng trống |
| --- | --- | --- |
| Từ tiếp nhận tới phòng khám đầu tiên | Need dòng 12 chỉ chọn đoạn chờ/quay phòng nhận kết quả | Ngoài phạm vi hiện tại; có thể giữ ở tầm nhìn, không phải luồng thử chính |
| Bác sĩ chỉ định thêm việc, app hiện các việc tiếp | Brief chỉ có trạng thái chờ, kết quả sẵn sàng và phòng mời tới | Chưa có danh sách chỉ định/dịch vụ, quan hệ trước–sau hoặc cơ chế thêm/hủy việc |
| Thông báo sau xác nhận | Brief dòng 13 có cập nhật theo sự kiện mô phỏng | Khớp nguyên tắc; mới áp dụng cho kết quả và lời mời quay lại |
| Mỗi bước có trạng thái riêng và dự kiến | Có mốc dự kiến, phân biệt kết quả/phòng tiếp nhận | Mới khớp một phần; thiếu nhiều việc cùng tồn tại và nguồn/thời điểm của từng dự kiến |
| Nhãn màu “Đang chờ kết quả” / “Đã có kết quả” | Bảng trạng thái có ý nghĩa tương ứng | Chưa đặc tả giao diện, nhãn, biểu tượng; màu không nên là tín hiệu duy nhất |
| Làm B khi A đang chờ | Không có kịch bản, luật hợp lệ hay nhiệm vụ thử | Thiếu phần quan trọng nhất để kiểm tra lợi ích chủ động thời gian |
| Sơ đồ tòa/tầng/phòng và đường đi | Need dòng 14, 44 chủ động để map ngoài phạm vi chính; brief không có route | Chưa khớp mong muốn được làm rõ hiện tại |
| Tối ưu nhiều điểm, có quay lại bác sĩ | Không có mục tiêu, dữ liệu, cách so sánh hoặc ngoại lệ | Chưa có; chưa nên coi là năng lực đã chứng minh |
| Kết quả điện tử, bỏ chuyến nhận giấy | Có trạng thái kết quả, chưa có kênh nhận hoặc xác nhận bác sĩ đã truy cập được | Thiếu nhánh sản phẩm mà người làm bài ưu tiên |
| Hướng dẫn sau nhận kết quả | Có “phòng đã mời tới” | Khớp nguyên tắc, cần gắn đúng điểm đến và điều kiện cho từng nhánh |
| Kiểm tra giá trị AI | Brief dòng 15–17 tách AI giải thích khỏi notification theo luật | Điểm đúng cần giữ khi sửa brief |

Need statement không cần liệt kê map, nhãn màu, push, AI hoặc bộ tối ưu. Những thứ đó thuộc giải pháp và experiment brief. Vì vậy không đưa đủ tên tính năng vào need statement để cố làm nó “khớp”. Cần sửa phạm vi vấn đề trước, rồi để brief đặc tả cách thử.

**3. P1, P2, P3 ủng hộ ý tưởng đến mức nào?**

| Nguồn | Bằng chứng phù hợp | Có thể suy ra | Chưa thể suy ra |
| --- | --- | --- | --- |
| P1-19–21, 30, 32, 34–38 | Hỏi điểm đến, nhận giấy có phòng; được điều phối dẫn; sau một bước chưa biết làm gì tiếp; điều phối xem giấy và hướng dẫn tiếp | Có vấn đề nối tình trạng hiện tại với hành động/địa điểm tiếp theo; hỗ trợ con người có ích | Map là yêu cầu trực tiếp của P1; P1 đã đi sai nhiều tòa; thiếu nhân lực hoặc mất bao nhiêu phút di chuyển |
| P1-33 và CONF-05 | Ý tưởng map/trình tự và lo điều phối thiếu khi đông thuộc người phỏng vấn | Có giả thuyết giải pháp đáng thử, xuất phát từ một vướng mắc có nguồn | Có bằng chứng người bệnh đã yêu cầu map hoặc điều phối chắc chắn quá tải |
| P2-04–09, 14–18 | Tự tìm phòng, dựa giấy/trí nhớ; có nhánh lục giấy để về phòng đầu | Hướng dẫn điểm đến và giữ ngữ cảnh có cơ sở khám phá | Mọi nhánh đều xảy ra trong cùng một lần; phòng 302 hay 9 tờ là số liệu đã xác nhận |
| P2-11–13, 24–27 | Thời gian nói miệng, chờ/gọi tên; mô tả có thể làm bước khác; muốn kết quả về phòng đầu, được báo và biết khi đủ | Có căn cứ cho cập nhật trạng thái, phối hợp nhiều việc và ưu tiên kết quả điện tử | Mọi việc đều làm song song được; backend hiện đã có/không có tích hợp; tiết kiệm được bao nhiêu |
| P3-05–10, 13 | Đã biết phòng quay lại, đợi rồi được bác sĩ báo có kết quả và mời vào | Chỉ dẫn địa điểm cần đi cùng tín hiệu thời điểm/trạng thái | Map vô ích với P1/P2; mọi người đều chỉ cần thông báo; đã chờ thừa một giờ |
| P3-02–03 | Chưa biết cách lấy số khi đến, được hướng dẫn sau khi hỏi | Có thêm vướng mắc ở bước khởi đầu | Phải ghép khởi đầu/check-in vào thử nghiệm đang chọn |

Ba nguồn có vai trò bổ sung: P1 làm rõ “làm gì/tới đâu”; P2 làm rõ “còn việc và kết quả nào, có thể làm gì trong lúc chờ”; P3 làm rõ “lúc nào trạng thái đổi để hành động”. Chúng không chứng minh cả bộ giải pháp đã đúng hoặc đại diện toàn bộ người bệnh Vinmec.

Điểm lập luận cần sửa trong tài liệu cũ: “P3 đã biết phòng nên không chỉ làm map” là đúng. Từ đó chọn map ngoài MVP chỉ là một lựa chọn phạm vi, không phải hệ quả bắt buộc của dữ liệu. Một nguồn mới bổ sung pain không tự động loại pain có nguồn ở những người trước.

**4. Điều đề bài bắt buộc và lựa chọn riêng của người phân tích**

[Mục 6 của đề](https://docs.google.com/document/d/1f2XCxK1NnLgVlRF2VGL0dtoxBSOKcls6/view) yêu cầu một khoảnh khắc hẹp; need problem–population–outcome không nêu giải pháp; prototype có AI và click được; thử 2–3 người. Hồ sơ còn cần nhật ký app, ít nhất ba phỏng vấn, journey/workflow, ba thực hành quốc tế, rủi ro, coach plan, prompt/log và slides.pdf tối đa 10 slide. Hạn bài: 23h59 ngày 19/10/2026, giờ Việt Nam.

Đề không yêu cầu map, tối ưu tuyến hoặc chatbot; cũng không cấm thử chỉ đường trong một chuyển bước. Không có yêu cầu phải tích hợp bệnh viện thật. Những chức năng vận hành có thể mô phỏng rõ ràng bằng dữ liệu tự tạo. Tự thuật P3 chưa có xác nhận được tính tương đương phỏng vấn thứ ba.

Phân tích này không có rubric chấm điểm chi tiết hoặc xác nhận chấp nhận phạm vi từ ban tổ chức; không tự suy trọng số/điểm số.

| Cách chọn phạm vi | Hệ quả với bài tập |
| --- | --- |
| Làm mọi bước từ vào viện, khám, xét nghiệm, thanh toán, thuốc tới kết thúc | Phạm vi rộng so với yêu cầu một khoảnh khắc; khó tìm bằng chứng và thử sâu từng nhánh |
| Chỉ báo có kết quả | Hẹp, gần brief hiện tại; bỏ qua phần hướng dẫn chuyển bước mà người làm bài muốn kiểm tra |
| Một chuyển bước khi đang chờ kết quả, với hai việc và đường quay phòng đầu | Đề xuất phù hợp hơn với ý tưởng và vẫn có thể giữ ranh giới nhỏ; đây là đánh giá thiết kế, không phải xác nhận của người chấm |

**5. Need statement đề xuất**

Need cho tầm nhìn sản phẩm:

> Cách để người đi khám ngoại trú phải qua nhiều điểm dịch vụ xác định đúng việc cần làm, nơi cần đến và thời điểm có thể tiếp tục từ tình trạng hiện tại của lượt khám, nhằm giảm việc phải hỏi lại, chờ và di chuyển không cần thiết.

Need ưu tiên cho bài tập:

> Cách để người đi khám ngoại trú có nhiều bước cận lâm sàng xác định đúng việc có thể làm tiếp và nơi cần đến trong lúc chờ kết quả, nhằm tiếp tục quy trình đúng thứ tự, giảm việc phải hỏi lại và hạn chế chờ hoặc di chuyển không cần thiết.

| Thành phần | Nội dung cho bài tập |
| --- | --- |
| Problem | Khó nối việc đã xong, kết quả đang chờ, việc được phép làm tiếp và địa điểm tương ứng |
| Population | Người khám ngoại trú có nhiều bước, đang chờ ít nhất một kết quả; nhóm giả thuyết, chưa xác thực đại diện |
| Outcome chính | Xác định và thực hiện đúng bước có thể làm tiếp |
| Outcome phụ | Ít phải hỏi lại; giảm chờ/đi lại có thể tránh khi đo được |
| Bắt đầu | Nhân viên vừa xác nhận hoàn tất thao tác A; A đang chờ kết quả, còn B có thể làm |
| Kết thúc | Người dùng biết làm B ở đâu; sau cập nhật biết tiếp tục chờ hay quay phòng đầu theo xác nhận |
| Quy mô demo | Hai việc A/B, một phòng khám đầu, sơ đồ cơ sở giả nhỏ |

Bản này vẫn liên quan kết quả nhưng không chỉ phục vụ người đang ngồi đợi. Không khẳng định thời gian dự kiến chắc chắn sai hoặc có sẵn chờ thừa trong mọi trường hợp.

**6. Experiment brief thay thế đề xuất, chưa triển khai**

Tên: “Biết bước có thể làm tiếp trong lúc chờ kết quả”.

Câu hỏi học hỏi: khi vừa hoàn tất A nhưng còn chờ kết quả, chỉ dẫn cập nhật theo trạng thái kèm điểm đến/tuyến có giúp người dùng chọn đúng B hoặc tiếp tục chờ theo điều kiện được cấp, rồi quay đúng phòng đầu khi được yêu cầu không?

Giả thuyết: người dùng hiểu được đồng thời “A đang chờ” và “B có thể làm ngay”; không hiểu nhãn chờ như một lệnh phải ngồi đợi toàn bộ hành trình. Chưa có kết quả thử ủng hộ giả thuyết này.

Giả thuyết cạnh tranh: dữ liệu chưa được cập nhật; chỉ dẫn sẵn có đã đủ nhưng khó thấy; B chưa thật sự đủ điều kiện; người bệnh cần hỗ trợ đi cùng; notification/timeline đã đủ và AI không tạo thêm giá trị.

Luồng mô phỏng:

| Sự kiện từ bảng nhân viên/hệ thống giả | Màn hình người bệnh cần thể hiện | Hành động cần quan sát |
| --- | --- | --- |
| Đã có chỉ định A/B trong một lượt khám giả | Danh sách các việc với cơ sở/tòa/tầng/phòng; điều kiện rõ | Tìm được bước đang được hướng dẫn |
| Nhân viên xác nhận thao tác A xong; B được phép làm ngay | A: “Đang chờ kết quả”, dự kiến có nguồn; thẻ chính: tới B; tuyến từ điểm xuất phát xác nhận | Chọn tới B, không mặc định phải đợi A |
| A có kết quả khi người dùng đang làm B | A đổi nhãn, thông báo được giữ lại; B vẫn là việc hiện hành nếu chưa có chỉ dẫn mới | Không bỏ B hoặc tự quay lại chỉ vì A đổi màu |
| Kịch bản đối chứng: B phải đợi A hoặc chưa được tiếp nhận | B chưa thể thực hiện; giải thích điều kiện còn thiếu | Không đi B trước khi được phép |
| Những kết quả bắt buộc đã được xác nhận đủ, phòng đầu yêu cầu quay lại | Hướng quay lại đúng phòng; bản điện tử đã tới đúng nơi theo dữ liệu giả; tuyến từ vị trí vừa xác nhận | Phân biệt yêu cầu quay về khu chờ với lời mời vào phòng |
| Mất cập nhật, đổi phòng, sai điểm xuất phát hoặc bỏ lỡ push | Thời điểm dữ liệu, thông báo còn trong app; xác nhận lại vị trí hoặc hỏi hỗ trợ | Không tin dữ liệu cũ hoặc tuyến khởi hành không còn đúng |

Tòa/phòng/thời gian trong demo đều tự tạo, ghi rõ không phải sơ đồ hay trạng thái thật của Vinmec. Lễ tân → phòng đầu có thể là một màn giới thiệu bối cảnh; không thêm nhiệm vụ đo riêng cho cả check-in. Nhánh nhận giấy là tùy chọn phát triển sau, không mặc định trong luồng ưu tiên điện tử.

Màn hình tối thiểu: (1) “Việc cần làm bây giờ”; (2) tiến độ riêng của A/B; (3) điểm đến và xem đường; (4) thông báo lưu lại; (5) hỗ trợ hỏi đáp AI dựa trên cùng dữ liệu; (6) bảng điều khiển mô phỏng sự kiện nhân viên, có thể gọn trong màn demo riêng.

Để giữ phép thử có ý nghĩa:

- So phương án hướng dẫn tĩnh và phương án cập nhật động trên hai tình huống tương đương; giữ cùng dữ kiện, điều kiện hợp lệ và mục tiêu. Đổi thứ tự, ghi ảnh hưởng học cách dùng. Đây là đánh giá gói thiết kế, không tách được tác động riêng của từng thành phần map/nhãn/push.
- Kiểm tra AI bằng nhiệm vụ hỏi hành chính ở một trạng thái đã cố định, so với đọc hướng dẫn tĩnh cùng thông tin. Không gọi notification hoặc đường đi là lợi ích AI.
- Thử 2–3 người theo yêu cầu đề; ghi từng người/lượt và cả lỗi. Mẫu này cung cấp phát hiện sử dụng, không chứng minh hiệu quả thống kê hoặc lợi ích tại bệnh viện.

| Chỉ số | Đo trong prototype | Giới hạn |
| --- | --- | --- |
| Chọn đúng bước | B, chờ, hay quay phòng đầu đúng với trạng thái từng tình huống | Báo số người/lượt cụ thể, không khái quát phần trăm người bệnh |
| Tìm đúng điểm đến | Nêu/ chọn đúng tòa, tầng, phòng và điểm xuất phát | Hiểu sơ đồ giả không chứng minh đi được trong cơ sở thật |
| Thời gian quyết định | Từ lúc giao nhiệm vụ/sự kiện nhìn thấy tới hành động đúng | Tách thời gian thao tác UI khỏi phút chờ xét nghiệm |
| Hiểu đúng trạng thái song song | Nêu được việc đang làm, kết quả đang chờ và việc chưa được phép | Không chỉ hỏi có thích giao diện không |
| Sai chuyển bước | Đi trước điều kiện; bỏ B vì A có kết quả; tự vào khi chưa được gọi | Một lỗi nghiêm trọng quan sát được đủ để sửa luồng trước khi thử tiếp |
| Lượt trợ giúp | Số lần cần người điều phối giải thích trong demo | Phân biệt trợ giúp hợp lý với thiếu thông tin thiết kế |
| Chất lượng AI | Đúng dữ liệu cấp, không thêm phòng/thời gian/điều kiện, biết chuyển hỗ trợ | Chưa đạt thì giữ hướng dẫn chuẩn và sửa/thu hẹp AI |
| Quãng đường / tổng thời gian mô phỏng | Chỉ tính nếu có mạng đường, thời lượng và quy tắc cố định | Kết quả mô hình không là thời gian tiết kiệm ngoài đời |

Quyết định sau thử: sửa nếu người dùng nhầm chờ A là phải dừng mọi việc; sửa nếu nhầm có kết quả là tự vào phòng; giảm thành phần không giúp thực hiện nhiệm vụ; giữ AI chỉ khi có bằng chứng giúp hiểu hướng dẫn mà vẫn đúng dữ liệu. Log và changelog chỉ điền sau khi đã chạy thật.

**7. Những quy tắc thiết kế cần đặc tả trước khi build**

Trạng thái nên tách thành ít nhất ba phần: việc cần thực hiện, kết quả và quyền/hướng tiếp nhận. Ví dụ A có thể “đã thực hiện / đang chờ kết quả”, B “được phép thực hiện / chưa tới”, còn phòng đầu “chưa yêu cầu quay lại”. Nếu dùng một stepper chỉ mở bước sau khi mọi thứ của bước trước hoàn tất, giao diện sẽ tự chặn chính khả năng làm B trong lúc chờ A.

Nhãn “Đã có kết quả” không thay thế hướng dẫn “tiếp tục B”, “chờ tại khu vực X”, “quay về đăng ký tiếp nhận” hoặc “phòng đã mời vào”. Nhãn có chữ và biểu tượng bên cạnh màu. Kết quả có sửa/thu hồi phải làm trạng thái cập nhật lại, không giữ dấu hoàn tất vĩnh viễn.

Nguồn cập nhật cần có vai trò chịu trách nhiệm: lễ tân xác nhận tiếp nhận; bộ phận thực hiện xác nhận hoàn tất; hệ thống/nhân viên có thẩm quyền xác nhận phát hành kết quả; phòng khám xác nhận bước quay lại. Không nhất thiết bắt mọi bác sĩ nhập thêm một thao tác riêng nếu hệ thống hiện có đã phát sự kiện tương ứng. Chưa biết Vinmec hiện hỗ trợ những sự kiện nào.

“Ngay lập tức” là mục tiêu sản phẩm cần đo: tách thời điểm xác nhận, nhận sự kiện, cập nhật app, gửi push và người dùng thấy thông tin. Không hứa push luôn tới ngay. Cần giữ thông báo trong app, xử lý sự kiện trùng/cũ và hiển thị lần cập nhật gần nhất. Chưa có SLA thật để điền số giây.

ETA lấy từ dữ liệu do cơ sở cung cấp hoặc giá trị mô phỏng có ghi nguồn. Hết mốc mà chưa có kết quả thì báo chưa có cập nhật/đã quá mốc dự kiến và hướng hỗ trợ; không tự đổi sang “Đã có kết quả” vì đồng hồ đếm hết. Chưa có dữ liệu để cho AI dự báo kết quả.

Sơ đồ có đường đi không đòi hỏi chấm vị trí chạy trực tiếp. Demo có thể cho chọn điểm xuất phát hoặc quét QR giả tại điểm mốc; hiển thị “điểm xuất phát vừa xác nhận”. Trong sản phẩm thật, muốn gọi đó là vị trí hiện tại phải có cơ chế xác nhận/cập nhật phù hợp. Tuyến giữa các tòa cần lối đi thật, điểm đổi tầng, thang máy và lối được phép; không vẽ một đoạn thẳng xuyên tường rồi coi là chỉ đường dùng được.

Kết quả điện tử là nhánh ưu tiên đúng với yêu cầu mới và phù hợp mong muốn P2-25–27. Để bỏ chuyến nhận bản cứng, cần xác nhận người bệnh/bác sĩ có quyền và kênh truy cập bản phù hợp, phòng đầu dùng được và quy trình không còn yêu cầu nộp giấy. Thời điểm công bố cho từng vai trò do cơ sở quy định. “Đã gửi” khác “người nhận truy cập được”; app chỉ báo thành công theo dữ liệu có thể xác nhận. Đây chưa phải mô tả hiện trạng Vinmec.

**8. Tối ưu đi lại: có thể đưa vào hướng phát triển, cần chọn đúng mục tiêu**

Có ba lớp khác nhau:

1. Từ vị trí đã biết tới một phòng: tìm tuyến hợp lệ giữa hai điểm trên sơ đồ.
2. Có A/B/C cùng được phép thực hiện: chọn thứ tự tới các điểm và quay lại phòng đầu để giảm tổng quãng đường.
3. Có thời gian chờ/kết quả, khung tiếp nhận và việc phụ thuộc nhau: chọn kế hoạch để giảm thời gian hoàn tất, đồng thời giữ ràng buộc và giới hạn đi lại.

Lớp 1 phù hợp bản demo nhỏ. Lớp 2–3 cần thêm giả định, dữ liệu và thử nghiệm; không phải tự nhiên có được chỉ vì đã có map.

Mục tiêu khoảng cách có thể mô tả: trong các thứ tự được phép, chọn thứ tự có tổng đường từ điểm hiện tại qua các điểm bắt buộc tới phòng đầu là nhỏ nhất. Mục tiêu thời gian cần tính cả đi bộ, chờ, thực hiện và phụ thuộc; một thứ tự đi xa hơn có thể hoàn tất sớm hơn nếu khởi động một việc xử lý lâu trước. Vì vậy không gắn chung nhãn “ngắn nhất/nhanh nhất” khi chưa chỉ rõ đang tối ưu điều gì.

Ví dụ tư duy: A gần nhưng thời gian xử lý dài, B xa hơn nhưng làm nhanh. Nếu A/B độc lập, làm thao tác A rồi tới B có thể tận dụng thời gian A xử lý. Nếu B phải đợi A, tuyến trên không hợp lệ. Đây là tình huống giả để đặc tả, không phải khuyến cáo trình tự xét nghiệm.

Dữ liệu cần cho hướng tối ưu: tập việc do cơ sở chỉ định; việc bắt buộc trước/sau và quyền rời khu chờ; địa điểm/đường hợp lệ; giờ nhận; ước lượng dịch vụ/hàng chờ nếu có nguồn; khả năng vận động/lối tiếp cận người dùng chọn; trạng thái kết quả và điều kiện quay phòng đầu. Mọi thứ tự tối ưu chỉ được chọn trong tập đã được quy trình cho phép.

Với ba điểm demo, có thể liệt kê các thứ tự hợp lệ rồi so tổng chi phí trên đồ thị giả. Chỉ gọi “ngắn nhất trong mô hình demo” nếu đã kiểm tra đủ phương án của mô hình đó. Không dùng một quy tắc luôn chọn nơi gần nhất rồi hứa tối ưu toàn lượt.

Ưu tiên điện tử loại các điểm nhận giấy khỏi tập phải ghé, nếu quy trình cho phép. Nhánh bản cứng cần thêm thời điểm được nhận và địa điểm lấy; không tự tối ưu đường tới nơi chưa thể trả giấy. Khi cập nhật kế hoạch, tính từ vị trí vừa xác nhận và tránh đổi ý liên tục giữa đường nếu không có lợi ích rõ hoặc chỉ đạo bắt buộc.

**9. Vai trò AI hợp lý và yêu cầu prototype có AI**

| Phần | Cơ chế đề xuất | Có cần mô hình ngôn ngữ? |
| --- | --- | --- |
| Xác nhận hoàn tất, kết quả, phòng gọi | Sự kiện/quy tắc và quyền nghiệp vụ | Không |
| Nhãn, đổi màu, gửi thông báo | Logic giao diện theo trạng thái | Không |
| Đường đi / thứ tự trong tập được phép | Thuật toán trên sơ đồ, mục tiêu và ràng buộc | Không bắt buộc mô hình ngôn ngữ |
| Hỏi “A chưa có kết quả thì tôi làm B được chưa?” | AI đọc trạng thái/điều kiện đã cấp, trả lời bằng ngôn ngữ dễ hiểu và dẫn dữ liệu | Có thể hữu ích; phải thử |
| Giải thích vì sao đang chờ, tìm lại hướng dẫn | AI dùng hướng dẫn được duyệt | Có thể hữu ích; không bịa thông tin thiếu |
| Quyết định chỉ định, thứ tự chuyên môn hoặc diễn giải kết quả | Nhân sự/quy trình chuyên môn có thẩm quyền | Ngoài vai trò AI của demo này |

Một cách đáp ứng yêu cầu AI là cho AI giải thích kế hoạch do bộ quy tắc/thuật toán tạo, hỗ trợ hỏi hành chính dựa trên dữ liệu có kiểm soát. UI chính vẫn cho phép hiểu và đi tiếp khi không hỏi chat. Cần chạy phần AI, lưu prompt/đầu vào giả/đầu ra thật; chỉ có kịch bản trả lời viết sẵn thì phải ghi mô phỏng và chưa nên tự xác nhận đủ yêu cầu có AI.

Nếu gọi thuật toán tối ưu là phần AI chính, cần giải thích rõ phương pháp và đối chiếu kỳ vọng môn học; tài liệu đã đọc chưa đủ để chắc người chấm tính một bộ tìm đường thông thường là prototype AI. Chọn phần AI có hành vi và bằng chứng kiểm thử rõ sẽ dễ đánh giá hơn.

**10. Các tài liệu cần chỉnh để cả repo cùng một hướng**

| Tài liệu | Điều nên giữ | Điều đề xuất sửa |
| --- | --- | --- |
| P1/P2/P3, source-coverage, clarifications | Phương pháp, mã nguồn, phản chứng, phân biệt diễn giải/ví dụ | Giữ nguyên dữ liệu; không sửa lời kể cho khớp ý tưởng |
| pain-points | Danh mục 17 pain và giới hạn | Ưu tiên PAIN-08 gắn PAIN-05/09/17; PAIN-10 hỗ trợ lý do giảm gánh giấy |
| insights | I-01/02/03/06/09/10 | Sửa quyết định ưu tiên: chuyển bước trong lúc chờ, kết hợp thông tin vị trí và thời điểm |
| journey-map | Journey từng nguồn tách biệt | Thêm workflow đề xuất riêng cho A đang chờ/B làm được; không trình bày như hành trình đã quan sát |
| need-statement | Cấu trúc Biodesign, không bịa hiệu quả | Phạm vi và problem/population/outcome theo đoạn thử mới |
| experiment-brief | Nguồn trạng thái, phân biệt kết quả/phòng, tách giá trị AI | Thêm hai việc, trạng thái đồng thời, map, nhánh điện tử, điều kiện tiếp tục và nhiệm vụ thử |
| best-practices | BP1 chỉ đường rất phù hợp; BP2/3 có nguồn | BP2/3 hiện tập trung đặt lịch/đăng ký. Nên dành ít nhất một thực hành cho tiếp cận kết quả điện tử hoặc cập nhật trong viện; không khẳng định thực hành quốc tế chứng minh hiệu quả Vinmec |
| risk-register | Bảo mật, dữ liệu giả, dữ liệu cũ, có kết quả khác được vào | Bổ sung sai vị trí xuất phát, đường không tiếp cận được, thứ tự không hợp lệ, kết quả tới giữa lúc làm B, sự kiện đảo thứ tự, trách nhiệm cập nhật |
| prototype README/data/prompts/test-guide/log/changelog | Công khai trạng thái chưa làm, cách ghi bằng chứng | Cập nhật nhiệm vụ và đầu vào cho brief mới; chỉ điền kết quả sau buổi thử thật |
| coach-plan | Kiểm tra nguồn, giữ phạm vi nhỏ | Dùng tình huống này minh họa cách giữ tầm nhìn nhưng chọn một phép thử; đây là gợi ý coach, không biến thành kinh nghiệm đã làm |
| README/NEXT-STEPS/REQUIREMENTS-STATUS/checklist/slides-outline/bản phân tích trước | Trạng thái bằng chứng và yêu cầu nộp | Đồng bộ tên khoảnh khắc; không còn file nói map bị loại trong khi file khác coi map là phần chính |
| AI-USAGE | Tách AI hỗ trợ khỏi dữ liệu người tham gia | Ghi bản đối chiếu và mọi chỉnh sửa được thực hiện sau quyết định mới |

Ví dụ nguồn bổ sung đã đọc: [CUH MyChart](https://www.cuh.nhs.uk/visiting-our-hospitals/your-appointment/mychart/) mô tả người bệnh truy cập một phần hồ sơ điện tử và kết quả. Nguồn này phù hợp để học cách tổ chức quyền truy cập kết quả; không chứng minh mọi kết quả tới bệnh nhân/bác sĩ cùng lúc hoặc bỏ giấy hoàn toàn. [CUH Directions](https://www.cuh.nhs.uk/visiting-our-hospitals/cuh-directions-mobile-app/) mô tả chọn điểm đầu/đích, chỉ dẫn bằng ảnh và hỗ trợ tiếp cận: có cơ sở tham khảo cho map mà không cần mặc định định vị trong nhà. Hai nguồn Mayo hiện tại vẫn hữu ích cho trạng thái xác nhận nhưng xa khoảnh khắc thử được đề xuất hơn: [đặt lịch](https://www.mayoclinic.org/scheduling-an-appointment-online/vid-20521112), [đăng ký](https://www.mayoclinic.org/billing-insurance/before-arrival/registration).

**11. Khoảng trống bài nộp còn tồn tại, độc lập với chọn ý tưởng**

Tại thời điểm đối chiếu, `05-prototype/src` chỉ có `.gitkeep`; chưa có mã ứng dụng. Prompt, log thử và changelog là mẫu. Nhật ký tự dùng MyVinmec chưa có quan sát; chưa có slides.pdf; coach plan và đầu mối chuyển hỗ trợ còn chỗ cần điền. Có hai phỏng vấn và một tự thuật; chưa có xác nhận đáp ứng tối thiểu ba cuộc phỏng vấn. Đổi need statement không tự hoàn tất những phần này.

Chưa có căn cứ kết luận MyVinmec hiện thiếu toàn bộ tính năng đề xuất, bệnh viện chưa có dữ liệu điện tử, các tòa/phòng liên kết ra sao hoặc tích hợp thời gian thực khả thi ở Vinmec. Bài có thể dùng giả định tích hợp và dữ liệu mô phỏng để thử trải nghiệm, đồng thời ghi rõ những điều phải xác minh trước triển khai.

Quyết định đề xuất để tiếp tục: dùng need cho bài tập ở mục 5; thay brief theo mục 6; dựng một đoạn A chờ/B tiếp tục/phòng đầu trên cơ sở giả; ưu tiên kết quả điện tử; giữ tối ưu nhiều tòa như hướng mở rộng có mô hình kiểm chứng riêng. Đây là phương án giữ được giá trị trung tâm của ý tưởng mà vẫn có thể đào sâu một khoảnh khắc.
