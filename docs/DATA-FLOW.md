# North Health GPT — Data Flow, Privacy and Security

**RFPS-NYH-2026-503931 | KANAL TECH | Nigeria**

## 1. Purpose

This document describes how information moves through North Health GPT, which components process it, what information should be retained, and how the final system is intended to minimise unnecessary collection of personal data.

The document distinguishes the current web prototype from the planned offline-capable architecture.

---

## 2. Long-Term End-to-End Flow

```text
┌─────────────────────────────┐
│ 1. USER                     │
│ Natural Hausa speech/text   │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────┐
│ 2. SPEECH INPUT              │
│ Hausa ASR                    │
│ Planned local capability    │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────┐
│ 3. INFORMATION EXTRACTION    │
│ Symptoms / context / intent  │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────┐
│ 4. HEALTH PATHWAY            │
│ Maternal / Newborn /         │
│ Meningitis / SAM / TB        │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────┐
│ 5. HEALTH LOGIC              │
│ Danger signs / urgency /     │
│ safety rules                 │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────┐
│ 6. REFERRAL ENGINE           │
│ Facility capability matching │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────┐
│ 7. RESPONSE GENERATION       │
│ Clear Hausa guidance         │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────┐
│ 8. HAUSA TTS                 │
│ Planned dedicated TTS        │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────┐
│ 9. USER                      │
│ Guidance / referral action   │
└─────────────────────────────┘
```

---

## 3. Current Prototype Flow

The current web prototype uses external AI infrastructure for real-time voice and text interaction.

A simplified current flow is:

```text
Browser
  ↓
Microphone / text
  ↓
Prototype voice or text API path
  ↓
Configured AI service
  ↓
Hausa health-assistant instruction
  ↓
Response
  ↓
Browser
```

This is a prototype architecture. It should not be described as the completed offline architecture.

---

## 4. Planned Offline Flow

When suitable models are available locally:

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
  ↓
User
```

Online synchronisation can be used when connectivity returns for:

- model updates;
- referral database updates;
- application updates;
- approved analytics;
- configuration updates.

---

## 5. Data Classification

| Data Type | Prototype Treatment | Long-Term Direction |
|---|---|---|
| Raw microphone audio | Used for voice interaction | Prefer local processing; do not retain by default |
| Speech transcript | Used for current interaction | Minimise retention; process locally where feasible |
| User name | Not required | Do not require for basic interaction |
| Phone number | Not required | Do not require for basic interaction |
| Precise address | Not required | Avoid unless an explicit, justified service requires it |
| Facility location | Required for referral data | Store as facility information, not as unnecessary user identity |
| Health pathway | Required for logic | Use for immediate decision support and aggregate monitoring |
| Referral category | Required for referral/monitoring | Aggregate where possible |
| Interaction completion | Useful for evaluation | Retain in anonymised form |
| Coarse geographic area | Useful for impact analysis | Use only at the minimum necessary granularity |
| Timestamp | Useful for performance analysis | Retain under defined policy |

---

## 6. Voice Data

### Prototype

The current browser voice system processes microphone input as an audio stream for real-time interaction.

### Long-term design

The dedicated Hausa ASR objective is to enable local processing where device performance permits.

Benefits include:

- reduced bandwidth;
- improved privacy;
- resilience during connectivity loss;
- lower recurring speech-API cost.

Raw audio should not be retained simply for convenience.

If audio is ever collected for research/model training, it requires an explicit data-governance process, consent where applicable, lawful basis, access control, retention limits and ethical review.

---

## 7. Health Conversation Data

The health conversation may contain sensitive information even if the user is anonymous.

Therefore:

- do not log complete conversations by default;
- do not place raw symptom text in public dashboards;
- do not include API credentials in logs;
- minimise server retention;
- use encryption in transit;
- restrict access to operational staff who need it;
- define retention periods before pilot deployment.

---

## 8. Anonymised Monitoring

The planned monitoring system should focus on aggregated information such as:

```text
condition category
referral category
completion status
coarse geographic zone
system version
timestamp
latency
safety escalation flag
```

It should not expose:

```text
name
phone number
home address
full raw conversation
raw audio
personal identifiers
```

---

## 9. Referral Database Data

Facility information is not the same as user personal data.

The referral database may contain:

- facility name;
- state;
- LGA;
- ward;
- service capabilities;
- facility type;
- coordinates;
- hours;
- verification date;
- data source.

The current schema includes these fields.

Facility records must be verified before being treated as authoritative for community deployment.

---

## 10. Referral Matching

The planned referral flow is:

```text
Health condition
       ↓
