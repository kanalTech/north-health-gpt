# North Health GPT — 12-Month Development Roadmap

**RFPS-NYH-2026-503931 | KANAL TECH | Nigeria**  
**Proposed UNICEF Innovation Fund Investment Period — Phase 1**

## 1. Roadmap Objective

The purpose of the 12-month roadmap is to transform the existing working prototype into a clinically reviewed, Hausa-native, increasingly offline-capable and community-tested digital health platform.

The roadmap deliberately distinguishes:

- what exists today;
- what will be engineered;
- what will be clinically reviewed;
- what will be tested with communities; and
- what evidence will be produced before scale.

---

## 2. Programme Structure

| Phase | Months | Focus |
|---|---:|---|
| **Phase 1 — BUILD** | 1–6 | Speech technology, health logic, Android, referral infrastructure, monitoring |
| **Phase 2 — PILOT** | 7–10 | Kano community deployment, CHW participation, usability and referral evidence |
| **Phase 3 — EVIDENCE & SCALE** | 10–12 | Evidence publication, government engagement and replication planning |

---

# PHASE 1 — BUILD

## Month 1 — Clinical and Technical Foundation

### Clinical

- Contract/appoint licensed clinical reviewer.
- Begin WHO/IMCI review of all five condition pathways.
- Establish clinical-content versioning and approval workflow.
- Define emergency escalation rules.

### Speech

- Begin Hausa speech-data recruitment and recording planning.
- Define recording specifications.
- Define dialect coverage strategy.
- Establish annotation and quality-control process.

### Engineering

- Freeze prototype baseline.
- Define internal interfaces between ASR, health logic, TTS and referral components.
- Define model/provider adapter architecture.
- Establish automated testing strategy.

---

## Month 2 — Hausa Data and Referral Foundation

### Speech

- Begin Kano and Katsina dialect data collection.
- Begin professional Hausa TTS recording.
- Establish speech-quality review.

### Referral

- Compile government-approved Kano State facility information.
- Classify facility capabilities.
- Begin field verification.

### Health logic

- Draft detailed logic for maternal, newborn, meningitis, SAM and TB pathways.

---

## Month 3 — Model Development and Clinical Sign-Off

### ASR

- Begin training/fine-tuning the dedicated Hausa ASR model using the growing dataset.
- Continue toward the 50+ hour target.

### TTS

- Begin Hausa TTS training/development.
- Start MOS-style evaluation.

### Clinical

- Complete initial clinical review and sign-off of the five health pathways before community deployment.

### Android

- Begin Android application development.
- Establish offline storage architecture.

### UX

- Begin structured usability testing with Hausa speakers across literacy levels.

### Engineering quality

- Establish CI/testing pipeline.
- Target at least 80% unit-test coverage for components where meaningful automated unit testing is applicable.

---

## Month 4 — Technical Evaluation and Referral Expansion

### ASR

- Evaluate WER by dialect.
- Investigate error categories.
- Target WER < 20% as specified in the project proposal.

### TTS

- Conduct MOS-style evaluation.
- Target MOS > 3.8/5.0.

### Referral

- Complete Kano validation milestone.
- Begin expansion to the wider 19-state coverage defined by the project plan.

### Monitoring

- Begin development of privacy-preserving anonymised interaction logging.

---

## Month 5 — Integration

### Referral

- Continue 19-state facility compilation.
- Target minimum verification requirements defined in the proposal.

### Android

- Progress toward feature-complete application build.
- Test low-cost Android devices.

### Speech

- Improve dialect performance based on evaluation results.

### Language

- Test Kano, Katsina and Sokoto comprehension.

### Dashboard

- Begin monitoring dashboard implementation.

---

## Month 6 — Integrated Build and Open-Source Release Preparation

By Month 6, the project should have an integrated system suitable for controlled pilot preparation.

Target deliverables include:

