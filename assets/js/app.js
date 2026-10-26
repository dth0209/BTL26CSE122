        const creators = {
            'creator1': { 
                id: 'creator1', name: 'Cô Lan Dệt Lụa', role: 'Nghệ nhân Lụa Vạn Phúc', avatar: '47', cover: '1018',
                bio: 'Gắn bó với khung cửi hơn 40 năm tại Vạn Phúc, gìn giữ kỹ thuật dệt lụa vân truyền thống.' 
            }
        };

        const profiles = {
            explorer: { id: 'exp1', name: 'Hải Đăng', role: 'Du khách', avatar: '11' },
            creator1: creators['creator1'],
            admin: { id: 'adm1', name: 'Trần Duy', role: 'Admin', avatar: '32' }
        };

        // Mảng bài viết mẫu. Không tự xóa dữ liệu người dùng trong LocalStorage.
        // [CultureTrail Persistence] Load posts from localStorage if available
        let posts = [];
        try {
            const savedPosts = localStorage.getItem('ct_posts');
            if (savedPosts) {
                posts = JSON.parse(savedPosts);
            }
        } catch(e) { posts = []; }
        if (!posts || posts.length === 0) posts = [
            { id: 'CT-1001', authorId: 'creator1', status: 'approved', tag: 'Làng nghề', title: 'Đèn lồng phố Hội', image: 'https://picsum.photos/id/1018/800/600', content: 'Tự tay làm nên chiếc đèn lồng truyền thống giữa lòng phố cổ thanh bình. Kỹ thuật vót tre, dán lụa tỉ mỉ...' },
            { id: 'CT-1002', authorId: 'creator1', status: 'approved', tag: 'Thủ công', title: 'Nhuộm Chàm Tây Bắc', image: 'https://picsum.photos/id/1036/800/600', content: 'Bí quyết nhuộm vải tự nhiên của đồng bào H\'Mông tại Sapa mờ sương. Cây chàm được ngâm ủ kỹ lưỡng...' },
            { id: 'CT-1003', authorId: 'creator1', status: 'approved', tag: 'Làng nghề', title: 'Vuốt gốm Bát Tràng', image: 'https://picsum.photos/id/106/800/600', content: 'Bát Tràng không chỉ là tên một ngôi làng, mà là tên của một miền ký ức đất nung. Lớn lên bên dòng sông Hồng...' },
            { id: 'CT-1004', authorId: 'creator1', status: 'approved', tag: 'Nghệ thuật', title: 'Kiến trúc Cố đô Huế', image: 'https://picsum.photos/id/1040/800/600', content: 'Dấu ấn vàng son của triều đại phong kiến qua lăng tẩm, đền đài. Những nét chạm trổ tinh xảo...' },
            { id: 'CT-1005', authorId: 'creator1', status: 'approved', tag: 'Ẩm thực', title: 'Chợ nổi Cái Răng', image: 'https://picsum.photos/id/1043/800/600', content: 'Nhịp sống lênh đênh trên sông nước miền Tây đậm đà tình quê. Tiếng rao vẳng trên sóng nước sớm mai...' },
            { id: 'CT-1006', authorId: 'creator1', status: 'approved', tag: 'Làng nghề', title: 'Nón lá Xứ Thanh', image: 'https://picsum.photos/id/1044/800/600', content: 'Tìm hiểu nghệ thuật đan nón lá chằm tinh tế qua bàn tay nghệ nhân. Những lớp lá cọ phơi sương mỏng manh...' },
            { id: 'CT-9999', authorId: 'creator1', status: 'pending', tag: 'Làng nghề', title: 'Bí mật men rạn', image: 'https://picsum.photos/id/1074/800/600', content: 'Kỹ thuật tạo rạn độc đáo từ lửa và đất...' }
        ];

        let currentUser = null;
        let currentReviewPostId = null;

        function showToast(message, type = 'success') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            
            let colorClass = 'bg-emerald-500';
            if(type === 'error') colorClass = 'bg-red-500';
            if(type === 'warning') colorClass = 'bg-yellow-500';
            if(type === 'info') colorClass = 'bg-blue-500';

            toast.className = `toast-animate flex items-center gap-3 px-6 py-3 rounded-full text-white font-bold shadow-xl ${colorClass}`;
            toast.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>${message}</span>
            `;
            
            container.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(100%)';
                toast.style.transition = 'all 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        const sidebar = document.getElementById('app-sidebar');
        const views = document.querySelectorAll('.view-section');
        const publicHeader = document.getElementById('public-header');
        const globalFooter = document.getElementById('global-footer');
        const appMain = document.getElementById('app-main');

        const publicViews = ['view-home', 'view-login', 'view-exp-discover', 'view-exp-detail', 'view-exp-trail', 'view-cre-profile', 'view-cre-list'];
        const noFooterViews = ['view-login'];
        const noPublicHeaderViews = ['view-home', 'view-login', 'view-cre-story', 'view-cre-create', 'view-cur-review', 'view-adm-dash'];

        const menus = {
            explorer: [
                { id: 'view-exp-discover', icon: '🔍', label: 'Khám phá Địa phương' },
                { id: 'view-exp-trail', icon: '✨', label: 'Lịch trình AI' },
                { id: 'view-cre-list', icon: '🏺', label: 'Gặp gỡ Nghệ nhân' },
            ],
            creator: [
                { id: 'view-cre-profile', icon: '👤', label: 'Hồ sơ của tôi' },
                { id: 'view-cre-story', icon: '📝', label: 'Quản lý Bài viết' },
            ],
            admin: [
                { id: 'view-adm-dash', icon: '📊', label: 'Bảng điều khiển' },
            ]
        };

        function switchView(targetId) {
            views.forEach(v => v.classList.remove('active'));
            const targetView = document.getElementById(targetId);
            if(targetView) {
                targetView.classList.add('active');
                appMain.scrollTop = 0;
            }

            if(publicViews.includes(targetId)) {
                sidebar.classList.add('hidden');
                sidebar.classList.remove('md:flex');
            } else {
                sidebar.classList.remove('hidden');
                sidebar.classList.add('md:flex');
                document.querySelectorAll('#sidebar-menu button').forEach(btn => {
                    if(btn.getAttribute('data-target') === targetId) {
                        btn.classList.add('bg-brand-50', 'text-brand-800');
                    } else {
                        btn.classList.remove('bg-brand-50', 'text-brand-800');
                    }
                });
            }
            
            globalFooter.style.display = noFooterViews.includes(targetId) ? 'none' : 'block';
            if(noPublicHeaderViews.includes(targetId)) publicHeader.classList.add('hidden');
            else publicHeader.classList.remove('hidden');

            // Dynamic Hook Renders
            if(targetId === 'view-exp-discover') renderPublicPosts();
            if(targetId === 'view-cre-list') renderCreatorList();
            if(targetId === 'view-cre-story') renderCreatorManagePosts();
            if(targetId === 'view-adm-dash') renderAdminDashboard();
            if(targetId === 'view-cre-profile' && currentUser && currentUser.id.startsWith('creator')) {
                renderCreatorProfile(currentUser.id);
            }
        }

        function openAuth(type) { switchView('view-login'); toggleAuthTab(type); }

        function toggleAuthTab(tab) {
            const loginForm = document.getElementById('form-login');
            const regForm = document.getElementById('form-register');
            const tabLogin = document.getElementById('tab-login');
            const tabReg = document.getElementById('tab-register');
            
            if(tab === 'login') {
                loginForm.classList.remove('hidden'); regForm.classList.add('hidden');
                tabLogin.classList.replace('border-transparent', 'border-brand-600');
                tabLogin.classList.replace('text-gray-400', 'text-brand-700');
                tabReg.classList.replace('border-brand-600', 'border-transparent');
                tabReg.classList.replace('text-brand-700', 'text-gray-400');
                document.getElementById('auth-title').innerText = 'Mừng bạn trở lại';
            } else {
                loginForm.classList.add('hidden'); regForm.classList.remove('hidden');
                tabReg.classList.replace('border-transparent', 'border-brand-600');
                tabReg.classList.replace('text-gray-400', 'text-brand-700');
                tabLogin.classList.replace('border-brand-600', 'border-transparent');
                tabLogin.classList.replace('text-brand-700', 'text-gray-400');
                document.getElementById('auth-title').innerText = 'Tạo tài khoản mới';
            }
        }

        function handleDemoLogin(e) {
            e.preventDefault();
            document.getElementById('auth-form-container').classList.add('hidden');
            document.getElementById('role-modal').classList.remove('hidden');
            document.getElementById('role-modal').classList.add('flex');
        }

        function loginAs(roleKey) {
            currentUser = profiles[roleKey];
            const menuType = roleKey.startsWith('creator') ? 'creator' : roleKey;
            
            document.getElementById('sidebar-name').textContent = currentUser.name;
            document.getElementById('sidebar-role').textContent = currentUser.role;
            document.getElementById('sidebar-avatar').src = `https://i.pravatar.cc/150?img=${currentUser.avatar}`;

            const menuContainer = document.getElementById('sidebar-menu');
            menuContainer.innerHTML = `<h3 class="px-4 text-xs font-bold text-gray-400 uppercase mb-3 mt-4">Menu Hệ thống</h3>`;
            
            menus[menuType].forEach(item => {
                const btn = document.createElement('button');
                btn.className = 'w-full flex items-center gap-4 px-4 py-3 text-sm font-bold rounded-2xl text-gray-600 hover:bg-brand-50 hover:text-brand-700 text-left transition-colors';
                btn.setAttribute('data-target', item.id);
                btn.innerHTML = `<span class="text-xl">${item.icon}</span> ${item.label}`;
                btn.onclick = () => switchView(item.id);
                menuContainer.appendChild(btn);
            });

            document.getElementById('public-auth-buttons').innerHTML = `
                <div class="flex items-center gap-3">
                    <img src="https://i.pravatar.cc/150?img=${currentUser.avatar}" class="w-8 h-8 rounded-full border border-gray-200">
                    <button onclick="logout()" class="text-sm font-bold text-gray-500 hover:text-red-500 transition-colors">Đăng xuất</button>
                </div>
            `;

            document.getElementById('auth-form-container').classList.remove('hidden');
            document.getElementById('role-modal').classList.add('hidden');
            document.getElementById('role-modal').classList.remove('flex');
            
            showToast(`Đăng nhập thành công: ${currentUser.name}`);
            switchView(menus[menuType][0].id);
        }

        function logout() {
            currentUser = null;
            document.getElementById('public-auth-buttons').innerHTML = `
                <button onclick="openAuth('login')" class="text-gray-600 font-semibold hover:text-brand-600 transition-colors hidden sm:block">Đăng nhập</button>
                <button onclick="openAuth('register')" class="bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-2 rounded-full shadow-sm">Đăng ký</button>
            `;
            switchView('view-home');
            showToast('Đã đăng xuất', 'info');
        }

        function renderPublicPosts() {
            const container = document.getElementById('public-posts-container');
            container.innerHTML = '';
            const approvedPosts = posts.filter(p => p.status === 'approved');
            approvedPosts.forEach(post => {
                container.innerHTML += `
                    <article class="bg-white rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100 cursor-pointer group" onclick="openPostDetail('${post.id}')">
                        <figure class="h-56 bg-gray-200 overflow-hidden relative">
                            <img src="${post.image}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                            <span class="absolute top-4 left-4 bg-white/90 text-brand-700 px-3 py-1 rounded-full text-xs font-bold">${post.tag}</span>
                        </figure>
                        <div class="p-6">
                            <h3 class="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-600">${post.title}</h3>
                            <p class="text-gray-600 text-sm line-clamp-2">${post.content}</p>
                        </div>
                    </article>
                `;
            });
        }

        window.filterCategory = function(buttonElement) {
            const container = document.getElementById('filter-buttons');
            const buttons = container.querySelectorAll('button');
            buttons.forEach(btn => btn.className = 'px-6 py-2.5 rounded-full text-sm font-semibold bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors');
            buttonElement.className = 'active-filter px-6 py-2.5 rounded-full text-sm font-bold bg-brand-700 text-white transition-colors';
            
            const filterValue = buttonElement.innerText;
            const postContainer = document.getElementById('public-posts-container');
            postContainer.innerHTML = '';
            
            const filteredPosts = posts.filter(p => p.status === 'approved' && (filterValue === 'Tất cả' || p.tag === filterValue));
            filteredPosts.forEach(post => {
                postContainer.innerHTML += `
                    <article class="bg-white rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100 cursor-pointer group" onclick="openPostDetail('${post.id}')">
                        <figure class="h-56 bg-gray-200 overflow-hidden relative">
                            <img src="${post.image}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                            <span class="absolute top-4 left-4 bg-white/90 text-brand-700 px-3 py-1 rounded-full text-xs font-bold">${post.tag}</span>
                        </figure>
                        <div class="p-6">
                            <h3 class="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-600">${post.title}</h3>
                            <p class="text-gray-600 text-sm line-clamp-2">${post.content}</p>
                        </div>
                    </article>
                `;
            });
            if(filteredPosts.length === 0) postContainer.innerHTML = '<p class="col-span-full text-center text-gray-500 py-10">Chưa có bài viết nào.</p>';
        }

        function renderCreatorList() {
            const container = document.getElementById('creator-list-container');
            container.innerHTML = '';
            Object.values(creators).forEach(creator => {
                container.innerHTML += `
                    <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md cursor-pointer transition-shadow" onclick="openCreatorProfile('${creator.id}')">
                        <img src="https://i.pravatar.cc/150?img=${creator.avatar}" class="w-24 h-24 rounded-full border-4 border-brand-50 mb-4 shadow-sm">
                        <h3 class="text-xl font-bold text-gray-900 mb-1">${creator.name}</h3>
                        <p class="text-brand-600 text-sm font-bold mb-3">${creator.role}</p>
                        <p class="text-gray-500 text-sm line-clamp-2 mb-4">${creator.bio}</p>
                        <button class="px-6 py-2 bg-gray-50 text-brand-700 font-bold rounded-full hover:bg-brand-50 transition-colors w-full border border-gray-200">Xem hồ sơ</button>
                    </div>
                `;
            });
        }

        window.openCreatorProfile = function(creatorId) {
            renderCreatorProfile(creatorId);
            switchView('view-cre-profile');
        }

        function renderCreatorProfile(creatorId) {
            const creator = creators[creatorId];
            if(!creator) return;
            const container = document.getElementById('creator-profile-container');
            const creatorPosts = posts.filter(p => p.authorId === creatorId && p.status === 'approved');
            
            let postsHTML = creatorPosts.map(post => `
                <article class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow group" onclick="openPostDetail('${post.id}')">
                    <img src="${post.image}" class="w-full h-56 object-cover bg-gray-200 group-hover:scale-105 transition-transform">
                    <div class="p-6">
                        <h3 class="font-bold text-xl mb-2 group-hover:text-brand-600 transition-colors">${post.title}</h3>
                        <p class="text-sm text-gray-500 line-clamp-2">${post.content}</p>
                    </div>
                </article>
            `).join('');
            if(creatorPosts.length === 0) postsHTML = '<p class="text-gray-500">Chưa có bài viết nào được xuất bản.</p>';

            container.innerHTML = `
                <div class="w-full h-64 bg-gray-300 relative shadow-inner">
                    <img src="https://picsum.photos/id/${creator.cover}/1920/400" class="w-full h-full object-cover">
                </div>
                <div class="max-w-5xl mx-auto px-4 sm:px-6 relative -mt-16">
                    <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-10">
                        <div class="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                            <img src="https://i.pravatar.cc/150?img=${creator.avatar}" class="w-32 h-32 rounded-full border-4 border-white shadow-md bg-white">
                            <div class="flex-grow pt-2">
                                <h1 class="text-3xl font-bold text-gray-900 flex flex-col md:flex-row items-center gap-2 justify-center md:justify-start">
                                    ${creator.name} 
                                    <span class="bg-brand-50 text-brand-700 text-xs px-2 py-1 rounded-full border border-brand-200 mt-2 md:mt-0 font-bold flex items-center gap-1">
                                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Verified
                                    </span>
                                </h1>
                                <p class="text-gray-600 mt-2 max-w-xl mx-auto md:mx-0">${creator.bio}</p>
                            </div>
                            <div class="flex-shrink-0 pt-2 text-center border-t md:border-t-0 md:border-l border-gray-100 mt-4 md:mt-0 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
                                <p class="text-3xl font-bold text-gray-900">${creatorPosts.length}</p>
                                <p class="text-xs text-gray-500 uppercase font-bold">Bài viết</p>
                            </div>
                        </div>
                    </div>
                    <h3 class="text-2xl font-bold mb-6 text-gray-900">Bài viết của Nghệ nhân</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">${postsHTML}</div>
                </div>
            `;
        }

        window.openPostDetail = function(postId) {
            const post = posts.find(p => p.id === postId);
            if(!post) return;
            const author = creators[post.authorId];
            switchView('view-exp-detail');
            document.getElementById('detail-container').innerHTML = `
                <button onclick="switchView('view-exp-discover')" class="mb-6 font-bold text-gray-500 hover:text-brand-600 flex items-center gap-2 transition-colors">&larr; Trở lại danh sách</button>
                <div class="w-full h-64 md:h-96 rounded-3xl overflow-hidden relative mb-10 bg-gray-200 shadow-sm">
                    <img src="${post.image}" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div class="absolute bottom-10 left-10 text-white pr-10">
                        <span class="bg-brand-600 px-3 py-1 rounded-full text-xs font-bold mb-3 inline-block shadow-sm">${post.tag}</span>
                        <h1 class="text-3xl md:text-5xl font-bold drop-shadow-md leading-tight">${post.title}</h1>
                    </div>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-10 pb-10">
                    <div class="lg:col-span-2 space-y-6">
                        <article class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <div class="flex items-center gap-4 pb-6 mb-6 border-b border-gray-100 cursor-pointer hover:bg-brand-50 p-4 rounded-2xl transition-colors group" onclick="openCreatorProfile('${author.id}')">
                                <img src="https://i.pravatar.cc/150?img=${author.avatar}" class="w-14 h-14 rounded-full border border-gray-200">
                                <div>
                                    <p class="text-xs font-bold text-gray-500 uppercase">Nghệ nhân kể chuyện</p>
                                    <h4 class="font-bold text-lg text-gray-900 group-hover:text-brand-700">${author.name}</h4>
                                </div>
                                <span class="ml-auto text-brand-600 font-bold text-sm">Xem hồ sơ &rarr;</span>
                            </div>
                            <div class="text-lg text-gray-700 leading-relaxed space-y-4 whitespace-pre-line">${post.content}</div>
                        </article>
                    </div>
                    <div class="lg:col-span-1">
                        <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
                            <div class="bg-gradient-to-r from-brand-700 to-brand-600 p-6 rounded-2xl text-white text-center shadow-md">
                                <h4 class="font-bold mb-3 text-lg">Hứng thú với câu chuyện?</h4>
                                <p class="text-sm text-brand-100 mb-4">Sử dụng AI để đưa địa điểm này vào lịch trình chuyến đi của bạn.</p>
                                <button onclick="switchView('view-exp-trail'); document.getElementById('ai-input').value = 'Đưa tôi đến thăm ${post.title}';" class="w-full bg-white text-brand-800 font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors shadow-sm flex items-center justify-center gap-2">
                                    <svg class="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                    Tạo lịch trình AI
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderCreatorManagePosts() {
            if(!currentUser) return;
            const container = document.getElementById('creator-posts-container');
            container.innerHTML = '';
            const myPosts = posts.filter(p => p.authorId === currentUser.id);
            myPosts.forEach(post => {
                let statusHtml = post.status === 'approved' 
                    ? '<span class="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold inline-block mb-2">Đã xuất bản</span>'
                    : post.status === 'pending'
                    ? '<span class="bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-full text-xs font-bold inline-block mb-2">Chờ duyệt</span>'
                    : '<span class="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-bold inline-block mb-2">Bị từ chối</span>';

                container.innerHTML += `
                    <div class="post-item bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:shadow-md transition-shadow cursor-pointer" onclick="openPostDetail('${post.id}')">
                        <img src="${post.image}" class="w-full sm:w-28 h-40 sm:h-28 object-cover rounded-2xl bg-gray-200">
                        <div class="flex-grow">
                            <h3 class="font-bold text-xl text-gray-900 mb-1 hover:text-brand-700">${post.title}</h3>
                            ${statusHtml}
                        </div>
                        <div class="flex gap-2 w-full sm:w-auto justify-end border-t sm:border-none pt-4 sm:pt-0 border-gray-100 mt-2 sm:mt-0" onclick="event.stopPropagation()">
                            <button onclick="deletePost('${post.id}', this)" class="p-2.5 bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors" title="Xóa bài"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                        </div>
                    </div>
                `;
            });
            if(myPosts.length === 0) container.innerHTML = '<p class="text-gray-500 text-center py-10">Bạn chưa tạo bài viết nào.</p>';
        }

        window.deletePost = function(postId, btnElement) {
            posts = posts.filter(p => p.id !== postId);
            const postItem = btnElement.closest('.post-item');
            if(postItem) {
                postItem.style.opacity = '0';
                setTimeout(() => postItem.remove(), 300);
                showToast('Đã xóa bài viết thành công');
            }
        }

        window.submitNewPost = function(e) {
            e.preventDefault();
            const newPost = {
                id: 'CT-' + Math.floor(Math.random() * 9000 + 1000),
                authorId: currentUser.id, status: 'pending',
                tag: document.getElementById('post-tag').value,
                title: document.getElementById('post-title').value,
                image: document.getElementById('post-image').value,
                content: document.getElementById('post-content').value,
            };
            posts.unshift(newPost);
            showToast('Bài viết đã được gửi để kiểm duyệt!');
            document.getElementById('form-create-post').reset();
            switchView('view-cre-story');
        }

        function renderAdminDashboard() {
            const pending = posts.filter(p => p.status === 'pending');
            const approved = posts.filter(p => p.status === 'approved');
            document.getElementById('stat-pending').innerText = pending.length;
            document.getElementById('stat-approved').innerText = approved.length;

            const queueContainer = document.getElementById('admin-queue-container');
            queueContainer.innerHTML = '';
            pending.forEach(post => {
                const author = creators[post.authorId];
                queueContainer.innerHTML += `
                    <div onclick="openReviewMode('${post.id}')" class="flex flex-col sm:flex-row justify-between sm:items-center p-4 hover:bg-gray-50 rounded-2xl transition-colors border border-gray-100 mb-3 cursor-pointer group">
                        <div class="flex gap-4 items-center mb-2 sm:mb-0">
                            <img src="${post.image}" class="w-16 h-12 object-cover rounded-lg border border-gray-200">
                            <div>
                                <p class="text-base font-bold text-gray-900 group-hover:text-brand-600">${post.title}</p>
                                <p class="text-sm text-gray-500">Tác giả: ${author.name}</p>
                            </div>
                        </div>
                        <span class="text-sm font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200 whitespace-nowrap">Chờ duyệt</span>
                    </div>
                `;
            });
            if(pending.length === 0) queueContainer.innerHTML = '<p class="text-gray-500 text-center py-4">Không có bài viết nào cần duyệt.</p>';
        }

                window.openReviewMode = function(postId) {
            currentReviewPostId = postId;
            let post = posts.find(p => p.id === postId);
            if (!post) {
                const allStories = getStore('stories') || [];
                post = allStories.find(p => p.id === postId);
            }
            if(!post) return;
            switchView('view-cur-review');
            const reviewContainer = document.getElementById('review-container');
            if (!reviewContainer) return;

            reviewContainer.innerHTML = `
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <span class="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">Kiểm duyệt Nội dung Chuyên sâu</span>
                        <h2 class="text-3xl font-bold text-gray-900 mt-2">Duyệt bài di sản: #${post.id}</h2>
                    </div>
                    <button onclick="switchView('view-adm-dash')" class="font-bold text-gray-500 hover:text-brand-600 flex items-center gap-1.5 transition-colors text-sm">
                        &larr; Quay lại danh sách
                    </button>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10">
                    <!-- Cột trái: Chi tiết bài viết -->
                    <div class="lg:col-span-7 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                        <div class="flex items-center justify-between">
                            <span class="bg-yellow-50 text-yellow-700 px-4 py-1.5 rounded-full text-xs font-bold border border-yellow-200 inline-block">
                                Trạng thái: ${post.status === 'approved' ? 'Đã duyệt' : (post.status === 'needs_revision' ? 'Cần bổ sung' : 'Chờ duyệt')}
                            </span>
                            <span class="text-xs text-gray-400 font-semibold">Chủ đề: ${post.tag || 'Làng nghề'}</span>
                        </div>
                        <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 leading-snug">${post.title}</h1>
                        <img src="${post.image}" alt="${post.title}" class="w-full h-80 object-cover rounded-2xl bg-gray-200 shadow-sm border border-gray-100">
                        <div class="text-base text-gray-700 leading-relaxed whitespace-pre-line border-t border-gray-100 pt-6">
                            ${post.content}
                        </div>
                    </div>

                    <!-- Cột phải: Bộ trợ lý AI-2 Thẩm định & Quyết định duyệt -->
                    <div class="lg:col-span-5 space-y-6">
                        <!-- Card Quyết định nhanh -->
                        <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h3 class="font-bold text-gray-900 mb-3 px-1 text-lg">Quyết định Ban Kiểm duyệt</h3>
                            <div class="space-y-3">
                                <button onclick="approvePost()" class="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-sm transition-all text-base flex items-center justify-center gap-2">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                    Phê duyệt Xuất bản
                                </button>
                                <button onclick="requestPostRevision()" class="w-full py-3 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 font-bold rounded-2xl transition-colors text-sm flex items-center justify-center gap-2">
                                    <span>⚠️</span> Yêu cầu nghệ nhân bổ sung (Needs Revision)
                                </button>
                                <button onclick="rejectPost()" class="w-full py-3 bg-white border border-red-200 text-red-600 font-bold rounded-2xl hover:bg-red-50 transition-colors text-sm flex items-center justify-center gap-2">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    Từ chối & Xóa bài
                                </button>
                            </div>
                        </div>

                        <!-- Card AI-2: Trợ lý Thẩm định Di sản & Story Highlights -->
                        <div class="bg-white p-6 rounded-3xl shadow-sm border border-brand-200 relative overflow-hidden">
                            <div class="flex items-center gap-2 mb-3">
                                <span class="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">✨</span>
                                <div>
                                    <h3 class="font-bold text-gray-900 text-base">Trợ lý AI Thẩm định Di sản (AI-2)</h3>
                                    <p class="text-xs text-gray-500">Chuẩn 6 bước AI UX theo Barem CSE122</p>
                                </div>
                            </div>

                            <!-- Bước 1: Input & Test Chips -->
                            <div class="mb-4">
                                <p class="text-xs font-bold text-gray-700 mb-2">Chọn kịch bản kiểm thử AI:</p>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <button type="button" onclick="runAiStoryReview('${post.id}', false)" class="px-3 py-2 bg-brand-50 hover:bg-brand-100 border border-brand-300 text-brand-800 rounded-xl text-xs font-bold text-left transition-colors flex items-center gap-1.5">
                                        <span>⚡</span> Thẩm định chuẩn (95đ)
                                    </button>
                                    <button type="button" onclick="runAiStoryReview('${post.id}', true)" class="px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 rounded-xl text-xs font-bold text-left transition-colors flex items-center gap-1.5">
                                        <span>⚠️</span> Test Bất định (42đ)
                                    </button>
                                </div>
                            </div>

                            <!-- Bước 2: Processing Container -->
                            <div id="curator-ai-loading" class="hidden my-4 p-4 bg-slate-50 border border-gray-100 rounded-2xl space-y-3">
                                <div class="flex items-center gap-2 text-xs font-bold text-brand-700">
                                    <svg class="animate-spin h-4 w-4 text-brand-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    AI đang thẩm định 3 tiêu chí di sản...
                                </div>
                                <div class="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                    <div class="bg-brand-600 h-full w-2/3 animate-pulse"></div>
                                </div>
                                <p class="text-[11px] text-gray-500">• Đối chiếu từ điển di sản TLU & tính xác thực nghệ nhân...</p>
                            </div>

                            <!-- Bước 3 + 4 + 5: Output, Explainability, User Control -->
                            <div id="curator-ai-display">
                                <div class="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-center text-xs text-gray-500">
                                    Nhấn một trong 2 nút phía trên để kích hoạt AI Thẩm định nội dung và trích xuất điểm nhấn văn hóa.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        };

        window.requestPostRevision = function() {
            if(!currentReviewPostId) return;
            const post = posts.find(p => p.id === currentReviewPostId);
            if(post) {
                post.status = 'needs_revision';
                savePosts();
            }
            showToast('Đã gửi yêu cầu nghệ nhân bổ sung hồ sơ chứng thực!', 'warning');
            switchView('view-adm-dash');
        };

        window.approvePost = function() {
            if(!currentReviewPostId) return;
            const post = posts.find(p => p.id === currentReviewPostId);
            if(post) {
                post.status = 'approved';
                savePosts();
            }
            showToast('Đã phê duyệt và xuất bản bài viết thành công!', 'success');
            switchView('view-adm-dash');
        };

        window.rejectPost = function() {
            if(!currentReviewPostId) return;
            posts = posts.filter(p => p.id !== currentReviewPostId);
            savePosts();
            showToast('Đã từ chối và xóa bài viết khỏi hệ thống', 'error');
            switchView('view-adm-dash');
        };

        function savePosts() {
            try {
                if (window.ApiService) window.ApiService.save('posts', posts);
                else localStorage.setItem('ct_posts', JSON.stringify(posts));
            } catch(e) {}
        }

        const chatHeader = document.getElementById('chat-header');
        const chatWidget = document.getElementById('chat-widget-container');
        let isDragging = false;
        let startX = 0, startY = 0, currentX = 0, currentY = 0;

        if (chatHeader && chatWidget) {
            chatHeader.addEventListener('mousedown', (e) => {
                isDragging = true;
                startX = e.clientX - currentX; startY = e.clientY - currentY;
                chatWidget.style.transition = 'none'; 
                document.addEventListener('mousemove', dragMove); document.addEventListener('mouseup', dragEnd);
            });
            function dragMove(e) {
                if (!isDragging) return; e.preventDefault(); 
                currentX = e.clientX - startX; currentY = e.clientY - startY;
                chatWidget.style.transform = `translate(${currentX}px, ${currentY}px)`;
            }
            function dragEnd() {
                isDragging = false; chatWidget.style.transition = 'transform 0.3s ease'; 
                document.removeEventListener('mousemove', dragMove); document.removeEventListener('mouseup', dragEnd);
            }
        }

        window.toggleChat = function(forceState) {
            const w = document.getElementById('chat-window');
            const container = document.getElementById('chat-widget-container');
            const toggleBtn = document.getElementById('chat-toggle-btn') || (container ? container.querySelector('button[onclick*="toggleChat"]') : null);
            if (!w) return;

            const shouldOpen = (typeof forceState === 'boolean') ? forceState : w.classList.contains('hidden');

            if (shouldOpen) {
                // Mở ra
                w.classList.remove('hidden');
                w.classList.add('flex');
                if (container && window.innerWidth < 768) {
                    container.style.transform = 'translate(0px, 0px)';
                }
                // Nếu vai trò demo menu đang mở trên màn hình nhỏ, đóng lại
                const roleMenu = document.getElementById('ct-role-switcher-menu');
                if (roleMenu && !roleMenu.classList.contains('hidden')) {
                    roleMenu.classList.add('hidden');
                    const roleBtn = document.getElementById('ct-role-switcher-btn');
                    if (roleBtn) roleBtn.setAttribute('aria-expanded', 'false');
                }
                if (toggleBtn) {
                    toggleBtn.setAttribute('aria-expanded', 'true');
                    toggleBtn.setAttribute('title', 'Thu gọn Trợ lý Văn hóa AI');
                    toggleBtn.innerHTML = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"></path></svg>';
                }
                const box = document.getElementById('chat-messages');
                if (box) box.scrollTop = box.scrollHeight;
                const input = document.getElementById('chat-input');
                if (input) setTimeout(() => input.focus(), 120);
            } else {
                // Thu gọn
                w.classList.add('hidden');
                w.classList.remove('flex');
                if (toggleBtn) {
                    toggleBtn.setAttribute('aria-expanded', 'false');
                    toggleBtn.setAttribute('title', 'Mở Trợ lý Văn hóa AI');
                    toggleBtn.innerHTML = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>';
                }
            }
        };

        // Phím Escape để thu gọn chatbox
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const w = document.getElementById('chat-window');
                if (w && !w.classList.contains('hidden')) {
                    window.toggleChat(false);
                }
            }
        });

        // Từ điển tri thức văn hóa nội bộ CultureTrail (Offline & Graceful Fallback)
        function getSmartCultureAiReplyDemo(msg) {
            const q = (msg || '').toLowerCase();
            if (q.includes('bát tràng') || q.includes('gốm')) {
                return `🏺 <b>Làng gốm Bát Tràng (Gia Lâm, Hà Nội):</b><br>
• <b>Lịch sử:</b> Hơn 700 năm tinh hoa làm gốm thủ công ven sông Hồng.<br>
• <b>Trải nghiệm nổi bật:</b> Tự tay vuốt gốm trên bàn xoay và vẽ họa tiết nung men (khoảng 50.000đ - 100.000đ/sản phẩm).<br>
• <b>Điểm tham quan:</b> Bảo tàng Gốm Bát Tràng kiến trúc xoáy ốc bàn xoay độc đáo và xưởng của nghệ nhân Trần Đức Bình.<br>
• <b>Ẩm thực:</b> Đừng bỏ lỡ món canh măng mực Bát Tràng trứ danh!`;
            }
            if (q.includes('hội an') || q.includes('đèn lồng')) {
                return `🏮 <b>Phố cổ Hội An (Quảng Nam):</b><br>
• <b>Di sản đèn lồng:</b> Nghề truyền thống hơn 400 năm. Khung tre được ngâm nước muối 10 ngày chống mối mọt, bọc lụa tơ tằm mềm mại.<br>
• <b>Thời điểm đẹp nhất:</b> Từ 17:30 khi phố cổ lên đèn và bắt đầu hoạt động thả hoa đăng lung linh trên dòng sông Hoài.<br>
• <b>Gợi ý:</b> Bạn có thể tham gia workshop làm đèn lồng và may đo áo dài lấy ngay trong ngày!`;
            }
            if (q.includes('vạn phúc') || q.includes('lụa')) {
                return `🧵 <b>Làng lụa Vạn Phúc (Hà Đông, Hà Nội):</b><br>
• <b>Lịch sử:</b> Đệ nhất làng lụa Việt Nam hơn 1.000 năm tuổi.<br>
• <b>Kỹ nghệ trứ danh:</b> Kỹ thuật dệt lụa vân (hoa văn biến đổi theo góc nhìn), lụa mềm mại đông ấm hè mát.<br>
• <b>Điểm đến:</b> Con đường ô sắc màu, xưởng dệt thủ công và đền thờ bà tổ nghề A Lã Đê Nương.`;
            }
            if (q.includes('đông hồ') || q.includes('tranh')) {
                return `🎨 <b>Làng tranh dân gian Đông Hồ (Thuận Thành, Bắc Ninh):</b><br>
• <b>Kỹ thuật:</b> Tranh khắc gỗ in trên nền giấy điệp óng ánh làm từ vỏ sò điệp nghiền mịn.<br>
• <b>Màu tự nhiên:</b> Màu đen từ than lá tre, vàng từ hoa hòe, đỏ từ sỏi son, xanh từ gỉ đồng hoặc lá tràm.<br>
• <b>Bức tranh tiêu biểu:</b> Vinh hoa, Phú quý, Đám cưới chuột, Hứng dừa.`;
            }
            if (q.includes('sa pa') || q.includes('thổ cẩm') || q.includes('chàm') || q.includes('cát cát')) {
                return `🏔️ <b>Nghề Dệt Thổ Cẩm & Nhuộm Chàm (Sa Pa, Lào Cai):</b><br>
• <b>Đặc sắc:</b> Kỹ thuật vẽ sáp ong và ngâm ủ lá chàm tự nhiên qua nhiều lần nước tro bếp của đồng bào H'Mông, Dao Đỏ.<br>
• <b>Điểm đến:</b> Bản Cát Cát, Tả Phìn, Tả Van.<br>
• <b>Sản phẩm:</b> Khăn choàng, trang phục thổ cẩm hoa văn hình học độc bản lưu giữ bản sắc vùng cao.`;
            }
            if (q.includes('vé') || q.includes('giờ') || q.includes('chi phí') || q.includes('giá')) {
                return `🎫 <b>Thông tin vé tham quan & Giờ mở cửa:</b><br>
• <b>Làng gốm Bát Tràng:</b> Vào làng tự do; Bảo tàng Gốm: 50.000 VNĐ/người (08:00 - 18:00).<br>
• <b>Phố cổ Hội An:</b> 80.000 VNĐ (vé di tích), mở cửa cả ngày.<br>
• <b>Làng lụa Vạn Phúc:</b> Vào cửa tự do, xưởng dệt mở 07:30 - 19:00.<br>
• <b>Bản Cát Cát (Sa Pa):</b> Vé tham quan 150.000 VNĐ/người (07:00 - 18:30).`;
            }
            if (q.includes('lịch trình') || q.includes('tour') || q.includes('trail')) {
                return `🗺️ <b>Gợi ý Lập lịch trình Văn hóa:</b><br>
Bạn có thể mở mục <b>'AI Lịch trình'</b> trên thanh điều hướng để hệ thống CultureTrail tự động thiết kế chuyến đi 1-2 ngày tối ưu bán kính di chuyển, đề xuất nghệ nhân hướng dẫn và tính toán chi phí chi tiết!`;
            }
            return `✨ <b>Trợ lý Văn hóa AI CultureTrail:</b><br>
Chào bạn! Tôi có thể tư vấn chuyên sâu về các làng nghề truyền thống Việt Nam (Bát Tràng, Hội An, Vạn Phúc, Đông Hồ, Sa Pa), gợi ý lịch trình văn hóa 1-2 ngày, chia sẻ bí quyết nghệ nhân và thông tin giờ mở cửa.<br>
Bạn đang muốn tìm hiểu về địa danh hay hoạt động trải nghiệm nào?`;
        }

        window.sendChatMessageLegacyDemo = async function() {
            const input = document.getElementById('chat-input');
            if (!input) return;
            const msg = input.value.trim();
            if (!msg) return;
            const box = document.getElementById('chat-messages');
            if (!box) return;

            // 1. Hiển thị tin nhắn người dùng (chống XSS)
            const userBubble = document.createElement('div');
            userBubble.className = 'bg-brand-600 text-white p-3 rounded-2xl rounded-tr-none self-end max-w-[85%] ml-auto shadow-sm text-sm break-words';
            userBubble.textContent = msg;
            box.appendChild(userBubble);
            input.value = '';
            box.scrollTop = box.scrollHeight;

            // 2. Trạng thái AI đang xử lý
            const loadingId = 'chat-loading-' + Date.now();
            const loadingBubble = document.createElement('div');
            loadingBubble.id = loadingId;
            loadingBubble.className = 'flex gap-2 items-start';
            loadingBubble.innerHTML = `
                <div class="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 flex-shrink-0 border border-brand-200">✨</div>
                <div class="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-gray-500 border border-gray-100 flex items-center gap-2 text-sm">
                    <svg class="animate-spin h-4 w-4 text-brand-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Đang phân tích văn hóa...
                </div>`;
            box.appendChild(loadingBubble);
            box.scrollTop = box.scrollHeight;

            // 3. Xử lý phản hồi (Ưu tiên Client Code an toàn trong sessionStorage, tự động fallback tri thức thông minh)
            setTimeout(async () => {
                let replyHtml = '';
                // Chỉ còn là kịch bản Demo/Test cũ, không kết nối API và không
                // được dùng bởi luồng Gemini live được định nghĩa cuối tệp.
                replyHtml = `<b>Chế độ Demo/Test (không phải Gemini):</b><br>${getSmartCultureAiReplyDemo(msg)}`;

                const loadEl = document.getElementById(loadingId);
                if (loadEl) {
                    loadEl.outerHTML = `
                        <div class="flex gap-2 items-start animate-fade-in">
                            <div class="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 flex-shrink-0 border border-brand-200">✨</div>
                            <div class="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-gray-700 border border-gray-100 max-w-[85%] text-sm leading-relaxed">${replyHtml}</div>
                        </div>`;
                }
                box.scrollTop = box.scrollHeight;
            }, 500);
        };

        // Giao tiếp thống nhất cho nút tạo AI trên trang Explorer My Trail
        window.runGeminiAiGenerator = function() {
            const input = document.getElementById('ai-input');
            const val = input ? input.value : '';
            if (typeof window.runAiTrailGenerator === 'function') {
                window.runAiTrailGenerator(val);
            }
        };


        document.addEventListener("DOMContentLoaded", () => switchView('view-home'));
        // Gemini key được cấu hình duy nhất trong gemini-config.local.js; giao diện
        // không yêu cầu và không lưu key trong sessionStorage.

        /* ==========================================================================
           [V2] MỞ RỘNG: THÊM NGHỆ NHÂN + QUY TRÌNH DUYỆT BÀI + KHU QUẢN TRỊ ADMIN
           --------------------------------------------------------------------------
           Toàn bộ khối bên dưới là CODE MỚI, được THÊM VÀO CUỐI file. Không một dòng
           code gốc nào bị sửa hay bị xoá. Những hàm gốc cần nâng cấp sẽ được gán đè
           theo dạng  tenHam = function () {...}  ngay trong khối này (binding của
           function declaration ở global scope nên gán đè có hiệu lực với mọi lời gọi).
           ========================================================================== */

        /* ---------- A. BỔ SUNG NGHỆ NHÂN MỚI ---------- */
        Object.assign(creators['creator1'], {
            craft: 'Dệt lụa', village: 'Vạn Phúc, Hà Đông, Hà Nội', experience: 42,
            phone: '0912 345 678', email: 'lan.lua@culturetrail.vn',
            joinedAt: '2021-03-14', verified: true, active: true
        });

        Object.assign(creators, {
            'creator2': {
                id: 'creator2', name: 'Chú Hùng Gốm Sứ', role: 'Nghệ nhân Gốm Bát Tràng', avatar: '59', cover: '1060',
                bio: 'Ba đời làm gốm bên sông Hồng, chuyên men lam cổ và kỹ thuật vuốt tay trên bàn xoay gỗ.',
                craft: 'Gốm sứ', village: 'Bát Tràng, Gia Lâm, Hà Nội', experience: 35,
                phone: '0903 222 111', email: 'hung.gom@culturetrail.vn',
                joinedAt: '2021-07-02', verified: true, active: true
            },
            'creator3': {
                id: 'creator3', name: 'Cô Mai Mây Tre', role: 'Nghệ nhân Mây tre đan Phú Vinh', avatar: '45', cover: '1080',
                bio: 'Đưa sản phẩm mây tre đan Phú Vinh ra thị trường quốc tế, dạy nghề miễn phí cho thanh niên trong làng.',
                craft: 'Mây tre đan', village: 'Phú Vinh, Phú Nghĩa, Hà Nội', experience: 28,
                phone: '0915 777 888', email: 'mai.maytre@culturetrail.vn',
                joinedAt: '2022-01-19', verified: true, active: true
            },
            'creator4': {
                id: 'creator4', name: 'Bác Tám Đờn Ca', role: 'Nghệ nhân Đờn ca tài tử', avatar: '60', cover: '1056',
                bio: 'Nghệ nhân ưu tú, hơn 50 năm giữ lửa đờn ca tài tử Nam Bộ và truyền nghề đàn kìm cho lớp trẻ.',
                craft: 'Âm nhạc dân gian', village: 'TP. Bạc Liêu', experience: 52,
                phone: '0908 555 444', email: 'tam.donca@culturetrail.vn',
                joinedAt: '2022-05-30', verified: true, active: true
            },
            'creator5': {
                id: 'creator5', name: 'Chị Hoa Tranh Dân Gian', role: 'Nghệ nhân Tranh Đông Hồ', avatar: '44', cover: '1074',
                bio: 'In tranh Đông Hồ từ ván gỗ thị trăm tuổi, tự tay làm giấy dó và quét màu điệp óng ánh.',
                craft: 'Tranh dân gian', village: 'Đông Hồ, Thuận Thành, Bắc Ninh', experience: 21,
                phone: '0977 333 222', email: 'hoa.tranh@culturetrail.vn',
                joinedAt: '2023-02-11', verified: false, active: true
            },
            'creator6': {
                id: 'creator6', name: 'Anh Khang Bếp Huế', role: 'Nghệ nhân Ẩm thực cung đình', avatar: '53', cover: '1082',
                bio: 'Đầu bếp cung đình Huế đời thứ tư, phục dựng các món ngự thiện và bánh trái dân gian xứ Huế.',
                craft: 'Ẩm thực', village: 'Kim Long, TP. Huế', experience: 19,
                phone: '0934 666 999', email: 'khang.bephue@culturetrail.vn',
                joinedAt: '2023-09-08', verified: true, active: true
            }
        });

        /* Mỗi nghệ nhân đều có tài khoản demo để đăng nhập thử */
        Object.assign(profiles, {
            creator2: creators['creator2'],
            creator3: creators['creator3'],
            creator4: creators['creator4'],
            creator5: creators['creator5'],
            creator6: creators['creator6']
        });

        /* ---------- B. BỔ SUNG BÀI VIẾT CỦA CÁC NGHỆ NHÂN MỚI ---------- */
        const ctPostDates = {
            'CT-1001': '2026-01-12', 'CT-1002': '2026-01-20', 'CT-1003': '2026-02-02',
            'CT-1004': '2026-02-08', 'CT-1005': '2026-02-15', 'CT-1006': '2026-02-22',
            'CT-9999': '2026-03-02'
        };
        posts.forEach(p => { if (!p.createdAt) p.createdAt = ctPostDates[p.id] || '2026-01-05'; });

        /* Bài "Vuốt gốm Bát Tràng" hợp với nghệ nhân gốm hơn */
        const ctPost1003 = posts.find(p => p.id === 'CT-1003');
        if (ctPost1003) ctPost1003.authorId = 'creator2';

        posts.push(
            { id: 'CT-1007', authorId: 'creator2', status: 'approved', tag: 'Làng nghề', title: 'Men lam hoa nâu – hồn đất Bát Tràng', image: 'https://picsum.photos/id/1050/800/600', content: 'Màu men lam được pha từ tro trấu và đá trường thạch, nung ở 1.300 độ suốt 36 giờ. Mỗi mẻ gốm ra lò đều mang một sắc độ riêng, không lần nào giống lần nào...', createdAt: '2026-02-25' },
            { id: 'CT-1008', authorId: 'creator3', status: 'approved', tag: 'Thủ công', title: 'Giỏ mây Phú Vinh đi ra thế giới', image: 'https://picsum.photos/id/1084/800/600', content: 'Sợi mây được chẻ mỏng như lá lúa, phơi đủ ba nắng rồi mới đan. Một chiếc giỏ cỡ trung cần tới 1.200 mũi đan và gần hai ngày làm việc liên tục...', createdAt: '2026-02-27' },
            { id: 'CT-1009', authorId: 'creator4', status: 'approved', tag: 'Nghệ thuật', title: 'Dạ cổ hoài lang giữa đêm trăng Bạc Liêu', image: 'https://picsum.photos/id/1041/800/600', content: 'Tiếng đàn kìm ngân lên trong đêm trăng, sáu câu vọng cổ kể chuyện người chinh phu. Đờn ca tài tử không diễn trên sân khấu, mà sống trong hơi thở xóm làng...', createdAt: '2026-03-03' },
            { id: 'CT-1010', authorId: 'creator5', status: 'approved', tag: 'Nghệ thuật', title: 'Tranh Đông Hồ in từ ván gỗ thị trăm tuổi', image: 'https://picsum.photos/id/1080/800/600', content: 'Giấy dó quét màu điệp óng ánh, ván khắc gỗ thị, màu in lấy từ hoa hòe, lá chàm, quả gấc. Bức "Đám cưới chuột" đã đi qua hơn năm thế kỷ như thế...', createdAt: '2026-03-05' },
            { id: 'CT-1011', authorId: 'creator6', status: 'approved', tag: 'Ẩm thực', title: 'Bún bò Huế – bí mật của nồi nước dùng', image: 'https://picsum.photos/id/1082/800/600', content: 'Ninh xương ống suốt sáu tiếng, thêm mắm ruốc Huế khuấy tan đúng độ, điểm màu điều và sả đập dập. Bát bún chuẩn vị cung đình phải trong mà đậm, cay mà thanh...', createdAt: '2026-03-06' },
            { id: 'CT-1012', authorId: 'creator2', status: 'pending', tag: 'Di tích', title: 'Lò nung cổ 500 tuổi còn đỏ lửa', image: 'https://picsum.photos/id/1053/800/600', content: 'Chiếc lò bầu cổ nhất Bát Tràng vẫn được giữ nguyên vẹn. Tôi muốn kể lại cách cha ông xếp gốm vào lò và canh lửa bằng kinh nghiệm dân gian...', createdAt: '2026-03-08' },
            { id: 'CT-1013', authorId: 'creator3', status: 'pending', tag: 'Lễ hội', title: 'Hội làng Phú Vinh mùa tháng Giêng', image: 'https://picsum.photos/id/1062/800/600', content: 'Mỗi dịp tháng Giêng, làng nghề lại mở hội tri ân tổ nghề. Phần rước kiệu và thi đan nhanh thu hút hàng nghìn du khách thập phương...', createdAt: '2026-03-09' },
            { id: 'CT-1014', authorId: 'creator5', status: 'pending', tag: 'Thủ công', title: 'Tự tay làm giấy dó cùng nghệ nhân', image: 'https://picsum.photos/id/1074/800/600', content: 'Hướng dẫn trải nghiệm trọn một ngày trong xưởng: seo giấy, bóc phơi, quét điệp và in tranh từ ván khắc cổ...', createdAt: '2026-03-10' },
            { id: 'CT-1015', authorId: 'creator6', status: 'pending', tag: 'Ẩm thực', title: 'Mâm ngự thiện mười hai món của vua triều Nguyễn', image: 'https://picsum.photos/id/1060/800/600', content: 'Phục dựng mâm cơm cung đình với nem công chả phượng, bát trân và các loại bánh trái tạo hình tinh xảo...', createdAt: '2026-03-11' },
            { id: 'CT-1016', authorId: 'creator4', status: 'rejected', tag: 'Nghệ thuật', title: 'Quảng bá lớp học đàn miễn phí', image: 'https://picsum.photos/id/1025/800/600', content: 'Lớp học mở cửa mỗi tối thứ Bảy tại nhà riêng, học viên đóng phí tự nguyện...', createdAt: '2026-03-04', rejectReason: 'Nội dung mang tính quảng cáo dịch vụ riêng, chưa phù hợp tiêu chí cộng đồng.' }
        );

        /* ---------- C. CẤU HÌNH ĐIỀU HƯỚNG CHO CÁC VIEW QUẢN TRỊ MỚI ---------- */
        noPublicHeaderViews.push('view-adm-posts', 'view-adm-creators', 'view-adm-reports');

        menus.admin = [
            { id: 'view-adm-dash', icon: '📊', label: 'Tổng quan' },
            { id: 'view-adm-posts', icon: '📝', label: 'Quản lý Bài viết' },
            { id: 'view-adm-creators', icon: '🏺', label: 'Quản lý Nghệ nhân' },
            { id: 'view-adm-reports', icon: '📈', label: 'Báo cáo & Thống kê' }
        ];

        /* Mở rộng switchView: tự render dữ liệu khi vào các khu quản trị mới */
        const _switchViewV1 = switchView;
        switchView = function (targetId) {
            _switchViewV1(targetId);
            if (targetId === 'view-adm-posts') renderAdminPosts();
            if (targetId === 'view-adm-creators') renderAdminCreators();
            if (targetId === 'view-adm-reports') renderAdminReports();
            if (targetId === 'view-cre-create') {
                /* Người dùng chủ động mở trang soạn bài -> thoát chế độ chỉnh sửa.
                   (editPost() sẽ gọi ctLoadPostIntoForm() ngay sau đó để bật lại) */
                window.ctEditingPostId = null;
                if (typeof ctSetPostFormMode === 'function') ctSetPostFormMode(false, null);
            }
        };

        /* ---------- D. HÀM TIỆN ÍCH CHUNG ---------- */
        function ctEscape(value) {
            return String(value == null ? '' : value)
                .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        }
        function ctAuthor(post) {
            return creators[post.authorId] || { id: post.authorId, name: 'Nghệ nhân không xác định', role: '—', avatar: '12' };
        }
        function ctStatusMeta(status) {
            if (status === 'approved') return { label: 'Đã xuất bản', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
            if (status === 'pending') return { label: 'Chờ duyệt', pill: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
            if (status === 'rejected') return { label: 'Bị từ chối', pill: 'bg-red-50 text-red-700 border-red-200' };
            return { label: 'Bản nháp', pill: 'bg-gray-100 text-gray-600 border-gray-200' };
        }
        function ctFormatDate(iso) {
            if (!iso) return '—';
            const parts = String(iso).split('-');
            return parts.length === 3 ? parts[2] + '/' + parts[1] + '/' + parts[0] : iso;
        }
        function ctToday() {
            const d = new Date();
            return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        }
        function ctNewPostId() {
            let max = 1000;
            posts.forEach(p => {
                const n = parseInt(String(p.id).replace('CT-', ''), 10);
                /* bỏ qua mã 9999 (bài mẫu đặc biệt của dữ liệu gốc) */
                if (!isNaN(n) && n > max && n < 9000) max = n;
            });
            return 'CT-' + (max + 1);
        }
        function ctCountBy(status) { return posts.filter(p => p.status === status).length; }

        /* Ghi trạng thái xuống sessionStorage (các hàm lưu nằm trong page-nav.js) */
        function ctPersist() {
            if (typeof ctSavePosts === 'function') ctSavePosts();
            if (typeof ctSaveCreators === 'function') ctSaveCreators();
        }

        /* ---------- E. DANH SÁCH NGHỆ NHÂN CÔNG KHAI (ẩn tài khoản bị khoá) ---------- */
        renderCreatorList = function () {
            const container = document.getElementById('creator-list-container');
            if (!container) return;
            container.innerHTML = '';
            const list = Object.values(creators).filter(c => c.active !== false);
            list.forEach(creator => {
                const published = posts.filter(p => p.authorId === creator.id && p.status === 'approved').length;
                container.innerHTML += `
                    <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md cursor-pointer transition-shadow" onclick="openCreatorProfile('${creator.id}')">
                        <div class="relative mb-4">
                            <img src="https://i.pravatar.cc/150?img=${creator.avatar}" class="w-24 h-24 rounded-full border-4 border-brand-50 shadow-sm">
                            ${creator.verified ? '<span class="absolute bottom-1 right-1 w-6 h-6 bg-brand-600 rounded-full border-2 border-white flex items-center justify-center" title="Đã xác minh"><svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg></span>' : ''}
                        </div>
                        <h3 class="text-xl font-bold text-gray-900 mb-1">${creator.name}</h3>
                        <p class="text-brand-600 text-sm font-bold mb-1">${creator.role}</p>
                        <p class="text-gray-400 text-xs mb-3">📍 ${creator.village || 'Việt Nam'} · ${published} bài viết</p>
                        <p class="text-gray-500 text-sm line-clamp-2 mb-4">${creator.bio}</p>
                        <button class="px-6 py-2 bg-gray-50 text-brand-700 font-bold rounded-full hover:bg-brand-50 transition-colors w-full border border-gray-200">Xem hồ sơ</button>
                    </div>
                `;
            });
            if (list.length === 0) container.innerHTML = '<p class="col-span-full text-center text-gray-500 py-10">Chưa có nghệ nhân nào.</p>';
        };

        /* ---------- F. HỒ SƠ NGHỆ NHÂN (bổ sung nghề, làng, liên hệ cho admin) ---------- */
        renderCreatorProfile = function (creatorId) {
            const creator = creators[creatorId];
            if (!creator) return;
            const container = document.getElementById('creator-profile-container');
            if (!container) return;
            const creatorPosts = posts.filter(p => p.authorId === creatorId && p.status === 'approved');
            const isAdmin = currentUser && currentUser.role === 'Admin';

            let postsHTML = creatorPosts.map(post => `
                <article class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow group" onclick="openPostDetail('${post.id}')">
                    <img src="${post.image}" class="w-full h-56 object-cover bg-gray-200 group-hover:scale-105 transition-transform">
                    <div class="p-6">
                        <span class="inline-block bg-brand-50 text-brand-700 text-xs font-bold px-3 py-1 rounded-full mb-3">${post.tag}</span>
                        <h3 class="font-bold text-xl mb-2 group-hover:text-brand-600 transition-colors">${post.title}</h3>
                        <p class="text-sm text-gray-500 line-clamp-2">${post.content}</p>
                    </div>
                </article>
            `).join('');
            if (creatorPosts.length === 0) postsHTML = '<p class="text-gray-500">Chưa có bài viết nào được xuất bản.</p>';

            let badgesHTML = '';
            if (creator.verified) badgesHTML += '<span class="bg-brand-50 text-brand-700 text-xs px-2 py-1 rounded-full border border-brand-200 mt-2 md:mt-0 font-bold flex items-center gap-1"><svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Verified</span>';
            else badgesHTML += '<span class="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full border border-gray-200 mt-2 md:mt-0 font-bold">Chờ xác minh</span>';
            if (creator.active === false) badgesHTML += '<span class="bg-red-50 text-red-600 text-xs px-2 py-1 rounded-full border border-red-200 mt-2 md:mt-0 font-bold">Đã khoá</span>';

            let contactHTML = '';
            if (isAdmin) {
                contactHTML = '<div class="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">'
                    + '<div><p class="text-gray-400 font-bold uppercase text-xs mb-1">Điện thoại</p><p class="font-bold text-gray-800">' + (creator.phone || '—') + '</p></div>'
                    + '<div><p class="text-gray-400 font-bold uppercase text-xs mb-1">Email</p><p class="font-bold text-gray-800 break-all">' + (creator.email || '—') + '</p></div>'
                    + '<div><p class="text-gray-400 font-bold uppercase text-xs mb-1">Tham gia</p><p class="font-bold text-gray-800">' + ctFormatDate(creator.joinedAt) + '</p></div>'
                    + '<div><p class="text-gray-400 font-bold uppercase text-xs mb-1">Mã nghệ nhân</p><p class="font-bold text-gray-800">' + creator.id + '</p></div>'
                    + '</div>';
            }

            container.innerHTML = `
                <div class="w-full h-64 bg-gray-300 relative shadow-inner">
                    <img src="https://picsum.photos/id/${creator.cover}/1920/400" class="w-full h-full object-cover">
                </div>
                <div class="max-w-5xl mx-auto px-4 sm:px-6 relative -mt-16">
                    <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
                        <div class="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                            <img src="https://i.pravatar.cc/150?img=${creator.avatar}" class="w-32 h-32 rounded-full border-4 border-white shadow-md bg-white">
                            <div class="flex-grow pt-2">
                                <h1 class="text-3xl font-bold text-gray-900 flex flex-col md:flex-row items-center gap-2 justify-center md:justify-start">
                                    ${creator.name}
                                    ${badgesHTML}
                                </h1>
                                <p class="text-brand-600 font-bold mt-2">${creator.role}</p>
                                <p class="text-gray-600 mt-2 max-w-xl mx-auto md:mx-0">${creator.bio}</p>
                                <div class="flex flex-wrap gap-2 justify-center md:justify-start mt-4">
                                    <span class="bg-gray-50 border border-gray-200 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-full">🎨 ${creator.craft || 'Thủ công truyền thống'}</span>
                                    <span class="bg-gray-50 border border-gray-200 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-full">📍 ${creator.village || 'Việt Nam'}</span>
                                    <span class="bg-gray-50 border border-gray-200 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-full">⏳ ${creator.experience || 0} năm kinh nghiệm</span>
                                </div>
                            </div>
                            <div class="flex-shrink-0 pt-2 text-center border-t md:border-t-0 md:border-l border-gray-100 mt-4 md:mt-0 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
                                <p class="text-3xl font-bold text-gray-900">${creatorPosts.length}</p>
                                <p class="text-xs text-gray-500 uppercase font-bold">Bài viết</p>
                                <button onclick="switchView('view-exp-trail')" class="mt-4 w-full bg-brand-700 hover:bg-brand-800 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">Lịch trình AI</button>
                            </div>
                        </div>
                        ${contactHTML}
                    </div>
                    <h3 class="text-2xl font-bold mb-6 text-gray-900">Bài viết của Nghệ nhân</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">${postsHTML}</div>
                </div>
            `;
        };

        /* ---------- G. NGHỆ NHÂN: DANH SÁCH BÀI VIẾT + THỐNG KÊ TRẠNG THÁI ---------- */
        renderCreatorManagePosts = function () {
            if (!currentUser) return;
            const container = document.getElementById('creator-posts-container');
            if (!container) return;
            const myPosts = posts.filter(p => p.authorId === currentUser.id);

            const setStat = (id, value) => { const el = document.getElementById(id); if (el) el.innerText = value; };
            setStat('cre-stat-total', myPosts.length);
            setStat('cre-stat-approved', myPosts.filter(p => p.status === 'approved').length);
            setStat('cre-stat-pending', myPosts.filter(p => p.status === 'pending').length);
            setStat('cre-stat-rejected', myPosts.filter(p => p.status === 'rejected' || p.status === 'draft').length);

            const rejectedCount = myPosts.filter(p => p.status === 'rejected').length;
            const notice = document.getElementById('cre-notice');
            if (notice) {
                if (rejectedCount > 0) {
                    notice.className = 'mb-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm font-semibold';
                    notice.innerHTML = '⚠️ Bạn có ' + rejectedCount + ' bài viết bị từ chối. Mở bài viết để xem lý do, sau đó bấm "Sửa &amp; gửi lại".';
                } else {
                    notice.className = 'mb-6 bg-brand-50 border border-brand-200 text-brand-800 rounded-2xl p-4 text-sm font-semibold';
                    notice.innerHTML = '✅ Bài viết mới gửi sẽ ở trạng thái <b>Chờ duyệt</b> và chỉ hiển thị công khai sau khi Quản trị viên phê duyệt.';
                }
            }

            container.innerHTML = '';
            myPosts.forEach(post => {
                const meta = ctStatusMeta(post.status);
                const reasonHTML = (post.status === 'rejected' && post.rejectReason)
                    ? '<p class="mt-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">Lý do từ chối: ' + ctEscape(post.rejectReason) + '</p>'
                    : '';
                const editBtn = (post.status === 'rejected' || post.status === 'draft')
                    ? '<button onclick="editPost(\'' + post.id + '\')" class="px-4 py-2.5 bg-brand-50 text-brand-700 hover:bg-brand-100 font-bold rounded-xl transition-colors text-sm">Sửa &amp; gửi lại</button>'
                    : '';
                container.innerHTML += `
                    <div class="post-item bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:shadow-md transition-shadow cursor-pointer" onclick="openPostDetail('${post.id}')">
                        <img src="${post.image}" class="w-full sm:w-28 h-40 sm:h-28 object-cover rounded-2xl bg-gray-200">
                        <div class="flex-grow">
                            <h3 class="font-bold text-xl text-gray-900 mb-1 hover:text-brand-700">${post.title}</h3>
                            <span class="${meta.pill} border px-3 py-1 rounded-full text-xs font-bold inline-block mb-2">${meta.label}</span>
                            <p class="text-xs text-gray-400 font-semibold">${post.id} · ${post.tag} · Gửi ngày ${ctFormatDate(post.createdAt || post.updatedAt)}</p>
                            ${reasonHTML}
                        </div>
                        <div class="flex gap-2 w-full sm:w-auto justify-end border-t sm:border-none pt-4 sm:pt-0 border-gray-100 mt-2 sm:mt-0" onclick="event.stopPropagation()">
                            ${editBtn}
                            <button onclick="deletePost('${post.id}', this)" class="p-2.5 bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors" title="Xóa bài"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                        </div>
                    </div>
                `;
            });
            if (myPosts.length === 0) container.innerHTML = '<p class="text-gray-500 text-center py-10">Bạn chưa tạo bài viết nào.</p>';
        };

        window.deletePost = function (postId, btnElement) {
            posts = posts.filter(p => p.id !== postId);
            const item = btnElement && btnElement.closest ? btnElement.closest('.post-item') : null;
            if (item) item.remove();
            ctPersist();
            showToast('Đã xoá bài viết!');
            renderCreatorManagePosts();
        };

        /* ---------- H. NGHỆ NHÂN: FORM SOẠN BÀI VIẾT (kiểm tra dữ liệu, nháp, sửa lại) ---------- */
        function ctFormError(message) {
            const box = document.getElementById('post-form-error');
            if (box) { box.innerHTML = '⚠️ ' + message; box.className = 'bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm font-bold'; }
            showToast(message, 'error');
        }
        function ctFormClearError() {
            const box = document.getElementById('post-form-error');
            if (box) { box.innerHTML = ''; box.className = 'hidden'; }
        }
        function ctReadPostForm() {
            return {
                title: (document.getElementById('post-title').value || '').trim(),
                image: (document.getElementById('post-image').value || '').trim(),
                tag: document.getElementById('post-tag').value,
                content: (document.getElementById('post-content').value || '').trim()
            };
        }
        function ctValidatePostForm(data) {
            if (data.title.length < 5) return 'Tiêu đề cần ít nhất 5 ký tự.';
            if (!/^https?:\/\//i.test(data.image)) return 'Link hình ảnh phải bắt đầu bằng http:// hoặc https://';
            if (data.content.length < 30) return 'Nội dung cần tối thiểu 30 ký tự (hiện tại: ' + data.content.length + ').';
            return null;
        }
        function ctSetPostFormMode(isEdit, postId) {
            const heading = document.querySelector('#view-cre-create h2');
            if (heading) heading.innerText = isEdit ? ('Chỉnh sửa bài viết ' + postId) : 'Soạn bài viết mới';
            const originalSubmit = document.querySelector('#form-create-post button[type="submit"]:not([id])');
            const editSubmit = document.getElementById('btn-submit-post');
            if (originalSubmit) originalSubmit.className = originalSubmit.className.replace(/\bhidden\b/g, '').trim() + (isEdit ? ' hidden' : '');
            if (editSubmit) editSubmit.className = editSubmit.className.replace(/\bhidden\b/g, '').trim() + (isEdit ? '' : ' hidden');
        }
        function ctResetPostFormUI() {
            window.ctEditingPostId = null;
            try { sessionStorage.removeItem('ct_editPostId'); } catch (err) { /* sessionStorage có thể bị chặn */ }
            ctSetPostFormMode(false, null);
            const notice = document.getElementById('edit-notice');
            if (notice) { notice.className = 'hidden'; notice.innerHTML = ''; }
            ctUpdateImagePreview();
            ctUpdateContentCounter();
            ctFormClearError();
        }

        window.submitNewPost = function (e) {
            if (e && e.preventDefault) e.preventDefault();
            if (!currentUser) { ctFormError('Vui lòng đăng nhập bằng tài khoản Nghệ nhân để gửi bài viết.'); return false; }
            if (currentUser.role === 'Du khách') { ctFormError('Tài khoản Du khách không có quyền đăng bài. Hãy đăng nhập vai Nghệ nhân.'); return false; }

            const data = ctReadPostForm();
            const error = ctValidatePostForm(data);
            if (error) { ctFormError(error); return false; }

            if (window.ctEditingPostId) {
                const post = posts.find(p => p.id === window.ctEditingPostId);
                if (post) Object.assign(post, { title: data.title, image: data.image, tag: data.tag, content: data.content, status: 'pending', rejectReason: null, updatedAt: ctToday() });
                showToast('Đã cập nhật và gửi lại bài viết để kiểm duyệt!');
            } else {
                posts.unshift({ id: ctNewPostId(), authorId: currentUser.id, status: 'pending', tag: data.tag, title: data.title, image: data.image, content: data.content, createdAt: ctToday() });
                showToast('Đã gửi bài viết. Quản trị viên sẽ kiểm duyệt trong thời gian sớm nhất!');
            }

            const form = document.getElementById('form-create-post');
            if (form) form.reset();
            ctResetPostFormUI();
            ctPersist();
            switchView('view-cre-story');
            return false;
        };

        window.saveDraftPost = function () {
            if (!currentUser) { ctFormError('Vui lòng đăng nhập bằng tài khoản Nghệ nhân.'); return false; }
            const data = ctReadPostForm();
            if (data.title.length < 3) { ctFormError('Cần nhập tiêu đề trước khi lưu bản nháp.'); return false; }
            if (window.ctEditingPostId) {
                const post = posts.find(p => p.id === window.ctEditingPostId);
                if (post) Object.assign(post, data, { status: 'draft', rejectReason: null, updatedAt: ctToday() });
            } else {
                posts.unshift({ id: ctNewPostId(), authorId: currentUser.id, status: 'draft', tag: data.tag, title: data.title, image: data.image || 'https://picsum.photos/id/1015/800/600', content: data.content, createdAt: ctToday() });
            }
            const form = document.getElementById('form-create-post');
            if (form) form.reset();
            ctResetPostFormUI();
            ctPersist();
            showToast('Đã lưu bản nháp. Bạn có thể chỉnh sửa và gửi duyệt sau.', 'info');
            switchView('view-cre-story');
            return false;
        };

        window.editPost = function (postId) {
            const post = posts.find(p => p.id === postId);
            if (!post) return false;
            if (!currentUser || post.authorId !== currentUser.id) { showToast('Bạn không có quyền sửa bài viết này.', 'error'); return false; }
            try { sessionStorage.setItem('ct_editPostId', postId); } catch (err) { /* bỏ qua */ }
            switchView('view-cre-create');
            ctLoadPostIntoForm(postId);
            return false;
        };

        window.ctLoadPostIntoForm = function (postId) {
            const post = posts.find(p => p.id === postId);
            if (!post || !document.getElementById('post-title')) return;
            document.getElementById('post-title').value = post.title;
            document.getElementById('post-image').value = post.image;
            const tagSelect = document.getElementById('post-tag');
            if (tagSelect) tagSelect.value = post.tag;
            document.getElementById('post-content').value = post.content;
            window.ctEditingPostId = post.id;
            ctSetPostFormMode(true, post.id);
            const notice = document.getElementById('edit-notice');
            if (notice) {
                notice.className = 'mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-2xl p-4 text-sm font-semibold';
                notice.innerHTML = 'Bạn đang chỉnh sửa bài <b>' + post.id + '</b> (' + ctStatusMeta(post.status).label + ').'
                    + (post.rejectReason ? '<br>Lý do bị từ chối: ' + ctEscape(post.rejectReason) : '')
                    + '<br>Sau khi gửi lại, bài viết sẽ trở về trạng thái <b>Chờ duyệt</b>.';
            }
            ctUpdateImagePreview();
            ctUpdateContentCounter();
        };

        function ctUpdateImagePreview() {
            const input = document.getElementById('post-image');
            const preview = document.getElementById('post-image-preview');
            if (!input || !preview) return;
            const url = (input.value || '').trim();
            if (/^https?:\/\//i.test(url)) { preview.src = url; preview.className = 'w-full h-56 object-cover rounded-2xl border border-gray-200 bg-gray-100 mt-3'; }
            else { preview.removeAttribute('src'); preview.className = 'hidden'; }
        }
        function ctUpdateContentCounter() {
            const area = document.getElementById('post-content');
            const counter = document.getElementById('post-content-counter');
            if (!area || !counter) return;
            const len = area.value.length;
            counter.innerText = len + ' ký tự' + (len < 30 ? ' (tối thiểu 30)' : ' · hợp lệ');
            counter.className = 'text-xs font-bold mt-2 block ' + (len < 30 ? 'text-gray-400' : 'text-emerald-600');
        }
        function ctInitPostForm() {
            if (!document.getElementById('form-create-post')) return;
            const image = document.getElementById('post-image');
            const content = document.getElementById('post-content');
            if (image && !image.dataset.bound) { image.addEventListener('input', ctUpdateImagePreview); image.dataset.bound = '1'; }
            if (content && !content.dataset.bound) { content.addEventListener('input', ctUpdateContentCounter); content.dataset.bound = '1'; }
            ctUpdateImagePreview();
            ctUpdateContentCounter();
        }

        /* ---------- I. ADMIN: TỔNG QUAN HỆ THỐNG (mở rộng) ---------- */
        renderAdminDashboard = function () {
            const pending = posts.filter(p => p.status === 'pending');
            const approved = posts.filter(p => p.status === 'approved');
            const rejected = posts.filter(p => p.status === 'rejected');

            const setText = (id, value) => { const el = document.getElementById(id); if (el) el.innerText = value; };
            setText('stat-pending', pending.length);
            setText('stat-approved', approved.length);
            setText('stat-rejected', rejected.length);
            setText('stat-total', posts.length);
            setText('stat-creators', Object.keys(creators).length);
            setText('quick-pending-count', pending.length);
            const judged = approved.length + rejected.length;
            setText('stat-approval-rate', judged === 0 ? '—' : Math.round(approved.length / judged * 100) + '%');

            const queue = document.getElementById('admin-queue-container');
            if (queue) {
                queue.innerHTML = pending.map(p => {
                    const author = ctAuthor(p);
                    return `
                    <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
                        <img src="${p.image}" class="w-full sm:w-24 h-32 sm:h-20 object-cover rounded-xl bg-gray-100">
                        <div class="flex-grow">
                            <p class="font-bold text-gray-900 text-lg hover:text-brand-700 cursor-pointer" onclick="openReviewMode('${p.id}')">${ctEscape(p.title)}</p>
                            <p class="text-sm text-gray-500">${author.name} · ${p.tag} · Gửi ngày ${ctFormatDate(p.createdAt)}</p>
                        </div>
                        <div class="flex gap-2 w-full sm:w-auto">
                            <button onclick="openReviewMode('${p.id}')" class="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 font-bold rounded-xl transition-colors text-sm">Xem</button>
                            <button onclick="adminApprove('${p.id}')" class="px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 font-bold rounded-xl transition-colors text-sm">Duyệt</button>
                            <button onclick="adminReject('${p.id}')" class="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl transition-colors text-sm">Từ chối</button>
                        </div>
                    </div>`;
                }).join('');
                if (pending.length === 0) queue.innerHTML = '<p class="text-gray-500 text-center py-6 bg-gray-50 rounded-2xl">🎉 Không còn bài viết nào chờ duyệt.</p>';
            }

            const recent = document.getElementById('admin-recent-container');
            if (recent) {
                const items = posts.slice().sort((a, b) => String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || ''))).slice(0, 6);
                recent.innerHTML = items.map(p => {
                    const meta = ctStatusMeta(p.status);
                    const target = p.status === 'pending' ? "openReviewMode('" + p.id + "')" : "openPostDetail('" + p.id + "')";
                    return `
                    <div class="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer" onclick="${target}">
                        <img src="${p.image}" class="w-12 h-12 rounded-xl object-cover bg-gray-100">
                        <div class="flex-grow min-w-0">
                            <p class="font-bold text-gray-800 truncate">${ctEscape(p.title)}</p>
                            <p class="text-xs text-gray-400 font-semibold">${ctAuthor(p).name} · ${ctFormatDate(p.updatedAt || p.createdAt)}</p>
                        </div>
                        <span class="${meta.pill} border px-3 py-1 rounded-full text-xs font-bold flex-shrink-0">${meta.label}</span>
                    </div>`;
                }).join('');
            }
        };

        /* ---------- J. ADMIN: DUYỆT / TỪ CHỐI / XOÁ BÀI VIẾT ---------- */
        window.adminApprove = function (postId) {
            const post = posts.find(p => p.id === postId);
            if (!post) { showToast('Không tìm thấy bài viết.', 'error'); return false; }
            post.status = 'approved';
            post.rejectReason = null;
            post.reviewedAt = ctToday();
            post.reviewer = currentUser ? currentUser.name : 'Admin';
            currentReviewPostId = null;
            ctPersist();
            showToast('Đã phê duyệt và xuất bản: ' + post.title);
            ctRefreshAdminViews();
            return false;
        };

        window.adminReject = function (postId) {
            const post = posts.find(p => p.id === postId);
            if (!post) { showToast('Không tìm thấy bài viết.', 'error'); return false; }
            const fallback = 'Nội dung chưa phù hợp với tiêu chí cộng đồng.';
            let reason = post.rejectReason || fallback;
            try {
                const input = window.prompt('Lý do từ chối bài "' + post.title + '":', reason);
                if (input === null) return false;            // người dùng bấm Huỷ
                reason = input.trim() || fallback;
            } catch (err) { /* prompt bị chặn thì dùng lý do mặc định */ }
            post.status = 'rejected';
            post.rejectReason = reason;
            post.reviewedAt = ctToday();
            post.reviewer = currentUser ? currentUser.name : 'Admin';
            currentReviewPostId = null;
            ctPersist();
            showToast('Đã từ chối bài viết: ' + post.title, 'warning');
            ctRefreshAdminViews();
            return false;
        };

        window.adminDeletePost = function (postId) {
            const post = posts.find(p => p.id === postId);
            if (!post) return false;
            try { if (!window.confirm('Xoá vĩnh viễn bài "' + post.title + '" khỏi hệ thống?')) return false; } catch (err) { /* bỏ qua */ }
            posts = posts.filter(p => p.id !== postId);
            ctPersist();
            showToast('Đã xoá bài viết khỏi hệ thống.', 'info');
            ctRefreshAdminViews();
            return false;
        };

        /* Giữ nguyên tên hàm gốc để trang curator-review.html tiếp tục hoạt động */
        window.approvePost = function () { if (currentReviewPostId) adminApprove(currentReviewPostId); };
        window.rejectPost = function () { if (currentReviewPostId) adminReject(currentReviewPostId); };

        function ctRefreshAdminViews() {
            renderAdminDashboard();
            if (document.getElementById('admin-posts-container')) renderAdminPosts();
            if (document.getElementById('admin-creators-container')) renderAdminCreators();
            if (document.getElementById('report-tag-container')) renderAdminReports();
            const reviewView = document.getElementById('view-cur-review');
            if (reviewView && reviewView.classList.contains('active')) switchView('view-adm-dash');
        }

        /* ---------- K. ADMIN: QUẢN LÝ TOÀN BỘ BÀI VIẾT ---------- */
        let ctAdminPostFilter = 'all';
        let ctAdminPostQuery = '';

        function renderAdminPosts() {
            const container = document.getElementById('admin-posts-container');
            if (!container) return;

            const filterBar = document.getElementById('admin-post-filters');
            if (filterBar) {
                filterBar.querySelectorAll('button').forEach(btn => {
                    const isActive = btn.getAttribute('data-filter') === ctAdminPostFilter;
                    btn.className = isActive
                        ? 'px-5 py-2.5 rounded-full text-sm font-bold bg-brand-700 text-white transition-colors'
                        : 'px-5 py-2.5 rounded-full text-sm font-semibold bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors';
                });
            }

            const list = posts
                .filter(p => ctAdminPostFilter === 'all' || p.status === ctAdminPostFilter)
                .filter(p => !ctAdminPostQuery || (p.title + ' ' + p.content + ' ' + p.tag + ' ' + p.id + ' ' + ctAuthor(p).name).toLowerCase().includes(ctAdminPostQuery))
                .slice()
                .sort((a, b) => String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || '')));

            const countEl = document.getElementById('admin-posts-count');
            if (countEl) countEl.innerText = list.length;

            container.innerHTML = list.map(p => {
                const meta = ctStatusMeta(p.status);
                const author = ctAuthor(p);
                const viewCall = p.status === 'pending' ? "openReviewMode('" + p.id + "')" : "openPostDetail('" + p.id + "')";
                const reasonHTML = (p.status === 'rejected' && p.rejectReason)
                    ? '<p class="mt-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">Lý do từ chối: ' + ctEscape(p.rejectReason) + '</p>'
                    : '';
                return `
                <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col lg:flex-row items-start lg:items-center gap-4 hover:shadow-md transition-shadow">
                    <img src="${p.image}" class="w-full lg:w-24 h-32 lg:h-20 object-cover rounded-xl bg-gray-100 flex-shrink-0">
                    <div class="flex-grow min-w-0">
                        <div class="flex items-center gap-3 flex-wrap">
                            <p class="font-bold text-gray-900 text-lg hover:text-brand-700 cursor-pointer" onclick="${viewCall}">${ctEscape(p.title)}</p>
                            <span class="${meta.pill} border px-3 py-1 rounded-full text-xs font-bold">${meta.label}</span>
                        </div>
                        <p class="text-sm text-gray-500 mt-1">${p.id} · ${p.tag} · ${author.name} · ${ctFormatDate(p.createdAt)}${p.reviewedAt ? ' · Duyệt: ' + ctFormatDate(p.reviewedAt) + ' bởi ' + ctEscape(p.reviewer || 'Admin') : ''}</p>
                        <p class="text-xs text-gray-400 mt-1 line-clamp-1">${ctEscape(p.content)}</p>
                        ${reasonHTML}
                    </div>
                    <div class="flex gap-2 flex-shrink-0 flex-wrap w-full lg:w-auto items-center">
                        <button onclick="${viewCall}" class="flex-1 sm:flex-initial px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold rounded-xl transition-colors text-sm text-center">Xem</button>
                        ${p.status !== 'approved' ? '<button onclick="adminApprove(\'' + p.id + '\')" class="flex-1 sm:flex-initial px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 font-bold rounded-xl transition-colors text-sm text-center">Duyệt</button>' : ''}
                        ${p.status === 'pending' || p.status === 'approved' ? '<button onclick="adminReject(\'' + p.id + '\')" class="flex-1 sm:flex-initial px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl transition-colors text-sm text-center">Từ chối</button>' : ''}
                        <button onclick="adminDeletePost('${p.id}')" class="flex-1 sm:flex-initial px-4 py-2 bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 font-bold rounded-xl transition-colors text-sm border border-gray-200 text-center">Xoá</button>
                    </div>
                </div>`;
            }).join('');

            if (list.length === 0) container.innerHTML = '<p class="text-center text-gray-500 py-12 bg-white rounded-3xl border border-gray-100">Không có bài viết nào khớp với bộ lọc.</p>';
        }

        window.filterAdminPosts = function (status) { ctAdminPostFilter = status; renderAdminPosts(); };
        window.searchAdminPosts = function (input) { ctAdminPostQuery = (input.value || '').trim().toLowerCase(); renderAdminPosts(); };

        /* ---------- L. ADMIN: QUẢN LÝ NGHỆ NHÂN ---------- */
        function renderAdminCreators() {
            const container = document.getElementById('admin-creators-container');
            if (!container) return;
            const list = Object.values(creators);
            const setText = (id, value) => { const el = document.getElementById(id); if (el) el.innerText = value; };
            setText('admin-creator-count', list.length);
            setText('admin-creator-active', list.filter(c => c.active !== false).length);
            setText('admin-creator-verified', list.filter(c => c.verified).length);

            container.innerHTML = list.map(c => {
                const cPosts = posts.filter(p => p.authorId === c.id);
                const approved = cPosts.filter(p => p.status === 'approved').length;
                const pending = cPosts.filter(p => p.status === 'pending').length;
                const rejected = cPosts.filter(p => p.status === 'rejected').length;
                const locked = c.active === false;
                const lockBtnClass = locked ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-red-50 text-red-600 hover:bg-red-100';
                const verifyLabel = c.verified ? 'Bỏ xác minh' : 'Xác minh';
                const lockLabel = locked ? 'Mở khoá' : 'Khoá';
                return `
                <div class="bg-white p-5 rounded-2xl border ${locked ? 'border-red-200' : 'border-gray-100'} shadow-sm flex flex-col md:flex-row items-start md:items-center gap-5 hover:shadow-md transition-shadow">
                    <img src="https://i.pravatar.cc/150?img=${c.avatar}" class="w-16 h-16 rounded-full border-2 border-brand-50 bg-gray-100 ${locked ? 'grayscale opacity-60' : ''}">
                    <div class="flex-grow min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                            <p class="font-bold text-gray-900 text-lg">${c.name}</p>
                            ${c.verified ? '<span class="bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded-full text-xs font-bold">Verified</span>' : '<span class="bg-gray-100 text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full text-xs font-bold">Chờ xác minh</span>'}
                            ${locked ? '<span class="bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full text-xs font-bold">Đã khoá</span>' : '<span class="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-xs font-bold">Đang hoạt động</span>'}
                        </div>
                        <p class="text-sm text-gray-500">${c.role} · ${c.craft || 'Thủ công truyền thống'} · 📍 ${c.village || 'Việt Nam'}</p>
                        <p class="text-xs text-gray-400 mt-1">${c.email || '—'} · ${c.phone || '—'} · Tham gia ${ctFormatDate(c.joinedAt)} · ${c.experience || 0} năm kinh nghiệm</p>
                        <div class="flex gap-2 mt-3 flex-wrap">
                            <span class="text-xs font-bold bg-gray-50 border border-gray-200 text-gray-600 px-2.5 py-1 rounded-full">Tổng ${cPosts.length}</span>
                            <span class="text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full">Xuất bản ${approved}</span>
                            <span class="text-xs font-bold bg-yellow-50 border border-yellow-200 text-yellow-700 px-2.5 py-1 rounded-full">Chờ duyệt ${pending}</span>
                            <span class="text-xs font-bold bg-red-50 border border-red-200 text-red-600 px-2.5 py-1 rounded-full">Từ chối ${rejected}</span>
                        </div>
                    </div>
                    <div class="flex gap-2 flex-wrap w-full md:w-auto md:flex-col md:items-stretch">
                        <button onclick="openCreatorProfile('${c.id}')" class="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold rounded-xl text-sm transition-colors">Xem hồ sơ</button>
                        <button onclick="toggleCreatorVerified('${c.id}')" class="px-4 py-2 bg-brand-50 text-brand-700 hover:bg-brand-100 font-bold rounded-xl text-sm transition-colors">${verifyLabel}</button>
                        <button onclick="toggleCreatorActive('${c.id}')" class="px-4 py-2 ${lockBtnClass} font-bold rounded-xl text-sm transition-colors">${lockLabel}</button>
                    </div>
                </div>`;
            }).join('');
            if (list.length === 0) container.innerHTML = '<p class="text-center text-gray-500 py-12 bg-white rounded-3xl border border-gray-100">Chưa có nghệ nhân nào.</p>';
        }

        window.toggleCreatorActive = function (creatorId) {
            const creator = creators[creatorId];
            if (!creator) return false;
            creator.active = creator.active === false;
            ctPersist();
            showToast(creator.active ? 'Đã mở khoá tài khoản: ' + creator.name : 'Đã khoá tài khoản: ' + creator.name + ' (ẩn khỏi trang công khai)', creator.active ? 'success' : 'warning');
            renderAdminCreators();
            return false;
        };

        window.toggleCreatorVerified = function (creatorId) {
            const creator = creators[creatorId];
            if (!creator) return false;
            creator.verified = !creator.verified;
            ctPersist();
            showToast(creator.verified ? 'Đã xác minh hồ sơ: ' + creator.name : 'Đã bỏ xác minh: ' + creator.name, 'info');
            renderAdminCreators();
            return false;
        };

        /* ---------- M. ADMIN: BÁO CÁO & THỐNG KÊ ---------- */
        function renderAdminReports() {
            const setText = (id, value) => { const el = document.getElementById(id); if (el) el.innerText = value; };
            const total = posts.length;
            const approved = posts.filter(p => p.status === 'approved').length;
            const pending = posts.filter(p => p.status === 'pending').length;
            const rejected = posts.filter(p => p.status === 'rejected').length;
            const draft = posts.filter(p => p.status === 'draft').length;
            const judged = approved + rejected;
            const pct = n => total === 0 ? 0 : Math.round(n / total * 100);

            setText('report-total-posts', total);
            setText('report-total-creators', Object.keys(creators).length);
            setText('report-approval-rate', judged === 0 ? '—' : Math.round(approved / judged * 100) + '%');
            setText('report-avg-posts', Object.keys(creators).length === 0 ? '0' : (total / Object.keys(creators).length).toFixed(1));

            const funnelBox = document.getElementById('report-funnel-container');
            if (funnelBox) {
                funnelBox.innerHTML = [
                    { label: 'Đã xuất bản', value: approved, bar: 'bg-emerald-500' },
                    { label: 'Chờ duyệt', value: pending, bar: 'bg-yellow-400' },
                    { label: 'Bị từ chối', value: rejected, bar: 'bg-red-400' },
                    { label: 'Bản nháp', value: draft, bar: 'bg-gray-300' }
                ].map(item => `
                    <div>
                        <div class="flex justify-between text-sm font-bold text-gray-600 mb-1.5"><span>${item.label}</span><span>${item.value} bài · ${pct(item.value)}%</span></div>
                        <div class="h-3 bg-gray-100 rounded-full overflow-hidden"><div class="${item.bar} h-full rounded-full transition-all duration-500" style="width:${pct(item.value)}%"></div></div>
                    </div>`).join('');
            }

            const tagBox = document.getElementById('report-tag-container');
            if (tagBox) {
                const tags = {};
                posts.forEach(p => { tags[p.tag] = (tags[p.tag] || 0) + 1; });
                const keys = Object.keys(tags).sort((a, b) => tags[b] - tags[a]);
                const max = keys.length ? tags[keys[0]] : 1;
                tagBox.innerHTML = keys.map(tag => `
                    <div>
                        <div class="flex justify-between text-sm font-bold text-gray-600 mb-1.5"><span>${tag}</span><span>${tags[tag]} bài</span></div>
                        <div class="h-3 bg-brand-50 rounded-full overflow-hidden"><div class="bg-brand-600 h-full rounded-full transition-all duration-500" style="width:${Math.round(tags[tag] / max * 100)}%"></div></div>
                    </div>`).join('');
            }

            const creatorBox = document.getElementById('report-creator-container');
            if (creatorBox) {
                const rows = Object.values(creators).map(c => ({
                    creator: c,
                    approved: posts.filter(p => p.authorId === c.id && p.status === 'approved').length,
                    total: posts.filter(p => p.authorId === c.id).length
                })).sort((a, b) => b.approved - a.approved);
                const max = rows.length ? Math.max(1, rows[0].approved) : 1;
                creatorBox.innerHTML = rows.map(row => `
                    <div class="flex items-center gap-4">
                        <img src="https://i.pravatar.cc/150?img=${row.creator.avatar}" class="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0">
                        <div class="flex-grow min-w-0">
                            <div class="flex justify-between text-sm font-bold text-gray-700 mb-1.5"><span class="truncate">${row.creator.name}</span><span class="flex-shrink-0 ml-2">${row.approved}/${row.total}</span></div>
                            <div class="h-2.5 bg-gray-100 rounded-full overflow-hidden"><div class="bg-brand-500 h-full rounded-full transition-all duration-500" style="width:${Math.round(row.approved / max * 100)}%"></div></div>
                        </div>
                    </div>`).join('');
            }
        }

        /* ---------- N. TRANG ĐĂNG NHẬP: CHỌN NGHỆ NHÂN DEMO BẤT KỲ ---------- */
        window.ctRenderDemoCreators = function () {
            const select = document.getElementById('demo-creator-select');
            if (!select) return;
            select.innerHTML = Object.values(creators).map(c =>
                '<option value="' + c.id + '">' + c.name + ' — ' + c.role + '</option>').join('');
        };
        window.loginAsSelectedCreator = function () {
            const select = document.getElementById('demo-creator-select');
            if (!select || !select.value) { showToast('Không tìm thấy tài khoản nghệ nhân.', 'error'); return; }
            loginAs(select.value);
        };

        /* Khởi tạo các thành phần mở rộng khi trang sẵn sàng */
        document.addEventListener('DOMContentLoaded', function () {
            ctRenderDemoCreators();
            ctInitPostForm();
        });
        
