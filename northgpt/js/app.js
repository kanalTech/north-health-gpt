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
    maternal: {
        name: 'Murtala Muhammad Specialist Hospital, Kano',
        mapUrl: 'https://maps.google.com/?q=Murtala+Muhammad+Specialist+Hospital+Kano',
        iframe: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3902.6540984451276!2d8.5233689!3d11.998419499999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x11ae80e4d9cd0463%3A0x7668b046f1a73c58!2sMurtala%20Muhammad%20Specialist%20Hospital%20Kano!5e0!3m2!1sen!2sng!4v1787215615365!5m2!1sen!2sng" width="100%" height="300" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>',
    },
    newborn: {
        name: 'Hasiya Bayero Pediatric Hospital, Kano',
        mapUrl: 'https://maps.google.com/?q=Hasiya+Bayero+Pediatric+Hospital+Kano',
        iframe: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3902.798561829209!2d8.5181573!3d11.988436!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x11ae80f81835971b%3A0xdbe4267548ca2529!2sHasiya%20Bayero%20Pediatric%20Hospital!5e0!3m2!1sen!2sng!4v1787215826372!5m2!1sen!2sng" width="100%" height="300" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>',
    },
    malnutrition: {
        name: 'Hasiya Bayero Pediatric Hospital, Kano',
        mapUrl: 'https://maps.google.com/?q=Hasiya+Bayero+Pediatric+Hospital+Kano',
        iframe: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3902.798561829209!2d8.5181573!3d11.988436!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x11ae80f81835971b%3A0xdbe4267548ca2529!2sHasiya%20Bayero%20Pediatric%20Hospital!5e0!3m2!1sen!2sng!4v1787215826372!5m2!1sen!2sng" width="100%" height="300" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>',
    },
    infectious: {
        name: 'Kano Infectious Diseases Hospital, Kano',
        mapUrl: 'https://maps.google.com/?q=Infectious+Diseases+Hospital+Kano',
        iframe: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3902.4163239008717!2d8.528147!3d12.0148337!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x11ae8120a23c49eb%3A0x240e92089604d8ab!2sInfectious%20Diseases%20Hospital%2C%20Kano!5e0!3m2!1sen!2sng!4v1787216086126!5m2!1sen!2sng" width="100%" height="300" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>',
    },
    tuberculosis: {
        name: 'Zana Hospital (Kano Infectious Diseases Hospital), Kano',
        mapUrl: 'https://maps.google.com/?q=Zana+Hospital+France+Road+Kano',
        iframe: '<iframe src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d249854.14993578164!2d8.5122509!3d11.907100199999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sZana%20Hospital%2C%20France%20Road%2C%20Kano!5e0!3m2!1sen!2sng!4v1787216248419!5m2!1sen!2sng" width="100%" height="300" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>',
    },
    general: {
        name: 'Aminu Kano Teaching Hospital (AKTH)',
        mapUrl: 'https://maps.google.com/?q=Aminu+Kano+Teaching+Hospital+Kano',
        iframe: '<iframe src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d250031.01669395654!2d8.3714576!3d11.713197899999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sAminu%20Kano%20Teaching%20Hospital%2C%20Zaria%20Road%2C%20Kano!5e0!3m2!1sen!2sng!4v1787216581147!5m2!1sen!2sng" width="100%" height="300" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>',
    },
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
    if (voiceOn) {
        // Show logo area only once a conversation has started
        if (chatStarted) showVoiceLogoArea(true);
    } else {
        showVoiceLogoArea(false);
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
    showVoiceLogoArea(false);
    // Clear voice-mode referral container
    const vrc = document.getElementById('voice-referral-container');
    if (vrc) vrc.innerHTML = '';
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
    // Show voice logo area when chat starts in voice mode
    if (currentMode === 'voice') showVoiceLogoArea(true);
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
                setLogoState('listening');
            },
            reconnected: () => {
                status.innerText = 'Yi magana — ina saurare';
                setLogoState('listening');
            },
            status: (s) => {
                if (s === 'connecting')    setLogoState('connecting');
                if (s === 'reconnecting') { status.innerText = 'Ana sake haɗawa...'; setLogoState('connecting'); }
                if (s === 'connected')     setLogoState('listening');
            },
            heard: (text, final) => {
                // Voice mode: don't add text bubbles — logo handles visual feedback
                if (final) liveHeardBubble = null;
            },
            // speaking fires from worklet isSpeaking signal — real-time logo update
            speaking: (isSpeaking) => {
                setLogoState(isSpeaking ? 'speaking' : 'listening');
            },
            audioReply: (url, referral) => {
                // Live audio already played — no WAV replay bubble.
                // Referral is shown by the 'referral' callback below when
                // Leda emits [REFER:...] in a text part.
                // audioReply is kept as fallback for referral in edge cases.
                if (referral) showReferralForCategory(referral);
                setLogoState('listening');
            },
            interrupted: () => {
                setLogoState('listening');
            },
            referral: (category) => {
                showReferralForCategory(category);
            },
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
    setLogoState('idle');
}

