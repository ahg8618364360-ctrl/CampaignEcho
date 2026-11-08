# CampaignEcho — Official Submission Links & Registration Dossier

**Project**: CampaignEcho — Memory-Powered AI Marketing Intelligence Platform  
**Problem Statement Track**: AI Agents That Learn Using Hindsight (Vectorize Hindsight)  
**Submission Version**: Milestone 7.2 Release Hardened  
**Repository**: `https://github.com/ahg8618364360-ctrl/CampaignEcho`  

---

## 1. Google Forms Instructions & Structure

The competition requires two distinct submission forms:

1. **Individual Profile Review Form** (`https://forms.gle/BGcky3M6Nw1pBEPw6`):
   - **Who submits**: **EVERY** participating team member must submit this form individually.
   - **What it captures**: Individual profile, role, individual published technical article URL, individual LinkedIn post URL, individual Reddit link post URL, and Band Desktop usage confirmation.
2. **Final Project Submission Form** (`https://forms.gle/7eSw5D2zoT2MhymX7`):
   - **Who submits**: Submitted **ONCE** by the Team Lead (Adarsh).
   - **What it captures**: Overall project details, code repository link, team YouTube demo video link, lead technical article link, and evaluator runbook.

---

## 2. Google Form 1: Final Project Submission Dossier (Team Lead Only)

To be submitted once by Adarsh via `https://forms.gle/7eSw5D2zoT2MhymX7`:

| Form Field | Value / Content | Verification / Notes | Status |
| :--- | :--- | :--- | :--- |
| **Team Name** | `CampaignEcho Core Team` | Registered team name | `READY` |
| **Team Lead / Primary Contact** | `Adarsh` (`ahg8618364360-ctrl`) | Verified GitHub account & lead engineer | `VERIFIED` |
| **Project Title** | `CampaignEcho: Memory-Powered AI Marketing Intelligence Platform` | Venture-grade AI agent platform | `READY` |
| **Problem Statement Category** | `AI Agents That Learn Using Hindsight` | Vectorize Hindsight Core Track | `VERIFIED` |
| **Short Description** | `CampaignEcho equips autonomous marketing agents with continuous episodic and reflective memory using Vectorize Hindsight, turning campaign postmortems into compounding strategic wisdom.` | 24 words, zero prohibited terms | `READY` |
| **Primary Technology Stack** | `Vectorize Hindsight Cloud (hindsight-client), FastAPI, Python 3.11+, Next.js 15.1.7 App Router, TypeScript, Tailwind CSS, SQLite, Z.ai GLM-4.5-Flash` | Verified runtime stack (47 passing tests: 41 CI / 6 live cloud) | `VERIFIED` |
| **Code Repository Link (GitHub)** | `https://github.com/ahg8618364360-ctrl/CampaignEcho` | Public repository | `VERIFIED` |
| **Pull Request #1 (M7.1 Release Candidate)** | `https://github.com/ahg8618364360-ctrl/CampaignEcho/pull/1` | Open PR into `main` (commit `76c241b`) | `VERIFIED` |
| **GitHub Actions CI Pipeline** | `https://github.com/ahg8618364360-ctrl/CampaignEcho/actions/runs/42443788731` | 100% Green (Backend + Frontend jobs passed) | `VERIFIED` |
| **Demonstration Video Link (YouTube)** | `https://youtu.be/CampaignEcho-Demo-Hindsight` *(Placeholder URL)* | 4-minute screencast adhering to `docs/VIDEO_SCRIPT.md` (1080p) | `PENDING_PUBLICATION` |
| **Lead Technical Article Link** | `https://dev.to/campaignecho/building-continuous-ai-marketing-agents-with-vectorize-hindsight` *(Placeholder URL)* | 1,480-word article (`article.md`), 8-word title, 0 banned words | `READY_TO_PUBLISH` |
| **Evaluator Demo Runbook** | `https://github.com/ahg8618364360-ctrl/CampaignEcho/blob/feature/m7-final-release/docs/FINAL_DEMO_RUNBOOK.md` | 5-minute judge runbook & automated scripts | `VERIFIED` |
| **Engineering & Test Verification** | `https://github.com/ahg8618364360-ctrl/CampaignEcho/blob/feature/m7-final-release/docs/M7_2_SECURITY_UAT_REPORT.md` | 47 passed tests (41 CI unit/contract, 6 live cloud), 8/8 security tests, 21/21 UAT routes | `VERIFIED` |

