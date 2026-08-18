/**
 * North Health GPT — Client Application Logic (v5.0)
 * Brain: Gemini 3.6 Flash (text) | Voice: Gemini Live + Leda (realtime)
 * Strict mode separation: VOICE -> audio reply only | TEXT -> text reply only.
 * Controls (mode+cards+emergency) auto-hide once a conversation starts.
 * KANAL TECH (RC-8659947), Kano, Nigeria
 */

let currentMode = 'voice';
let conversationHistory = [];
let chatStarted = false;

let userLat = null;
let userLng = null;

// Mirrors the verified facilities in api/config.php — used to build the
// referral card when Leda signals a referral during a live voice turn.
const KANO_LAT = 11.9626;
const KANO_LNG = 8.5519;
const HOSPITALS = {
    maternal:     { name: 'Murtala Muhammad Specialist Hospital, Kano', q: 'Murtala Muhammad Specialist Hospital Kano' },
    newborn:      { name: 'Murtala Muhammad Specialist Hospital, Kano', q: 'Murtala Muhammad Specialist Hospital Kano' },
    infectious:   { name: 'Infectious Disease Hospital, Kano',          q: 'Infectious Disease Hospital Weatherhead Sabon Gari Kano' },
    malnutrition: { name: 'Murtala Muhammad Specialist Hospital, Kano', q: 'Murtala Muhammad Specialist Hospital Kano' },
    general:      { name: 'Aminu Kano Teaching Hospital (AKTH)',        q: 'Aminu Kano Teaching Hospital Zaria Road Tarauni Kano' },
};

document.addEventListener('DOMContentLoaded', () => {
    switchMode('voice');
    requestLocationSilently();
});

// ── Geolocation (silent, at load) ─────────────────────────────────────────────
function requestLocationSilently() {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
        (pos) => { userLat = pos.coords.latitude; userLng = pos.coords.longitude; },
        () => {},
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
    );
}

// ── Mode Switcher ─────────────────────────────────────────────────────────────
function switchMode(mode) {
    currentMode = mode;
    const tabVoice = document.getElementById('tab-voice');
    const tabText  = document.getElementById('tab-text');
    const pVoice   = document.getElementById('voice-input-panel');
    const pText    = document.getElementById('text-input-panel');

    const voiceOn = (mode === 'voice');
    tabVoice.classList.toggle('active', voiceOn);
    tabText.classList.toggle('active', !voiceOn);
    tabVoice.setAttribute('aria-selected', voiceOn ? 'true' : 'false');
    tabText.setAttribute('aria-selected', voiceOn ? 'false' : 'true');
    pVoice.classList.toggle('active', voiceOn);
    pText.classList.toggle('active', !voiceOn);
    if (!voiceOn) {
        if (typeof liveActive !== 'undefined' && liveActive) stopLive();
        document.getElementById('text-input').focus();
    }
}

// ── Reset Chat ────────────────────────────────────────────────────────────────
function resetChat() {
    if (typeof LiveVoice !== 'undefined') LiveVoice.stop();
    stopLive();
    
    conversationHistory = [];
    chatStarted = false;
    
    const list = document.getElementById('messages-list');
    if (list) list.innerHTML = '';
    
    const controls = document.getElementById('controls-block');
    const welcome  = document.getElementById('welcome-card');
    if (controls) controls.classList.remove('hidden');
    if (welcome)  welcome.classList.remove('hidden');
    
    closeEmergency();
    switchMode('voice');
    resetVoiceUI();
}

// ── Chat start: hide controls (mode + cards + emergency) and welcome ──────────
function beginChatIfNeeded() {
    if (chatStarted) return;
    chatStarted = true;
    const controls = document.getElementById('controls-block');
    const welcome  = document.getElementById('welcome-card');
    if (controls) controls.classList.add('hidden');
    if (welcome)  welcome.classList.add('hidden');
    closeEmergency();
}

// ── Emergency overlay ─────────────────────────────────────────────────────────
function toggleEmergency() {
    const wrap = document.getElementById('emergency-wrap');
    const ov   = document.getElementById('emergency-overlay');
    const trig = document.getElementById('emergency-trigger');
    const open = !ov.classList.contains('open');
    ov.classList.toggle('open', open);
    wrap.classList.toggle('open', open);
    trig.setAttribute('aria-expanded', open ? 'true' : 'false');
}
function closeEmergency() {
    const wrap = document.getElementById('emergency-wrap');
    const ov   = document.getElementById('emergency-overlay');
    const trig = document.getElementById('emergency-trigger');
    if (ov) ov.classList.remove('open');
    if (wrap) wrap.classList.remove('open');
    if (trig) trig.setAttribute('aria-expanded', 'false');
}

