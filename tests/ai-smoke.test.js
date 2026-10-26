const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const storage = new Map();
const listeners = new Map();
let geminiRequest = null;

global.window = global;
global.location = { pathname: '/index.html' };
global.localStorage = {
    getItem: key => storage.has(key) ? storage.get(key) : null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: key => storage.delete(key)
};
global.CustomEvent = class CustomEvent {
    constructor(type, init) { this.type = type; this.detail = init && init.detail; }
};
global.addEventListener = (type, handler) => {
    const group = listeners.get(type) || [];
    group.push(handler);
    listeners.set(type, group);
};
global.dispatchEvent = event => (listeners.get(event.type) || []).forEach(handler => handler(event));

global.fetch = async (url, options = {}) => {
    if (String(url).startsWith('assets/data/')) {
        const data = JSON.parse(fs.readFileSync(path.join(root, String(url)), 'utf8'));
        return { ok: true, status: 200, json: async () => data };
    }
    geminiRequest = { url: String(url), options };
    return {
        ok: true,
        status: 200,
        json: async () => ({ candidates: [{ content: { parts: [{ text: 'Phản hồi kiểm thử' }] } }] })
    };
};

function load(relativePath) {
    vm.runInThisContext(fs.readFileSync(path.join(root, relativePath), 'utf8'), { filename: relativePath });
}

(async () => {
    load('assets/js/api.js');
    assert.equal(await ApiService.ready, true);
    assert.equal(ApiService.getStories().length, 5, 'stories.json must seed ct_stories');
    assert.equal(ApiService.getPlaces().length, 5, 'places.json must seed ct_places');
    assert.equal(ApiService.getCreators().length, 5, 'creators.json must seed ct_creators');
    assert.equal(ApiService.get('posts').length, 5, 'ct_posts must share the first-run story seed');
    assert.ok(ApiService.get('posts')[0].image, 'first-run posts must be normalized for the legacy UI');

    const preserved = [{ id: 'user-story', title: 'Dữ liệu người dùng' }];
    ApiService.saveStories(preserved);
    await ApiService.init();
    assert.deepEqual(ApiService.getStories(), preserved, 'initialization must not overwrite existing LocalStorage');

    load('assets/js/ai-data-context.js');
    const context = await CultureTrailAiData.getContext({ query: 'Bát Tràng', purpose: 'chat' });
    assert.equal(JSON.stringify(context).includes('0901234567'), false, 'phone numbers must not enter AI context');
    const externalContext = await CultureTrailAiData.getContext({ query: 'Tôi muốn đi Ba Vì', purpose: 'chat' });
    assert.equal(externalContext.coverage.hasProjectMatch, false, 'an unknown destination must be marked outside project coverage');
    assert.ok(externalContext.projectCatalog.placeNames.includes('Làng cổ Gốm sứ Bát Tràng'));

    window.CULTURETRAIL_GEMINI_CONFIG = { apiKey: 'test-key', model: 'gemini-3.5-flash-lite', enableGoogleSearch: true, timeoutMs: 1000 };
    load('assets/js/gemini-service.js');
    const reply = await GeminiService.generateText({ prompt: 'Kiểm thử', context: {}, requestKey: 'smoke' });
    assert.equal(reply, 'Phản hồi kiểm thử');
    assert.equal(geminiRequest.url.includes('?key='), false, 'API key must not be placed in URL');
    assert.equal(geminiRequest.options.headers['x-goog-api-key'], 'test-key');
    assert.match(geminiRequest.url, /gemini-3\.5-flash-lite:generateContent$/);
    assert.equal(geminiRequest.options.body.includes('test-key'), false, 'API key must not enter request body');
    assert.deepEqual(JSON.parse(geminiRequest.options.body).tools, [{ google_search: {} }], 'chat must enable Google Search grounding');

    global.fetch = async (url, options) => {
        geminiRequest = { url: String(url), options };
        return {
            ok: true,
            status: 200,
            json: async () => ({
                candidates: [{
                    content: { parts: [{ text: 'Ba Vì có nhiều điểm tham quan.' }] },
                    groundingMetadata: { groundingChunks: [{ web: { title: 'Nguồn Ba Vì', uri: 'https://example.com/ba-vi' } }] }
                }]
            })
        };
    };
    const groundedReply = await GeminiService.generateText({ prompt: 'Đi Ba Vì', context: externalContext, requestKey: 'grounded' });
    assert.match(groundedReply, /Nguồn tham khảo bên ngoài CultureTrail/);
    assert.match(groundedReply, /https:\/\/example\.com\/ba-vi/);

    let fallbackCalls = 0;
    global.fetch = async (url, options) => {
        fallbackCalls += 1;
        const hasSearchTool = Boolean(JSON.parse(options.body).tools);
        if (hasSearchTool) {
            return { ok: false, status: 429, json: async () => ({ error: { status: 'RESOURCE_EXHAUSTED' } }) };
        }
        return {
            ok: true,
            status: 200,
            json: async () => ({ candidates: [{ content: { parts: [{ text: 'Kiến thức Gemini dự phòng.' }] } }] })
        };
    };
    const fallbackReply = await GeminiService.generateText({ prompt: 'Ba Vì khi Search hết quota', context: externalContext, requestKey: 'search-fallback' });
    assert.equal(fallbackCalls, 2, 'search quota failure must retry exactly once without Google Search');
    assert.match(fallbackReply, /Google Search grounding đang hết hạn mức riêng/);
    assert.match(fallbackReply, /Kiến thức Gemini dự phòng/);

    global.fetch = async () => ({
        ok: false,
        status: 400,
        json: async () => ({ error: { message: 'API key not valid' } })
    });
    await assert.rejects(
        GeminiService.generateText({ prompt: 'invalid key', context: {}, requestKey: 'invalid-key' }),
        error => error.code === 'AUTH' && !error.message.includes('test-key')
    );

    global.fetch = async () => ({ ok: false, status: 429, json: async () => ({}) });
    await assert.rejects(
        GeminiService.generateText({ prompt: 'quota', context: {}, requestKey: 'quota' }),
        error => error.code === 'QUOTA'
    );

    console.log('AI smoke tests passed.');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