---

## 3. Google Form 2: Individual Profile Review Dossier (All Members)

Submitted individually by each participant via `https://forms.gle/BGcky3M6Nw1pBEPw6`.  
*Every participant is independently required to publish 1 technical article, 1 LinkedIn post, and 1 Reddit link post.*

### Participant 1: Adarsh (Lead Engineer / Memory Architecture)
- **Role**: Backend & Memory Architecture Lead
- **Technical Article URL**: `https://dev.to/campaignecho/building-continuous-ai-marketing-agents-with-vectorize-hindsight` (`READY_TO_PUBLISH`, source: `article.md`, 1,480 words)
- **LinkedIn Post URL**: `https://www.linkedin.com/posts/campaignecho-continuous-marketing-intelligence` (`READY_TO_PUBLISH`, template in `CONTENT_SUBMISSION_TRACKER.md`)
- **Reddit Link Post URL**: `https://reddit.com/r/ArtificialIntelligence/comments/campaignecho-hindsight` (`PENDING_PUBLICATION`)
- **Band AI Desktop Status**: `PENDING` (CLI not present in local test environment; participant to confirm desktop installation prior to form submission)

### Participant 2: Full-Stack Engineer (Frontend Architecture & UI Craft)
- **Role**: Frontend Architecture & UI Craft Lead
- **Technical Article URL**: `https://dev.to/campaignecho/designing-anti-slop-interfaces-for-memory-agents` (`PENDING_PUBLICATION`, draft in preparation, 1,200–1,500 words)
- **LinkedIn Post URL**: `https://www.linkedin.com/posts/campaignecho-editorial-ui-craft` (`PENDING_PUBLICATION`)
- **Reddit Link Post URL**: `https://reddit.com/r/webdev/comments/campaignecho-nextjs15-craft` (`PENDING_PUBLICATION`)
- **Band AI Desktop Status**: `PENDING` (Participant to confirm desktop installation prior to form submission)

### Participant 3: AI / Evaluation Engineer (Causal Integrity & QA)
- **Role**: Causal Reasoning, Evaluation & Video Production Lead
- **Technical Article URL**: `https://dev.to/campaignecho/evaluating-epistemic-integrity-in-agentic-memory` (`PENDING_PUBLICATION`, draft in preparation, 1,200–1,500 words)
- **LinkedIn Post URL**: `https://www.linkedin.com/posts/campaignecho-evaluating-memory-agents` (`PENDING_PUBLICATION`)
- **Reddit Link Post URL**: `https://reddit.com/r/MachineLearning/comments/campaignecho-evaluation` (`PENDING_PUBLICATION`)
- **Band AI Desktop Status**: `PENDING` (Participant to confirm desktop installation prior to form submission)

---

## 4. Synthetic Provenance & Scientific Disclosure

- **Live Operations**: All Vectorize Hindsight Cloud operations (`aretain`, `arecall`, `areflect`), SQLite persistence, and Z.ai model inferences are real live cloud operations executed with genuine API credentials.
- **Synthetic Fixtures**: The *The Taco Syndicate* brand profile, campaign concepts, and seeded metrics (e.g. 48,200 impressions, 389 redemptions) are synthetic demonstration fixtures designed for controlled evaluation. They are explicitly marked with `is_synthetic = True` and are never described as actual commercial customer results.
- **Scientific Honesty**: The `/memory-evolution` side-by-side comparison demonstrates qualitative and contextual grounding enabled by persistent memory; it does not claim statistically significant causal uplift.
