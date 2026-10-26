/**
 * Copy this file to gemini-config.local.js, then paste the demo API key below.
 * Never commit the local file. A frontend key is visible to every browser user,
 * so this setup is suitable only for a controlled local demonstration.
 */
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";
const GEMINI_MODEL = "gemini-3.5-flash-lite";

window.CULTURETRAIL_GEMINI_CONFIG = Object.freeze({
    apiKey: GEMINI_API_KEY,
    model: GEMINI_MODEL,
    enableGoogleSearch: true,
    timeoutMs: 30000
});

