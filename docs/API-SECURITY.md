# North Health GPT — API Security and Provider Boundary

**RFPS-NYH-2026-503931 | KANAL TECH | Nigeria**

## 1. Purpose

This document defines how North Health GPT separates public open-source code from private API credentials and third-party provider infrastructure. It exists both as an engineering control and as evidence that the repository is prepared for technical review.

The current prototype uses Google Gemini services for real-time voice and text interaction. The project does not claim that Gemini itself is Open Source or that Gemini Live has been fine-tuned by North Health GPT.

## 2. Credential Rule

**No live API credential belongs in this repository.**

The public repository contains:

- `northgpt/api/config.example.php` — placeholder configuration only;
- `.gitignore` — excludes `northgpt/api/config.php`; and
- server-side PHP integration code that reads local configuration at runtime.

The repository intentionally does not contain `config.php`.

## 3. Runtime Boundary

```text
User browser
    │
    │ application interaction
    ▼
North Health GPT backend
    │
    ├── token.php
    │      └── requests an ephemeral Gemini Live token
    │
    └── chat.php
           └── sends text request using server-side configuration
                    │
                    ▼
               External AI provider
```

The browser must not be shipped with a long-lived provider API key.

## 4. Local Configuration

A developer may create a local configuration file from the template:

```bash
cp northgpt/api/config.example.php northgpt/api/config.php
```

The developer then supplies their own credentials and local settings. The resulting `config.php` remains untracked and must never be uploaded to GitHub.

If a deployment platform supports environment variables or a secret manager, credentials should be kept there and the local configuration adapter should read them without placing secrets in source control.

## 5. Provider Independence

The project is intentionally designed so that the following can evolve independently:

- real-time voice provider;
- text/reasoning provider;
- Hausa ASR;
- Hausa TTS;
- structured health logic; and
- referral intelligence.

This is important for long-term resilience. A provider can be replaced without redesigning the entire North Health GPT product.

## 6. What a UNICEF Technical Reviewer Should See

A reviewer should be able to confirm that:

1. the repository is public/open-source ready;
2. the actual prototype code is present;
3. the current third-party API dependency is disclosed;
4. no working API key is published;
5. the local configuration template contains placeholders only;
6. the provider boundary is documented; and
7. the long-term architecture is not permanently dependent on one proprietary provider.

## 7. Secret-Scanning Checklist

Before every public push:

- confirm `northgpt/api/config.php` is absent;
- inspect `git status`;
- search for `AIza` and other provider-key patterns;
- search for `.env` files;
- search for passwords and bearer tokens;
- run `php tests/validate_repository.php`; and
- if a secret was ever committed, rotate it rather than relying only on deleting the file in a later commit.

## 8. Security Is Not a Claim of Clinical Safety

Protecting API credentials does not by itself make a health AI system safe. Clinical safety is handled separately through the health-logic architecture, clinical review, conservative escalation rules, testing and monitoring documented in [`HEALTH-LOGIC.md`](HEALTH-LOGIC.md).

## 9. Open-Source Position

UNICEF's published funding guidance states that the funded solution must be Open Source and that the funded solution should be placed under an Open Source license by month six of the investment period. The same FAQ explains that not every technology used by the company must itself be Open Source.

North Health GPT therefore distinguishes clearly between:

- **third-party infrastructure:** e.g. Google Gemini services;
- **North Health GPT project code:** application, integration, health-logic architecture, schemas and tooling; and
- **future North Health GPT-owned technical assets:** dedicated Hausa ASR/TTS, evaluation assets and offline components where licensing and data rights permit.

Official reference: https://www.unicefventurefund.org/apply-funding
