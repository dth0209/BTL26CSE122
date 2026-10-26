# CultureTrail (BTL-26) — Nền tảng Du lịch Văn hóa & Kết nối Làng nghề Di sản

> **Học phần:** Phát triển ứng dụng Web cơ bản (CSE122)  
> **Đơn vị đào tạo:** Khoa Công nghệ Thông tin – Trường Đại học Thủy Lợi (TLU)  
> **Giảng viên hướng dẫn & chấm thi:** ThS. Kiều Tuấn Dũng – ThS. Tạ Chí Hiếu  
> **Nhóm thực hiện:** BTL-26 (Nhóm 3 sinh viên SV1, SV2, SV3)  

---

## 1. Giới thiệu Đề tài
CultureTrail là nền tảng số hóa du lịch văn hóa di sản, kết nối trực tiếp du khách với các nghệ nhân làng nghề truyền thống Việt Nam (gốm Bát Tràng, lụa Vạn Phúc, tranh Đông Hồ...). Hệ thống giải quyết bài toán thông tin làng nghề bị phân tán, thiếu trải nghiệm tương tác và hỗ trợ lập lịch trình cá nhân hóa thông qua AI.

---

## 2. Hệ thống Phân quyền Đa vai trò (Multi-Role System)
1. **🧭 Người khám phá (Explorer / Du khách):** Tìm hiểu di sản, đọc câu chuyện làng nghề, xem chi tiết địa điểm và tạo tuyến lịch trình thông minh với trợ lý AI (AI-1).
2. **🏺 Nghệ nhân (Creator / Artisan):** Không gian quản lý bài viết di sản, đăng bài mới, quản lý sự kiện/workshop và hiển thị hồ sơ cá nhân.
3. **⚙️ Quản trị viên (Admin - Kiêm nhiệm Ban Kiểm duyệt):** Dashboard số liệu toàn diện, duyệt & thẩm định bài viết chuyên sâu với AI Review Copilot (AI-2), điều hành dự báo di sản (AI-3), duyệt tài khoản nghệ nhân và quản lý taxonomy tags.

---

## 3. Cấu trúc Thư mục Chuẩn (Architecture)
Tuân thủ 100% quy chuẩn Barem CSE122: Trang chủ `index.html` tại thư mục gốc, toàn bộ các trang con đặt trong thư mục `pages/` với chuẩn tên `role-function-action.html`:

```
c:\test\BTCKNEW\ptw\
├── index.html                                 ← TRANG CHỦ HỆ THỐNG (view-home)
│
├── pages\                                     ← TOÀN BỘ TRANG NGHIỆP VỤ ĐA VAI TRÒ
│   ├── login.html                             ← Đăng nhập / Đăng ký & chọn vai trò demo
│   ├── explorer-story-discovery.html          ← Du khách: Khám phá câu chuyện & địa điểm
│   ├── explorer-place-detail.html             ← Du khách: Chi tiết địa điểm di sản
│   ├── explorer-my-trail.html                 ← Du khách: Tuyến của tôi & AI Trail Generator (AI-1)
│   ├── explorer-creator-list.html             ← Du khách: Danh sách nghệ nhân tiêu biểu
│   ├── creator-profile-view.html              ← Nghệ nhân: Hồ sơ trang cá nhân
│   ├── creator-story-management.html          ← Nghệ nhân: Quản lý bài viết di sản
│   ├── creator-story-create.html              ← Nghệ nhân: Soạn thảo bài viết mới (Form Validation)
│   ├── creator-event-management.html          ← Nghệ nhân: Quản lý sự kiện / workshop văn hóa
│   ├── curator-content-review.html            ← Quản trị: Kiểm duyệt bài viết & AI Summarizer (AI-2)
│   ├── curator-collection-management.html     ← Quản trị: Quản lý bộ sưu tập chủ đề di sản
│   ├── curator-content-map.html               ← Quản trị: Bản đồ không gian văn hóa & điểm đến
│   ├── admin-culture-dashboard.html           ← Quản trị: Bảng điều khiển & AI Analytics (AI-3)
│   ├── admin-user-management.html             ← Quản trị: Quản lý người dùng & duyệt nghệ nhân
│   └── admin-tag-management.html              ← Quản trị: Quản lý taxonomy & thẻ tags di sản
│
├── assets\
│   ├── css\
│   │   ├── style.css                          ← Biến CSS, font, thanh cuộn, hiệu ứng
│   │   └── responsive.css                     ← Thiết kế đáp ứng đa thiết bị (320px, 768px, 1024px)
│   ├── data\
│   │   ├── stories.json                       ← Dữ liệu mẫu câu chuyện di sản
│   │   ├── places.json                        ← Dữ liệu mẫu địa điểm làng nghề
│   │   └── creators.json                      ← Dữ liệu mẫu hồ sơ nghệ nhân
│   └── js\
│       ├── tailwind.config.js                 ← Cấu hình Tailwind Design Tokens
│       ├── app.js                             ← Nghiệp vụ chính, render giao diện, xử lý AI
│       ├── page-nav.js                        ← Tầng điều hướng thông minh đa trang
│       ├── role-switcher.js                   ← Thanh chuyển đổi nhanh 4 vai trò demo
│       └── api.js                             ← Lớp dữ liệu tập trung (LocalStorage/Sync)
│
├── docs\
│   ├── screen-inventory.md                    ← Bảng kiểm kê 12 màn hình khớp 1:1 mã nguồn
│   ├── ai-usage-report.md                     ← Báo cáo minh bạch sử dụng AI
│   └── presentation\                          ← Slide thuyết trình nhóm
│
└── README.md                                  ← Tài liệu giới thiệu & hướng dẫn dự án
```