Urgency
       ↓
Required capability
       ↓
Eligible facilities
       ↓
Verification status
       ↓
Distance / practical suitability
       ↓
Recommended facility
```

The nearest facility is not automatically the correct facility.

For example, a facility without emergency obstetric capability should not be ranked as the preferred destination for an identified maternal emergency merely because it is closer.

---

## 11. Security Boundaries

The web prototype uses server-side PHP configuration for provider credentials.

Production security should ensure:

```text
Browser
  ↓
Secure application endpoint
  ↓
Server-side provider credential
  ↓
External AI service
```

rather than:

```text
Browser
  ↓
Permanent secret API key
```

The latter should not be used.

---

## 12. Repository Secret Protection

The repository `.gitignore` excludes:

```text
northgpt/api/config.php
.env
.env.local
*.log
```

Only `config.example.php` is intended for public source control.

Before every public push, verify that no real key has been committed.

---

## 13. Transport Security

Production online communication should use HTTPS/TLS.

The application should avoid sending sensitive information through unencrypted HTTP.

The exact TLS configuration is a deployment concern and should be validated on the production server.

---

## 14. Offline Fallback

The project proposal includes offline resilience as a core requirement.

A safe fallback architecture can use a limited, clinically reviewed set of high-priority emergency responses stored locally.

Conceptually:

```text
No network
   ↓
Local safety check
   ↓
High-risk presentation?
   ├── YES → immediate pre-approved guidance + facility information
   └── NO  → available local guidance / advise professional assessment
```

Offline fallback content must be clinically reviewed and versioned.

The current web prototype does not claim to have completed this final offline fallback implementation.

---

## 15. Data Synchronisation

When connectivity becomes available, the final application may synchronise:

- updated referral records;
- model updates;
- health-content versions;
- application updates;
- approved aggregate metrics.

Synchronisation should not silently upload raw health conversations or audio unless explicitly required, governed and approved.

---

## 16. Research and Pilot Data

Pilot research involving human participants should be governed by an appropriate protocol.

The protocol should define:

- participant information;
- consent process where required;
- data categories;
- retention;
- access control;
- deletion;
- publication rules;
- incident handling.

Technical convenience must not determine health-data governance.

---

## 17. Data Retention Principle

The system should follow:

> **Collect the minimum necessary, retain it for the minimum necessary period, and use it only for the stated purpose.**

This principle applies especially to voice, health conversation and pilot research data.

---

## 18. Privacy-Preserving Public Dashboard

The planned public dashboard should display aggregate indicators such as:

- total interactions;
- condition distribution;
- referral distribution;
- completion rate;
- broad geographic reach;
- system availability.

It should not display identifiable individual health events.

---

## 19. Data-Flow Security Review Checklist

Before production/community deployment:

- [ ] API keys are not in source control.
- [ ] HTTPS is enabled.
- [ ] Browser credentials are ephemeral where required.
- [ ] Raw audio retention is disabled by default.
- [ ] Conversation logging is minimised.
- [ ] Access controls are configured.
- [ ] Retention periods are documented.
- [ ] Referral records are verified.
- [ ] Health content has clinical approval.
- [ ] Offline fallback content has clinical approval.
- [ ] Pilot data governance is approved.
- [ ] Public dashboard is anonymised.

---

## 20. Privacy and Safety Are Development Requirements

The current prototype demonstrates the interaction concept.

The proposed investment period is where privacy, offline resilience, clinical governance and production-grade monitoring are progressively engineered and validated.