// Cầu nối đồng bộ với nút bấm có sẵn trên trang ai-trail.html
window.runGeminiAiGenerator = function () {
    const promptInput = document.getElementById('ai-input');
    runAiTrailGenerator(promptInput ? promptInput.value : '');
};
/* ==========================================================================
   CULTURETRAIL CORE ENGINE - 6 THỰC THỂ & 3 TÍNH NĂNG AI CHUẨN BAREM CSE122 V2
   ========================================================================== */

// 1. KHỞI TẠO DỮ LIỆU MẪU BAN ĐẦU VÀO LOCALSTORAGE
const INITIAL_DATA = {
    stories: [
        { id: "CT-1001", title: "Đèn lồng phố Hội", creatorId: "CR-01", creatorName: "Nguyễn Văn An", tag: "Làng nghề", status: "approved", image: "https://picsum.photos/id/1018/800/600", content: "Nghề làm đèn lồng ở Hội An đã có hơn 400 năm lịch sử. Những chiếc khung tre được ngâm nước muối 10 ngày để chống mối mọt, bọc bằng lụa tơ tằm Hà Đông tạo nên ánh sáng lung linh huyền ảo...", createdAt: "2026-03-15" },
        { id: "CT-1002", title: "Nhuộm Chàm Tây Bắc", creatorId: "CR-02", creatorName: "Sùng Thị Mỷ", tag: "Thủ công", status: "approved", image: "https://picsum.photos/id/1036/800/600", content: "Kỹ thuật nhuộm chàm của người H'Mông đòi hỏi sự kiên nhẫn qua nhiều lần ngâm ủ lá chàm tự nhiên với nước tro bếp, tạo ra sắc chàm đậm đà bền bỉ cùng thời gian...", createdAt: "2026-03-18" },
        { id: "CT-1003", title: "Vuốt gốm Bát Tràng", creatorId: "CR-03", creatorName: "Trần Đức Bình", tag: "Làng nghề", status: "pending", image: "https://picsum.photos/id/106/800/600", content: "Bát Tràng lưu giữ nghệ thuật làm gốm bằng tay trên bàn xoay và kỹ thuật nung men rạn đặc trưng từ thời nhà Lý...", createdAt: "2026-04-01" },
        { id: "CT-1004", title: "Kiến trúc Cố đô Huế", creatorId: "CR-01", creatorName: "Nguyễn Văn An", tag: "Nghệ thuật", status: "approved", image: "https://picsum.photos/id/1040/800/600", content: "Dấu ấn vàng son của triều đại phong kiến qua lăng tẩm, đền đài. Những nét chạm trổ tinh xảo trên gỗ lim và đá thanh...", createdAt: "2026-04-02" },
        { id: "CT-9999", title: "Bí mật men rạn Bát Tràng", creatorId: "CR-03", creatorName: "Trần Đức Bình", tag: "Làng nghề", status: "pending", image: "https://picsum.photos/id/1074/800/600", content: "Kỹ thuật tạo rạn độc đáo từ lửa và đất sét trắng sông Hồng, kiểm soát độ co giãn nhiệt để tạo vân rạn tam giác tinh xảo...", createdAt: "2026-04-05" }
    ],
    places: [
        { id: "PL-01", name: "Làng gốm Bát Tràng", address: "Gia Lâm, Hà Nội", tag: "Làng nghề", openTime: "08:00 - 18:00", lat: 20.978, lng: 105.912, description: "Làng nghề gốm sứ truyền thống nghìn năm tuổi ven bờ sông Hồng." },
        { id: "PL-02", name: "Phố cổ Hội An", address: "Quảng Nam", tag: "Di tích", openTime: "Cả ngày", lat: 15.880, lng: 108.338, description: "Đô thị cổ được bảo tồn nguyên vẹn với kiến trúc đèn lồng đặc sắc." },
        { id: "PL-03", name: "Bản Cát Cát", address: "Sa Pa, Lào Cai", tag: "Thủ công", openTime: "07:30 - 18:30", lat: 22.327, lng: 103.834, description: "Bản làng người Mông với nghề dệt thổ cẩm và chạm bạc truyền thống." }
    ],
    events: [
        { id: "EV-01", title: "Workshop: Tự tay vuốt gốm Bát Tràng", creatorId: "CR-03", placeId: "PL-01", date: "2026-05-10", time: "09:00 - 11:30", maxSeats: 15, bookedSeats: 12, fee: "150.000 VNĐ", status: "open" },
        { id: "EV-02", title: "Trải nghiệm dệt thổ cẩm và nhuộm vải", creatorId: "CR-02", placeId: "PL-03", date: "2026-05-15", time: "14:00 - 16:30", maxSeats: 10, bookedSeats: 10, fee: "200.000 VNĐ", status: "full" }
    ],
    collections: [
        { id: "COL-01", title: "Hành trình Đất Sét & Lửa: Tinh hoa gốm Việt", curator: "Lê Minh Curator", storyIds: ["CT-1003", "CT-9999"], banner: "https://picsum.photos/id/106/800/600", summary: "Tập hợp các câu chuyện và địa danh giữ lửa nghề gốm qua nhiều thế kỷ." },
        { id: "COL-02", title: "Sắc màu dệt vải truyền thống Việt Nam", curator: "Phạm Hà Curator", storyIds: ["CT-1001", "CT-1002"], banner: "https://picsum.photos/id/1036/800/600", summary: "Những kỹ thuật dệt nhuộm thủ công lưu giữ bản sắc của đồng bào các dân tộc." }
    ],
    trails: [
        { id: "TR-01", title: "1 ngày khám phá di sản Bát Tràng", duration: "1 ngày", steps: ["Bảo tàng Gốm Bát Tràng", "Xưởng gốm nghệ nhân Bình", "Nhà hàng Canh măng mực Bát Tràng"], aiReasoning: "Tối ưu hóa bán kính di chuyển dưới 1.8km, kết hợp tham quan kiến trúc và trải nghiệm thực tế.", createdAt: "2026-04-10" }
    ],
    admin_plans: [
        {
            id: "AP-2026-01",
            title: "Kế hoạch điều tiết dòng khách & bảo tồn nghệ nhân Bát Tràng",
            timeframe: "Quý 2/2026",
            domain: "Làng nghề gốm sứ & thủ công",
            confidence: "91.4%",
            forecastGrowth: "+34.2%",
            recommendations: "1. Kích hoạt phân luồng du khách theo giờ qua ứng dụng CultureTrail.\n2. Phê duyệt gói hỗ trợ số hóa và truyền nghề cho 3 nghệ nhân cao niên.\n3. Khuyến khích xưởng gốm mở workshop ban đêm (18h-20h30) giảm áp lực ban ngày.",
            savedAt: "2026-04-12"
        }
    ]
};

