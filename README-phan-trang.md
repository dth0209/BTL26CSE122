# CultureTrail — Cấu trúc đa trang (đã tách từ 1 file SPA duy nhất)

Toàn bộ web trước đây nằm trong **một file** `culturetrail_n_n_t_ng_du_l_ch_v_n_h_a-2.html`
(1253 dòng), gồm 11 `<section class="view-section">` được bật/tắt bằng hàm `switchView()`.

Nay đã được chuẩn hóa toàn bộ vào thư mục pages/ theo đúng chuẩn Barem CSE122 V2: index.html (trang chủ ở root) + toàn bộ các trang con đặt trong pages/ tuân thủ quy chuẩn ole-function-action.html.
`assets/css/style.css` và `assets/js/app.js`.

> ⚠️ **CODE GỐC KHÔNG BỊ THAY ĐỔI.** Toàn bộ HTML/CSS/JS được **cắt nguyên văn theo
> số dòng** bằng script (không gõ lại tay), và đã kiểm chứng từng ký tự giống hệt file gốc.
>
> 🧹 **ĐÃ DỌN DẸP:** file gốc 1 trang và thư mục script `_build/` đã bị xoá theo yêu cầu,
> để `c:\ptw` chỉ còn đúng sản phẩm cuối cùng. Bản nén dự phòng (chứa cả file gốc lẫn
> script tách trang) nằm ở `%TEMP%\ptw-backup-truoc-khi-xoa.zip` — giải nén ra nếu cần.

---

## 1. Cây thư mục

```
c:\ptw\
├── index.html                  ← TRANG CHỦ  (view-home)
├── login.html                  ← Đăng nhập / Đăng ký + chọn vai trò demo
├── discover.html               ← Du khách: Khám phá câu chuyện
├── post-detail.html            ← Du khách: Chi tiết địa điểm
├── ai-trail.html               ← Du khách: AI Lịch trình (Gemini)
├── creators.html               ← Danh sách nghệ nhân
├── creator-profile.html        ← Nghệ nhân: Hồ sơ
├── creator-posts.html          ← Nghệ nhân: Quản lý bài viết
├── creator-post-new.html       ← Nghệ nhân: Tạo bài viết mới
├── curator-review.html         ← Quản trị: Kiểm duyệt bài viết
├── admin.html                  ← Quản trị: Bảng điều khiển
│
├── assets\
│   ├── css\style.css           ← nguyên văn khối <style> gốc (dòng 32–47)
│   └── js\
│       ├── tailwind.config.js  ← nguyên văn script cấu hình Tailwind (dòng 14–29)
│       ├── app.js              ← nguyên văn LOGIC SCRIPT gốc (dòng 615–1250)
│       └── page-nav.js         ← FILE MỚI: lớp kết nối điều hướng đa trang
│
└── README-phan-trang.md        ← tài liệu này
```

## 2. Bảng ánh xạ trang ↔ section gốc

| Trang | `id` section gốc | Dòng trong file gốc |
|---|---|---|
| `index.html` | `view-home` | 147–265 |
| `login.html` | `view-login` | 267–352 |
| `discover.html` | `view-exp-discover` | 354–376 |
| `post-detail.html` | `view-exp-detail` | 378–385 |
| `ai-trail.html` | `view-exp-trail` | 387–429 |
| `creators.html` | `view-cre-list` | 431–444 |
| `creator-profile.html` | `view-cre-profile` | 446–453 |
| `creator-posts.html` | `view-cre-story` | 455–471 |
| `creator-post-new.html` | `view-cre-create` | 473–508 |
| `curator-review.html` | `view-cur-review` | 510–520 |
| `admin.html` | `view-adm-dash` | 522–560 |

**Mỗi trang đều có đầy đủ phần khung dùng chung (giống hệt file gốc):**
toast, chat widget AI kéo-thả, sidebar, `<main>`, public header, global footer.

## 3. Cấu trúc một trang con

```html
<head> … (dòng 1–12 gốc) …
    <script src="assets/js/tailwind.config.js"></script>   <!-- thay cho script nội dòng -->
    <link rel="stylesheet" href="assets/css/style.css">    <!-- thay cho khối <style> -->
</head>
<body>
    … dòng 52–145 gốc: toast + chat + sidebar + <main> + public header …
    … SECTION của riêng trang này (cắt nguyên văn) …
    … dòng 562–611 gốc: global footer + </main> …

    <script src="assets/js/app.js"></script>       <!-- toàn bộ logic gốc -->
    <script src="assets/js/page-nav.js"></script>  <!-- lớp kết nối đa trang -->
    <script>
        document.addEventListener("DOMContentLoaded", () => switchView('view-xxx'));
    </script>
</body>
```

## 4. `page-nav.js` làm gì? (file MỚI, không sửa code gốc)

