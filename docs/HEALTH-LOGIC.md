# North Health GPT — Health Logic and Safety Architecture

**RFPS-NYH-2026-503931 | KANAL TECH | Nigeria**

## 1. Purpose

This document defines how North Health GPT is intended to transform natural Hausa conversation into safe health guidance and referral support.

North Health GPT is not designed as an autonomous diagnostic system. The health-logic layer exists specifically to reduce the risk that a general-purpose conversational model will improvise medical advice without appropriate structure.

The final health logic must undergo qualified clinical review before community deployment.

---

## 2. Five Target Conditions

The RFPS defines five target areas:

1. Maternal emergencies
2. Newborn danger signs
3. Meningococcal meningitis
4. Severe acute malnutrition (SAM)
5. Tuberculosis

The referral schema represents these as:

```text
MATERNAL
NEWBORN
MENINGITIS
SAM
TB
```

---

## 3. Clinical Frameworks

The project proposal identifies the following major references:

- WHO Pocket Book of Hospital Care for Children, 2nd edition;
- WHO Making Pregnancy Safer technical guidance;
- WHO-UNICEF Integrated Management of Childhood Illness (IMCI);
- WHO meningitis surveillance/case-definition guidance relevant to the African Meningitis Belt;
- WHO severe acute malnutrition classification/guidance; and
- WHO tuberculosis guidance referenced in the proposal.

The implementation must preserve the distinction between **source guidance** and **AI-generated language**.

Clinical content should be version-controlled and reviewed independently of model changes.

---

## 4. Core Safety Model

```text
User conversation
       ↓
Information extraction
       ↓
Condition / presentation mapping
       ↓
Danger-sign evaluation
       ↓
Urgency classification
       ↓
Referral requirement
       ↓
Hausa response generation
```

The conversational model should not be allowed to override explicit emergency/referral rules.

---

## 5. Safety Priorities

### Priority 1 — Emergency danger signs

When credible emergency danger signs are present, the system should prioritise immediate professional care.

### Priority 2 — High-risk uncertainty

If available information is insufficient to safely exclude a serious condition, the system should avoid false reassurance and escalate appropriately.

### Priority 3 — Appropriate facility

The referral engine should match the condition to facility capability rather than simply choosing the closest facility.

### Priority 4 — Clear Hausa

The response should explain what action is needed in simple, natural Hausa.

### Priority 5 — No unsupported treatment claims

The system should not invent medication, dosage or clinical procedures that are not supported by the approved health pathway.

---

## 6. Maternal Emergency Pathway

The maternal pathway is intended to identify symptoms that may require urgent assessment during pregnancy, labour or the postpartum period.

The system should:

- identify the relevant stage/context;
- recognise serious reported symptoms;
- determine whether urgent referral is required;
- avoid giving false reassurance; and
- route the user toward an appropriately capable facility.

The referral schema gives maternal emergencies a required emergency-obstetric capability (`eoc`) and an immediate urgency category.

The exact clinical decision rules must be approved by the licensed clinical reviewer before deployment.

---

## 7. Newborn Danger-Sign Pathway

The newborn pathway is designed around recognised danger signs requiring professional assessment.

The system should be particularly conservative because newborn deterioration can be rapid.

Where a serious danger sign is reported, the interaction should prioritise:

- immediate professional assessment;
- appropriate facility capability;
- concise instructions;
- minimal unnecessary questioning.

The referral schema associates newborn emergencies with special-care/neonatal capability (`scbu`) and immediate urgency.

---

## 8. Meningitis Pathway

The meningitis pathway is designed to recognise presentations requiring urgent assessment rather than attempt to confirm a diagnosis remotely.

Potentially concerning combinations of symptoms should trigger escalation.

The referral architecture identifies lumbar-puncture/CSF capability as an important facility attribute and assigns immediate urgency to the meningitis referral pathway.

Climate-health context can be used to strengthen seasonal awareness but must not be used as a substitute for clinical danger-sign assessment.

---

## 9. Severe Acute Malnutrition Pathway

The SAM pathway is intended to support recognition and referral of children who may require nutrition or medical assessment.

The system should distinguish between:

- possible nutrition concern;
- signs of severe illness/complication; and
- situations requiring same-day professional assessment.

The referral schema models therapeutic feeding capability and SAM treatment capacity.

The system must not attempt to replace formal anthropometric or clinical assessment where those are required.

---

## 10. Tuberculosis Pathway

The TB pathway is intended to support recognition of concerning respiratory/systemic presentations and appropriate testing or referral.

The system should not claim that a person has TB based only on conversational symptoms.

The correct objective is to:

- recognise concerning patterns;
- explain the need for professional assessment/testing;
- direct the user to an appropriate facility;
- avoid unsupported certainty.

