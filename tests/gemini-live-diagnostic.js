/**
 * Minimal live diagnostic for the locally configured Gemini key.
 * It never prints the key or sends CultureTrail/user data.
 */
const fs = require('node:fs');
const path = require('node:path');

const configPath = path.resolve(__dirname, '../assets/js/gemini-config.local.js');
const source = fs.readFileSync(configPath, 'utf8');
const key = (source.match(/const GEMINI_API_KEY\s*=\s*["']([^"']+)["']/) || [])[1];
const model = (source.match(/const GEMINI_MODEL\s*=\s*["']([^"']+)["']/) || [])[1] || 'gemini-3.5-flash-lite';

if (!key || key === 'DAN_API_KEY_CUA_TOI_VAO_DAY') {
    console.error('Chưa có API key trong gemini-config.local.js.');
    process.exit(1);
}

const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

function safeError(payload, status) {
    const error = payload && payload.error || {};
    const serializedDetails = JSON.stringify(error.details || []).replaceAll(key, '[REDACTED]');
    return {
        httpStatus: status,
        apiStatus: error.status || '',
        message: String(error.message || 'Không có thông báo chi tiết.').replaceAll(key, '[REDACTED]').slice(0, 2500),
        details: JSON.parse(serializedDetails)
    };
}

async function call(label, withSearch) {
    const body = {
        contents: [{ role: 'user', parts: [{ text: 'Chỉ trả lời đúng một từ: OK' }] }],
        generationConfig: { maxOutputTokens: 8 }
    };
    if (withSearch) body.tools = [{ google_search: {} }];
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify(body)
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        console.log(JSON.stringify({ test: label, ok: false, ...safeError(payload, response.status) }, null, 2));
        return false;
    }
    console.log(JSON.stringify({ test: label, ok: true, httpStatus: response.status, model }, null, 2));
    return true;
}

(async () => {
    const baseWorks = await call('model-without-search', false);
    if (baseWorks) await call('model-with-google-search', true);
})().catch(error => {
    console.error(JSON.stringify({ test: 'network', ok: false, message: error.message }, null, 2));
    process.exitCode = 1;
});
