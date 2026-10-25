/* =============================================================================
   page-nav.js  —  LỚP KẾT NỐI ĐA TRANG (file MỚI, KHÔNG sửa code gốc)
   -----------------------------------------------------------------------------
   File gốc là một SPA: mọi <section class="view-section"> nằm chung 1 trang và
   được bật/tắt bằng hàm switchView('view-xxx'). Sau khi tách thành
   index.html + các trang con, mỗi trang chỉ còn 1 section, nên file này:

   1) Giữ nguyên switchView() gốc. Nếu view KHÔNG tồn tại trên trang hiện tại
      thì tự chuyển sang file .html tương ứng (mọi onclick="switchView(...)"
      trong code gốc vẫn chạy đúng, không phải sửa).
   2) Giữ trạng thái đăng nhập (currentUser) và dữ liệu bài viết (posts) khi
      di chuyển giữa các trang bằng sessionStorage.
   3) Chuyển tham số cho các trang được render bằng JS:
      post-detail.html / creator-profile.html / curator-review.html / ai-trail.html
   ========================================================================== */

/* id <section> trong code gốc  ->  file trang tương ứng trong pages/ */
const VIEW_PAGE_MAP = {
    'view-home':         'index.html',
    'view-login':        'login.html',
    'view-exp-discover': 'explorer-story-discovery.html',
    'view-exp-detail':   'explorer-place-detail.html',
    'view-exp-trail':    'explorer-my-trail.html',
    'view-cre-list':     'explorer-creator-list.html',
    'view-cre-profile':  'creator-profile-view.html',
    'view-cre-story':    'creator-story-management.html',
    'view-cre-create':   'creator-story-create.html',
    'view-cur-review':   'curator-content-review.html',
    'view-adm-dash':     'admin-culture-dashboard.html',
    'view-adm-posts':    'admin-culture-dashboard.html',      /* [V2] Quản lý bài viết   */
    'view-adm-creators': 'admin-culture-dashboard.html',      /* [V2] Quản lý nghệ nhân  */
    'view-adm-reports':  'admin-culture-dashboard.html',      /* [V2] Báo cáo & thống kê */
    'view-adm-tags':     'admin-tag-management.html',
    'view-adm-users':    'admin-user-management.html',
    'view-cre-events':   'creator-event-management.html',
    'view-cur-collections': 'curator-collection-management.html',
    'view-cur-map':      'curator-content-map.html'
};

function isInsidePagesDir() {
    var p = window.location.pathname.replace(/\\/g, '/');
    return p.indexOf('/pages/') !== -1;
}

function resolvePageUrl(targetPage) {
    if (!targetPage) return '';
    var inPages = isInsidePagesDir();
    if (targetPage === 'index.html') {
        return inPages ? '../index.html' : 'index.html';
    }
    return inPages ? targetPage : ('pages/' + targetPage);
}

const SS_KEY = {
    user:      'ct_roleKey',
    posts:     'ct_posts',
    creators:  'ct_creators',    /* [V2] trạng thái xác minh / khoá nghệ nhân */
    editPost:  'ct_editPostId',  /* [V2] bài viết nghệ nhân đang sửa lại      */
    postId:    'ct_openPostId',
    creatorId: 'ct_openCreatorId',
    reviewId:  'ct_reviewPostId',
    aiPrefill: 'ct_aiPrefill',
    authTab:   'ct_authTab'
};

/* Chỉ cho phép chuyển trang SAU khi app.js chạy xong khởi tạo của nó
   (app.js có: DOMContentLoaded -> switchView('view-home')).
   Nhờ vậy các trang con không bị "đá" về index.html khi vừa tải xong. */
let navEnabled = false;

/* ---- sessionStorage an toàn (kể cả khi mở bằng file://) ---- */
function ssSet(key, value) { try { sessionStorage.setItem(key, value); } catch (e) { /* ignore */ } }
function ssGet(key)        { try { return sessionStorage.getItem(key); } catch (e) { return null; } }
function ssDel(key)        { try { sessionStorage.removeItem(key); } catch (e) { /* ignore */ } }
function savePosts()       { try { ssSet(SS_KEY.posts, JSON.stringify(posts)); } catch (e) { /* ignore */ } }

