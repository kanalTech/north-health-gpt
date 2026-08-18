# North Health GPT — Technical Architecture

**RFPS-NYH-2026-503931 | KANAL TECH | Nigeria**

## 1. Purpose

This document describes the proposed technical architecture of North Health GPT and distinguishes the **current working prototype** from components planned for development during the proposed 12-month investment period.

The architecture is intentionally modular. North Health GPT should not become a thin interface permanently dependent on one commercial model provider. Commercial APIs can accelerate the prototype, while specialised Hausa speech, health logic, referral and deployment components are developed as project-owned assets.

---

## 2. Architecture Principles

### Hausa-first

Hausa is a primary engineering language. Speech recognition, speech synthesis, prompts, health vocabulary and usability testing are designed around Northern Nigerian Hausa users.

### Safety-first

Health guidance is separated from unrestricted model generation through structured pathways, danger-sign rules, escalation logic and clinical review.

### Offline-first

The final system is designed to retain useful functionality under intermittent or absent connectivity.

### Provider-independent

The system should be able to replace its underlying reasoning or speech provider without rebuilding the entire application.

### Modular

Each major capability has a defined interface so that it can be independently tested and improved.

### Privacy-preserving

Only data necessary for operation, safety evaluation and impact measurement should be collected.

---

## 3. Six-Layer Architecture

```text
┌─────────────────────────────────────────────────────────────────────┐
│                    NORTH HEALTH GPT PLATFORM                        │
├─────────────────────────────────────────────────────────────────────┤
│ LAYER 1 — HAUSA SPEECH INPUT                                       │
│ Dedicated ASR; dialect-aware; future on-device inference           │
├─────────────────────────────────────────────────────────────────────┤
│ LAYER 2 — HEALTH INTELLIGENCE                                     │
│ Structured clinical pathways + safety + AI reasoning               │
├─────────────────────────────────────────────────────────────────────┤
│ LAYER 3 — HAUSA SPEECH OUTPUT                                     │
│ Dedicated Hausa TTS; future local inference                        │
├─────────────────────────────────────────────────────────────────────┤
│ LAYER 4 — APPLICATION                                              │
│ Current web prototype + planned Android/offline client              │
├─────────────────────────────────────────────────────────────────────┤
│ LAYER 5 — REFERRAL INTELLIGENCE                                   │
│ Facility data + capability matching + urgency                       │
├─────────────────────────────────────────────────────────────────────┤
│ LAYER 6 — IMPACT / MONITORING                                     │
│ Anonymised metrics + safety monitoring + evaluation                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Layer 1 — Hausa Speech Input

### Current prototype

The current web prototype uses Google Gemini Live for real-time voice interaction.

Gemini Live is therefore a **prototype infrastructure component**, not a claim of a North Health GPT fine-tuned model.

### Development target

North Health GPT will develop a dedicated Hausa ASR capability using a minimum 50-hour multi-dialect speech dataset target.

The ASR interface should eventually expose a simple application contract such as:

```text
Audio PCM / microphone stream
        ↓
Hausa ASR
        ↓
Transcript + confidence / metadata
```

### Evaluation

The project proposal establishes a target of **WER < 20%**. Evaluation should be separated by dialect and recording condition rather than reporting only one aggregate number.

---

## 5. Layer 2 — Health Intelligence

This layer is the core safety architecture.

It should contain:

- condition classification;
- symptom extraction;
- danger-sign evaluation;
- urgency rules;
- referral rules;
- uncertainty handling;
- clinical content versioning;
- safety constraints; and
- model/provider adapters.

### Recommended internal separation

```text
Conversation / Language Model
              ↓
Structured Health State
              ↓
North Health GPT Health Logic
              ↓
Risk / Urgency / Referral Decision
              ↓
Response Generation
```

A conversational model can help interpret natural language, but the final health pathway should be governed by explicit project rules and clinically reviewed content.

---

## 6. Layer 3 — Hausa Speech Output

### Current prototype

The current voice prototype uses Gemini Live's native audio output.

### Development target

A dedicated Hausa TTS component should eventually expose:

```text
Hausa response text
        ↓
Hausa TTS
        ↓
