# ── North Health GPT · Piper Hausa TTS (Render / any Docker host) ──
# The voice model is baked in at BUILD time, so a cold start NEVER
# re-downloads it — startup just loads from local disk.

FROM python:3.11-slim

# espeak-ng: Piper needs it for Hausa phonemization
RUN apt-get update && apt-get install -y --no-install-recommends \
        espeak-ng \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Keep the Hugging Face cache inside the image (the baked model lives here)
ENV HF_HOME=/app/hf_cache

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Bake the Piper voice into the image (no download at startup) ──
RUN python -c "from huggingface_hub import hf_hub_download; \
r='adab-tech/murya-piper-hausa-tts'; \
hf_hub_download(r,'model.onnx'); \
hf_hub_download(r,'model.onnx.json')"

COPY app.py .

# Model is baked in — don't touch the network at startup at all
ENV HF_HUB_OFFLINE=1

EXPOSE 7860
# Render injects $PORT; fall back to 7860 for local runs
CMD uvicorn app:app --host 0.0.0.0 --port ${PORT:-7860}
