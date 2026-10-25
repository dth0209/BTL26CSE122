# Báo cáo Minh Bạch Sử Dụng AI (AI Usage Report) - CultureTrail (BTL-26)

Tuân thủ nghiêm ngặt **Điều kiện tiên quyết ĐK5** và **Tiêu chí 6 (AI Product UX & Failure UX)** theo **Barem CSE122 V2**.

---

## 1. Công cụ AI sử dụng & Phạm vi ứng dụng
- **Google Gemini 1.5 Flash / Claude 3.5 Sonnet:** Hỗ trợ phác thảo thuật toán tối ưu tuyến đường văn hóa, sinh cấu trúc dữ liệu JSON khởi tạo ban đầu (`stories`, `places`, `events`, `trails`, `admin_plans`), và tư vấn mô hình tương tác 6 bước theo tiêu chuẩn sản phẩm.
- **Tích hợp trong mã nguồn:**
  - Tuyệt đối không lưu cứng (hardcode) API Key trong mã nguồn đẩy lên GitHub (Tránh vi phạm **VP-01** bị trừ -1.50đ).
  - Sử dụng cơ chế lưu khóa tạm thời vào `sessionStorage` kết hợp bộ dữ liệu tri thức văn hóa nội bộ chạy Offline 100% không lo lỗi mạng.

---

## 2. Đặc Tả 3 Tính Năng AI Theo Chuẩn 6 Bước (Barem Tiêu Chí 6)

### 🌟 AI-1: Trình Tạo Lịch Trình Văn Hóa Cá Nhân Hóa (Culture Trail Planner & Itinerary)
- **Vị trí màn hình:** `pages/explorer-my-trail.html` (Vai trò: Du khách / Explorer).
- **Giải quyết bài toán:** Du khách thiếu thông tin về giờ mở xưởng của nghệ nhân và gặp khó khăn khi sắp xếp lịch trình di chuyển giữa các làng nghề.
- **Chuẩn 6 bước AI UX:**
  1. **Input:** Ô nhập liệu tự do `#ai-input` kèm 4 nút gợi ý nhanh (Prompt Chips): *1 ngày Gốm Bát Tràng*, *2 ngày Phố cổ Hội An*, *1 ngày Thổ cẩm Sa Pa*, *Test Bất định (Uncertainty UX)*.
  2. **Processing:** Khung xương động (Skeleton) kết hợp vòng quay và thông điệp trạng thái *"AI đang tổng hợp dữ liệu bản đồ & lịch mở cửa làng nghề..."*.
  3. **Output:** Thẻ lịch trình chi tiết theo từng mốc thời gian, tên điểm đến, mô tả trải nghiệm và thời lượng.
  4. **Explainability:** Khối *"Vì sao AI đề xuất lịch trình này?"*: Nêu rõ độ tin cậy mô hình **96.5%**, tối ưu bán kính di chuyển **1.8 km** (tiết kiệm 65% thời gian đi lại) và khớp khung giờ nghệ nhân đón khách.
  5. **User Control:** Cung cấp nút *Chỉnh sửa trước khi lưu* (cho phép sửa trực tiếp tiêu đề/ghi chú), nút *Tạo phương án khác (Option B)*, nút *Hủy*.
  6. **Save / Apply:** Khi bấm *Lưu vào Lịch trình của tôi*, dữ liệu được ghi thật sự vào `localStorage` (khóa `ct_trails`), danh sách hiển thị và bộ đếm cập nhật tức thì.
- **Kịch bản AI Failure / Uncertainty UX:** Khi người dùng nhập chuỗi quá ngắn (< 8 ký tự) hoặc chứa từ khóa ngoài phạm vi di sản (*"du lịch sao Hỏa vũ trụ"*), hệ thống không sinh dữ liệu rác mà hiển thị cảnh báo vàng: *"Không đủ dữ liệu di sản địa phương để lập lịch trình (Độ tin cậy 32%)"* kèm các nút khôi phục (Prompt Chips) để thử lại với địa danh chuẩn.

---

### 🌟 AI-2: Trợ Lý Thẩm Định Di Sản & Story Highlights (Content Review Copilot)
- **Vị trí màn hình:** `pages/curator-content-review.html` (Vai trò: Quản trị viên - Kiểm duyệt nội dung / Admin).
- **Giải quyết bài toán:** Kiểm duyệt viên tốn nhiều thời gian đọc bài viết dài và khó phát hiện các thông tin thiếu căn cứ di sản.
- **Chuẩn 6 bước AI UX:**
  1. **Input:** Dữ liệu bài viết di sản của nghệ nhân (`postId`), kết hợp 2 nút chọn kịch bản kiểm thử: *Thẩm định chuẩn (95 điểm)* và *Test Bất định (42 điểm)*.
  2. **Processing:** Trạng thái thanh tiến trình kiểm tra 3 tiêu chí: Đối chiếu từ điển di sản TLU, kiểm tra tính xác thực nghệ nhân, rà soát bản quyền ảnh.
  3. **Output:** 
     - Huy hiệu Điểm chất lượng văn hóa (*95/100 - Đạt chuẩn di sản xuất sắc*).
     - Huy hiệu Cảnh báo rủi ro (*An toàn: Không phát hiện vi phạm bản quyền hay thương mại hóa sai lệch*).
     - 3 Điểm nhấn văn hóa (Story Highlights: Nguồn gốc lịch sử, Kỹ nghệ độc bản, Giá trị cộng đồng).
  4. **Explainability:** Khối *"Tiêu chí thẩm định AI"*: Giải thích rõ mức độ khớp 95% tư liệu bảo tàng văn hóa TLU, cấu trúc bài viết đạt chuẩn 5W1H.
  5. **User Control:** Vùng soạn thảo (`textarea`) cho phép Quản trị viên chỉnh sửa trực tiếp 3 điểm nhấn văn hóa trước khi duyệt; các nút *Phê duyệt*, *Yêu cầu bổ sung (Needs Revision)*, *Từ chối*.
  6. **Save / Apply:** Khi bấm *Áp dụng AI Highlights & Phê duyệt*, trạng thái bài viết chuyển sang `approved`, điểm số và tóm tắt AI được ghi vào `ct_posts` / `ct_stories` trong `localStorage`, giao diện Queue tự động gạch bỏ bài đã xử lý.