- clinically reviewed health pathways;
- dedicated Hausa ASR development build;
- dedicated Hausa TTS development build;
- Android application build;
- referral database expansion;
- monitoring system;
- technical documentation;
- automated tests;
- deployment documentation.

Where individual components are mature enough, their code/model repositories should be published under the appropriate open-source/data licence.

**Important:** repositories should only be published when the corresponding component genuinely exists. The current main repository does not pretend that future ASR, TTS, Android or dashboard repositories already exist.

---

# PHASE 2 — PILOT

## Month 7 — Controlled Community Launch

### Pilot

- Launch in selected Kano State LGAs.
- Target at least three LGAs.
- Recruit/train community health workers.
- Begin participant enrolment toward 500–1,000 users.

### Community engagement

- Hausa-language sensitisation.
- Radio/community communication channels where appropriate.

---

## Month 8 — Monitoring and Iteration

Measure:

- interaction completion;
- referral recommendation;
- referral follow-through where measurable;
- user comprehension;
- CHW usability;
- ASR dialect performance;
- system failures.

Target interaction completion: **85%+**.

Begin structured care-seeking interviews.

---

## Month 9 — Validation

### Referral

Target CHW-validated referral accuracy: **90%+**.

### Language

- Compare Kano, Katsina and Sokoto comprehension.
- Investigate dialect gaps.

### Safety

- Review anonymised interaction samples.
- Identify false reassurance or inappropriate escalation.

### Product

- Update prompts, logic and UX based on evidence.

---

## Month 10 — Pilot Completion

- Complete pilot data collection.
- Analyse interaction completion.
- Analyse referral accuracy.
- Analyse documented care-seeking behaviour.
- Complete CHW satisfaction evaluation.
- Prepare evidence package for Phase 3.

---

# PHASE 3 — EVIDENCE & SCALE PREPARATION

## Month 11 — Evidence and Partnerships

- Draft pilot evidence report.
- Analyse climate-health context where data supports it.
- Begin/continue engagement with Kano State Ministry of Health.
- Engage relevant Federal Ministry of Health digital-health stakeholders.
- Review technical lessons for scale.

---

## Month 12 — Scale Readiness

- Publish final evidence report where appropriate.
- Document Lake Chad Basin replication framework.
- Prepare follow-on funding applications.
- Complete CHW lessons-learned process.
- Confirm public technical repositories and documentation.
- Submit required final reporting.

---

# 3. Key Performance Targets

| KPI | Target |
|---|---:|
| Pilot users | 500–1,000 |
| Interaction completion | ≥ 85% |
| CHW-validated referral accuracy | ≥ 90% |
| ASR WER target | < 20% |
| TTS MOS target | > 3.8/5.0 |
| Dashboard uptime target | ≥ 99% during investment period |
| Unit-test coverage target | ≥ 80% where applicable |
| Facility coverage target | 1,500+ across planned 19-state coverage |
| Kano facility field verification | Minimum 30% |
| Other-state verification | Minimum 20% per state |
| Government/development partner meetings | ≥ 2 |
| Follow-on funding applications | ≥ 1 |

---

# 4. Clinical Safety KPI

Clinical safety is not treated as an ordinary product KPI.

For severe safety failures:

```text
Detect
  ↓
Stop affected pathway if necessary
  ↓
Clinical review
  ↓
Correct
  ↓
Retest
  ↓
Reapprove
  ↓
Resume
```

The system should not trade safety for uptime or pilot growth.

---

# 5. Speech Data Programme

The target is a minimum **50 hours of recorded Hausa speech** across multiple dialect regions.

The dataset programme should define:

- speakers;
- dialect;
- age range where ethically/operationally appropriate;
- recording conditions;
- microphone/device;
- transcript quality;
- segmentation;
- consent/data rights;
- train/validation/test splits.

The final dataset should avoid speaker leakage between evaluation sets.

---

# 6. Referral Database Programme

The referral database is one of the project's key operational assets.

The programme should:

