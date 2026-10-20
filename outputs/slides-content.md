# Nội dung slide hiện hành - trợ lý khám ngoại trú

Cập nhật 21/10/2026. [PDF](../slides.pdf) · [PowerPoint hiện hành](slides/tro-ly-kham-ngoai-tru.pptx). 10 trang; nội dung dưới đây lấy từ chính bộ slide đã xuất.

## Slide 1. Trợ lý khám ngoại trú

- Trợ lý / khám ngoại trú
- Điều phối thủ tục theo lượng người chờ / và dẫn đường trong bệnh viện
- Việc gì tiếp? / Tới đâu? / Khi nào?
- Vinmec · Prototype điều phối và dẫn đường · 20/10/2026

**Nguồn:** [README dự án](../README.md).

## Slide 2. Nghiên cứu trải nghiệm

- Hai cuộc phỏng vấn và một trải nghiệm tự thuật
- 2
- Cuộc phỏng vấn
- Trải nghiệm người tham gia kể lại
- 1
- Trải nghiệm tự thuật
- Góc nhìn của người làm bài
- Tổng hợp hành vi, cảm nhận và điểm vướng để xác định nhu cầu.
- Dữ liệu ẩn danh; ghi chép diễn giải; mẫu nghiên cứu còn nhỏ.

**Nguồn:** [P1](../01-phong-van/P1.md), [P2](../01-phong-van/P2.md), [P3](../01-phong-van/P3.md).

## Slide 3. Điểm đau nằm ở các lần chuyển bước

- Dòng việc tiếp tục, nhưng thông tin để quyết định có thể bị đứt đoạn
- Rời phòng / khám đầu
- Tìm điểm / tiếp theo
- Thực hiện / dịch vụ
- Chờ và nhận / kết quả
- Quay lại / bác sĩ
- ×
- ×
- ×
- Chưa rõ bước tiếp / và nơi cần đến
- Khó biết / diễn tiến
- Chưa rõ lúc nào / có thể quay lại
- Tìm giấy hoặc hỏi nhân viên để nối lại thông tin
- ×  Điểm đứt mạch thông tin
- Sơ đồ tổng hợp các tình huống nghiên cứu, không phải hành trình của một người.

**Nguồn:** [Journey map](../02-journey-map/journey-map.md).

## Slide 4. Nhu cầu trọng tâm

- Biết đúng bước tiếp theo, / đúng nơi và đúng thời điểm.
- CHO AI
- Người khám ngoại trú / qua nhiều điểm dịch vụ
- VẤN ĐỀ
- Thông tin chuyển bước / chưa liền mạch
- MONG MUỐN
- Giảm hỏi lại, chờ và / di chuyển không cần thiết
- Giả thuyết thiết kế; cần kiểm chứng hiệu quả với người dùng.

**Nguồn:** [Need statement](../03-need-statement/need-statement.md).

## Slide 5. Ba thực hành quốc tế tham khảo

- Bài học áp dụng cho hướng dẫn chuyển bước
- CUH Directions
- Anh
- Chỉ dẫn theo chặng, dùng mốc dễ nhận ra / và xác nhận điểm xuất phát.
- Mayo Clinic
- Đặt lịch trực tuyến
- Phân biệt gửi yêu cầu với đã hoàn tất; / cho người dùng tìm lại chi tiết.
- Mayo Clinic
- Đăng ký
- Nói rõ phần đã xong và / những việc còn cần xác minh.
- Nguồn chính thức và giới hạn áp dụng giữ trong ghi chú và repo.

**Nguồn:** [Thực hành quốc tế](../04-best-practice/best-practices.md).

## Slide 6. Điều phối thủ tục theo lượng người chờ