/* [V2] Lưu trạng thái nghệ nhân (verified / active) mà admin vừa thay đổi.
   app.js gọi 2 hàm này qua tên toàn cục ctSavePosts / ctSaveCreators. */
function saveCreators()    { try { ssSet(SS_KEY.creators, JSON.stringify(creators)); } catch (e) { /* ignore */ } }
window.ctSavePosts    = savePosts;
window.ctSaveCreators = saveCreators;

/* [FIX] Nút "Quản lý bài viết" / "Tạo bài mới" trên trang HỒ SƠ NGHỆ NHÂN.
   Trang hồ sơ thuộc nhóm public (không có sidebar), mà renderCreatorProfile()
   gốc không có liên kết nào sang trang quản lý bài viết. Wrapper này nối thêm
   2 nút khi người đang đăng nhập xem hồ sơ CỦA CHÍNH MÌNH (không sửa app.js). */
(function () {
    var _originalRenderProfile = window.renderCreatorProfile;
    if (typeof _originalRenderProfile !== 'function') return;
    window.renderCreatorProfile = function (creatorId) {
        _originalRenderProfile.apply(this, arguments);
        try {
            if (!currentUser || currentUser.id !== creatorId) return;
            var container = document.getElementById('creator-profile-container');
            if (!container || document.getElementById('cre-manage-btn-bar')) return;
            var bar = document.createElement('div');
            bar.id = 'cre-manage-btn-bar';
            bar.className = 'flex flex-col sm:flex-row gap-3 mb-10';
            bar.innerHTML =
                '<button onclick="switchView(\'view-cre-story\')" class="flex-1 py-3.5 bg-brand-700 hover:bg-brand-800 text-white font-bold rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-2">'
                + '<span>📝</span> Quản lý bài viết</button>'
                + '<button onclick="switchView(\'view-cre-create\')" class="flex-1 py-3.5 bg-white border-2 border-brand-200 hover:bg-brand-50 text-brand-700 font-bold rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-2">'
                + '<span>✍️</span> Tạo bài mới</button>';
            var heading = container.querySelector('h3');
            if (heading && heading.parentNode) heading.parentNode.insertBefore(bar, heading);
            else container.appendChild(bar);
        } catch (e) { /* ignore */ }
    };
})();

/* =============================================================================
   1. KHÔI PHỤC TRẠNG THÁI NGAY KHI SCRIPT ĐƯỢC NẠP (trước DOMContentLoaded)
   ============================================================================= */
(function restoreState() {
    /* 1a. Danh sách bài viết (đã duyệt / đã xóa / mới tạo ở trang trước) */
    const savedPosts = ssGet(SS_KEY.posts);
    if (savedPosts) {
        try { posts = JSON.parse(savedPosts); } catch (e) { /* ignore */ }
    }

    /* [V2] 1a-bis. Trạng thái nghệ nhân do admin thay đổi (xác minh / khoá).
       Ghi ngược vào đúng object đang tồn tại để `profiles.creatorX` (tham chiếu
       tới cùng object) không bị lệch dữ liệu. */
    const savedCreators = ssGet(SS_KEY.creators);
    if (savedCreators) {
        try {
            const parsed = JSON.parse(savedCreators);
            Object.keys(parsed).forEach(function (key) {
                if (creators[key]) Object.assign(creators[key], parsed[key]);
            });
        } catch (e) { /* ignore */ }
    }

    /* 1b. Người dùng đang đăng nhập: tái sử dụng NGUYÊN hàm loginAs() của
       code gốc để dựng lại sidebar, avatar, menu, nút "Đăng xuất".
       - switchView tạm thời bị vô hiệu để không nhảy sang trang khác
       - showToast tạm thời bị vô hiệu để không hiện thông báo lúc tải trang
       - try/catch vì #auth-form-container & #role-modal chỉ có ở login.html  */
    const roleKey = ssGet(SS_KEY.user);
    if (roleKey && typeof loginAs === 'function') {
        const keepSwitchView = window.switchView;
        const keepShowToast  = window.showToast;
        window.switchView = function () { };
        window.showToast  = function () { };
        try { loginAs(roleKey); } catch (e) { /* bỏ qua phần tử chỉ có ở login.html */ }
        window.switchView = keepSwitchView;
        window.showToast  = keepShowToast;
    }
})();