// ── Voice logo state ──────────────────────────────────────────────────────────
// States: idle | listening | speaking | processing | connecting
const LOGO_TEXTS = {
    idle:        'Danna mic domin yin magana',
    listening:   'Ina saurare...',
    speaking:    'Leda tana magana...',
    processing:  'Ana tunani...',
    connecting:  'Ana haɗawa...',
};

function setLogoState(state) {
    const logo = document.getElementById('north-logo');
    const txt  = document.getElementById('logo-state-text');
    if (!logo) return;
    logo.className = 'north-logo ' + state;
    if (txt) txt.textContent = LOGO_TEXTS[state] || '';
}

function showVoiceLogoArea(visible) {
    const area = document.getElementById('voice-logo-area');
    const voiceStatus = document.getElementById('voice-status');
    if (area) area.classList.toggle('hidden', !visible);
    // Logo area handles all state text — hide the footer status below the mic
    // so the same text doesn't appear in two places at once.
    if (voiceStatus) voiceStatus.style.display = visible ? 'none' : '';
}

function openMapModal(categoryKey) {
    const hospital = HOSPITALS[categoryKey] || HOSPITALS.general;
    if (!hospital) return;
    const modal     = document.getElementById('map-modal');
    const title     = document.getElementById('map-modal-title');
    const container = document.getElementById('map-modal-iframe-container');
    const extLink   = document.getElementById('map-modal-external');
    if (!modal) return;
    title.textContent = '📍 ' + hospital.name;
    if (extLink && hospital.mapUrl) {
        extLink.href = hospital.mapUrl;
    }
    container.innerHTML = hospital.iframe;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeMapModal() {
    const modal     = document.getElementById('map-modal');
    const container = document.getElementById('map-modal-iframe-container');
    if (!modal) return;
    modal.classList.add('hidden');
    if (container) container.innerHTML = '';   // stop iframe loading when closed
    document.body.style.overflow = '';
}

// Close modal on backdrop click or Escape key
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn  = document.getElementById('map-modal-close');
    const backdrop  = document.getElementById('map-modal-backdrop');
    if (closeBtn) closeBtn.addEventListener('click', closeMapModal);
    if (backdrop) backdrop.addEventListener('click', closeMapModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMapModal();
    });
});