- Chọn phòng ít người trước; cùng số người thì chọn phòng gần nhất
- Khám đầu
- Chốt / chỉ định
- Chọn phòng / ít người
- Thực hiện / thủ tục
- Tính lại / việc còn lại
- Quay lại / khoa đầu
- Ví dụ: thứ tự được tính lại sau khi làm xong A
- A / Ít người nhất
- Dự kiến còn lại / B → C
- Làm xong A / Tính lại
- C ít hơn B / Đi C trước
- Đếm người tại phòng
- Bằng nhau: chọn gần nhất
- Một bác sĩ / phòng
- Ví dụ mô phỏng; hiệu quả giảm chờ cần được đo khi thử nghiệm thực tế.

**Nguồn:** [Đặc tả](../05-prototype/simulation-spec.md), [điều phối](../05-prototype/adaptive-routing.md).

## Slide 7. Thử với người dùng

- Đã nhận phản hồi từ 2 người
- 2
- người đã dùng thử
- T1: Khó nhìn, nhiều chữ thừa
- T2: Chưa rõ hướng rẽ, lo đi nhầm. / Đề nghị có giọng đọc chỉ đường.
- Phản hồi do người làm bài thuật lại ngày 19/10. Chưa đo thời gian hoặc tỷ lệ hoàn thành.

**Nguồn:** [Phản hồi dùng thử](../05-prototype/user-test-log.md).

## Slide 8. Cải tiến giao diện và đường đi

- Dễ theo dõi, / linh hoạt đường đi
- Thu gọn chữ; chỉ dẫn từng chặng. / Chạm biểu tượng để xem giờ đồng bộ.
- Thang máy hoặc thang bộ
- Mặc định thang máy; chọn thang bộ / khi thang máy đông. Tuyến cập nhật / theo lựa chọn.
- Đi lạc hoặc vừa quay lại
- Chọn tòa, tầng và mốc đang đứng. / Giữ tiến độ, tính lại đường tới đích.
- Giọng Việt từ bản ghi hoặc Azure; vị trí do người dùng xác nhận.

**Nguồn:** [Cải tiến từ phản hồi](../05-prototype/user-feedback-revision.md), [lựa chọn thang](../05-prototype/adaptive-routing.md).

## Slide 9. Rủi ro về an toàn và đạo đức

- Cách giảm thiểu trong prototype
- RỦI RO
- CÁCH GIẢM THIỂU
- Sai bước hoặc sai phòng
- Cập nhật vị trí; chưa rõ mốc thì nhờ nhân viên.
- AI trả lời sai hoặc vượt phạm vi
- Dùng facts đã xác nhận, giới hạn hướng dẫn hành chính.
- Chậm tìm hỗ trợ khẩn cấp
- Lối tìm nhân viên trực tiếp, dừng hướng dẫn thường.
- Lộ dữ liệu hoặc dùng sai mục đích
- Ẩn danh, xin đồng ý, dùng dữ liệu giả, giữ khóa ở server.
- Khó dùng app hoặc mất kết nối
- Báo mất kết nối, hiện lần đồng bộ; dùng giấy/nhân viên.
- Biện pháp đề xuất. Luồng khẩn cấp còn cần hoàn thiện và kiểm chứng với cơ sở.

**Nguồn:** [Rủi ro](../06-rui-ro-dao-duc/risk-register.md).

## Slide 10. Kế hoạch coach nhóm K4

Em muốn cả nhóm hiểu quy trình và pain point trước khi chia việc

| Thời gian | Công việc |
| --- | --- |
| Tuần 0-1 | Soạn câu hỏi và phỏng vấn |
| Cuối tuần 1 | Tổng hợp, chọn hướng |
| Tuần 2 | Chia việc theo thế mạnh |
| Tuần 3-4 | Ghép luồng và thử sớm |
| Tuần 5 | Sửa theo phản hồi |
| Tuần 6 | Hoàn thiện và demo |

- Chia việc: rõ người, hạn và đầu ra
- Gỡ kẹt: hỗ trợ hoặc phân bổ lại việc
- Chất lượng: đọc chéo và thử người dùng

Nhóm 5-10 bạn. Cập nhật hằng ngày, họp 2 buổi/tuần và review thứ Sáu.

**Nguồn:** [Kế hoạch coach](../07-coach-plan/coach-plan.md).