/* =============================================================================
   2. BỌC CÁC HÀM ĐIỀU HƯỚNG CỦA CODE GỐC (không sửa nội dung hàm gốc)
   ============================================================================= */
const _switchView = window.switchView;
window.switchView = function (targetId) {
    /* View có sẵn trên trang này -> dùng đúng logic gốc */
    if (document.getElementById(targetId)) return _switchView(targetId);

    const page = VIEW_PAGE_MAP[targetId];
    if (!navEnabled || !page) return _switchView(targetId);

    /* Nút "Tạo lịch trình AI" ở trang chi tiết bài viết chạy:
       switchView('view-exp-trail'); document.getElementById('ai-input').value = '...'
       -> tạo sẵn #ai-input tạm để câu lệnh sau không lỗi, rồi lưu lại giá trị. */
    if (targetId === 'view-exp-trail' && !document.getElementById('ai-input')) {
        const tmp = document.createElement('input');
        tmp.type = 'hidden';
        tmp.id = 'ai-input';
        document.body.appendChild(tmp);
        window.__ctAiTmp = true;
    }

    window.location.href = resolvePageUrl(page);
};

/* Lưu nội dung đã gõ vào #ai-input tạm khi rời trang */
window.addEventListener('pagehide', function () {
    if (window.__ctAiTmp) {
        const tmp = document.getElementById('ai-input');
        if (tmp) ssSet(SS_KEY.aiPrefill, tmp.value);
    }
});

/* Đăng nhập / Đăng ký từ bất kỳ trang nào */
const _openAuth = window.openAuth;
window.openAuth = function (type) {
    if (!document.getElementById('view-login')) {
        ssSet(SS_KEY.authTab, type || 'login');
        window.location.href = resolvePageUrl(VIEW_PAGE_MAP['view-login']);
        return;
    }
    return _openAuth(type);
};

/* Ghi nhớ phiên đăng nhập */
const _loginAs = window.loginAs;
window.loginAs = function (roleKey) {
    ssSet(SS_KEY.user, roleKey);
    return _loginAs(roleKey);
};

const _logout = window.logout;
window.logout = function () {
    ssDel(SS_KEY.user);
    return _logout();
};

/* Các hàm mở trang được render bằng JS: chuyển tham số qua trang đích */
const _openPostDetail = window.openPostDetail;
window.openPostDetail = function (postId) {
    if (!document.getElementById('detail-container')) {
        ssSet(SS_KEY.postId, postId);
        window.location.href = resolvePageUrl(VIEW_PAGE_MAP['view-exp-detail']);
        return;
    }
    return _openPostDetail(postId);
};

const _openCreatorProfile = window.openCreatorProfile;
window.openCreatorProfile = function (creatorId) {
    if (!document.getElementById('creator-profile-container')) {
        ssSet(SS_KEY.creatorId, creatorId);
        window.location.href = resolvePageUrl(VIEW_PAGE_MAP['view-cre-profile']);
        return;
    }
    return _openCreatorProfile(creatorId);
};

const _openReviewMode = window.openReviewMode;
window.openReviewMode = function (postId) {
    if (!document.getElementById('review-container')) {
        ssSet(SS_KEY.reviewId, postId);
        window.location.href = resolvePageUrl(VIEW_PAGE_MAP['view-cur-review']);
        return;
    }
    return _openReviewMode(postId);
};

/* Các hàm làm thay đổi dữ liệu bài viết -> lưu lại để trang khác thấy được.
   try/finally để LUÔN lưu được dữ liệu kể cả khi hàm gốc ném lỗi giữa chừng
   (ví dụ truy cập phần tử chỉ tồn tại ở trang đích). */
['submitNewPost', 'deletePost', 'approvePost', 'rejectPost',
 /* [V2] các hàm mới làm thay đổi dữ liệu bài viết */
 'saveDraftPost', 'adminApprove', 'adminReject', 'adminDeletePost'].forEach(function (fnName) {
    const original = window[fnName];
    if (typeof original !== 'function') return;
    window[fnName] = function () {
        try {
            return original.apply(this, arguments);
        } finally {
            savePosts();
        }
    };
});

