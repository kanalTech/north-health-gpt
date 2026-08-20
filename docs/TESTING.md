# North Health GPT — Testing and Evaluation Strategy

**RFPS-NYH-2026-503931 | KANAL TECH | Nigeria**

## 1. Purpose

The repository separates basic engineering validation from clinical, speech and community validation. Passing a repository test does not mean the health system is clinically validated.

## 2. Static Repository Validation

Run:

```bash
php tests/validate_repository.php
```

The script checks:

- required files and documentation;
- screenshots;
- valid JSON referral schema;
- current demo URL;
- absence of the former testing URL;
- absence of `config.php`;
- presence of the secret exclusion in `.gitignore`;
- placeholder-only API configuration; and
- common exposed-secret patterns.

## 3. Prototype Functional Testing

Before a public evaluation session, test at minimum:

### Voice mode

- microphone permission;
- start/stop behaviour;
- user speech capture;
- assistant audio playback;
- interruption/recovery;
- WebSocket disconnect/reconnect behaviour;
- no browser exposure of long-lived API credentials.

### Text mode

- message submission;
- response rendering;
- health-topic cards;
- emergency pathway;
- referral signal handling;
- empty input handling;
- provider error handling.

### Referral

- referral appears only when the health pathway calls for it;
- facility capability is checked before recommendation;
- preliminary sample records are clearly marked unverified;
- the system does not imply that an unverified facility record is a confirmed live service.

## 4. Health-Logic Testing

Clinical testing should include representative and adversarial cases for all five target areas:

- maternal emergency;
- newborn danger signs;
- meningitis;
- severe acute malnutrition; and
- tuberculosis.

Test categories should include:

1. clear emergency;
2. non-emergency;
3. incomplete information;
4. ambiguous language;
5. mixed symptoms;
6. misleading user description;
7. uncertainty; and
8. attempts to obtain unsupported medication/dosage advice.

The expected behaviour is defined by the clinically reviewed health-logic rules, not by whatever answer a general language model happens to generate.

## 5. Speech Evaluation

### ASR

Measure WER separately for dialect, recording condition and health vocabulary. The project proposal target is **WER < 20%**.

### TTS

Measure intelligibility, pronunciation and naturalness. The project proposal target is **MOS > 3.8/5.0**.

## 6. Accessibility Evaluation

Test with Hausa speakers across:

- literacy levels;
- age groups appropriate to the pilot;
- dialect backgrounds;
- smartphone familiarity; and
- realistic connectivity conditions.

The existing 12-participant result reported in the RFPS is treated as early usability evidence, not clinical validation.

## 7. Security Testing

Before every release:

- run the repository validator;
- inspect Git status;
- scan for credentials;
- confirm `config.php` is absent;
- verify API keys are server-side;
- verify HTTPS in production; and
- review logs for accidental health or credential leakage.

## 8. Pilot Evidence

During the planned pilot, collect evidence for:

- interaction completion;
- referral appropriateness;
- CHW agreement;
- user comprehension;
- safety incidents;
- system failures;
- care-seeking behaviour where measurable; and
- accessibility across dialect and literacy groups.

The roadmap targets **85%+ interaction completion** and **90%+ CHW-validated referral accuracy** as development/pilot targets.

## 9. Release Gate

A major feature should move through:

```text
Implemented
   ↓
Automated/static checks
   ↓
Functional testing
   ↓
Clinical/safety review where applicable
   ↓
Controlled user testing
   ↓
Pilot evidence
   ↓
Production/scale decision
```

This prevents the repository from presenting future plans as completed evidence.
