/**
 * CultureTrail data service: JSON seeds on first run, then LocalStorage is the
 * single current source. Existing user data is never overwritten at startup.
 */
(function () {
    'use strict';

    const DB_KEYS = Object.freeze({
        stories: 'ct_stories',
        places: 'ct_places',
        creators: 'ct_creators',
        events: 'ct_events',
        collections: 'ct_collections',
        trails: 'ct_trails',
        posts: 'ct_posts',
        adminPlans: 'ct_admin_plans',
        currentUser: 'ct_current_user',
        currentRole: 'ct_current_role'
    });

    const DEFAULTS = Object.freeze({
        events: [
            { id: 'event-1', title: 'Workshop Trải nghiệm vuốt gốm Bát Tràng', creatorId: 'creator-1', placeId: 'place-1', date: '2026-04-10', time: '09:00 - 11:30', slots: 15, price: '150.000đ', status: 'upcoming' },
            { id: 'event-2', title: 'Khám phá kỹ thuật dệt lụa Vạn Phúc', creatorId: 'creator-2', placeId: 'place-2', date: '2026-04-12', time: '14:00 - 16:30', slots: 10, price: '200.000đ', status: 'upcoming' }
        ],
        collections: [
            { id: 'col-1', title: 'Tinh hoa Làng nghề Tràng An', desc: 'Bộ sưu tập các câu chuyện đặc sắc về gốm và lụa thủ công.', storyIds: ['story-1', 'story-2'], cover: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80' }
        ],
        trails: [
            { id: 'trail-1', title: 'Hành trình di sản Phố cổ & Làng nghề', duration: '1 ngày', placeIds: ['place-1', 'place-2'], steps: ['Làng cổ Gốm sứ Bát Tràng', 'Làng lụa Vạn Phúc'], notes: 'Trải nghiệm tinh hoa thủ công truyền thống.' }
        ],
        admin_plans: []
    });

    function pathPrefix() {
        return window.location.pathname.replace(/\\/g, '/').includes('/pages/') ? '../' : '';
    }

    function emit(key) {
        window.dispatchEvent(new CustomEvent('ct-data-updated', { detail: { key } }));
    }

    function readStorage(storageKey) {
        try {
            const value = JSON.parse(localStorage.getItem(storageKey) || '[]');
            return Array.isArray(value) ? value : [];
        } catch (_) {
            return [];
        }
    }

    const ApiService = {
        async init() {
            await Promise.all([
                this._loadEntity(pathPrefix() + 'assets/data/stories.json', DB_KEYS.stories),
                this._loadEntity(pathPrefix() + 'assets/data/places.json', DB_KEYS.places),
                this._loadEntity(pathPrefix() + 'assets/data/creators.json', DB_KEYS.creators)
            ]);

            // The legacy screens call their editable workflow collection
            // "posts". Seed it once from the same stories JSON so UI and AI
            // begin with identical content, then preserve its own CRUD state.
            if (localStorage.getItem(DB_KEYS.posts) === null) {
                const placesById = new Map(this.getPlaces().map(place => [place.id, place]));
                const initialPosts = this.getStories().map(story => ({
                    ...story,
                    image: story.image || placesById.get(story.placeId)?.imageUrl || ''
                }));
                localStorage.setItem(DB_KEYS.posts, JSON.stringify(initialPosts));
                emit(DB_KEYS.posts);
            }

            this._seedIfMissing('events', DB_KEYS.events);
            this._seedIfMissing('collections', DB_KEYS.collections);
            this._seedIfMissing('trails', DB_KEYS.trails);
            this._seedIfMissing('admin_plans', DB_KEYS.adminPlans);
            return true;
        },

        async _loadEntity(jsonPath, storageKey) {
            if (localStorage.getItem(storageKey) !== null) return;
            const response = await fetch(jsonPath, { cache: 'no-store' });
            if (!response.ok) throw new Error(`Không tải được ${jsonPath} (HTTP ${response.status}).`);
            const data = await response.json();
            if (!Array.isArray(data)) throw new Error(`${jsonPath} không chứa một mảng JSON hợp lệ.`);
            // Re-check after await so a concurrent tab/user write always wins.
            if (localStorage.getItem(storageKey) === null) {
                localStorage.setItem(storageKey, JSON.stringify(data));
                emit(storageKey);
            }
        },

        _seedIfMissing(name, storageKey) {
            if (localStorage.getItem(storageKey) === null) {
                localStorage.setItem(storageKey, JSON.stringify(DEFAULTS[name] || []));
                emit(storageKey);
            }
        },

        get(entity) {
            const storageKey = DB_KEYS[entity] || `ct_${entity}`;
            return readStorage(storageKey);
        },

        save(entity, data) {
            const storageKey = DB_KEYS[entity] || `ct_${entity}`;
            localStorage.setItem(storageKey, JSON.stringify(Array.isArray(data) ? data : []));
            emit(storageKey);
        },

        getStories() { return this.get('stories'); },
        saveStories(items) { this.save('stories', items); },
        createStory(story) {
            const items = this.getStories();
            const created = { ...story, id: story.id || `story-${Date.now()}`, createdAt: story.createdAt || new Date().toISOString() };
            items.unshift(created);
            this.saveStories(items);
            return created;
        },
        updateStory(story) { this.saveStories(this.getStories().map(item => item.id === story.id ? { ...item, ...story } : item)); },
        deleteStory(id) { this.saveStories(this.getStories().filter(item => item.id !== id)); },
        getPlaces() { return this.get('places'); },
        getCreators() { return this.get('creators'); },
        getEvents() { return this.get('events'); },
        saveEvents(items) { this.save('events', items); },
        getCollections() { return this.get('collections'); },
        saveCollections(items) { this.save('collections', items); },
        getTrails() { return this.get('trails'); },
        saveTrails(items) { this.save('trails', items); }
    };

    window.DB_KEYS = DB_KEYS;
    window.ApiService = ApiService;
    ApiService.ready = ApiService.init().catch(error => {
        ApiService.initError = error;
        window.dispatchEvent(new CustomEvent('ct-data-init-error', { detail: { message: error.message } }));
        return false;
    });

    window.addEventListener('storage', event => {
        if (event.key && event.key.startsWith('ct_')) emit(event.key);
    });
}());