/** Turn an internal referral category into the hospital card. */
function showReferralForCategory(category) {
    if (!category) return;
    const catKey = HOSPITALS[category] ? category : 'general';
    const hospital = HOSPITALS[catKey];
    const html = `<div class="referral-container">`
        + `<button type="button" class="hospital-referral-btn" onclick="openMapModal('${catKey}')">`
        + `📍 Nemo Asibiti Mafi Kusa — ${escapeHtml(hospital.name)}`
        + `</button></div>`;

    if (currentMode === 'voice') {
        // Voice mode: drop the map button below the logo, not in the messages list
        const container = document.getElementById('voice-referral-container');
        if (container) container.innerHTML = html; // replace not accumulate
    } else {
        // Text mode: original behaviour — attach to last assistant bubble
        const list   = document.getElementById('messages-list');
        const bubble = list && list.lastElementChild;
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
            appendMessage('assistant', reply.reply, reply.maps_url, reply.hospital, reply.hospital_key);
        } else {
            const textNode = assistantBubble.querySelector('.bubble-text');
            if (textNode) textNode.textContent = reply.reply;
            appendCopyButton(assistantBubble, reply.reply);
            if (reply.hospital_key && HOSPITALS[reply.hospital_key]) {
                const catKey = reply.hospital_key;
                const hosp = HOSPITALS[catKey];
                const html = `<div class="referral-container">`
                    + `<button type="button" class="hospital-referral-btn" onclick="openMapModal('${catKey}')">`
                    + `📍 Nemo Asibiti Mafi Kusa — ${escapeHtml(hosp.name)}`
                    + `</button></div>`;
                assistantBubble.insertAdjacentHTML('beforeend', html);
            } else if (reply.maps_url) {
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
    const promptText = `Ina bukatar bayani da shawarwari game da ${topicName}`;

    if (currentMode === 'voice') {
        // Voice mode: internal only — no text bubble ever shown
        const CARD_CATEGORY = {
            'Mata Masu Juna Biyu': 'maternal',
            'Lafiyar Jarirai':     'newborn',
            'Ciwon Tamowa':        'malnutrition',
            'Ciwon Sankarau':      'infectious',
            'Tarin TB':            'tuberculosis',
        };
        const category = CARD_CATEGORY[topicName];
        if (category) showReferralForCategory(category);

        try {
            if (!liveActive) await startLive();
            if (liveActive) {
                LiveVoice.sendText(promptText);
            }
        } catch (err) {
            console.error('Failed to start voice for card topic:', err);
        }
        return; // In voice mode, never fall through to text mode or show text bubbles
    }

    // TEXT MODE: show user bubble and run text turn
    appendMessage('user', promptText);
    await runTextTurn(promptText);
}

// ── Emergency cards ───────────────────────────────────────────────────────────
async function sendEmergency(label) {
    closeEmergency();
    beginChatIfNeeded();
    const promptText = `Ina bukatar taimako saboda ${label}.`;

    if (currentMode === 'voice') {
        // Voice mode: internal only — no text bubble ever shown
        const EMERG_CATEGORY = {
            'Jariri Ba Ya Numfashi':           'newborn',
            'Jariri Ya Ƙi Shan Nono':          'newborn',
            'Jariri Ya Ki Shan Nono':          'newborn',
            'Jariri Yana Karkarwa':            'newborn',
            'Jinin Haihuwa Ya Ƙi Tsayawa':    'maternal',
            'Jinin Haihuwa Ya Ki Tsayawa':    'maternal',
            'Mai Juna Biyu Tana Karkarwa':     'maternal',
            'Mace Tana Karkarwa':              'maternal',
            'Wuya Ya Sankare':                 'infectious',
            'Zazzabi Mai Tsanani':             'general',
            'Wahalar Numfashi':                'general',
        };
        const category = EMERG_CATEGORY[label];
        if (category) showReferralForCategory(category);

        try {
            if (!liveActive) await startLive();
            if (liveActive) {
                LiveVoice.sendText(promptText);
            }
        } catch (err) {
            console.error('Failed to start voice for emergency:', err);
        }
        return; // In voice mode, never fall through to text mode or show text bubbles
    }

    // TEXT MODE: show user bubble and run text turn
    appendMessage('user', promptText);
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
        hospital: result.hospital_name || null,
        hospital_key: result.hospital_key || null
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

function appendMessage(role, text, mapsUrl = null, hospitalName = null, hospitalKey = null) {
    const list = document.getElementById('messages-list');
    const div = document.createElement('div');
    div.className = `message-bubble ${role}`;
    let referral = '';
    if (role === 'assistant') {
        if (hospitalKey && HOSPITALS[hospitalKey]) {
            const catKey = hospitalKey;
            const hosp = HOSPITALS[catKey];
            referral = `<div class="referral-container">`
                + `<button type="button" class="hospital-referral-btn" onclick="openMapModal('${catKey}')">`
                + `📍 Nemo Asibiti Mafi Kusa — ${escapeHtml(hosp.name)}`
                + `</button></div>`;
        } else if (mapsUrl) {
            const nm = hospitalName ? ' — ' + escapeHtml(hospitalName) : '';
            referral = `<div class="referral-container"><a href="${mapsUrl}" target="_blank" rel="noopener" class="hospital-referral-btn">📍 Nemo Asibiti Mafi Kusa${nm}</a></div>`;
        }
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