PCM / audio output
```

The project proposal identifies grapheme-oriented Hausa synthesis as a development direction and establishes a MOS target above 3.8/5.0.

Evaluation should include ordinary speech and health-specific terminology.

---

## 7. Layer 4 — Application

### Current

The repository contains the web prototype under `northgpt/`.

### Planned

An Android client should be developed for low-cost devices and designed around a minimum approximately 1 GB RAM target from the proposal.

The mobile client should be modular enough to support:

- local ASR;
- local TTS;
- cached health logic;
- cached referral data;
- online synchronisation;
- secure API communication when available; and
- graceful offline degradation.

---

## 8. Layer 5 — Referral Intelligence

The referral system turns health guidance into an actionable pathway.

The current repository contains a preliminary schema with facility capabilities such as:

- emergency obstetric care;
- neonatal/special-care capacity;
- lumbar puncture/CSF capability;
- severe acute malnutrition treatment;
- therapeutic feeding;
- TB/DOTS capability;
- blood transfusion;
- surgery;
- laboratory; and
- X-ray.

The database should be populated from authoritative facility sources and field verification.

The proposal targets more than 1,500 facilities and minimum verification rates by state.

---

## 9. Referral Matching Model

Referral selection should not simply choose the closest facility.

The system should consider:

1. condition;
2. urgency;
3. required clinical capability;
4. facility level;
5. operating status/hours where reliable;
6. geographic proximity; and
7. verification status.

Conceptually:

```text
Condition
   +
Urgency
   +
Required capability
   +
Location
   ↓
Eligible facilities
   ↓
Rank by suitability and distance
   ↓
Referral recommendation
```

A facility should not be recommended for a condition merely because it is geographically close if it lacks the required capability.

---

## 10. Layer 6 — Monitoring

The planned monitoring layer should measure system performance and impact without collecting unnecessary identity data.

Candidate fields include:

- anonymous interaction identifier;
- condition category;
- referral category;
- completion status;
- coarse geographic area;
- timestamp;
- latency;
- safety escalation;
- system version.

Raw audio should not be retained as a default monitoring requirement.

---

## 11. Online and Offline Modes

### Online mode

```text
Microphone
   ↓
ASR / voice service
   ↓
Health logic
   ↓
Referral engine
   ↓
TTS / voice output
```

### Offline-capable mode

```text
Microphone
   ↓
Local Hausa ASR
   ↓
Local / cached health logic
   ↓
Local referral database
   ↓
Local Hausa TTS
```

The final system may use a hybrid approach where advanced services are available online but essential safety and referral functions remain available locally.

---

## 12. Provider Independence

The architecture should use adapters rather than hard-code business logic directly into a single provider API.

Example:

```text
                    ┌── Gemini
Health/Reasoning ───┼── Other API provider
                    └── Local model

Speech Input ───────┬── Current voice API
                    └── North Hausa ASR

Speech Output ──────┬── Current voice API
                    └── North Hausa TTS
```

The application should depend on stable internal interfaces rather than provider-specific behaviour wherever practical.

---

## 13. Security Boundaries

The current web architecture includes server-side PHP endpoints for provider credentials.

Production boundaries should ensure:

- provider API keys remain server-side;
- browser clients receive only short-lived credentials where necessary;
- HTTPS protects data in transit;
- logs do not contain raw health conversations by default;
- configuration files remain outside version control.

---

## 14. Repository Mapping

```text
northgpt/
  Current web application and prototype APIs

schema/
  Referral database design and preliminary records

docs/ARCHITECTURE.md
  System architecture

docs/HEALTH-LOGIC.md
  Health decision architecture

docs/DATA-FLOW.md
  Data movement and privacy

docs/ROADMAP.md
  Development and validation plan
```

Planned ASR, TTS, Android and dashboard repositories should be created only when the corresponding components genuinely exist.

---

## 15. Architecture Evolution

The architecture deliberately evolves through stages:

```text
Current prototype
      ↓
Dedicated speech components
      ↓
Structured health logic
      ↓
Referral infrastructure
      ↓
Offline Android
      ↓
Clinical validation
      ↓
Community pilot
      ↓
Scale-ready platform
```

The prototype demonstrates feasibility. The investment period builds evidence, specialised technology and deployment readiness.
