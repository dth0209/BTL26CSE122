/** Build a small, current and privacy-filtered context for each Gemini request. */
(function () {
    'use strict';

    const ENTITY_KEYS = ['stories', 'places', 'creators', 'events', 'collections', 'trails', 'posts', 'admin_plans'];
    let revision = 0;

    function read(key) {
        try {
            const value = JSON.parse(localStorage.getItem(`ct_${key}`) || '[]');
            return Array.isArray(value) ? value : [];
        } catch (_) {
            return [];
        }
    }

    function normalize(value) {
        return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    }

    function tokens(query) {
        return normalize(query).split(/[^a-z0-9]+/).filter(token => token.length > 2);
    }

    function score(item, queryTokens) {
        const haystack = normalize(JSON.stringify(item));
        return queryTokens.reduce((total, token) => total + (haystack.includes(token) ? 1 : 0), 0);
    }

    function relevant(items, query, limit) {
        const queryTokens = tokens(query);
        if (!queryTokens.length) return items.slice(0, limit);
        return items
            .map((item, index) => ({ item, index, score: score(item, queryTokens) }))
            .filter(row => row.score > 0)
            .sort((a, b) => b.score - a.score || a.index - b.index)
            .slice(0, limit)
            .map(row => row.item);
    }

    function safeCreator(creator) {
        if (!creator || typeof creator !== 'object') return creator;
        const { phone, email, address, ...safe } = creator;
        return safe;
    }

    function joinRelations(data) {
        const creators = new Map(data.creators.map(item => [item.id, item]));
        const places = new Map(data.places.map(item => [item.id, item]));
        data.stories = data.stories.map(story => ({
            ...story,
            author: safeCreator(creators.get(story.authorId || story.creatorId)),
            place: places.get(story.placeId)
        }));
        data.events = data.events.map(event => ({
            ...event,
            creator: safeCreator(creators.get(event.creatorId)),
            place: places.get(event.placeId)
        }));
        data.collections = data.collections.map(collection => ({
            ...collection,
            stories: (collection.storyIds || []).map(id => data.stories.find(story => story.id === id)).filter(Boolean)
        }));
        data.creators = data.creators.map(safeCreator);
        return data;
    }

    async function ready() {
        if (window.ApiService && window.ApiService.ready) await window.ApiService.ready;
        if (window.ApiService && window.ApiService.initError) {
            throw new Error('Không tải được dữ liệu CultureTrail. Hãy mở dự án bằng VS Code Live Server rồi thử lại.');
        }
    }

    async function getContext({ query = '', purpose = 'chat', targetId = '' } = {}) {
        await ready();
        const all = joinRelations(Object.fromEntries(ENTITY_KEYS.map(key => [key, read(key)])));
        const storyMap = new Map(all.stories.map(item => [item.id, item]));
        all.posts.forEach(item => storyMap.set(item.id, item));
        const currentStories = Array.from(storyMap.values());
        const matchedStories = relevant(currentStories, query, 6);
        const matchedPlaces = relevant(all.places, query, 6);
        const matchedCreators = relevant(all.creators, query, 5);
        const matchedEvents = relevant(all.events, query, 5);
        const matchedCollections = relevant(all.collections, query, 3);
        const matchedTrails = relevant(all.trails, query, 3);
        const matchedEntityCount = matchedStories.length + matchedPlaces.length + matchedCreators.length
            + matchedEvents.length + matchedCollections.length + matchedTrails.length;

        if (purpose === 'review') {
            const story = [...all.posts, ...all.stories].find(item => item.id === targetId);
            if (!story) return { purpose, revision, error: 'Không tìm thấy bài viết được chọn.' };
            const relatedQuery = `${story.title || ''} ${story.content || ''} ${story.tag || ''}`;
            return {
                purpose,
                revision,
                selectedStory: story,
                referenceStories: relevant(currentStories.filter(item => item.id !== targetId), relatedQuery, 4),
                places: relevant(all.places, relatedQuery, 4),
                creators: relevant(all.creators, relatedQuery, 4)
            };
        }

        if (purpose === 'admin') {
            return {
                purpose,
                revision,
                counts: Object.fromEntries(ENTITY_KEYS.map(key => [key, all[key].length])),
                statusCounts: {
                    stories: all.stories.reduce((acc, item) => { acc[item.status || 'unknown'] = (acc[item.status || 'unknown'] || 0) + 1; return acc; }, {}),
                    posts: all.posts.reduce((acc, item) => { acc[item.status || 'unknown'] = (acc[item.status || 'unknown'] || 0) + 1; return acc; }, {}),
                    events: all.events.reduce((acc, item) => { acc[item.status || 'unknown'] = (acc[item.status || 'unknown'] || 0) + 1; return acc; }, {})
                },
                stories: all.stories.slice(0, 30),
                places: all.places.slice(0, 30),
                creators: all.creators.slice(0, 30),
                events: all.events.slice(0, 30),
                trails: all.trails.slice(0, 30)
            };
        }

        return {
            purpose,
            revision,
            coverage: {
                hasProjectMatch: matchedEntityCount > 0,
                matchedEntityCount,
                note: matchedEntityCount > 0
                    ? 'CultureTrail có dữ liệu liên quan đến yêu cầu.'
                    : 'CultureTrail chưa có dữ liệu, chuyến đi hoặc dịch vụ phù hợp trực tiếp với yêu cầu.'
            },
            projectCatalog: {
                placeNames: all.places.map(item => item.name).filter(Boolean),
                trailTitles: all.trails.map(item => item.title).filter(Boolean),
                eventTitles: all.events.map(item => item.title).filter(Boolean)
            },
            stories: matchedStories,
            places: matchedPlaces,
            creators: matchedCreators,
            events: matchedEvents,
            collections: matchedCollections,
            trails: purpose === 'trail' ? matchedTrails : []
        };
    }

    window.addEventListener('storage', () => { revision += 1; });
    window.addEventListener('ct-data-updated', () => { revision += 1; });
    window.CultureTrailAiData = Object.freeze({ getContext, read, get revision() { return revision; } });
}());