// ── LIVE VOICE (Gemini Live: hearing + thinking + Leda's voice, one socket) ──
// The old flow was: record, upload, transcribe, chat, synthesise, play — four
// round trips before a single word came back. Live keeps one connection open,
// so Leda can start answering while the user is still finishing, and the user
// can interrupt her mid-sentence.

let liveActive = false;
let liveHeardBubble = null;
let liveReplyBubble = null;

async function toggleRecording() {
    if (liveActive) { stopLive(); return; }
    await startLive();
}

async function startLive() {
    const micBtn = document.getElementById('mic-btn');
    const pulse  = document.getElementById('rec-pulse');
    const status = document.getElementById('voice-status');

    beginChatIfNeeded();
    status.innerText = 'Ana haɗawa...';

    try {
        await LiveVoice.start({
            open: () => {
                liveActive = true;
                micBtn.classList.add('recording');
                pulse.classList.add('active');
                status.innerText = 'Yi magana — ina saurare';
            },
            reconnected: () => { status.innerText = 'Yi magana — ina saurare'; },
            status: (s) => {
                if (s === 'reconnecting') status.innerText = 'Ana sake haɗawa...';
            },
            heard: (text, final) => {
                liveHeardBubble = upsertBubble(liveHeardBubble, 'user', text);
                if (final) liveHeardBubble = null;
            },
            audioReply: (url, referral) => {
                appendVoiceAudioBubble(url, null, null);
                if (referral) showReferralForCategory(referral);
            },
            interrupted: () => {},
            referral: (category) => { showReferralForCategory(category); },
            fatal: (msg) => {
                appendSystemMessage('⚠️ ' + msg);
                resetVoiceUI();
            },
            closed: () => { resetVoiceUI(); },
        });
    } catch (err) {
        console.error('Live start failed:', err);
        resetVoiceUI();
        const m = String(err && err.message || '');
        if (m.indexOf('Permission') !== -1 || m.indexOf('NotAllowed') !== -1) {
            appendSystemMessage('🎙️ Ba a sami izinin mic ba. A ba da izini sannan a sake gwadawa.');
        } else {
            appendSystemMessage('⚠️ Muryar baya kan aiki yanzu. Yi amfani da Rubutu (Text).');
        }
    }
}

function stopLive() {
    LiveVoice.stop();
    resetVoiceUI();
}

function resetVoiceUI() {
    liveActive = false;
    liveHeardBubble = null;
    liveReplyBubble = null;
    const micBtn = document.getElementById('mic-btn');
    const pulse  = document.getElementById('rec-pulse');
    const status = document.getElementById('voice-status');
    if (micBtn) micBtn.classList.remove('recording');
    if (pulse)  pulse.classList.remove('active');
    if (status) status.innerText = 'Danna mic domin yin magana';
}

/** Create the bubble on first token, then update it in place as text streams. */
function upsertBubble(el, role, text) {
    if (!el) {
        const list = document.getElementById('messages-list');
        el = document.createElement('div');
        el.className = 'message-bubble ' + role;
        el.innerHTML = '<div class="bubble-text"></div>';
        list.appendChild(el);
    }
    const t = el.querySelector('.bubble-text');
    if (t) t.textContent = text;
    scrollBottom();
    return el;
}

/** Turn an internal referral category into the hospital card. */
function showReferralForCategory(category) {
    const list = document.getElementById('messages-list');
    const bubble = list && list.lastElementChild;
    const q = encodeURIComponent(HOSPITALS[category] ? HOSPITALS[category].q : HOSPITALS.general.q);
    const name = HOSPITALS[category] ? HOSPITALS[category].name : HOSPITALS.general.name;
    const lat = (userLat !== null) ? userLat : KANO_LAT;
    const lng = (userLng !== null) ? userLng : KANO_LNG;
    const url = 'https://www.google.com/maps/search/' + q + '/@' + lat + ',' + lng + ',14z';
    const html = '<div class="referral-container"><a href="' + url + '" target="_blank" rel="noopener" class="hospital-referral-btn">📍 Nemo Asibiti Mafi Kusa — ' + escapeHtml(name) + '</a></div>';
    if (bubble && bubble.classList.contains('assistant')) {
        bubble.insertAdjacentHTML('beforeend', html);
    } else {
        const d = document.createElement('div');
        d.className = 'message-bubble assistant';
        d.innerHTML = html;
        list.appendChild(d);
    }
    scrollBottom();
}

