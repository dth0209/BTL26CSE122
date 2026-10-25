/**
 * assets/js/api.js - Tầng kiến trúc dữ liệu tập trung (CultureTrail BTL-26)
 * Quản lý lưu trữ bền vững qua localStorage, hỗ trợ đồng bộ tab realtime qua sự kiện storage.
 */

const DB_KEYS = {
    stories: 'ct_stories',
    places: 'ct_places',
    creators: 'ct_creators',
    events: 'ct_events',
    collections: 'ct_collections',
    trails: 'ct_trails',
    currentUser: 'ct_current_user',
    currentRole: 'ct_current_role'
};

const ApiService = {
    async init() {
        try {
            // Kiểm tra và nạp dữ liệu từ các file JSON mẫu nếu chưa có trong localStorage
            var inPages = window.location.pathname.replace(/\\\\/g, '/').indexOf('/pages/') !== -1; var prefix = inPages ? '../' : '';
            await this._loadEntity('stories', prefix + 'assets/data/stories.json', DB_KEYS.stories);
            await this._loadEntity('places', prefix + 'assets/data/places.json', DB_KEYS.places);
            await this._loadEntity('creators', prefix + 'assets/data/creators.json', DB_KEYS.creators);
            
            // Khởi tạo các entity mẫu bổ sung nếu chưa tồn tại
            if (!localStorage.getItem(DB_KEYS.events)) {
                localStorage.setItem(DB_KEYS.events, JSON.stringify([
                    { id: 'event-1', title: 'Workshop Trải nghiệm vuốt gốm Bát Tràng', artisan: 'Trần Văn Hùng', date: '2026-04-10', slots: 15, price: '150.000đ', status: 'upcoming' },
                    { id: 'event-2', title: 'Khám phá kỹ thuật dệt lụa Vạn Phúc', artisan: 'Nguyễn Thị Tâm', date: '2026-04-12', slots: 10, price: '200.000đ', status: 'upcoming' }
                ]));
            }
            if (!localStorage.getItem(DB_KEYS.collections)) {
                localStorage.setItem(DB_KEYS.collections, JSON.stringify([
                    { id: 'col-1', title: 'Tinh hoa Làng nghề Tràng An', desc: 'Bộ sưu tập các câu chuyện đặc sắc về gốm và lụa thủ công.', storyIds: ['story-1', 'story-2'], cover: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80' }
                ]));
            }
            if (!localStorage.getItem(DB_KEYS.trails)) {
                localStorage.setItem(DB_KEYS.trails, JSON.stringify([
                    { id: 'trail-1', title: 'Hành trình di sản Phố cổ & Làng nghề', duration: '1 Ngày', places: ['place-1', 'place-2'], notes: 'Trải nghiệm trọn vẹn tinh hoa thủ công truyền thống.' }
                ]));
            }

            console.log("✅ ApiService initialized successfully.");
        } catch (error) {
            console.error("❌ Error initializing ApiService:", error);
        } finally {
            // Lắng nghe sự kiện storage để đồng bộ realtime giữa các tab
            window.addEventListener('storage', (e) => {
                console.log(`🔄 Storage updated for key: ${e.key}`);
                window.dispatchEvent(new CustomEvent('ct-data-updated', { detail: { key: e.key } }));
            });
        }
    },

    async _loadEntity(name, jsonPath, storageKey) {
        if (!localStorage.getItem(storageKey)) {
            try {
                const response = await fetch(jsonPath);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                localStorage.setItem(storageKey, JSON.stringify(data));
            } catch (err) {
                console.warn(`Could not load ${jsonPath}, using default empty array.`, err);
                localStorage.setItem(storageKey, JSON.stringify([]));
            }
        }
    },

    // --- STORIES CRUD ---
    getStories() {
        try { return JSON.parse(localStorage.getItem(DB_KEYS.stories)) || []; } catch(e) { return []; }
    },
    saveStories(stories) {
        localStorage.setItem(DB_KEYS.stories, JSON.stringify(stories));
        window.dispatchEvent(new CustomEvent('ct-data-updated', { detail: { key: DB_KEYS.stories } }));
    },
    createStory(story) {
        const stories = this.getStories();
        story.id = 'story-' + Date.now();
        story.createdAt = new Date().toISOString();
        stories.unshift(story);
        this.saveStories(stories);
        return story;
    },
    updateStory(updatedStory) {
        let stories = this.getStories();
        stories = stories.map(s => s.id === updatedStory.id ? { ...s, ...updatedStory } : s);
        this.saveStories(stories);
    },
    deleteStory(id) {
        let stories = this.getStories();
        stories = stories.filter(s => s.id !== id);
        this.saveStories(stories);
    },

    // --- PLACES ---
    getPlaces() {
        try { return JSON.parse(localStorage.getItem(DB_KEYS.places)) || []; } catch(e) { return []; }
    },

    // --- CREATORS ---
    getCreators() {
        try { return JSON.parse(localStorage.getItem(DB_KEYS.creators)) || []; } catch(e) { return []; }
    },

    // --- EVENTS ---
    getEvents() {
        try { return JSON.parse(localStorage.getItem(DB_KEYS.events)) || []; } catch(e) { return []; }
    },
    saveEvents(events) {
        localStorage.setItem(DB_KEYS.events, JSON.stringify(events));
    },

    // --- COLLECTIONS ---
    getCollections() {
        try { return JSON.parse(localStorage.getItem(DB_KEYS.collections)) || []; } catch(e) { return []; }
    },
    saveCollections(cols) {
        localStorage.setItem(DB_KEYS.collections, JSON.stringify(cols));
    },

    // --- TRAILS ---
    getTrails() {
        try { return JSON.parse(localStorage.getItem(DB_KEYS.trails)) || []; } catch(e) { return []; }
    },
    saveTrails(trails) {
        localStorage.setItem(DB_KEYS.trails, JSON.stringify(trails));
    }
};

// Tự động khởi tạo khi tài liệu sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    ApiService.init();
});