/* [V2] Các hàm làm thay đổi trạng thái nghệ nhân -> lưu lại để trang khác thấy */
['toggleCreatorActive', 'toggleCreatorVerified'].forEach(function (fnName) {
    const original = window[fnName];
    if (typeof original !== 'function') return;
    window[fnName] = function () {
        try {
            return original.apply(this, arguments);
        } finally {
            saveCreators();
        }
    };
});

/* =============================================================================
   3. XỬ LÝ DỮ LIỆU ĐƯỢC TRANG TRƯỚC CHUYỂN SANG (chạy sau khởi tạo của app.js)
   ============================================================================= */
document.addEventListener('DOMContentLoaded', function () {
    navEnabled = true;

    /* [FIX] Sidebar đang bị ẩn VĨNH VIỄN bởi style="display:none" nội tuyến
       trong HTML, mà switchView() gốc chỉ bật/tắt class (hidden / md:flex),
       không đụng tới style -> menu "Quản lý Bài viết" không bao giờ hiện ra.
       Gỡ style nội tuyến để class điều khiển đúng thiết kế ban đầu:
       - Trang công khai: switchView thêm 'hidden', bỏ 'md:flex' -> vẫn ẩn.
       - Trang nghệ nhân / kiểm duyệt / quản trị: hiện khi màn hình >= 768px.
       Listener này chạy TRƯỚC switchView riêng của từng trang (đăng ký sau)
       và cùng một nhịp render nên không gây loé giao diện. */
    var _sidebar = document.getElementById('app-sidebar');
    if (_sidebar) _sidebar.style.removeProperty('display');

    /* 3a. Chi tiết bài viết */
    const postId = ssGet(SS_KEY.postId);
    if (postId && document.getElementById('detail-container')) {
        ssDel(SS_KEY.postId);
        _openPostDetail(postId);
    }

    /* 3b. Hồ sơ nghệ nhân */
    const creatorId = ssGet(SS_KEY.creatorId);
    if (creatorId && document.getElementById('creator-profile-container')) {
        ssDel(SS_KEY.creatorId);
        _openCreatorProfile(creatorId);
    }

    /* 3c. Trang kiểm duyệt bài viết */
    const reviewId = ssGet(SS_KEY.reviewId);
    if (reviewId && document.getElementById('review-container')) {
        ssDel(SS_KEY.reviewId);
        _openReviewMode(reviewId);
    }

    /* 3d. Điền sẵn yêu cầu cho trang AI Lịch trình */
    const prefill = ssGet(SS_KEY.aiPrefill);
    if (prefill && document.getElementById('ai-input')) {
        ssDel(SS_KEY.aiPrefill);
        document.getElementById('ai-input').value = prefill;
    }

    /* 3e. Mở đúng tab Đăng nhập / Đăng ký */
    const authTab = ssGet(SS_KEY.authTab);
    if (authTab && document.getElementById('view-login')) {
        ssDel(SS_KEY.authTab);
        toggleAuthTab(authTab);
    }

    /* [V2] 3f. Chế độ "Sửa & gửi lại" bài viết của nghệ nhân.
       Dùng setTimeout(0) để chạy SAU khi script khởi tạo của trang gọi
       switchView('view-cre-create') — câu lệnh đó reset form, nếu nạp dữ liệu
       trước thì sẽ bị xoá mất. */
    setTimeout(function () {
        const editId = ssGet(SS_KEY.editPost);
        if (editId && document.getElementById('form-create-post')
                && typeof window.ctLoadPostIntoForm === 'function') {
            ssDel(SS_KEY.editPost);
            window.ctLoadPostIntoForm(editId);
        }
    }, 0);
});

/* =============================================================================
   4. DỰ PHÒNG: mở trực tiếp trang con bằng URL (không có tham số) thì vẫn
      có nội dung để xem, thay vì để trống. Dùng lại chính hàm render gốc.
   ============================================================================= */
window.addEventListener('load', function () {
    try {
        const detail = document.getElementById('detail-container');
        if (detail && detail.children.length === 0) {
            const firstPost = posts.find(function (p) { return p.status === 'approved'; });
            if (firstPost) _openPostDetail(firstPost.id);
        }

        const profile = document.getElementById('creator-profile-container');
        if (profile && profile.children.length === 0) {
            const firstCreatorId = Object.keys(creators)[0];
            if (firstCreatorId) renderCreatorProfile(firstCreatorId);
        }
    } catch (e) { /* ignore */ }
});

