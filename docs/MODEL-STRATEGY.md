# North Health GPT — Model and Voice Strategy

**RFPS-NYH-2026-503931 | KANAL TECH | Nigeria**

## 1. Strategic Objective

North Health GPT should not become a permanent wrapper around a single commercial model. The current prototype uses commercial AI infrastructure because it provides a practical way to demonstrate the user experience while the specialised Hausa technology and health-safety layers are being developed.

The long-term technical strategy is therefore **provider-independent, Hausa-native and progressively local/offline-capable**.

## 2. What Exists Today

The current web prototype demonstrates:

- real-time voice interaction through Gemini Live infrastructure;
- text-mode interaction through a Gemini API endpoint;
- Hausa-focused system instructions and interaction design;
- condition-specific health pathways; and
- referral-oriented behaviour.

Gemini Live is a third-party real-time voice service. North Health GPT does **not** claim to have fine-tuned Gemini Live.

## 3. Why We Are Not Claiming a Fine-Tuned Gemini Live Model

Gemini Live is a proprietary hosted model/service. The appropriate claim is that North Health GPT **integrates and configures** Gemini Live for the current prototype, not that the project has trained or fine-tuned the underlying model.

This distinction protects technical credibility. A reviewer should be able to reproduce the claim from the repository.

## 4. North Health GPT-Specific Hausa Speech Layer

The proposed investment period will develop dedicated Hausa speech capabilities.

### ASR

Target components include:

- professionally collected Hausa speech data;
- multiple dialect regions;
- health vocabulary;
- noisy real-world recordings;
- WER evaluation; and
- eventual low-resource/on-device inference.

The project proposal establishes a development target of **WER < 20%**.

### TTS

Target components include:

- professional Hausa voice recordings;
- grapheme-oriented synthesis;
- health-term pronunciation testing;
- intelligibility testing;
- MOS-style evaluation; and
- eventual local/offline execution where technically viable.

The project proposal establishes a development target of **MOS > 3.8/5.0**.

## 5. Health Intelligence Must Remain Separate

Speech and language models should not be the sole medical decision authority. The architecture separates:

```text
Speech / language model
        ↓
Information extraction
        ↓
North Health GPT health state
        ↓
Clinically reviewed rules
        ↓
Urgency / referral decision
        ↓
Hausa response generation
```

This separation allows the speech or reasoning provider to change without rewriting the clinical safety architecture.

## 6. Provider Adapter Principle

Each external model provider should be treated as an adapter rather than as the product itself. Conceptually:

```text
                    ┌── Gemini Live adapter
                    │
North Health GPT ────┼── Text-model adapter
 core interfaces     │
                    ├── Future local/open model adapter
                    │
                    └── Future dedicated Hausa ASR/TTS
```

The adapter boundary should define stable inputs/outputs so that provider migration is an implementation change, not a product rewrite.

## 7. Funding Alignment

UNICEF's current funding guidance explicitly supports AI/data-science solutions and explains that a funded solution can use a combination of Open Source and closed-license technologies, while the solution receiving investment must be Open Source under the published rules. End-to-end Open Source solutions are given priority.

The North Health GPT strategy therefore aims to make the **project's funded solution** increasingly independent of proprietary speech services and ready for Open Source publication, while transparently disclosing third-party dependencies used during prototyping.

Official reference: https://www.unicefventurefund.org/apply-funding

## 8. Migration Path

```text
CURRENT
Gemini Live + Gemini text API
        ↓
STAGE 1
Stable provider adapters + structured health state
        ↓
STAGE 2
Dedicated Hausa ASR + dedicated Hausa TTS
        ↓
STAGE 3
Offline-capable Android + cached/local components
        ↓
STAGE 4
Community validation + safety evaluation
        ↓
STAGE 5
Open-source, reusable North Health GPT technology stack
```

## 9. What We Will Measure

The transition is evidence-driven. Components should not be declared replacements merely because they exist. Each replacement should demonstrate:

- accuracy;
- latency;
- Hausa comprehension;
- health-vocabulary performance;
- robustness to noise and dialect variation;
- safety behaviour;
- device/resource requirements; and
- user acceptance.

## 10. Decision Rule

The project should keep a hosted provider where it materially improves safety or prototype capability while a dedicated replacement is still below the required evidence threshold. This avoids replacing a working component with a weaker one merely to make the architecture appear more independent.