function initDataStore() {
    // api.js is loaded before app.js and owns first-run JSON seeding. Keeping
    // this function preserves old callers without racing or overwriting JSON.
    return window.ApiService ? window.ApiService.ready : Promise.resolve();
}
initDataStore();

function getStore(key) {
    try {
        const data = JSON.parse(localStorage.getItem(`ct_${key}`) || '[]');
        return Array.isArray(data) ? data : [];
    } catch (error) {
        return [];
    }
}

function setStore(key, data) {
    if (window.ApiService) window.ApiService.save(key, data);
    else {
        localStorage.setItem(`ct_${key}`, JSON.stringify(data));
        window.dispatchEvent(new CustomEvent('ct-data-updated', { detail: { key: `ct_${key}` } }));
    }
}

/* ==========================================================================
   TÍNH NĂNG AI-1: CULTURE TRAIL PLANNER & SMART ITINERARY (ROLE EXPLORER)
   Chuẩn 6 bước: Input -> Processing -> Output -> Explain -> Control -> Save
   Kèm Failure / Uncertainty UX (Mục 6.3 Barem)
   ========================================================================== */
window.runAiTrailGeneratorLegacyDemo = function(promptText) {
    const loadingElem = document.getElementById('ai-loading');
    const resultElem = document.getElementById('ai-results');
    const errorElem = document.getElementById('ai-error');

    if (errorElem) errorElem.classList.add('hidden');
    if (resultElem) resultElem.classList.add('hidden');

    const raw = (promptText || '').trim();

    // Bước 1: Validation & AI Failure / Uncertainty UX (<8 ký tự)
    if (!raw || raw.length < 8) {
        if (errorElem) {
            errorElem.classList.remove('hidden');
            errorElem.innerHTML = `
                <div class="p-5 bg-amber-50 border border-amber-200 rounded-3xl text-amber-800 text-sm space-y-3 animate-fade-in shadow-sm">
                    <div class="flex items-start gap-3">
                        <span class="text-2xl">⚠️</span>
                        <div>
                            <p class="font-bold text-amber-900 text-base">Yêu cầu chưa đủ dữ liệu để AI phân tích chính xác! (Độ tin cậy: 28%)</p>
                            <p class="text-xs text-amber-700 mt-1 leading-relaxed">Vui lòng nhập rõ địa danh di sản (ví dụ: Bát Tràng, Hội An, Sa Pa) và thời gian dự kiến (1 ngày, 2 ngày) hoặc bấm chọn nhanh gợi ý mẫu dưới đây:</p>
                        </div>
                    </div>
                    <div class="flex flex-wrap gap-2 pt-1 border-t border-amber-200/60">
                        <button type="button" onclick="document.getElementById('ai-input').value='1 ngày trải nghiệm làm gốm và ẩm thực Bát Tràng'; runAiTrailGenerator('1 ngày trải nghiệm làm gốm và ẩm thực Bát Tràng')" class="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs">
                            🏺 1 ngày Gốm Bát Tràng
                        </button>
                        <button type="button" onclick="document.getElementById('ai-input').value='2 ngày khám phá phố cổ và đèn lồng Hội An'; runAiTrailGenerator('2 ngày khám phá phố cổ và đèn lồng Hội An')" class="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs">
                            🏮 2 ngày Phố cổ Hội An
                        </button>
                    </div>
                </div>`;
        }
        return;
    }

    // Bước 2: Hiển thị trạng thái AI đang phân tích (Loading Skeleton / Progress)
    if (loadingElem) {
        loadingElem.classList.remove('hidden');
        loadingElem.innerHTML = `
            <div class="flex items-center gap-3">
                <svg class="animate-spin h-5 w-5 text-brand-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span class="text-brand-700 font-bold text-sm">AI đang tổng hợp dữ liệu bản đồ & lịch mở cửa làng nghề...</span>
            </div>
            <div class="space-y-3">
                <div class="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm animate-pulse flex items-center gap-3">
                    <span class="w-6 h-6 rounded-full bg-brand-200"></span>
                    <div class="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div class="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm animate-pulse flex items-center gap-3">
                    <span class="w-6 h-6 rounded-full bg-brand-200"></span>
                    <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>`;
    }

    setTimeout(() => {
        if (loadingElem) loadingElem.classList.add('hidden');

        const low = raw.toLowerCase();

        // Kịch bản AI Failure / Uncertainty UX khi từ khóa mâu thuẫn / ngoài phạm vi di sản
        if (low.includes("vũ trụ") || low.includes("sao hỏa") || low.includes("mặt trăng") || low.includes("alien")) {
            if (errorElem) {
                errorElem.classList.remove('hidden');
                errorElem.innerHTML = `
                    <div class="p-5 bg-amber-50 border border-amber-200 rounded-3xl text-amber-800 text-sm space-y-3 shadow-sm animate-fade-in">
                        <div class="flex items-start gap-3">
                            <span class="text-2xl">⚠️</span>
                            <div>
                                <p class="font-bold text-amber-900 text-base">Không đủ dữ liệu di sản địa phương để lập lịch trình! (Độ tin cậy: 32%)</p>
                                <p class="text-xs text-amber-700 mt-1 leading-relaxed">Từ khóa của bạn nằm ngoài hệ sinh thái di sản văn hóa truyền thống Việt Nam. Vui lòng thử lại với các địa danh văn hóa được xác thực:</p>
                            </div>
                        </div>
                        <div class="flex flex-wrap gap-2 pt-1 border-t border-amber-200/60">
                            <button type="button" onclick="document.getElementById('ai-input').value='1 ngày trải nghiệm làm gốm và ẩm thực Bát Tràng'; runAiTrailGenerator('1 ngày trải nghiệm làm gốm và ẩm thực Bát Tràng');" class="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs">
                                🏺 Thử lại với Làng gốm Bát Tràng
                            </button>
                            <button type="button" onclick="document.getElementById('ai-input').value='1 ngày trải nghiệm dệt thổ cẩm Sa Pa'; runAiTrailGenerator('1 ngày trải nghiệm dệt thổ cẩm Sa Pa');" class="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs">
                                🧵 Thử lại với Dệt thổ cẩm Sa Pa
                            </button>
                            <button type="button" onclick="switchView('view-exp-discover')" class="px-3.5 py-1.5 bg-white border border-amber-300 text-amber-800 rounded-xl text-xs font-bold transition-all hover:bg-amber-100">
                                🗺️ Chọn điểm đến thủ công
                            </button>
                        </div>
                    </div>`;
            }
            return;
        }

        // Bước 3: Chuẩn bị dữ liệu Output dạng Card trực quan
        let generatedTrail = {
            title: `Lịch trình Văn hóa: ${raw.length > 40 ? raw.substring(0, 38) + '...' : raw}`,
            duration: low.includes("2 ngày") ? "2 ngày 1 đêm" : "1 ngày",
            steps: [
                { time: "08:30 - 10:30", spot: "Bảo tàng Gốm Bát Tràng", desc: "Tham quan kiến trúc 7 xoáy ốc đất nung độc bản, tìm hiểu lịch sử 700 năm tinh hoa gốm ven sông Hồng." },
                { time: "10:45 - 12:30", spot: "Xưởng gốm nghệ nhân Trần Đức Bình", desc: "Trực tiếp trải nghiệm vuốt gốm thủ công trên bàn xoay và vẽ màu nung men truyền thống." },
                { time: "12:30 - 14:00", spot: "Nhà hàng Canh măng mực Bát Tràng", desc: "Thưởng thức ẩm thực tiến vua cổ truyền, lắng nghe câu chuyện về mâm cỗ làng gốm." }
            ],
            reasoning: "Lịch trình được tối ưu hóa theo bán kính di chuyển liên tiếp dưới 1.8km (khuyến khích đi bộ/xe đạp), khớp 100% khung giờ mở xưởng của nghệ nhân vào buổi sáng khi ánh sáng tự nhiên tốt nhất."
        };

        if (low.includes("hội an") || low.includes("đèn lồng")) {
            generatedTrail = {
                title: "Hành trình: Sắc màu Đèn lồng Phố cổ Hội An",
                duration: "2 ngày 1 đêm",
                steps: [
                    { time: "09:00 - 11:30", spot: "Xưởng làm đèn lồng nghệ nhân An", desc: "Học kỹ thuật vót nan tre ngâm muối biển 10 ngày và tự căng lụa tơ tằm lên khung đèn." },
                    { time: "15:00 - 17:30", spot: "Quần thể di tích Chùa Cầu & Nhà cổ Tấn Ký", desc: "Khám phá dấu ấn giao thoa kiến trúc Việt - Nhật - Hoa qua 4 thế kỷ thịnh vượng." },
                    { time: "18:30 - 20:30", spot: "Bến thuyền sông Hoài", desc: "Trải nghiệm đi thuyền gỗ và thả hoa đăng ước nguyện giữa không gian phố cổ lung linh." }
                ],
                reasoning: "Lịch trình bố trí đón hoàng hôn và hoạt động thắp đèn lồng lúc 17:30, phân bổ hợp lý giữa di tích lịch sử ban ngày và trải nghiệm văn hóa sông nước về đêm."
            };
        } else if (low.includes("sa pa") || low.includes("thổ cẩm") || low.includes("chàm")) {
            generatedTrail = {
                title: "Hành trình: Bản sắc Chàm & Dệt Thổ cẩm Tây Bắc",
                duration: "1 ngày",
                steps: [
                    { time: "08:30 - 11:30", spot: "Xưởng dệt thổ cẩm nghệ nhân Sùng Thị Mỷ (Bản Cát Cát)", desc: "Trải nghiệm tước sợi lanh, se sợi trên khung dệt gỗ cổ truyền của phụ nữ H'Mông." },
                    { time: "13:30 - 15:30", spot: "Vườn ủ lá chàm tự nhiên", desc: "Thực hành ngâm ủ thùng nước chàm pha tro bếp và vẽ hoa văn sáp ong lên vải." },
                    { time: "16:00 - 17:30", spot: "Chợ phiên thổ cẩm Sa Pa", desc: "Gặp gỡ các thiếu nữ vùng cao và lựa chọn sản phẩm thủ công thổ cẩm lưu niệm." }
                ],
                reasoning: "Thời gian sắp xếp theo chu trình thao tác nghề thực tế: chuẩn bị sợi lanh buổi sáng, nhuộm chàm buổi chiều nắng ráo để vải lên màu tươi nhất."
            };
        }

        // Bước 3, 4, 5, 6: Render Output Card + Explainability + User Control + Save
        if (resultElem) {
            resultElem.classList.remove('hidden');
            resultElem.innerHTML = `
                <div class="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 animate-fade-in">
                    <!-- Bước 3: Output Header -->
                    <div class="border-b border-gray-100 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <span class="px-3.5 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-full uppercase tracking-wider border border-brand-200">
                                ✨ Lịch trình Cá nhân hóa AI
                            </span>
                            <h4 id="ai-trail-title" class="text-2xl font-bold text-gray-900 mt-2">${generatedTrail.title}</h4>
                            <p class="text-gray-500 text-xs mt-1">Thời lượng: <b class="text-brand-700">${generatedTrail.duration}</b> • Độ tin cậy mô hình: <b class="text-emerald-600">96.5%</b></p>
                        </div>
                        <span class="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto">
                            Tối ưu bán kính 1.8km
                        </span>
                    </div>

                    <!-- Bước 4: Explainability (Giải thích lý do) -->
                    <div class="p-4 bg-indigo-50/80 border border-indigo-100 rounded-2xl text-xs text-indigo-900 space-y-1.5">
                        <p class="font-bold flex items-center gap-1.5 text-indigo-950 text-sm">
                            <span>💡</span> Vì sao AI đề xuất lịch trình này?
                        </p>
                        <p class="leading-relaxed text-indigo-800">${generatedTrail.reasoning}</p>
                    </div>

                    <!-- Danh sách các chặng timeline -->
                    <div class="space-y-4" id="ai-steps-container">
                        ${generatedTrail.steps.map((s, idx) => `
                            <div class="flex gap-4 items-start">
                                <span class="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs mt-1">${idx + 1}</span>
                                <div class="bg-gray-50 p-4 rounded-2xl flex-1 border border-gray-100 space-y-1">
                                    <span class="text-xs font-bold text-brand-600">${s.time}</span>
                                    <h5 class="font-bold text-gray-900 text-base">${s.spot}</h5>
                                    <p class="text-xs text-gray-600 leading-relaxed">${s.desc}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Khung chỉnh sửa mở rộng (Bước 5: User Control - Edit AI Suggestion) -->
                    <div id="ai-edit-box" class="hidden p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                        <label class="block text-xs font-bold text-gray-700">Chỉnh sửa tiêu đề lịch trình:</label>
                        <input type="text" id="ai-edit-title-input" value="${generatedTrail.title}" class="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm font-semibold focus:outline-none focus:border-brand-500">
                    </div>

                    <!-- Bước 5 + 6: Nút kiểm soát của người dùng (User Control & Save/Apply) -->
                    <div class="pt-4 border-t border-gray-100 flex flex-wrap gap-2.5 justify-end items-center btn-responsive-group">
                        <button type="button" onclick="toggleEditAiTrail()" class="w-full sm:w-auto px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors text-center">
                            ✏️ Chỉnh sửa trước khi lưu
                        </button>
                        <button type="button" onclick="runAiTrailGenerator(document.getElementById('ai-input').value)" class="w-full sm:w-auto px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors text-center">
                            🔄 Tạo lại phương án khác (Option B)
                        </button>
                        <button type="button" id="btn-save-ai-trail" class="w-full sm:w-auto px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-1.5">
                            💾 Lưu vào Lịch trình của tôi
                        </button>
                    </div>
                </div>`;

            // Gắn sự kiện lưu thực sự vào localStorage (Bước 6: Save/Apply)
            document.getElementById('btn-save-ai-trail').onclick = function() {
                const editTitle = document.getElementById('ai-edit-title-input');
                if (editTitle && editTitle.value.trim()) {
                    generatedTrail.title = editTitle.value.trim();
                }
                saveAiTrailToMyTrails(generatedTrail);
            };
        }
    }, 700);
};

window.toggleEditAiTrail = function() {
    const box = document.getElementById('ai-edit-box');
    if (box) box.classList.toggle('hidden');
};

window.saveAiTrailToMyTrails = function(trail) {
    const myTrails = getStore('trails') || [];
    const newTrail = {
        id: "TR-" + Date.now().toString().slice(-4),
        title: trail.title,
        duration: trail.duration,
        steps: trail.steps.map(s => typeof s === 'string' ? s : s.spot),
        aiReasoning: trail.reasoning || "Tối ưu hóa bán kính di chuyển dưới 1.8km.",
        createdAt: new Date().toISOString().split('T')[0]
    };
    myTrails.unshift(newTrail);
    setStore('trails', myTrails);
    if (typeof showToast === 'function') {
        showToast("Đã lưu lịch trình AI thành công vào 'Lịch trình của tôi'!", "success");
    }
    renderMySavedTrails();
};

window.deleteMyTrail = function(id) {
    let myTrails = getStore('trails') || [];
    myTrails = myTrails.filter(t => t.id !== id);
    setStore('trails', myTrails);
    if (typeof showToast === 'function') {
        showToast("Đã xóa lịch trình khỏi bộ sưu tập", "info");
    }
    renderMySavedTrails();
};

window.renderMySavedTrails = function() {
    const container = document.getElementById('my-saved-trails-list');
    const countEl = document.getElementById('saved-trails-count');
    if (!container) return;

    const trails = getStore('trails') || [];
    if (countEl) countEl.innerText = trails.length;

    if (trails.length === 0) {
        container.innerHTML = `
            <div class="p-8 text-center bg-white rounded-3xl border border-gray-100">
                <span class="text-3xl">🗺️</span>
                <p class="font-bold text-gray-700 mt-2">Chưa có lịch trình nào được lưu</p>
                <p class="text-xs text-gray-400 mt-1">Hãy dùng ô tìm kiếm phía trên để AI thiết kế chuyến đi văn hóa của riêng bạn!</p>
            </div>`;
        return;
    }

    container.innerHTML = trails.map(t => `
        <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
            <div class="space-y-1">
                <div class="flex items-center gap-2">
                    <span class="px-2.5 py-0.5 bg-brand-50 text-brand-700 text-[11px] font-bold rounded-full border border-brand-200">#${t.id}</span>
                    <span class="text-xs text-gray-400">${t.duration || '1 ngày'} • Tạo ngày: ${t.createdAt || '2026-04-10'}</span>
                </div>
                <h4 class="text-lg font-bold text-gray-900">${t.title}</h4>
                <p class="text-xs text-gray-500">Các chặng: ${(t.steps || []).join(' &rarr; ')}</p>
            </div>
            <div class="flex items-center gap-2 w-full md:w-auto justify-end md:justify-center">
                <button onclick="showToast('Lịch trình đã sẵn sàng trên bản đồ offline!', 'info')" class="px-3.5 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-xl text-xs transition-colors">
                    Xem bản đồ
                </button>
                <button onclick="deleteMyTrail('${t.id}')" class="px-3.5 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold rounded-xl text-xs transition-colors">
                    Xóa
                </button>
            </div>
        </div>
    `).join('');
};

/* ==========================================================================
   TÍNH NĂNG AI-2: CONTENT REVIEW COPILOT & STORY HIGHLIGHTS (ROLE CURATOR)
   Chuẩn 6 bước: Input -> Processing -> Output -> Explain -> Control -> Save
   Kèm Failure / Uncertainty UX (Mục 6.3 Barem)
   ========================================================================== */
window.runAiStoryReviewLegacyDemo = function(postId, isUncertaintyTest = false) {
    const loading = document.getElementById('curator-ai-loading');
    const display = document.getElementById('curator-ai-display');
    if (!display) return;

    if (loading) loading.classList.remove('hidden');
    display.innerHTML = '';

    setTimeout(() => {
        if (loading) loading.classList.add('hidden');

        // Kịch bản AI Failure / Uncertainty UX (Điểm thấp 42/100, thiếu dữ liệu chứng thực)
        if (isUncertaintyTest) {
            display.innerHTML = `
                <div class="p-5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 space-y-4 animate-fade-in">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                            ⚠️ Cảnh báo Bất định (Uncertainty UX)
                        </span>
                        <span class="text-base font-extrabold text-amber-700 bg-white px-3 py-1 rounded-xl border border-amber-200 shadow-xs">
                            Điểm: 42/100
                        </span>
                    </div>

                    <div class="space-y-1">
                        <p class="font-bold text-sm text-amber-950">AI chưa đủ dữ liệu để phê duyệt tự động!</p>
                        <p class="text-xs text-amber-800 leading-relaxed">
                            Phát hiện bài viết thiếu thông tin nguồn gốc truyền nhân dòng họ nghệ nhân và chưa đính kèm tọa độ xưởng chế tác thực địa. Độ tin cậy phân tích chỉ đạt <b>42%</b> (dưới ngưỡng an toàn 70%).
                        </p>
                    </div>

                    <!-- Khối Explainability trong Failure State -->
                    <div class="p-3 bg-white/80 rounded-xl border border-amber-200 text-xs text-amber-900">
                        <b>Lý do AI cảnh báo:</b> Từ khóa mô tả mang tính thương mại chung chung, không khớp với danh mục di sản làng nghề đã được bảo tàng công nhận.
                    </div>

                    <!-- Nút hành động phục hồi -->
                    <div class="pt-2 flex flex-wrap gap-2">
                        <button type="button" onclick="requestPostRevision()" class="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs">
                            Yêu cầu nghệ nhân bổ sung hồ sơ
                        </button>
                        <button type="button" onclick="runAiStoryReview('${postId}', false)" class="px-3 py-2 bg-white border border-amber-300 text-amber-800 rounded-xl text-xs font-bold hover:bg-amber-100">
                            Thử lại với chế độ chuẩn
                        </button>
                    </div>
                </div>`;
            return;
        }

        // Kịch bản Thành công Chuẩn 6 bước (Điểm cao 95/100, trích xuất 3 Story Highlights)
        const sampleHighlights = `• Nguồn gốc lịch sử: Làng nghề hơn 700 năm bên dòng sông Hồng, gắn liền với các triều đại Lý - Trần.
• Kỹ nghệ độc bản: Bí quyết chế tác men rạn tam giác và vuốt tay thủ công tinh tế trên bàn xoay gỗ.
• Giá trị cộng đồng: Truyền thừa qua 5 thế hệ dòng họ nghệ nhân, giữ gìn hồn cốt mỹ thuật dân tộc.`;

        display.innerHTML = `
            <div class="bg-gradient-to-br from-indigo-50/70 to-brand-50/70 border border-brand-200 p-5 rounded-2xl shadow-sm space-y-4 animate-fade-in">
                <!-- Bước 3: Output Score & Risk Badge -->
                <div class="flex items-center justify-between">
                    <span class="text-xs font-bold uppercase tracking-wider text-brand-800 bg-brand-100 px-3 py-1 rounded-full border border-brand-200">
                        ✨ Thẩm định Hoàn tất
                    </span>
                    <span class="text-base font-extrabold text-emerald-700 bg-white px-3 py-1 rounded-xl border border-emerald-200 shadow-xs">
                        Điểm chất lượng: 95/100
                    </span>
                </div>

                <!-- Cảnh báo rủi ro (Risk Alert) -->
                <div class="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold">
                    <span>✅</span> An toàn: Không phát hiện vi phạm bản quyền hay thương mại hóa sai lệch.
                </div>

                <!-- Bước 4: Explainability (Giải thích lý do) -->
                <div class="p-3 bg-white rounded-xl border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
                    <b>💡 Tiêu chí thẩm định AI:</b> Khớp 95% tư liệu bảo tàng văn hóa TLU, cấu trúc bài viết đạt chuẩn di sản và ảnh gốc độ phân giải cao.
                </div>

                <!-- Bước 5: User Control (Chỉnh sửa trực tiếp Story Highlights) -->
                <div class="space-y-1.5">
                    <div class="flex justify-between items-center text-xs">
                        <label for="ai-curator-highlights" class="font-bold text-gray-800">3 Điểm nhấn văn hóa (Quản trị viên có thể chỉnh sửa):</label>
                        <span class="text-gray-400">Inline Editable</span>
                    </div>
                    <textarea id="ai-curator-highlights" rows="4" class="w-full p-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-brand-500 font-mono leading-relaxed shadow-2xs">${sampleHighlights}</textarea>
                </div>

                <!-- Bước 5 + 6: Nút hành động phê duyệt & Lưu vào dữ liệu thật -->
                <div class="pt-2 border-t border-brand-100 flex flex-wrap gap-2 justify-end btn-responsive-group">
                    <button type="button" onclick="applyAiHighlightsAndApprove('${postId}')" class="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        Áp dụng AI Highlights & Phê duyệt
                    </button>
                    <button type="button" onclick="requestPostRevision()" class="w-full sm:w-auto px-3 py-2 bg-white border border-amber-300 text-amber-800 rounded-xl text-xs font-bold hover:bg-amber-50 text-center">
                        Yêu cầu bổ sung
                    </button>
                </div>
            </div>`;
    }, 600);
};

window.applyAiHighlightsAndApproveLegacyDemo = function(postId) {
    const highlights = document.getElementById('ai-curator-highlights')?.value || '';
    let post = posts.find(p => p.id === postId);
    if (!post) {
        const stories = getStore('stories') || [];
        post = stories.find(p => p.id === postId);
    }
    if (post) {
        post.status = 'approved';
        post.aiHighlights = highlights;
        post.qualityScore = 95;
        savePosts();
        
        // Đồng bộ vào ct_stories
        const allStories = getStore('stories') || [];
        const idx = allStories.findIndex(s => s.id === postId);
        if (idx !== -1) {
            allStories[idx].status = 'approved';
            allStories[idx].aiHighlights = highlights;
            setStore('stories', allStories);
        }
    }
    showToast('Đã áp dụng Story Highlights của AI và phê duyệt bài viết thành công!', 'success');
    switchView('view-adm-dash');
};

/* ==========================================================================
   TÍNH NĂNG AI-3: HERITAGE INTELLIGENCE & TREND COPILOT (ROLE ADMIN)
   Chuẩn 6 bước: Input -> Processing -> Output -> Explain -> Control -> Save
   Kèm Failure / Uncertainty UX (Mục 6.3 Barem)
   ========================================================================== */
window.runAiAdminAnalyticsLegacyDemo = function(isFailureTest = false) {
    const loading = document.getElementById('admin-ai-loading');
    const display = document.getElementById('admin-ai-results');
    const errorBox = document.getElementById('admin-ai-error');
    if (!display) return;

    if (errorBox) errorBox.classList.add('hidden');
    display.classList.add('hidden');
    if (loading) loading.classList.remove('hidden');

    setTimeout(() => {
        if (loading) loading.classList.add('hidden');

        // Kịch bản AI Failure / Uncertainty UX khi dữ liệu phân tán / thiếu hụt
        if (isFailureTest) {
            if (errorBox) {
                errorBox.classList.remove('hidden');
                errorBox.innerHTML = `
                    <div class="p-5 bg-amber-50 border border-amber-200 rounded-3xl text-amber-900 space-y-3 animate-fade-in shadow-sm">
                        <div class="flex items-start gap-3">
                            <span class="text-2xl">⚠️</span>
                            <div>
                                <p class="font-bold text-amber-900 text-base">Cảnh báo AI Bất định: Mẫu dữ liệu dưới ngưỡng phân tích! (Độ tin cậy: 38%)</p>
                                <p class="text-xs text-amber-700 mt-1 leading-relaxed">
                                    Dữ liệu khảo sát tại các làng nghề vệ tinh phân tán chưa đạt tối thiểu 50 lượt tương tác du khách trong 30 ngày qua. Dự báo tự động có nguy cơ sai số lớn.
                                </p>
                            </div>
                        </div>
                        <div class="flex flex-wrap gap-2 pt-1 border-t border-amber-200/60">
                            <button type="button" onclick="showToast('Đã giao nhiệm vụ khảo sát thực địa cho tổ kiểm duyệt!', 'info')" class="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs">
                                📋 Giao cán bộ kiểm duyệt khảo sát thực địa bổ sung
                            </button>
                            <button type="button" onclick="runAiAdminAnalytics(false)" class="px-3.5 py-1.5 bg-white border border-amber-300 text-amber-800 rounded-xl text-xs font-bold hover:bg-amber-100">
                                🔄 Thử lại với dữ liệu Toàn hệ thống (91.4%)
                            </button>
                        </div>
                    </div>`;
            }
            return;
        }

        // Kịch bản Thành công Chuẩn 6 bước
        const domain = document.getElementById('admin-ai-domain')?.value || 'Toàn bộ hệ thống di sản';
        const timeframe = document.getElementById('admin-ai-timeframe')?.value || 'Quý 2/2026';

        const defaultPlan = `1. Điều tiết lưu lượng: Kích hoạt tính năng phân luồng theo giờ trên AI Trail để giảm tải 35% khách dồn vào khung 10h-12h tại Bát Tràng.
2. Bảo trợ nghệ nhân: Phê duyệt gói hỗ trợ số hóa và trợ cấp truyền nghề cho 3 nghệ nhân cao niên tại Tây Bắc và Hội An.
3. Mở rộng khung giờ: Khuyến khích xưởng gốm mở workshop ca tối (18:00 - 20:30) phục vụ khách lưu trú.`;

        display.classList.remove('hidden');
        display.innerHTML = `
            <div class="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 animate-fade-in">
                <!-- Bước 3: Output Metric Cards -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div class="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                        <p class="text-xs font-bold uppercase tracking-wider text-emerald-700">Dự báo Tăng trưởng Khách</p>
                        <p class="text-3xl font-extrabold text-emerald-800 mt-1">+34.2%</p>
                        <p class="text-[11px] text-emerald-600 mt-0.5">Cuối tuần chạm 1.500 khách/ngày</p>
                    </div>
                    <div class="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                        <p class="text-xs font-bold uppercase tracking-wider text-amber-700">Công suất Xưởng nghề</p>
                        <p class="text-3xl font-extrabold text-amber-800 mt-1">82%</p>
                        <p class="text-[11px] text-amber-600 mt-0.5">Cảnh báo thiếu nghệ nhân hướng dẫn</p>
                    </div>
                    <div class="p-4 bg-rose-50 border border-rose-200 rounded-2xl">
                        <p class="text-xs font-bold uppercase tracking-wider text-rose-700">Chỉ số Nguy cơ Mai một</p>
                        <p class="text-3xl font-extrabold text-rose-800 mt-1">2 Điểm</p>
                        <p class="text-[11px] text-rose-600 mt-0.5">Dệt chàm Sa Pa & Nón Chuông</p>
                    </div>
                </div>

                <!-- Bước 4: Explainability (Giải thích lý do) -->
                <div class="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs text-indigo-900 space-y-1">
                    <p class="font-bold flex items-center gap-1.5 text-indigo-950 text-sm">
                        <span>💡</span> Vì sao AI đưa ra dự báo và khuyến nghị này?
                    </p>
                    <p class="leading-relaxed text-indigo-800">
                        Mô hình phân tích chuỗi thời gian dựa trên <b>3,721 lượt tạo lịch trình du khách</b>, 150 đánh giá trải nghiệm thực tế và tỷ lệ đăng ký workshop tăng 48% trong quý 1/2026. Độ tin cậy mô hình: <b>91.4%</b>.
                    </p>
                </div>

                <!-- Bước 5: User Control (Chỉnh sửa Khuyến nghị trước khi áp dụng) -->
                <div class="space-y-1.5">
                    <div class="flex justify-between items-center text-xs">
                        <label for="admin-ai-plan-text" class="font-bold text-gray-800">Khuyến nghị Chiến lược Quản trị (Admin có thể chỉnh sửa):</label>
                        <span class="text-gray-400">Inline Editable</span>
                    </div>
                    <textarea id="admin-ai-plan-text" rows="4" class="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-800 focus:outline-none focus:border-brand-500 font-mono leading-relaxed">${defaultPlan}</textarea>
                </div>

                <!-- Bước 5 + 6: Nút hành động & Lưu kế hoạch vào hệ thống -->
                <div class="pt-3 border-t border-gray-100 flex flex-wrap gap-2.5 justify-end items-center btn-responsive-group">
                    <button type="button" onclick="runAiAdminAnalytics(false)" class="w-full sm:w-auto px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors text-center">
                        🔄 Tạo phương án khác (Option B)
                    </button>
                    <button type="button" onclick="exportAiReportJson()" class="w-full sm:w-auto px-4 py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-xl text-xs border border-brand-200 transition-colors text-center">
                        📥 Xuất Báo cáo JSON
                    </button>
                    <button type="button" onclick="saveAiAdminPlan()" class="w-full sm:w-auto px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-1.5">
                        💾 Áp dụng vào Kế hoạch Bảo tồn 2026
                    </button>
                </div>
            </div>`;
    }, 700);
};

window.saveAiAdminPlanLegacyDemo = function() {
    const textarea = document.getElementById('admin-ai-plan-text');
    const domain = document.getElementById('admin-ai-domain')?.value || 'Toàn bộ hệ thống di sản';
    const timeframe = document.getElementById('admin-ai-timeframe')?.value || 'Quý 2/2026';
    const recs = textarea ? textarea.value : 'Kế hoạch hành động bảo tồn di sản';

    const plans = getStore('admin_plans') || [];
    const newPlan = {
        id: "AP-" + Date.now().toString().slice(-4),
        title: `Kế hoạch điều tiết: ${domain}`,
        timeframe: timeframe,
        domain: domain,
        confidence: "91.4%",
        forecastGrowth: "+34.2%",
        recommendations: recs,
        savedAt: new Date().toISOString().split('T')[0]
    };
    plans.unshift(newPlan);
    setStore('admin_plans', plans);
    if (typeof showToast === 'function') {
        showToast("Đã lưu khuyến nghị AI vào Kế hoạch bảo tồn hệ thống thành công!", "success");
    }
    renderAdminSavedPlans();
};

window.exportAiReportJsonLegacyDemo = function() {
    const plans = getStore('admin_plans') || [];
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(plans, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `CultureTrail_AI_Analytics_${Date.now()}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    showToast("Đã xuất tệp dữ liệu phân tích JSON thành công!", "info");
};

window.renderAdminSavedPlans = function() {
    const container = document.getElementById('admin-saved-plans-container');
    const badge = document.getElementById('admin-saved-plans-badge');
    if (!container) return;

    const plans = getStore('admin_plans') || [];
    if (badge) badge.innerText = `${plans.length} kế hoạch`;

    if (plans.length === 0) {
        container.innerHTML = `<p class="text-xs text-gray-400 py-3 text-center">Chưa có kế hoạch nào được áp dụng từ AI Copilot.</p>`;
        return;
    }

    container.innerHTML = plans.slice(0, 3).map(p => `
        <div class="p-4 bg-slate-50 border border-gray-100 rounded-2xl space-y-1.5 hover:bg-white hover:shadow-xs transition-all">
            <div class="flex justify-between items-center text-xs">
                <span class="font-bold text-brand-700">${p.title}</span>
                <span class="text-gray-400">${p.savedAt}</span>
            </div>
            <p class="text-xs text-gray-600 line-clamp-2">${p.recommendations}</p>
        </div>
    `).join('');
};

/* ==========================================================================
   TỰ ĐỘNG KHỞI TẠO CÁC MÀN HÌNH AI TRONG VIEW TƯƠNG ỨNG
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    // Khởi tạo Saved Trails nếu đang ở trang Explorer Trail
    if (document.getElementById('my-saved-trails-list')) {
        renderMySavedTrails();
    }
    // Khởi tạo Saved Plans nếu đang ở trang Admin Dashboard
    if (document.getElementById('admin-saved-plans-container')) {
        renderAdminSavedPlans();
    }
});

/* ========================================================================== 
   GEMINI LIVE INTEGRATION
   These definitions intentionally replace the legacy Demo/Test generators
   above while preserving every function name referenced by existing HTML.
   ========================================================================== */
const ctAiChatHistory = [];
const ctAiBusy = new Set();
let ctAiLastReview = null;
let ctAiLastAdminReport = null;

function ctAiEscape(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function ctAiErrorMessage(error) {
    return error && error.message ? error.message : 'Không thể xử lý yêu cầu AI. Vui lòng thử lại.';
}

function ctAiSetBusy(key, busy) {
    if (busy) ctAiBusy.add(key); else ctAiBusy.delete(key);
    document.querySelectorAll('[data-ct-ai-action]').forEach(button => {
        if (button.dataset.ctAiAction === key) button.disabled = busy;
    });
}

function ctAiShowError(container, error, retry) {
    if (!container) return;
    container.classList.remove('hidden');
    container.innerHTML = '';
    const card = document.createElement('div');
    card.className = 'p-5 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm space-y-3 animate-fade-in';
    const message = document.createElement('p');
    message.className = 'font-semibold leading-relaxed';
    message.textContent = ctAiErrorMessage(error);
    card.appendChild(message);
    const note = document.createElement('p');
    note.className = 'text-xs text-red-700';
    note.textContent = 'Không có kết quả giả lập nào được dùng thay cho phản hồi Gemini.';
    card.appendChild(note);
    if (retry) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold';
        button.textContent = 'Thử lại';
        button.addEventListener('click', retry, { once: true });
        card.appendChild(button);
    }
    container.appendChild(card);
}

window.getSmartCultureAiReply = async function (message, history = ctAiChatHistory) {
    const context = await window.CultureTrailAiData.getContext({ query: message, purpose: 'chat' });
    const normalized = String(message).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const needsCurrentWebData = /\b(hom nay|hien nay|moi nhat|thoi tiet|giao thong|duong di|gia ve|gio mo cua|khach san|nha hang)\b/.test(normalized);
    const shouldUseGoogleSearch = !context.coverage?.hasProjectMatch || needsCurrentWebData;
    const reply = await window.GeminiService.generateText({
        prompt: message,
        context,
        history,
        requestKey: `chat:${Date.now()}`,
        useGoogleSearch: shouldUseGoogleSearch
    });
    const hasTravelIntent = /\b(di|den|du lich|tham quan|dia diem|lich trinh|chuyen di|nghi duong|check in)\b/.test(normalized);
    const normalizedReply = String(reply).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const alreadyDisclosed = normalizedReply.includes('culturetrail') && normalizedReply.includes('chua co');
    if (hasTravelIntent && context.coverage && !context.coverage.hasProjectMatch && !alreadyDisclosed) {
        return `Lưu ý từ CultureTrail: Dịch vụ của dự án hiện chưa có chuyến đi hoặc điểm đến phù hợp trực tiếp với yêu cầu này. Phần tư vấn dưới đây sử dụng thông tin tham khảo bên ngoài CultureTrail.\n\n${reply}`;
    }
    return reply;
};

window.sendChatMessage = async function () {
    const input = document.getElementById('chat-input');
    const box = document.getElementById('chat-messages');
    if (!input || !box || ctAiBusy.has('chat')) return;
    const message = input.value.trim();
    if (!message) return;

    const userBubble = document.createElement('div');
    userBubble.className = 'bg-brand-600 text-white p-3 rounded-2xl rounded-tr-none self-end max-w-[85%] ml-auto shadow-sm text-sm break-words';
    userBubble.textContent = message;
    box.appendChild(userBubble);
    input.value = '';

    const row = document.createElement('div');
    row.className = 'flex gap-2 items-start animate-fade-in';
    const icon = document.createElement('div');
    icon.className = 'w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 flex-shrink-0 border border-brand-200';
    icon.textContent = '✨';
    const answer = document.createElement('div');
    answer.className = 'bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-gray-600 border border-gray-100 max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap break-words';
    answer.textContent = 'Gemini đang phân tích dữ liệu CultureTrail…';
    row.append(icon, answer);
    box.appendChild(row);
    box.scrollTop = box.scrollHeight;
    ctAiSetBusy('chat', true);

    try {
        const reply = await window.getSmartCultureAiReply(message, ctAiChatHistory);
        answer.classList.remove('text-gray-600');
        answer.classList.add('text-gray-700');
        answer.textContent = reply;
        ctAiChatHistory.push({ role: 'user', text: message }, { role: 'model', text: reply });
        if (ctAiChatHistory.length > 16) ctAiChatHistory.splice(0, ctAiChatHistory.length - 16);
    } catch (error) {
        answer.innerHTML = '';
        answer.classList.add('text-red-700', 'bg-red-50', 'border-red-200');
        const text = document.createElement('p');
        text.textContent = ctAiErrorMessage(error);
        const retry = document.createElement('button');
        retry.type = 'button';
        retry.className = 'mt-2 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold';
        retry.textContent = 'Thử lại';
        retry.onclick = () => { row.remove(); input.value = message; window.sendChatMessage(); };
        answer.append(text, retry);
    } finally {
        ctAiSetBusy('chat', false);
        box.scrollTop = box.scrollHeight;
    }
};

const CT_TRAIL_SCHEMA = {
    type: 'OBJECT',
    required: ['title', 'duration', 'summary', 'projectAvailability', 'dataScope', 'steps', 'reasoning', 'limitations', 'sourceIds'],
    properties: {
        title: { type: 'STRING' },
        duration: { type: 'STRING' },
        summary: { type: 'STRING' },
        projectAvailability: { type: 'STRING' },
        dataScope: { type: 'STRING', enum: ['PROJECT', 'MIXED', 'EXTERNAL'] },
        estimatedBudget: { type: 'STRING' },
        reasoning: { type: 'STRING' },
        limitations: { type: 'ARRAY', items: { type: 'STRING' } },
        sourceIds: { type: 'ARRAY', items: { type: 'STRING' } },
        steps: {
            type: 'ARRAY',
            items: {
                type: 'OBJECT',
                required: ['time', 'spot', 'activity', 'description'],
                properties: {
                    time: { type: 'STRING' },
                    placeId: { type: 'STRING' },
                    spot: { type: 'STRING' },
                    activity: { type: 'STRING' },
                    description: { type: 'STRING' },
                    estimatedCost: { type: 'STRING' }
                }
            }
        }
    }
};

function ctAiValidateTrail(trail) {
    const validSteps = trail && Array.isArray(trail.steps) && trail.steps.length > 0
        && trail.steps.every(step => step && step.time && step.spot && step.activity && step.description);
    if (!trail || !trail.title || !trail.duration || !trail.summary || !trail.projectAvailability
        || !['PROJECT', 'MIXED', 'EXTERNAL'].includes(trail.dataScope) || !trail.reasoning
        || !validSteps || !Array.isArray(trail.limitations) || !Array.isArray(trail.sourceIds)) {
        throw new Error('Gemini trả về lịch trình thiếu trường bắt buộc. Vui lòng tạo lại.');
    }
    return trail;
}

function ctAiRenderTrail(trail, resultElem) {
    window.__ctAiLastTrail = trail;
    const limitations = (trail.limitations || []).map(item => `<li>${ctAiEscape(item)}</li>`).join('');
    const isExternal = trail.dataScope !== 'PROJECT';
    const searchUnavailable = Boolean(trail._searchUnavailable);
    const groundingSources = (trail._groundingSources || [])
        .map(source => `<li>${ctAiEscape(source.title)}: ${ctAiEscape(source.uri)}</li>`).join('');
    resultElem.classList.remove('hidden');
    resultElem.innerHTML = `
        <div class="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 animate-fade-in">
            <div class="border-b border-gray-100 pb-5">
                <span class="px-3.5 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-full border border-brand-200">✨ LỊCH TRÌNH TỪ GEMINI</span>
                <h4 id="ai-trail-title" class="text-2xl font-bold text-gray-900 mt-2">${ctAiEscape(trail.title)}</h4>
                <p class="text-gray-500 text-xs mt-1">${ctAiEscape(trail.duration)}${trail.estimatedBudget ? ` • Chi phí dự kiến: ${ctAiEscape(trail.estimatedBudget)}` : ''}</p>
                <p class="text-sm text-gray-600 mt-2">${ctAiEscape(trail.summary)}</p>
            </div>
            <div class="p-4 ${isExternal ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'} border rounded-2xl text-xs">
                <b>${isExternal ? 'Thông tin ngoài danh mục CultureTrail:' : 'Dữ liệu dịch vụ CultureTrail:'}</b> ${ctAiEscape(trail.projectAvailability)}
            </div>
            ${searchUnavailable ? '<div class="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900"><b>Google Search đang hết hạn mức riêng.</b> Lịch trình ngoài dự án được tạo từ kiến thức của Gemini, chưa được kiểm chứng trực tiếp trên web; hãy kiểm tra lại trước chuyến đi.</div>' : ''}
            <div class="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs text-indigo-900">
                <p class="font-bold mb-1">💡 Căn cứ đề xuất</p><p>${ctAiEscape(trail.reasoning)}</p>
            </div>
            <div class="space-y-4" id="ai-steps-container">
                ${trail.steps.map((step, index) => `
                    <div class="flex gap-4 items-start">
                        <span class="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs shrink-0">${index + 1}</span>
                        <div class="bg-gray-50 p-4 rounded-2xl flex-1 border border-gray-100">
                            <span class="text-xs font-bold text-brand-600">${ctAiEscape(step.time)}</span>
                            <h5 class="font-bold text-gray-900">${ctAiEscape(step.spot)}</h5>
                            <p class="text-xs text-gray-700">${ctAiEscape(step.activity)}</p>
                            <p class="text-xs text-gray-500 mt-1">${ctAiEscape(step.description)}</p>
                            ${step.estimatedCost ? `<p class="text-xs text-emerald-700 mt-1">Chi phí: ${ctAiEscape(step.estimatedCost)}</p>` : ''}
                        </div>
                    </div>`).join('')}
            </div>
            ${limitations ? `<div class="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900"><b>Giới hạn dữ liệu:</b><ul class="list-disc ml-5 mt-1">${limitations}</ul></div>` : ''}
            ${groundingSources ? `<div class="p-4 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-sky-900"><b>Nguồn web tham khảo:</b><ul class="list-disc ml-5 mt-1 break-all">${groundingSources}</ul></div>` : ''}
            <div id="ai-edit-box" class="hidden p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <label class="block text-xs font-bold text-gray-700 mb-2">Chỉnh sửa tiêu đề trước khi lưu:</label>
                <input type="text" id="ai-edit-title-input" class="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm">
            </div>
            <div class="pt-4 border-t border-gray-100 flex flex-wrap gap-2.5 justify-end">
                <button type="button" id="ct-ai-edit-trail" class="px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs">✏️ Chỉnh sửa</button>
                <button type="button" id="ct-ai-regenerate-trail" class="px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs">🔄 Tạo lại</button>
                <button type="button" id="btn-save-ai-trail" class="px-5 py-2.5 bg-brand-600 text-white font-bold rounded-xl text-xs">💾 Lưu lịch trình</button>
            </div>
        </div>`;
    const titleInput = document.getElementById('ai-edit-title-input');
    titleInput.value = trail.title;
    document.getElementById('ct-ai-edit-trail').onclick = window.toggleEditAiTrail;
    document.getElementById('ct-ai-regenerate-trail').onclick = () => window.runAiTrailGenerator(document.getElementById('ai-input')?.value || '');
    document.getElementById('btn-save-ai-trail').onclick = () => {
        if (titleInput.value.trim()) trail.title = titleInput.value.trim();
        window.saveAiTrailToMyTrails(trail);
    };
}

window.runAiTrailGenerator = async function (promptText) {
    if (ctAiBusy.has('trail')) return;
    const raw = String(promptText || '').trim();
    const loading = document.getElementById('ai-loading');
    const result = document.getElementById('ai-results');
    const errorBox = document.getElementById('ai-error');
    if (!raw || raw.length < 8) {
        ctAiShowError(errorBox, new Error('Hãy mô tả rõ sở thích, thời lượng, địa điểm hoặc ngân sách mong muốn.'), () => window.runAiTrailGenerator(document.getElementById('ai-input')?.value || ''));
        return;
    }
    if (errorBox) errorBox.classList.add('hidden');
    if (result) result.classList.add('hidden');
    if (loading) loading.classList.remove('hidden');
    ctAiSetBusy('trail', true);
    try {
        const context = await window.CultureTrailAiData.getContext({ query: raw, purpose: 'trail' });
        const trail = ctAiValidateTrail(await window.GeminiService.generateJson({
            prompt: `Lập lịch trình theo yêu cầu: "${raw}". Trước hết so sánh điểm đến người dùng yêu cầu với projectCatalog. Nếu CultureTrail có dữ liệu phù hợp, ưu tiên dữ liệu dự án. Nếu điểm đến không có trong projectCatalog, dùng Google Search để vẫn lập lịch trình hữu ích, đặt dataScope là EXTERNAL hoặc MIXED và projectAvailability phải nói rõ CultureTrail hiện chưa có chuyến đi/dịch vụ cho điểm đến đó. Không biến dữ liệu web thành dịch vụ CultureTrail. Với giá vé/giờ mở cửa bên ngoài, nêu là tham khảo và cần kiểm tra lại. Không tuyên bố tối ưu quãng đường nếu không đủ tọa độ. sourceIds chỉ chứa ID thật từ DATA_CONTEXT, không tự tạo ID.`,
            context,
            schema: CT_TRAIL_SCHEMA,
            requestKey: `trail:${raw}:${context.revision}`,
            useGoogleSearch: !context.coverage?.hasProjectMatch
        }));
        ctAiRenderTrail(trail, result);
    } catch (error) {
        ctAiShowError(errorBox, error, () => window.runAiTrailGenerator(raw));
    } finally {
        if (loading) loading.classList.add('hidden');
        ctAiSetBusy('trail', false);
    }
};

window.runGeminiAiGenerator = function () {
    return window.runAiTrailGenerator(document.getElementById('ai-input')?.value || '');
};

window.saveAiTrailToMyTrails = function (trail) {
    if (!trail || !Array.isArray(trail.steps)) return;
    const trails = getStore('trails');
    trails.unshift({
        id: `TR-${Date.now()}`,
        title: trail.title,
        duration: trail.duration,
        steps: trail.steps.map(step => step.spot),
        itinerary: trail.steps,
        estimatedBudget: trail.estimatedBudget || '',
        projectAvailability: trail.projectAvailability,
        dataScope: trail.dataScope,
        searchUnavailable: Boolean(trail._searchUnavailable),
        aiReasoning: trail.reasoning || '',
        limitations: trail.limitations || [],
        sourceIds: trail.sourceIds || [],
        generatedBy: window.CULTURETRAIL_GEMINI_CONFIG?.model || 'gemini-3.5-flash-lite',
        createdAt: new Date().toISOString().slice(0, 10)
    });
    setStore('trails', trails);
    showToast('Đã lưu lịch trình Gemini vào Lịch trình của tôi.', 'success');
    renderMySavedTrails();
};

const CT_REVIEW_SCHEMA = {
    type: 'OBJECT',
    required: ['score', 'summary', 'completeness', 'consistency', 'relevance', 'highlights', 'warnings', 'evidence', 'limitations'],
    properties: {
        score: { type: 'INTEGER' },
        summary: { type: 'STRING' },
        completeness: { type: 'STRING' },
        consistency: { type: 'STRING' },
        relevance: { type: 'STRING' },
        highlights: { type: 'ARRAY', items: { type: 'STRING' } },
        warnings: { type: 'ARRAY', items: { type: 'STRING' } },
        evidence: { type: 'ARRAY', items: { type: 'STRING' } },
        limitations: { type: 'ARRAY', items: { type: 'STRING' } }
    }
};

function ctAiValidateReview(review) {
    const score = Number(review && review.score);
    if (!review || !Number.isFinite(score) || !review.summary || !review.completeness
        || !review.consistency || !review.relevance || !Array.isArray(review.highlights)
        || review.highlights.length !== 3 || !Array.isArray(review.warnings)
        || !Array.isArray(review.evidence) || !Array.isArray(review.limitations)) {
        throw new Error('Gemini trả về kết quả thẩm định thiếu trường bắt buộc. Vui lòng thử lại.');
    }
    return review;
}

function ctAiRenderReview(postId, review, display) {
    const score = Math.max(0, Math.min(100, Number(review.score) || 0));
    const highlights = (review.highlights || []).slice(0, 3);
    while (highlights.length < 3) highlights.push('Chưa đủ dữ liệu để xác định điểm nhấn này.');
    review.score = score;
    review.highlights = highlights;
    ctAiLastReview = { postId, review };
    display.innerHTML = `
        <div class="bg-gradient-to-br from-indigo-50/70 to-brand-50/70 border border-brand-200 p-5 rounded-2xl shadow-sm space-y-4 animate-fade-in">
            <div class="flex items-center justify-between"><span class="text-xs font-bold text-brand-800">✨ GEMINI ĐÃ THẨM ĐỊNH</span><span class="font-extrabold text-brand-700">${score}/100</span></div>
            <p class="text-sm text-gray-700">${ctAiEscape(review.summary)}</p>
            <div class="grid sm:grid-cols-3 gap-2 text-xs">
                <div class="p-3 bg-white rounded-xl"><b>Đầy đủ:</b> ${ctAiEscape(review.completeness)}</div>
                <div class="p-3 bg-white rounded-xl"><b>Nhất quán:</b> ${ctAiEscape(review.consistency)}</div>
                <div class="p-3 bg-white rounded-xl"><b>Phù hợp:</b> ${ctAiEscape(review.relevance)}</div>
            </div>
            ${(review.warnings || []).length ? `<div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs"><b>Cảnh báo:</b><ul class="list-disc ml-5">${review.warnings.map(item => `<li>${ctAiEscape(item)}</li>`).join('')}</ul></div>` : ''}
            <div><label for="ai-curator-highlights" class="text-xs font-bold text-gray-800">3 điểm nhấn văn hóa (có thể chỉnh sửa):</label><textarea id="ai-curator-highlights" rows="5" class="w-full mt-2 p-3 bg-white border border-gray-300 rounded-xl text-xs"></textarea></div>
            <div class="p-3 bg-white rounded-xl border border-indigo-100 text-xs"><b>Căn cứ:</b><ul class="list-disc ml-5">${(review.evidence || []).map(item => `<li>${ctAiEscape(item)}</li>`).join('')}</ul></div>
            ${(review.limitations || []).length ? `<p class="text-xs text-gray-500"><b>Giới hạn:</b> ${ctAiEscape(review.limitations.join(' '))}</p>` : ''}
            <div class="pt-2 border-t border-brand-100 flex flex-wrap gap-2 justify-end">
                <button type="button" id="ct-ai-review-retry" class="px-4 py-2 bg-gray-100 rounded-xl text-xs font-bold">🔄 Thẩm định lại</button>
                <button type="button" id="ct-ai-review-apply" class="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">Áp dụng điểm nhấn & phê duyệt</button>
            </div>
            <p class="text-[11px] text-gray-500">Gemini chỉ hỗ trợ thẩm định; quyết định phê duyệt chỉ xảy ra khi quản trị viên bấm nút.</p>
        </div>`;
    document.getElementById('ai-curator-highlights').value = highlights.map(item => `• ${item}`).join('\n');
    document.getElementById('ct-ai-review-retry').onclick = () => window.runAiStoryReview(postId, false);
    document.getElementById('ct-ai-review-apply').onclick = () => window.applyAiHighlightsAndApprove(postId);
}

window.runAiStoryReview = async function (postId, isUncertaintyTest = false) {
    if (ctAiBusy.has('review')) return;
    currentReviewPostId = postId;
    const loading = document.getElementById('curator-ai-loading');
    const display = document.getElementById('curator-ai-display');
    if (!display) return;
    if (loading) loading.classList.remove('hidden');
    display.innerHTML = '';
    ctAiSetBusy('review', true);
    try {
        const context = await window.CultureTrailAiData.getContext({ purpose: 'review', targetId: postId });
        if (context.error) throw new Error(context.error);
        const review = ctAiValidateReview(await window.GeminiService.generateJson({
            prompt: `Đọc kỹ bài viết được chọn và thẩm định dựa trên dữ liệu đối chiếu. Cho đúng 3 điểm nhấn riêng của bài. Không khẳng định bản quyền hay tính xác thực ngoài dữ liệu.${isUncertaintyTest ? ' Hãy đặc biệt chỉ ra mọi điểm thiếu dữ liệu và bất định.' : ''}`,
            context,
            schema: CT_REVIEW_SCHEMA,
            requestKey: `review:${postId}:${context.revision}:${isUncertaintyTest}`
        }));
        ctAiRenderReview(postId, review, display);
    } catch (error) {
        ctAiShowError(display, error, () => window.runAiStoryReview(postId, isUncertaintyTest));
    } finally {
        if (loading) loading.classList.add('hidden');
        ctAiSetBusy('review', false);
    }
};

window.applyAiHighlightsAndApprove = function (postId) {
    if (!ctAiLastReview || ctAiLastReview.postId !== postId) {
        showToast('Chưa có kết quả thẩm định Gemini hợp lệ cho bài viết này.', 'error');
        return;
    }
    const highlights = document.getElementById('ai-curator-highlights')?.value.trim() || '';
    const score = ctAiLastReview.review.score;
    const post = posts.find(item => item.id === postId);
    if (post) {
        Object.assign(post, { status: 'approved', aiHighlights: highlights, qualityScore: score, aiReview: ctAiLastReview.review });
        savePosts();
    }
    const stories = getStore('stories');
    const index = stories.findIndex(item => item.id === postId);
    if (index >= 0) {
        stories[index] = { ...stories[index], status: 'approved', aiHighlights: highlights, qualityScore: score, aiReview: ctAiLastReview.review };
        setStore('stories', stories);
    }
    showToast('Quản trị viên đã áp dụng điểm nhấn và phê duyệt bài viết.', 'success');
    switchView('view-adm-dash');
};

const CT_ADMIN_SCHEMA = {
    type: 'OBJECT',
    required: ['summary', 'metrics', 'observations', 'recommendations', 'limitations', 'evidence'],
    properties: {
        summary: { type: 'STRING' },
        metrics: { type: 'ARRAY', items: { type: 'OBJECT', required: ['label', 'value', 'basis'], properties: { label: { type: 'STRING' }, value: { type: 'STRING' }, basis: { type: 'STRING' } } } },
        observations: { type: 'ARRAY', items: { type: 'STRING' } },
        recommendations: { type: 'ARRAY', items: { type: 'STRING' } },
        limitations: { type: 'ARRAY', items: { type: 'STRING' } },
        evidence: { type: 'ARRAY', items: { type: 'STRING' } }
    }
};

function ctAiValidateAdminReport(report) {
    if (!report || !report.summary || !Array.isArray(report.metrics)
        || !report.metrics.every(metric => metric && metric.label && metric.value && metric.basis)
        || !Array.isArray(report.observations) || !Array.isArray(report.recommendations)
        || !Array.isArray(report.limitations) || !Array.isArray(report.evidence)) {
        throw new Error('Gemini trả về báo cáo quản trị thiếu trường bắt buộc. Vui lòng thử lại.');
    }
    return report;
}

function ctAiRenderAdmin(report, display) {
    ctAiLastAdminReport = report;
    display.classList.remove('hidden');
    display.innerHTML = `
        <div class="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 animate-fade-in">
            <div><span class="text-xs font-bold text-brand-700">✨ PHÂN TÍCH GEMINI TỪ DỮ LIỆU HIỆN HÀNH</span><p class="mt-2 text-sm text-gray-700">${ctAiEscape(report.summary)}</p></div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">${(report.metrics || []).slice(0, 6).map(metric => `<div class="p-4 bg-brand-50 border border-brand-100 rounded-2xl"><p class="text-xs font-bold text-brand-700">${ctAiEscape(metric.label)}</p><p class="text-2xl font-extrabold text-brand-900 mt-1">${ctAiEscape(metric.value)}</p><p class="text-[11px] text-gray-600 mt-1">${ctAiEscape(metric.basis)}</p></div>`).join('')}</div>
            <div class="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs"><b>Nhận xét có thể suy ra:</b><ul class="list-disc ml-5 mt-1">${(report.observations || []).map(item => `<li>${ctAiEscape(item)}</li>`).join('')}</ul></div>
            <div><label for="admin-ai-plan-text" class="text-xs font-bold text-gray-800">Khuyến nghị quản trị (có thể chỉnh sửa):</label><textarea id="admin-ai-plan-text" rows="6" class="w-full mt-2 p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs"></textarea></div>
            <div class="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs"><b>Giới hạn:</b><ul class="list-disc ml-5 mt-1">${(report.limitations || []).map(item => `<li>${ctAiEscape(item)}</li>`).join('')}</ul></div>
            <div class="text-xs text-gray-600"><b>Căn cứ:</b> ${ctAiEscape((report.evidence || []).join(' • '))}</div>
            <div class="pt-3 border-t border-gray-100 flex flex-wrap gap-2.5 justify-end"><button type="button" id="ct-ai-admin-retry" class="px-4 py-2.5 bg-gray-100 rounded-xl text-xs font-bold">🔄 Phân tích lại</button><button type="button" onclick="exportAiReportJson()" class="px-4 py-2.5 bg-brand-50 text-brand-700 rounded-xl text-xs font-bold">📥 Xuất JSON</button><button type="button" onclick="saveAiAdminPlan()" class="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold">💾 Lưu kế hoạch</button></div>
        </div>`;
    document.getElementById('admin-ai-plan-text').value = (report.recommendations || []).map((item, index) => `${index + 1}. ${item}`).join('\n');
    document.getElementById('ct-ai-admin-retry').onclick = () => window.runAiAdminAnalytics(false);
}

window.runAiAdminAnalytics = async function (isFailureTest = false) {
    if (ctAiBusy.has('admin')) return;
    const loading = document.getElementById('admin-ai-loading');
    const display = document.getElementById('admin-ai-results');
    const errorBox = document.getElementById('admin-ai-error');
    if (!display) return;
    if (loading) loading.classList.remove('hidden');
    display.classList.add('hidden');
    if (errorBox) errorBox.classList.add('hidden');
    ctAiSetBusy('admin', true);
    try {
        const domain = document.getElementById('admin-ai-domain')?.value || 'Toàn bộ hệ thống di sản';
        const timeframe = document.getElementById('admin-ai-timeframe')?.value || 'Khoảng thời gian hiện tại';
        const context = await window.CultureTrailAiData.getContext({ query: domain, purpose: 'admin' });
        const report = ctAiValidateAdminReport(await window.GeminiService.generateJson({
            prompt: `Phân tích quản trị cho phạm vi "${domain}", mốc "${timeframe}". Chỉ nêu số liệu tính trực tiếp được từ DATA_CONTEXT. Không tạo phần trăm tăng trưởng, công suất, độ tin cậy hoặc dự báo nếu thiếu dữ liệu chuỗi thời gian.${isFailureTest ? ' Tập trung đánh giá thiếu hụt dữ liệu và nói rõ điều không thể kết luận.' : ''}`,
            context,
            schema: CT_ADMIN_SCHEMA,
            requestKey: `admin:${domain}:${timeframe}:${context.revision}:${isFailureTest}`
        }));
        ctAiRenderAdmin(report, display);
    } catch (error) {
        ctAiShowError(errorBox || display, error, () => window.runAiAdminAnalytics(isFailureTest));
    } finally {
        if (loading) loading.classList.add('hidden');
        ctAiSetBusy('admin', false);
    }
};

window.saveAiAdminPlan = function () {
    if (!ctAiLastAdminReport) {
        showToast('Chưa có báo cáo Gemini để lưu.', 'error');
        return;
    }
    const domain = document.getElementById('admin-ai-domain')?.value || 'Toàn bộ hệ thống di sản';
    const timeframe = document.getElementById('admin-ai-timeframe')?.value || '';
    const recommendations = document.getElementById('admin-ai-plan-text')?.value.trim() || '';
    const plans = getStore('admin_plans');
    plans.unshift({
        id: `AP-${Date.now()}`,
        title: `Kế hoạch: ${domain}`,
        timeframe,
        domain,
        recommendations,
        analysis: ctAiLastAdminReport,
        generatedBy: window.CULTURETRAIL_GEMINI_CONFIG?.model || 'gemini-3.5-flash-lite',
        savedAt: new Date().toISOString().slice(0, 10)
    });
    setStore('admin_plans', plans);
    showToast('Đã lưu báo cáo Gemini sau khi quản trị viên xác nhận.', 'success');
    renderAdminSavedPlans();
};

window.exportAiReportJson = function () {
    const exportData = { currentReport: ctAiLastAdminReport, savedPlans: getStore('admin_plans'), exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `CultureTrail_Gemini_Analytics_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
    showToast('Đã xuất báo cáo JSON.', 'info');
};

// Refresh legacy screen state after the asynchronous JSON seed completes.
// This closes the old race where app.js inserted unrelated hard-coded records
// before assets/data/*.json could load.
if (window.ApiService && window.ApiService.ready) {
    window.ApiService.ready.then(initialized => {
        if (!initialized) return;
        posts = window.ApiService.get('posts');
        const storedCreators = window.ApiService.getCreators();
        storedCreators.forEach(creator => {
            creators[creator.id] = {
                ...creator,
                role: creator.title || 'Nghệ nhân văn hóa',
                craft: creator.title || 'Thủ công truyền thống',
                cover: creator.cover || '1018'
            };
            profiles[creator.id] = creators[creator.id];
        });
        if (document.getElementById('public-posts-container')) renderPublicPosts();
        if (document.getElementById('creator-list-container')) renderCreatorList();
        if (document.getElementById('creator-posts-container')) renderCreatorManagePosts();
        if (document.getElementById('admin-posts-container')) renderAdminPosts();
        if (document.getElementById('admin-creators-container')) renderAdminCreators();
        if (document.getElementById('my-saved-trails-list')) renderMySavedTrails();
        if (document.getElementById('admin-saved-plans-container')) renderAdminSavedPlans();
    });
}
