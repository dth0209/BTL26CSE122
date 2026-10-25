/**
 * assets/js/role-switcher.js - Thanh công cụ chuyển đổi vai trò nhanh (Demo Role Switcher)
 */
(function () {
    const rolesConfig = [
        { key: "explorer", label: "🧭 Người khám phá", roleName: "Du khách", file: "explorer-story-discovery.html", user: { id: "user-explorer", name: "Nguyễn Văn Du Khách", role: "explorer", avatar: "12" } },
        { key: "creator", label: "🏺 Nghệ nhân", roleName: "Nghệ nhân", file: "creator-story-management.html", user: { id: "creator-1", name: "Cô Lan Dệt Lụa", role: "creator", avatar: "2" } },
        { key: "admin", label: "⚙️ Quản trị viên", roleName: "Quản trị viên", file: "admin-culture-dashboard.html", user: { id: "user-admin", name: "Admin Tổng Quản", role: "admin", avatar: "1" } }
    ];

    function createToolbar() {
        if (document.getElementById("ct-role-switcher")) return;
        const container = document.createElement("div");
        container.id = "ct-role-switcher";
        container.className = "fixed bottom-4 left-4 z-[9990] font-sans";

        const toggleBtn = document.createElement("button");
        toggleBtn.className = "w-12 h-12 bg-brand-700 text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer";
        toggleBtn.innerHTML = "<span class=\"text-xl\">🛡️</span>";

        const menu = document.createElement("div");
        menu.className = "hidden bg-white border border-gray-200 rounded-2xl shadow-xl p-3 mb-3 w-64 space-y-1";
        menu.innerHTML = "<div class=\"text-xs font-bold text-gray-400 uppercase px-2 pb-1\">Chuyển vai trò</div>";

        rolesConfig.forEach(rc => {
            const btn = document.createElement("button");
            btn.className = "w-full text-left px-3 py-2 rounded-xl hover:bg-brand-50 hover:text-brand-700 text-gray-700 font-semibold text-sm flex justify-between items-center cursor-pointer";
            btn.innerHTML = "<span>" + rc.label + "</span>";
            btn.onclick = () => {
                sessionStorage.setItem("ct_current_role", rc.key);
                sessionStorage.setItem("ct_current_user", JSON.stringify(rc.user));
                var inPages = window.location.pathname.replace(/\\/g, "/").indexOf("/pages/") !== -1;
                window.location.href = inPages ? rc.file : ("pages/" + rc.file);
            };
            menu.appendChild(btn);
        });

        toggleBtn.onclick = (e) => { e.stopPropagation(); menu.classList.toggle("hidden"); };
        document.addEventListener("click", (e) => { if (!container.contains(e.target)) menu.classList.add("hidden"); });

        container.appendChild(menu);
        container.appendChild(toggleBtn);
        document.body.appendChild(container);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", createToolbar);
    } else {
        createToolbar();
    }
})();