The referral schema models DOTS/TB diagnostic and treatment capability.

---

## 11. General Childhood Illness / IMCI Interaction

The general childhood-health interaction can use IMCI-aligned principles to structure questioning and danger-sign recognition.

This pathway should be used carefully so that the system does not turn a broad conversational category into a diagnosis.

The final implementation should prioritise:

- age/context;
- key danger signs;
- feeding/drinking status;
- breathing-related concerns;
- fever-related concerns;
- vomiting/diarrhoea-related concerns;
- dehydration indicators; and
- referral requirements.

Clinical content must be reviewed before deployment.

---

## 12. Emergency Mode

The application contains an emergency interaction concept.

When the user explicitly requests emergency help or the health logic identifies a high-risk presentation, the system should move from conversational exploration toward action.

Conceptually:

```text
Emergency signal
      ↓
Stop unnecessary questioning
      ↓
State urgency clearly
      ↓
Recommend immediate professional care
      ↓
Identify appropriate facility capability
      ↓
Provide practical next action
```

The exact wording should be natural Hausa and should avoid unnecessary technical language.

---

## 13. Maximum Questioning Principle

The system should not conduct a long questionnaire when a clear emergency has already been identified.

For lower-risk or ambiguous cases, the system can ask focused follow-up questions necessary to improve the safety of the assessment.

The application's implementation should enforce a practical limit on unnecessary conversational loops.

---

## 14. Uncertainty Handling

The health logic should explicitly model uncertainty.

Examples:

```text
High confidence + danger sign
        → urgent referral

Low confidence + potentially serious presentation
        → safer escalation

Low confidence + low-risk presentation
        → cautious guidance + monitoring / appropriate care advice
```

The model should never convert uncertainty into invented certainty.

---

## 15. Referral Rules

The current schema provides preliminary mappings:

| Pathway | Required Capability | Urgency |
|---|---|---|
| Maternal emergency | Emergency obstetric care | Immediate |
| Newborn danger | Special/neonatal care | Immediate |
| Meningitis | Lumbar puncture / CSF capability | Immediate |
| SAM | Therapeutic feeding capability | Same day |
| TB | DOTS/TB capability | Within 48 hours |

These are **architecture-level referral mappings**, not a substitute for final clinical review or facility verification.

---

## 16. Clinical Review Governance

The submitted proposal identifies a licensed clinical reviewer as the central safety mechanism.

The planned reviewer responsibilities include:

1. Review and sign off all five health pathways.
2. Confirm alignment with WHO/IMCI frameworks.
3. Confirm that content remains guidance/referral rather than autonomous diagnosis.
4. Review a sample of anonymised interactions during the pilot.
5. Advise on errors and corrective actions.
6. Review Hausa health content for clinical meaning.

No unreviewed clinical pathway should be promoted to community deployment.

---

## 17. Clinical Content Versioning

Each health pathway should have:

- version number;
- source references;
- clinical reviewer;
- approval date;
- change history;
- deployment status.

Example:

```text
MATERNAL-v0.1
Status: Draft
Clinical review: Pending
Source: WHO framework references
```

This allows a model or prompt update to be separated from a clinical-content update.

---

## 18. AI Role vs. Clinical Logic Role

### AI layer

Useful for:

- understanding natural Hausa;
- conversational context;
- extracting relevant information;
- generating natural Hausa explanations.

### Health-logic layer

Responsible for:

- structured pathways;
- danger-sign rules;
- urgency;
- escalation;
- referral requirements;
- safety constraints.

This separation is a core North Health GPT architectural principle.

---

## 19. Safety Testing

Before community deployment, testing should include:

- clear emergency cases;
- ambiguous cases;
- incomplete symptom descriptions;
- contradictory user statements;
- slang and ordinary Hausa phrasing;
- dialect variation;
- low-literacy communication;
- adversarial or irrelevant prompts;
- attempts to obtain unsupported medication advice.

Evaluation should include both clinical reviewers and language reviewers.

---

## 20. Post-Deployment Monitoring

The pilot should monitor:

- referral appropriateness;
- emergency escalation;
- false reassurance;
- interaction completion;
- user comprehension;
- clinically significant errors.

The proposal identifies a target of **90%+ CHW-validated referral accuracy** for the pilot evaluation.

For severe clinical safety failures, the project should apply a zero-tolerance corrective-action principle: stop, review, correct and revalidate rather than silently continue.

---

## 21. Clinical Disclaimer

North Health GPT is not a doctor and does not replace qualified healthcare professionals.

The technology is designed to support early recognition, guidance and referral.

Community deployment should occur only after the required clinical review, testing and governance steps have been completed.
