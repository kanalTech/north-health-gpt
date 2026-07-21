FROM python:3.11-slim

# libsndfile1 needed by piper/soundfile for WAV encoding
RUN apt-get update && apt-get install -y --no-install-recommends \
        libsndfile1 \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Non-root user; writable cache dir for huggingface_hub
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    HF_HOME=/home/user/.cache/huggingface \
    PYTHONUNBUFFERED=1

WORKDIR /home/user/app

COPY --chown=user:user requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

COPY --chown=user:user app.py .

# Render sets $PORT env var. Shell form of CMD so ${PORT} expands.
CMD uvicorn app:app --host 0.0.0.0 --port ${PORT:-10000}
