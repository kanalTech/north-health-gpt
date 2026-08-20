/**
 * live-voice.js
 * North Health GPT — Gemini Live Audio & WebSocket Engine (v5.0)
 * KANAL TECH (RC-8659947), Kano, Nigeria
 */

/* ── Inline AudioWorklets ────────────────────────────────────────────────── */

const CAPTURE_WORKLET = `
  class CaptureProcessor extends AudioWorkletProcessor {
    constructor() {
      super();
      this.buffer = new Int16Array(2048);
      this.bufferIndex = 0;
    }
    process(inputs, outputs, parameters) {
      const input = inputs[0];
      if (input && input.length > 0) {
        const channelData = input[0];
        for (let i = 0; i < channelData.length; i++) {
          let s = Math.max(-1, Math.min(1, channelData[i]));
          this.buffer[this.bufferIndex++] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          if (this.bufferIndex >= this.buffer.length) {
            this.port.postMessage(this.buffer.slice());
            this.bufferIndex = 0;
          }
        }
      }
      return true;
    }
  }
  registerProcessor('capture-processor', CaptureProcessor);
`;

const PLAYER_WORKLET = `
  class PlayerProcessor extends AudioWorkletProcessor {
    constructor() {
      super();
      // Chunked queue — fixes the O(n) flat-array shift() that caused cracking.
      // Old code called buffer.shift() 128 times per render block (~187x/sec),
      // each an O(n) rewrite of the whole array. Chunked queue is O(1) amortized.
      this.queue = [];      // Array of Float32Array chunks waiting to play
      this.current = null;  // Chunk currently being consumed
      this.offset = 0;      // Read position inside current chunk
      this.isPlaying = false;
      this.chunkCount   = 0;      // chunks received since last clear/reset
      this.prebuffering = true;   // hold output until 3 chunks have arrived
      this.PREBUF_CHUNKS = 3;     // wait for 3 chunks before starting playback

      this.port.onmessage = (event) => {
        const data = event.data;

        if (data && data.type === 'clear') {
          this.queue = [];
          this.current = null;
          this.offset = 0;
          this.isPlaying = false;
          this.chunkCount   = 0;
          this.prebuffering = true;
          this.port.postMessage({ isSpeaking: false });
          return;
        }

        if (data && data.type === 'flush') {
          this.prebuffering = false;   // force-play whatever is queued
          return;
        }

        let chunk = null;
        if (data instanceof ArrayBuffer) {
          chunk = new Float32Array(data);
        } else if (data instanceof Float32Array) {
          chunk = data;
        }

        if (chunk && chunk.length > 0) {
          this.queue.push(chunk);
          this.chunkCount++;
          if (this.prebuffering && this.chunkCount >= this.PREBUF_CHUNKS) {
            this.prebuffering = false;
          }
        }
      };
    }

    process(inputs, outputs) {
      const output = outputs[0];
      if (!output || !output[0]) return true;
      const channel = output[0];

      if (this.prebuffering) {
        channel.fill(0);
        return true;
      }

      let hasData = false;

      for (let i = 0; i < channel.length; i++) {
        // Advance to next chunk when current is exhausted
        if (!this.current || this.offset >= this.current.length) {
          this.current = this.queue.shift() || null;
          this.offset = 0;
          if (!this.current) { channel[i] = 0; continue; }
        }
        channel[i] = this.current[this.offset++];
        hasData = true;
      }

      const nowPlaying = hasData || this.queue.length > 0 ||
                         (this.current !== null && this.offset < this.current.length);
      if (nowPlaying !== this.isPlaying) {
        this.isPlaying = nowPlaying;
        this.port.postMessage({ isSpeaking: nowPlaying });
      }

      return true;
    }
  }
  registerProcessor('player-processor', PlayerProcessor);
`;

/* ── Audio Helpers ───────────────────────────────────────────────────────── */

function b64ToInt16(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Int16Array(bytes.buffer, 0, bytes.length >> 1);
}

function int16ToB64(int16) {
  const bytes = new Uint8Array(int16.buffer, int16.byteOffset, int16.byteLength);
  let s = '';
  const STEP = 0x8000;
  for (let i = 0; i < bytes.length; i += STEP) {
    s += String.fromCharCode.apply(null, bytes.subarray(i, i + STEP));
  }
  return btoa(s);
}

function int16ToFloat32(i16) {
  const f = new Float32Array(i16.length);
  for (let i = 0; i < i16.length; i++) f[i] = i16[i] / 32768;
  return f;
}