// ── TEXT MODE: Gemini -> text reply only, never audio ─────────────────────────
async function handleSendText() {
    const input = document.getElementById('text-input');
    const text = input.value.trim();
    if (!text) return;
    beginChatIfNeeded();
    appendMessage('user', text);
    input.value = '';
    input.style.height = 'auto';
    await runTextTurn(text);
}

function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendText(); }
}

// Auto-grow the textarea downward as the user types, keeping all lines visible.
function autoGrowTextarea(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
}

async function runTextTurn(text) {
    try {
        showLoadingDots();
        let assistantBubble = null;
        const reply = await streamChatReply(text, (partialText) => {
            removeLoadingDots();
            if (!assistantBubble) {
                assistantBubble = createStreamingAssistantBubble();
            }
            const textNode = assistantBubble.querySelector('.bubble-text');
            if (textNode) textNode.textContent = partialText;
            scrollBottom();
        });
        removeLoadingDots();
        if (!assistantBubble) {
            appendMessage('assistant', reply.reply, reply.maps_url, reply.hospital);
        } else {
            const textNode = assistantBubble.querySelector('.bubble-text');
            if (textNode) textNode.textContent = reply.reply;
            appendCopyButton(assistantBubble, reply.reply);
            if (reply.maps_url) {
                const nm = reply.hospital ? ' — ' + escapeHtml(reply.hospital) : '';
                assistantBubble.insertAdjacentHTML('beforeend', `<div class="referral-container"><a href="${reply.maps_url}" target="_blank" rel="noopener" class="hospital-referral-btn">📍 Nemo Asibiti Mafi Kusa${nm}</a></div>`);
            }
        }
        scrollBottom();
    } catch (err) {
        removeLoadingDots();
        console.error('Text error:', err);
        appendSystemMessage('⚠️ Yi hakuri, akwai matsala. A sake gwadawa.');
    }
}

// ── Topic cards ───────────────────────────────────────────────────────────────
// Cards follow the CURRENT mode. Voice -> spoken briefing. Text -> written briefing.
async function sendCardTopic(topicName) {
    beginChatIfNeeded();
    const promptText = `Ina bukatar bayani da shawarwari game da matsalar: ${topicName}`;
    appendMessage('user', promptText);
    if (currentMode === 'voice') {
        if (!liveActive) await startLive();
        if (liveActive) LiveVoice.sendText(promptText);
        return;
    } else {
        await runTextTurn(promptText);
    }
}

// ── Emergency cards ───────────────────────────────────────────────────────────
// Emergencies always use TEXT conversation (ask-first Q&A needs typing back).
async function sendEmergency(label) {
    closeEmergency();
    beginChatIfNeeded();
    const promptText = `Taimakon gaggawa — matsalar: ${label}`;
    appendMessage('user', promptText);
    
    if (currentMode === 'voice') {
        if (!liveActive) await startLive();
        if (liveActive) {
            LiveVoice.sendText(promptText);
            return;
        }
    }
    
    if (currentMode !== 'text') switchMode('text');
    await runTextTurn(promptText);
}

// ── API STREAM ────────────────────────────────────────────────────────────────
// The text response is received incrementally and rendered as it arrives.
async function streamChatReply(userMessage, onText) {
    const res = await fetch('api/chat.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: userMessage,
            history: conversationHistory.slice(-8),
            lat: userLat, lng: userLng
        })
    });

    if (!res.ok || !res.body) throw new Error('chat_stream_failed');

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let fullText = '';
    let result = null;

    const processEvent = (rawEvent) => {
        const lines = rawEvent.split(/\r?\n/);
        let dataText = '';
        for (const line of lines) {
            if (line.startsWith('data:')) dataText += line.slice(5).trim();
        }
        if (!dataText) return;

        let event;
        try { event = JSON.parse(dataText); } catch (_) { return; }

        if (event.type === 'token') {
            fullText += event.text || '';
            onText(fullText);
        } else if (event.type === 'done') {
            result = event;
        } else if (event.type === 'error') {
            throw new Error(event.message || 'chat_stream_failed');
        }
    };

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split(/\n\n/);
        buffer = events.pop() || '';
        for (const event of events) processEvent(event);
    }
    buffer += decoder.decode();
    if (buffer.trim()) processEvent(buffer);

    if (!result || !result.reply) throw new Error('chat_stream_failed');

    conversationHistory.push({ role: 'user', content: userMessage });
    conversationHistory.push({ role: 'assistant', content: result.reply });

    return {
        reply: result.reply,
        maps_url: result.maps_url || null,
        hospital: result.hospital_name || null
    };
}

