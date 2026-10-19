# Sửa theo phản hồi T1/T2 ngày 19/10/2026

## Thay đổi trong prototype

- Màn lượt khám: bỏ dòng cơ sở lặp, chuyển xin quyền thông báo vào hộp hỗ trợ, bỏ đoạn giải thích lặp ở bước khám đầu.
- Màn đường đi: mỗi lần hiển thị một bước, nêu mốc cần tới. Chấm xanh hiển thị vị trí minh họa, tiến khi bấm “Đã tới mốc tiếp theo”. Hướng trái/phải tính từ chiều vừa đi, bước đầu yêu cầu quay mặt về mốc. Tóm tắt chặng nằm trong phần mở rộng.
- “Bật giọng chỉ đường”: phát chỉ dẫn đang xem bằng text-to-speech vi-VN, đọc bước mới khi người dùng chuyển bước, có nghe lại và tắt. Khi đóng màn hoặc đổi tuyến, hủy lời đọc cũ. Giọng Việt phụ thuộc giọng sẵn có trên thiết bị. Không dùng mô hình AI để tự tạo hướng đi.
- “Tôi đi nhầm / không rõ hướng”: nhắc dừng tại mốc có biển tên, chọn lại vị trí, tính lại tuyến sau khi xác nhận. Có hướng dẫn hỏi nhân viên nếu không nhận ra mốc.
- Phần “Google Maps và sơ đồ trong viện”: liên kết tìm cơ sở trên Google Maps, nút mô phỏng đã tới cổng, sau đó dùng sơ đồ trong viện. Chưa có GPS, la bàn, phát hiện đi sai tự động, hoặc đồng bộ Google Maps với sơ đồ trong nhà.

## Trình diễn trong 1 phút

1. Mở màn người bệnh, chọn “Đường đi”.
2. Bật giọng chỉ đường, bấm “Đã tới mốc tiếp theo”, nghe bước kế tiếp hoặc chọn “Nghe lại”.
3. Xác nhận tới tầng / sang tòa để xem bước của chặng tiếp theo.
4. Bấm “Tôi đi nhầm / không rõ hướng”, chọn mốc khác và xác nhận. Tuyến thay đổi theo mốc mới.
5. Mở phần Google Maps để minh họa chuyển từ tìm cơ sở sang sơ đồ viện.

## Giới hạn và bằng chứng

Phản hồi gốc: [user-test-log.md](user-test-log.md). Chưa thử lại với người dùng sau sửa. Chưa kết luận giảm đi nhầm hoặc phù hợp cho người thị lực kém. Vị trí, phòng và tầng vẫn là dữ liệu demo. Bản đồ chính thức và định vị trong nhà cần cơ sở cung cấp/xác minh khi triển khai.

Tham khảo triển khai: [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/speak), [Google Maps URLs](https://developers.google.com/maps/documentation/urls/get-started), kiểm tra 19/10/2026.