---

## 4. Ba Tính Năng AI Đặc Thù (AI Product UX)
1. **AI-1: AI Trail Generator (`pages/explorer-my-trail.html`)**  
   Gợi ý tuyến trải nghiệm di sản văn hóa cá nhân hóa theo sở thích và thời gian của du khách. Đủ 6 bước AI UX: Input → Processing → Output → Explainability → User Control → Save. Có xử lý AI Uncertainty / Fallback khi thiếu thông tin.
2. **AI-2: AI Story Summarizer (`pages/curator-content-review.html`)**  
   Tự động tóm tắt nội dung bài viết, phân loại chủ đề và đánh giá mức độ phù hợp với tiêu chí văn hóa di sản, hỗ trợ Curator duyệt nhanh.
3. **AI-3: Trợ lý Văn hóa AI (Floating Chat Widget)**  
   Cung cấp thông tin văn hóa, lịch sử và chỉ dẫn làng nghề trực quan có thể di chuyển (draggable) trên toàn bộ hệ thống.

---

## 5. Hướng Dẫn Cài Đặt & Chạy Cục Bộ
Sản phẩm được xây dựng bằng kiến trúc Frontend thuần (Vanilla JS, Semantic HTML5, Tailwind CSS), không cần cài đặt môi trường backend phức tạp:

1. Mở thư mục `c:\test\BTCKNEW\ptw` bằng **VS Code**.
2. Cài đặt tiện ích mở rộng **Live Server** (Ritwick Dey).
3. Nhấp chuột phải vào tệp `index.html` → Chọn **Open with Live Server**.
4. Trình duyệt tự động mở tại `http://localhost:5501` hoặc `http://127.0.0.1:5500`.

### Cấu hình Gemini cho bản demo cục bộ

1. Mở `assets/js/gemini-config.local.js`.
2. Thay duy nhất chuỗi `DAN_API_KEY_CUA_TOI_VAO_DAY` tại hằng số `GEMINI_API_KEY` bằng API key của bạn.
3. Giữ nguyên model `gemini-3.5-flash-lite`, lưu tệp và tải lại trang Live Server.

`gemini-config.local.js` đã nằm trong `.gitignore`; `gemini-config.example.js` là tệp mẫu không chứa key. Đây chỉ là cấu hình phục vụ demo cục bộ: API key đặt trong JavaScript frontend vẫn có thể bị người dùng trình duyệt xem thấy và không phù hợp để triển khai website công khai. Khi triển khai thật, nên gọi Gemini qua một backend/proxy có kiểm soát xác thực, quota và domain.

Luồng dữ liệu AI: các tệp JSON chỉ seed `ct_stories`, `ct_places`, `ct_creators` ở lần chạy đầu → mọi thay đổi sau đó dùng bản hiện hành trong LocalStorage → `ai-data-context.js` lọc và nối quan hệ theo ID, đồng thời loại số điện thoại/email → `gemini-service.js` gọi Gemini qua header `x-goog-api-key` → `app.js` xác thực kết quả có cấu trúc và render an toàn lên UI.

Chatbot và AI lập lịch có bật Google Search grounding (`enableGoogleSearch: true`). Khi điểm đến chưa có trong CultureTrail, Gemini vẫn có thể tư vấn bằng nguồn web nhưng giao diện phải thông báo đó là thông tin ngoài dự án và CultureTrail chưa cung cấp chuyến đi/dịch vụ tương ứng. Google Search grounding có thể sử dụng quota hoặc phát sinh chi phí theo chính sách tài khoản Gemini API.

Gói người dùng Gemini Plus/Google AI Pro và hạn mức Gemini API là hai hệ thống riêng. API key kế thừa billing/quota của Google Cloud project trong AI Studio. Nếu quota riêng của Search grounding trả lỗi 429, CultureTrail tự thử lại một lần không dùng Search, hiển thị cảnh báo nguồn ngoài chưa được kiểm chứng trực tiếp, và tạm ngưng thử Search trong 5 phút để tránh lặp lỗi.

### Chuyển đổi vai trò Demo:
Nhấp vào biểu tượng chiếc khiên **🛡️ (Demo Role Switcher)** ở góc dưới bên phải màn hình để chuyển tức thì giữa 4 vai trò hoặc truy cập trang [login.html](pages/login.html).