- **Kịch bản AI Failure / Uncertainty UX:** Kích hoạt qua nút *Test Bất định (42 điểm)*: Hệ thống hiển thị cảnh báo đỏ/cam: *"Cảnh báo Bất định: Bài viết thiếu thông tin truyền nhân dòng họ và chưa có tọa độ xưởng (Độ tin cậy 42%)"* kèm nút hành động *"Yêu cầu nghệ nhân bổ sung hồ sơ chứng thực"*.

---

### 🌟 AI-3: Trợ Lý Phân Tích Dự Báo Xu Hướng & Quản Trị Di Sản (Heritage Intelligence Copilot)
- **Vị trí màn hình:** `pages/admin-culture-dashboard.html` (Vai trò: Quản trị viên / Admin).
- **Giải quyết bài toán:** Ban quản trị thiếu công cụ dự báo tình trạng quá tải tại các xưởng nghề và nguy cơ mai một của các nghệ nhân cao niên.
- **Chuẩn 6 bước AI UX:**
  1. **Input:** Bộ chọn *Lĩnh vực di sản / Làng nghề* + Bộ chọn *Khung thời gian dự báo* + 3 Prompt Chips (*Dự báo lưu lượng cao điểm*, *Rủi ro mai một nghề dệt*, *Test Bất định*).
  2. **Processing:** Khung phân tích dữ liệu động mô phỏng quét 3,721 tương tác lịch trình du khách.
  3. **Output:** 
     - 3 Thẻ chỉ số dự báo: *Tăng trưởng du khách (+34.2%)*, *Công suất xưởng nghề (82%)*, *Chỉ số nguy cơ mai một (2 điểm làng nghề)*.
     - Khuyến nghị chiến lược điều tiết luồng khách và bảo trợ nghệ nhân.
  4. **Explainability:** Khối *"Vì sao AI đưa ra dự báo này?"*: Nêu rõ thuật toán phân tích tương quan chuỗi thời gian dựa trên 3,721 lịch trình đã tạo, 150 đánh giá workshop; Độ tin cậy mô hình **91.4%**.
  5. **User Control:** Khung soạn thảo cho phép Admin tùy chỉnh nội dung khuyến nghị; nút *Tạo phương án khác (Option B)*, nút *Xuất Báo cáo JSON*, nút *Áp dụng vào Kế hoạch*.
  6. **Save / Apply:** Khi bấm *Áp dụng vào Kế hoạch Bảo tồn 2026*, bản ghi được lưu vào mảng `ct_admin_plans` trong `localStorage`, danh sách kế hoạch đã lưu hiển thị ngay trên Dashboard kèm số đếm cập nhật.
- **Kịch bản AI Failure / Uncertainty UX:** Kích hoạt qua nút *Test Bất định*: Hệ thống cảnh báo: *"Mẫu dữ liệu dưới ngưỡng phân tích (Độ tin cậy: 38%) do làng nghề vệ tinh chưa đạt 50 tương tác"* kèm nút *"Giao Curator khảo sát thực địa bổ sung"*.

---

## 3. Các Lỗi Kỹ Thuật Ban Đầu Do AI Sinh Ra & Cách Nhóm Đã Khắc Phục (Minh chứng trung thực)
1. **Lỗi 1 (Vi phạm VP-01 - Lộ API Key):** Ban đầu AI gợi ý một đoạn mã gọi Google Generative Language có nhúng trực tiếp API Key thô vào JavaScript.
   - *Sinh viên đã khắc phục:* Xóa bỏ hoàn toàn API Key thô khỏi mã nguồn, bổ sung cơ chế lưu khóa an toàn qua `sessionStorage` và xây dựng bộ từ điển tri thức văn hóa nội bộ hoạt động mượt mà cả khi offline.
2. **Lỗi 2 (Khung Chat tràn màn hình điện thoại & kẹt cuộn):** Cửa sổ chat ban đầu có chiều rộng cứng `350px` và chiều cao cố định, khiến trên màn hình iPhone SE (320px) bị tràn ngang 30px và kẹt thao tác cuộn trên cảm ứng.
   - *Sinh viên đã khắc phục:* Sửa lại CSS Responsive: `width: calc(100vw - 24px) !important; max-width: 340px !important;` kèm `-webkit-overflow-scrolling: touch; overscroll-behavior: contain;` và tự động cuộn xuống dưới cùng (`scrollTop = scrollHeight`) khi có tin nhắn mới.
3. **Lỗi 3 (AI Hộp đen thiếu Explainability & User Control):** Các gợi ý ban đầu chỉ hiển thị kết quả tĩnh, không giải thích tiêu chí gợi ý và người dùng không sửa được trước khi lưu.
   - *Sinh viên đã khắc phục:* Nâng cấp cả 3 tính năng AI tuân thủ đúng mô hình 6 bước của Barem V2: Bổ sung khối giải thích độ tin cậy %, vùng chỉnh sửa trước khi lưu (Inline Editable) và kịch bản cảnh báo bất định (Uncertainty UX).