// ── API ───────────────────────────────────────────────────────────────────────
async function fetchChatReply(userMessage) {
    const res = await fetch('api/chat.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: userMessage,
            history: conversationHistory.slice(-8),
            lat: userLat, lng: userLng
        })
    });
    const data = await res.json();
    if (data.status !== 'success' || !data.reply) throw new Error('chat_failed');

    conversationHistory.push({ role: 'user',      content: userMessage });
    conversationHistory.push({ role: 'assistant', content: data.reply });

    return { reply: data.reply, maps_url: data.maps_url || null, hospital: data.hospital_name || null };
}

// ── UI helpers ────────────────────────────────────────────────────────────────
function showLoadingDots() {
    removeLoadingDots();
    const list = document.getElementById('messages-list');
    const d = document.createElement('div');
    d.id = 'loading-dots';
    d.className = 'message-bubble assistant loading-bubble';
    d.innerHTML = `<div class="dots-pulse"><span></span><span></span><span></span></div>`;
    list.appendChild(d);
    scrollBottom();
}
function removeLoadingDots() {
    const el = document.getElementById('loading-dots');
    if (el) el.remove();
}

function createStreamingAssistantBubble() {
    const list = document.getElementById('messages-list');
    const div = document.createElement('div');
    div.className = 'message-bubble assistant';
    div.innerHTML = '<div class="bubble-text"></div>';
    list.appendChild(div);
    return div;
}

function appendCopyButton(bubble, text) {
    if (!bubble || bubble.querySelector('.message-copy-btn')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'message-copy-btn';
    btn.textContent = 'Kwafi';
    btn.setAttribute('aria-label', 'Kwafi amsar');
    btn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(text);
            btn.textContent = 'An kwafa';
            setTimeout(() => { btn.textContent = 'Kwafi'; }, 1200);
        } catch (_) {
            const area = document.createElement('textarea');
            area.value = text;
            area.style.position = 'fixed';
            area.style.opacity = '0';
            document.body.appendChild(area);
            area.select();
            try { document.execCommand('copy'); } catch (_) {}
            area.remove();
        }
    });
    bubble.appendChild(btn);
}

function appendMessage(role, text, mapsUrl = null, hospitalName = null) {
    const list = document.getElementById('messages-list');
    const div = document.createElement('div');
    div.className = `message-bubble ${role}`;
    let referral = '';
    if (role === 'assistant' && mapsUrl) {
        const nm = hospitalName ? ' — ' + escapeHtml(hospitalName) : '';
        referral = `<div class="referral-container"><a href="${mapsUrl}" target="_blank" rel="noopener" class="hospital-referral-btn">📍 Nemo Asibiti Mafi Kusa${nm}</a></div>`;
    }
    div.innerHTML = `<div class="bubble-text">${escapeHtml(text)}</div>${referral}`;
    list.appendChild(div);
    if (role === 'assistant') appendCopyButton(div, text);
    scrollBottom();
}

function appendVoiceAudioBubble(audioUrl, mapsUrl, hospitalName) {
    const list = document.getElementById('messages-list');
    const div = document.createElement('div');
    div.className = 'message-bubble assistant voice-audio-bubble';
    const id = 'aud-' + Date.now();
    let referral = '';
    if (mapsUrl) {
        const nm = hospitalName ? ' — ' + escapeHtml(hospitalName) : '';
        referral = `<div class="referral-container"><a href="${mapsUrl}" target="_blank" rel="noopener" class="hospital-referral-btn">📍 Nemo Asibiti Mafi Kusa${nm}</a></div>`;
    }
    div.innerHTML = `<div class="audio-player-container"><audio controls src="${audioUrl}" id="${id}"></audio></div>${referral}`;
    list.appendChild(div);
    scrollBottom();
    const a = document.getElementById(id);
    if (a) a.play().catch(() => {}); // autoplay; controls allow replay
}

function appendSystemMessage(text) {
    const list = document.getElementById('messages-list');
    const div = document.createElement('div');
    div.className = 'message-bubble system';
    div.textContent = text || '⚠️ Yi hakuri, akwai matsala. A sake gwadawa.';
    list.appendChild(div);
    scrollBottom();
}

function scrollBottom() {
    const vp = document.getElementById('chat-viewport');
    if (vp) vp.scrollTop = vp.scrollHeight;
}

function escapeHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
