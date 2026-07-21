"""
Murya Hausa TTS — FastAPI server for HF Spaces.

Wraps adab-tech/murya-piper-hausa-tts (8-voice VITS ONNX, ~77 MB) for use by
North Health GPT's tts.php over HTTP.

Speaker map (from model card):
    F2:0  M3:1  M2:2  F4:3  M4:4  F1:5  M1:6  F3:7

Default speaker = 6 (M1) — authoritative male, for Radio Nigeria Kaduna
broadcaster persona.
"""

from __future__ import annotations

import io
import logging
import unicodedata
import wave
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel, Field

from huggingface_hub import hf_hub_download
from piper import PiperVoice, SynthesisConfig

# ── Config ──────────────────────────────────────────────────────────
MODEL_REPO = "adab-tech/murya-piper-hausa-tts"
DEFAULT_SPEAKER_ID = 6            # M1 — authoritative male
MAX_TEXT_LEN = 2000

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("murya-tts")

app = FastAPI(
    title="Murya Hausa TTS",
    description="Piper Hausa TTS backend for North Health GPT",
    version="1.0.0",
)

# Loaded once at startup, held in memory for the process lifetime.
voice: Optional[PiperVoice] = None


# ── Startup: download & load model ──────────────────────────────────
@app.on_event("startup")
def load_voice() -> None:
    """Download the ONNX model + config from HF Hub, load into memory."""
    global voice
    log.info("Downloading model from %s …", MODEL_REPO)
    model_path = hf_hub_download(repo_id=MODEL_REPO, filename="model.onnx")
    config_path = hf_hub_download(repo_id=MODEL_REPO, filename="model.onnx.json")
    log.info("Loading Piper voice from %s", model_path)
    voice = PiperVoice.load(model_path, config_path=config_path)
    log.info("Ready — default speaker_id=%d", DEFAULT_SPEAKER_ID)


# ── Request schema ──────────────────────────────────────────────────
class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=MAX_TEXT_LEN)
    speaker_id: int = Field(DEFAULT_SPEAKER_ID, ge=0, le=7)


# ── Routes ──────────────────────────────────────────────────────────
@app.get("/")
def root() -> dict:
    return {
        "service": "murya-hausa-tts",
        "model": MODEL_REPO,
        "status": "ready" if voice is not None else "loading",
        "default_speaker_id": DEFAULT_SPEAKER_ID,
        "speaker_map": {
            "0": "F2", "1": "M3", "2": "M2", "3": "F4",
            "4": "M4", "5": "F1", "6": "M1", "7": "F3",
        },
    }


@app.get("/health")
def health() -> dict:
    """Liveness probe — used by the keepalive cron on Hostinger."""
    return {"ok": voice is not None}


@app.post("/tts")
def tts(req: TTSRequest) -> Response:
    """
    Synthesize Hausa speech.

    Body: {"text": "...", "speaker_id": 0-7}
    Returns: audio/wav bytes (22.05 kHz mono).
    """
    if voice is None:
        raise HTTPException(status_code=503, detail="Model still loading, retry in a few seconds")

    # Model card guidance:
    #   • lowercase input (model was trained casefolded)
    #   • normalize to Unicode NFD (NFC composes tone-marked vowels into codepoints
    #     outside the training alphabet, dropping the vowel; NFD keeps the base)
    text = unicodedata.normalize("NFD", req.text.lower())

    if not text.strip():
        raise HTTPException(status_code=400, detail="Text is empty after normalization")

    # Synthesize into an in-memory WAV
    buf = io.BytesIO()
    try:
        syn_config = SynthesisConfig(speaker_id=req.speaker_id)
        with wave.open(buf, "wb") as wav_out:
            voice.synthesize_wav(text, wav_out, syn_config=syn_config)
    except Exception as exc:
        log.exception("Synthesis failed")
        raise HTTPException(status_code=500, detail=f"Synthesis failed: {exc}") from exc

    audio_bytes = buf.getvalue()
    if not audio_bytes:
        raise HTTPException(status_code=500, detail="Empty audio produced")

    return Response(
        content=audio_bytes,
        media_type="audio/wav",
        headers={
            "X-Speaker-Id": str(req.speaker_id),
            "X-Text-Length": str(len(text)),
            "Cache-Control": "no-store",
        },
    )