function encodeWAV(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeString = (v, off, str) => {
    for (let i = 0; i < str.length; i++) v.setUint8(off + i, str.charCodeAt(i));
  };
  
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);
  
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
  return new Blob([view], { type: 'audio/wav' });
}

function sanitize(text) {
  if (!text) return { clean: '', referral: null };
  const clean = text.replace(/\[.*?\]/g, '').trim();
  return { clean, referral: null };
}

function resampleLinear(input, fromRate, toRate) {
    if (fromRate === toRate) return input;
    const ratio = fromRate / toRate;
    const outputLength = Math.round(input.length / ratio);
    const output = new Float32Array(outputLength);
    for (let i = 0; i < outputLength; i++) {
        const pos = i * ratio;
        const idx = Math.floor(pos);
        const frac = pos - idx;
        const a = input[idx]     !== undefined ? input[idx]     : 0;
        const b = input[idx + 1] !== undefined ? input[idx + 1] : 0;
        output[i] = a + frac * (b - a);
    }
    return output;
}

/* ── LiveVoice Singleton ─────────────────────────────────────────────────── */

const LiveVoice = {
  active: false,
  speaking: false,
  audioContextIn: null,
  audioContextOut: null,
  captureNode: null,
  playerNode: null,
  mediaStream: null,
  ws: null,
  callbacks: {},
  currentReferral: null,

  isSpeaking() {
    return this.speaking;
  },

  start(callbacks = {}) {
    this.callbacks = callbacks || {};
    if (this.callbacks.status) this.callbacks.status('connecting');

    return new Promise(async (resolve, reject) => {
      let resolved = false;

      try {
        // 1. Fetch ephemeral token from backend
        const tokenRes = await fetch('api/token.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!tokenRes.ok) {
          const errJson = await tokenRes.json().catch(() => ({}));
          throw new Error(errJson.message || 'Token acquisition failed');
        }
        const tokenData = await tokenRes.json();
        if (tokenData.status !== 'success' || !tokenData.token) {
          throw new Error(tokenData.message || 'Invalid token response');
        }

        const liveToken = tokenData.token;
        const model = tokenData.model || 'gemini-3.1-flash-live-preview';

        // 2. Setup Audio Input Context (16kHz)
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.audioContextIn = new AudioCtx({ sampleRate: 16000 });
        if (this.audioContextIn.state === 'suspended') {
          await this.audioContextIn.resume();
        }

        // 3. Setup Audio Output Context (24kHz for Gemini Live audio)
        this.audioContextOut = new AudioCtx({ sampleRate: 24000 });
        if (this.audioContextOut.state === 'suspended') {
          await this.audioContextOut.resume();
        }

        // 4. Load AudioWorklets via Blobs
        const captureBlob = new Blob([CAPTURE_WORKLET], { type: 'application/javascript' });
        const playerBlob = new Blob([PLAYER_WORKLET], { type: 'application/javascript' });
        await this.audioContextIn.audioWorklet.addModule(URL.createObjectURL(captureBlob));
        await this.audioContextOut.audioWorklet.addModule(URL.createObjectURL(playerBlob));

        // 5. Setup Capture Node & Player Node
        this.captureNode = new AudioWorkletNode(this.audioContextIn, 'capture-processor');
        this.playerNode = new AudioWorkletNode(this.audioContextOut, 'player-processor');
        this.playerNode.connect(this.audioContextOut.destination);

        this.playerNode.port.onmessage = (e) => {
          if (e.data && typeof e.data.isSpeaking === 'boolean') {
            this.speaking = e.data.isSpeaking;
            // Notify app so the logo can animate in real-time with Leda's audio
            if (this.callbacks.speaking) this.callbacks.speaking(e.data.isSpeaking);
          }
        };

        // 6. Request Microphone Access
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 16000
          }
        });
        const source = this.audioContextIn.createMediaStreamSource(this.mediaStream);
        source.connect(this.captureNode);

        // 7. WebSocket setup
        const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContentConstrained?access_token=${encodeURIComponent(liveToken)}`;
        this.ws = new WebSocket(wsUrl);
        this.currentReferral = null;

        this.ws.onopen = () => {
          console.log('✅ Connected to Gemini Live WebSocket. Sending setup frame...');
          const setupFrame = {
            setup: {
              model: 'models/' + model
            }
          };
          this.ws.send(JSON.stringify(setupFrame));
        };

        this.ws.onmessage = async (evt) => {
          let raw = evt.data;
          if (raw instanceof Blob) {
            raw = await raw.text();
          }
          let data;
          try {
            data = JSON.parse(raw);
          } catch (e) {
            console.error('Failed to parse WebSocket JSON:', e);
            return;
          }

          if (data.setupComplete) {
            console.log('✅ Gemini Live Setup Complete.');
            this.active = true;
            if (this.callbacks.open) this.callbacks.open();
            if (this.callbacks.status) this.callbacks.status('connected');
            if (!resolved) {
              resolved = true;
              resolve();
            }

            // Hook mic capture to WebSocket
            this.captureNode.port.onmessage = (event) => {
              if (!this.active || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;
              const pcm16 = event.data;
              const base64Audio = int16ToB64(pcm16);
              const payload = {
                realtimeInput: {
                  audio: {
                    mimeType: 'audio/pcm;rate=16000',
                    data: base64Audio
                  }
                }
              };
              this.ws.send(JSON.stringify(payload));
            };
          }

          if (data.serverContent) {
            const sc = data.serverContent;

            if (sc.interrupted) {
              console.log('Gemini Live: turn interrupted');
              if (this.playerNode) this.playerNode.port.postMessage({ type: 'clear' });
              this.currentReferral = null;
              if (this.callbacks.interrupted) this.callbacks.interrupted();
            }

            if (sc.modelTurn && sc.modelTurn.parts) {
              for (const part of sc.modelTurn.parts) {
                if (part.inlineData && part.inlineData.data) {
                  const pcm16 = b64ToInt16(part.inlineData.data);
                  const float32  = int16ToFloat32(pcm16);
                  const rate     = this.audioContextOut ? this.audioContextOut.sampleRate : 24000;
                  const resampled = resampleLinear(float32, 24000, rate);
                  if (this.playerNode) this.playerNode.port.postMessage(resampled.buffer, [resampled.buffer]);
                }
                if (part.text) {
                  const m = part.text.match(/\[REFER:(maternal|newborn|infectious|malnutrition|tuberculosis|general)\]/i);
                  if (m) {
                    this.currentReferral = m[1].toLowerCase();
                    if (this.callbacks.referral) this.callbacks.referral(this.currentReferral);
                  }
                }
              }
            }

            if (sc.turnComplete) {
              if (this.playerNode) this.playerNode.port.postMessage({ type: 'flush' });
              // Notify app: turn is done. url is null (no WAV replay).
              if (this.callbacks.audioReply) {
                this.callbacks.audioReply(null, this.currentReferral);
              }
              this.currentReferral = null;
            }
          }
        };

        this.ws.onerror = (err) => {
          console.error('Live WebSocket error:', err);
          if (!resolved) {
            resolved = true;
            reject(err);
          }
        };

        this.ws.onclose = (evt) => {
          console.log('Gemini Live WebSocket closed:', evt.code, evt.reason);
          this.stop();
          if (this.callbacks.closed) this.callbacks.closed();
          if (!resolved) {
            resolved = true;
            reject(new Error('WebSocket closed before setup: ' + evt.code));
          }
        };

      } catch (err) {
        console.error('LiveVoice start failed:', err);
        this.stop();
        if (!resolved) {
          resolved = true;
          reject(err);
        }
      }
    });
  },

  sendText(text) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('LiveVoice.sendText called but WebSocket is not open.');
      return;
    }
    const msg = {
      clientContent: {
        turns: [{
          role: 'user',
          parts: [{ text: text }]
        }],
        turnComplete: true
      }
    };
    this.ws.send(JSON.stringify(msg));
  },

  stop() {
    this.active = false;
    this.speaking = false;
    if (this.captureNode) {
      this.captureNode.port.onmessage = null;
      try { this.captureNode.disconnect(); } catch (_) {}
      this.captureNode = null;
    }
    if (this.playerNode) {
      this.playerNode.port.postMessage({ type: 'clear' });
      try { this.playerNode.disconnect(); } catch (_) {}
      this.playerNode = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }
    if (this.audioContextIn) {
      try { this.audioContextIn.close(); } catch (_) {}
      this.audioContextIn = null;
    }
    if (this.audioContextOut) {
      try { this.audioContextOut.close(); } catch (_) {}
      this.audioContextOut = null;
    }
    if (this.ws) {
      try {
        this.ws.onopen = null;
        this.ws.onmessage = null;
        this.ws.onerror = null;
        this.ws.onclose = null;
        this.ws.close();
      } catch (_) {}
      this.ws = null;
    }
    this.currentReferral = null;
  }
};

// Expose globally
window.LiveVoice = LiveVoice;
window.initLiveVoice = (wsUrl) => LiveVoice.start({});
window.stopLiveVoice = () => LiveVoice.stop();
window.encodeWAV = encodeWAV;
window.sanitize = sanitize;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LiveVoice, encodeWAV, sanitize };
}