Vì code gốc là SPA (mọi section nằm chung 1 trang), khi tách ra nhiều file cần một
lớp "keo" để hành vi không đổi. `page-nav.js` **không sửa bất kỳ dòng code gốc nào**,
nó chỉ bọc (wrap) các hàm gốc:

1. **`switchView(id)`** — nếu view có trên trang → chạy đúng hàm gốc; nếu không →
   tự chuyển sang file `.html` tương ứng. Nhờ vậy mọi
   `onclick="switchView('view-…')"` trong HTML gốc vẫn hoạt động bình thường.
2. **Giữ phiên đăng nhập** — lưu `roleKey` vào `sessionStorage`, sang trang khác sẽ
   gọi lại chính hàm `loginAs()` gốc để dựng sidebar / avatar / menu / nút đăng xuất.
3. **Giữ dữ liệu bài viết** — lưu mảng `posts` sau khi gọi `submitNewPost`,
   `deletePost`, `approvePost`, `rejectPost` (tạo bài → sang trang quản lý vẫn thấy;
   duyệt bài → về dashboard vẫn thấy số liệu mới).
4. **Chuyển tham số giữa các trang render bằng JS** — `openPostDetail(id)`,
   `openCreatorProfile(id)`, `openReviewMode(id)` sẽ gửi id sang trang đích
   (`post-detail.html`, `creator-profile.html`, `curator-review.html`) rồi gọi lại
   chính hàm gốc để render.
5. **`openAuth('login'|'register')`** — chuyển sang `login.html` và mở đúng tab.
6. **Nút "Tạo lịch trình AI"** ở trang chi tiết — chuyển sang `ai-trail.html` và
   điền sẵn câu lệnh vào ô input (giống hành vi gốc).
7. **Dự phòng** — mở trực tiếp `post-detail.html` / `creator-profile.html` bằng URL
   (không qua nút bấm) thì vẫn tự render nội dung đầu tiên thay vì để trang trống.

## 5. Cách chạy

Mở trực tiếp `index.html` bằng trình duyệt là chạy được.
Khuyến nghị chạy qua web server cục bộ (để `fetch` tới Gemini API và `sessionStorage`
ổn định nhất):

```powershell
cd c:\ptw
# Máy này KHÔNG cài Python/Node, nên dùng extension Live Server của VS Code:
#   chuột phải index.html -> Open with Live Server
# (nếu sau này có Python thì: python -m http.server 8080 -> http://localhost:8080/)
```

Hoặc dùng extension **Live Server** của VS Code → chuột phải `index.html` → *Open with Live Server*.

**Đăng nhập demo** (từ `login.html`): bấm *Đăng nhập* → *Đăng nhập nhanh (Demo)* → chọn
`🧭 Du khách` / `🏺 Nghệ nhân: Cô Lan (Lụa)` / `📊 Quản trị viên (Duyệt bài)`.

## 6. Khi muốn sửa nội dung

File gốc 1 trang và script tách trang **đã bị xoá** khi dọn dẹp, nên từ nay sửa
**trực tiếp trên các trang con**. Sửa ở đâu cho đúng:

| Muốn đổi gì | Sửa file nào | Ảnh hưởng |
|---|---|---|
| Nội dung riêng của 1 trang | file `.html` của trang đó | chỉ trang đó |
| Logic / dữ liệu / nghệ nhân / bài viết | `assets/js/app.js` | **cả 11 trang** |
| Điều hướng, giữ phiên, truyền tham số | `assets/js/page-nav.js` | **cả 11 trang** |
| CSS dùng chung | `assets/css/style.css` | **cả 11 trang** |

> ⚠️ **Lưu ý quan trọng:** phần khung dùng chung (header / sidebar / footer /
> chat widget AI) được **lặp lại trong từng file `.html`**, không phải file dùng chung.
> Sửa khung ở một trang sẽ **không** tự lan sang 10 trang còn lại — phải sửa tay ở cả 11 file.

Nếu cần khôi phục file gốc 1 trang hoặc script tách/kiểm chứng trang:
giải nén `%TEMP%\ptw-backup-truoc-khi-xoa.zip`.

## 7. Ghi chú kỹ thuật

- `index.html` giữ **nguyên văn** thẻ `<title>` của file gốc; các trang con có tiêu đề
  riêng dạng `<Tên trang> | CultureTrail - Nền tảng Du lịch Văn hóa`.
- Chỉ có 2 thẻ bao `<style>` / `</style>` (dòng 31 & 48) được thay bằng
  `<link rel="stylesheet">`; **nội dung CSS bên trong vẫn nguyên văn** trong
  `assets/css/style.css`. Tương tự, thẻ `<script>` bao ngoài được thay bằng
  `<script src="assets/js/app.js">`, nội dung JS không đổi một ký tự.
- Các file được ghi bằng **UTF-8 không BOM**, tiếng Việt hiển thị đúng.
- Nút *Đăng nhập/Đăng ký* trên trang chủ (hero) vẫn dùng `openAuth(...)` gốc →
  được `page-nav.js` chuyển sang `login.html`.