1. collect authoritative facility records;
2. classify capability;
3. remove duplicates;
4. verify facility status;
5. conduct field verification;
6. record verification dates;
7. maintain update procedures;
8. expose only appropriate public information.

The repository's current `schema/referral-database.json` defines the structure and preliminary examples.

---

# 7. Open-Source Release Strategy

The project proposal anticipates separate technical repositories as components mature.

Potential repositories include:

| Repository | Intended Contents | Status in this repository |
|---|---|---|
| `north-health-gpt` | Main prototype, documentation and schemas | **Current** |
| `north-health-gpt-asr` | Hausa ASR pipeline and model assets | **Planned** |
| `north-health-gpt-tts` | Hausa TTS pipeline and model assets | **Planned** |
| `north-health-gpt-android` | Android application | **Planned** |
| `north-health-gpt-health-logic` | Structured health logic and clinical docs | **Planned / may evolve from this repository** |
| `north-health-gpt-dashboard` | Monitoring dashboard | **Planned** |

The project should not create empty repositories merely to claim that they exist.

---

# 8. Pilot Evidence Framework

The pilot should generate evidence in four categories.

### Accessibility

- Can users complete interactions?
- Does literacy level affect performance?
- Do users understand the response?

### Clinical safety

- Does the system escalate danger signs?
- Does it avoid false reassurance?
- Is referral appropriate?

### Technical performance

- Is Hausa ASR reliable?
- Is TTS understandable?
- Does the application tolerate poor connectivity?

### Behavioural outcome

- Does the system influence timely care-seeking?
- Do users follow referrals?
- What barriers remain?

---

# 9. Climate-Health Evidence

The project proposes to examine the relationship between the system's seasonal health guidance and climate-sensitive health risks.

This may include:

- meningitis-season interaction patterns;
- lean-season malnutrition screening/referral patterns;
- service-access disruption during climate shocks;
- offline usage during connectivity disruption.

The project should avoid claiming causal climate-health effects from a small pilot unless the study design supports such conclusions.

---

# 10. Scale Pathway

The intended progression is:

```text
Kano prototype
      ↓
Kano clinical review
      ↓
Kano community pilot
      ↓
Evidence
      ↓
Northern Nigeria expansion
      ↓
Lake Chad Basin replication
```

Potential future expansion should be driven by evidence and partner readiness rather than assuming that a successful prototype automatically proves large-scale clinical impact.

---

# 11. Final 12-Month Deliverable Picture

By the end of the proposed period, the target is a **fully functional, clinically reviewed and community-tested North Health GPT system in Kano State**, with:

- Hausa voice access;
- five WHO-aligned health pathways;
- dedicated Hausa speech technology;
- low-cost Android support;
- offline capability for appropriate functions;
- structured referral intelligence;
- anonymised monitoring;
- documented pilot evidence; and
- a documented pathway for wider replication.

The key objective is not simply to demonstrate that an AI can speak Hausa.

The objective is to demonstrate that a Hausa-native, voice-first health technology system can be made **safe, useful, measurable, resilient and scalable** for communities that conventional digital health products often fail to reach.


# 12. API Security, Provider Independence and Evaluation Gates

These cross-cutting workstreams run throughout the investment period.

## API security

- Keep all live provider credentials outside the public repository.
- Maintain `config.example.php` as a placeholder-only template.
- Run secret scanning before releases.
- Rotate any credential immediately if exposure is suspected.
- Keep provider-specific configuration behind a replaceable backend boundary.

## Provider independence

The project will not claim a dedicated Hausa ASR/TTS replacement merely because a model has been trained. A component becomes a candidate replacement only after meeting the relevant accuracy, safety, latency, language and device requirements.

## Evaluation gates

Every major capability should pass:

```text
Engineering test
      ↓
Safety/clinical review where applicable
      ↓
Controlled user testing
      ↓
Pilot evidence
      ↓
Scale decision
```

This protects the credibility of the repository during technical due diligence and keeps the funding programme focused on measurable proof rather than feature count.
