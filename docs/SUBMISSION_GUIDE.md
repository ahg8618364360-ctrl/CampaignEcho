# CampaignEcho — Official Evaluator & Form Submission Guide

**Project**: CampaignEcho — Memory-Powered AI Marketing Intelligence Platform  
**Target Track**: AI Agents That Learn Using Hindsight (Vectorize Hindsight)  
**Release**: Milestone 7.1 Release Candidate  
**Submission Targets**: Google Forms (Individual Profile Review & Final Project Submission)  

---

## 1. Overview of Google Forms Structure

The competition requires two distinct submission workflows:

1. **Individual Profile Review Form** (`https://forms.gle/BGcky3M6Nw1pBEPw6`):
   - **Mandatory for EVERY participant**: Each team member must submit this form separately using their individual details.
   - **What it requires**: Full Name, Email, Role, URL of individual published technical article, URL of individual LinkedIn post, URL of individual Reddit link post, and Band AI Desktop confirmation.
2. **Final Project Submission Form** (`https://forms.gle/7eSw5D2zoT2MhymX7`):
   - **Submitted ONCE by the Team Lead (Adarsh)**: Do NOT instruct all members to submit this form.
   - **What it requires**: Team Name, Project Title, Track, Code Repository URL, Team Demo Video URL, Lead Technical Article URL, and Evaluator Runbook URL.

---

## 2. Form 1: Final Project Submission Walkthrough (Team Lead Only)

To be submitted once by Adarsh via `https://forms.gle/7eSw5D2zoT2MhymX7`:

| Field Name | Exact Recommended Value | Verification / Status |
| :--- | :--- | :--- |
| **Team Name** | `CampaignEcho Core Team` | Registered Team Name (`READY`) |
| **Team Lead / Primary Contact** | `Adarsh` (`ahg8618364360-ctrl`) | Verified GitHub Account (`VERIFIED`) |
| **Project Title** | `CampaignEcho: Memory-Powered AI Marketing Intelligence Platform` | Venture-grade AI agent platform (`READY`) |
| **Problem Statement Category** | `AI Agents That Learn Using Hindsight` | Vectorize Hindsight Core Track (`VERIFIED`) |
| **Short Description** | `CampaignEcho equips autonomous marketing agents with continuous episodic and reflective memory using Vectorize Hindsight, turning campaign postmortems into compounding strategic wisdom.` | Concise, zero prohibited terms (`READY`) |
| **Primary Technology Stack** | `Vectorize Hindsight Cloud (hindsight-client), FastAPI, Python 3.11+, Next.js 15+ App Router, TypeScript, Tailwind CSS, SQLite, Z.ai GLM-4.5-Flash` | Verified 39/39 passing tests (`VERIFIED`) |
| **Code Repository Link (GitHub)** | `https://github.com/ahg8618364360-ctrl/CampaignEcho` | Public repository with release PR (`VERIFIED`) |
| **Demonstration Video Link (YouTube)** | `https://youtu.be/CampaignEcho-Demo-Hindsight` *(Placeholder)* | 4-minute demo (`docs/VIDEO_SCRIPT.md`) (`PENDING_PUBLICATION`) |
| **Lead Technical Article Link** | `https://dev.to/campaignecho/building-continuous-ai-marketing-agents-with-vectorize-hindsight` *(Placeholder)* | 1,480-word article (`article.md`), 8-word title (`READY_TO_PUBLISH`) |
| **Evaluator Runbook / Quick Start** | `https://github.com/ahg8618364360-ctrl/CampaignEcho/blob/main/docs/FINAL_DEMO_RUNBOOK.md` | 5-minute judge runbook & scripts (`VERIFIED`) |

---

## 3. Form 2: Individual Profile Review Walkthrough (All Participants)

Submitted individually by each participant via `https://forms.gle/BGcky3M6Nw1pBEPw6`.  
*Every participant must provide their own published links for an Article, LinkedIn Post, and Reddit Link Post:*

### Participant 1: Adarsh (Lead Engineer)
- **Role**: Memory Architecture & Backend Lead
- **Technical Article URL**: `https://dev.to/campaignecho/building-continuous-ai-marketing-agents-with-vectorize-hindsight` (`READY_TO_PUBLISH`, source: `article.md`, 1,480 words, 8-word title)
- **LinkedIn Post URL**: `https://www.linkedin.com/posts/campaignecho-continuous-marketing-intelligence` (`READY_TO_PUBLISH`, template in `CONTENT_SUBMISSION_TRACKER.md`)
- **Reddit Link Post URL**: `https://reddit.com/r/ArtificialIntelligence/comments/campaignecho-hindsight` (`PENDING_PUBLICATION`)
- **Band AI Desktop Status**: `PENDING` (Participant to confirm installation before submitting form)

### Participant 2: Full-Stack Engineer
- **Role**: Frontend Architecture & UI Craft Lead
- **Technical Article URL**: `https://dev.to/campaignecho/designing-anti-slop-interfaces-for-memory-agents` (`PENDING_PUBLICATION`, 1,200–1,500 words)
- **LinkedIn Post URL**: `https://www.linkedin.com/posts/campaignecho-editorial-ui-craft` (`PENDING_PUBLICATION`)
- **Reddit Link Post URL**: `https://reddit.com/r/webdev/comments/campaignecho-nextjs15-craft` (`PENDING_PUBLICATION`)
- **Band AI Desktop Status**: `PENDING` (Participant to confirm installation before submitting form)

### Participant 3: AI / Evaluation Engineer
- **Role**: Evaluation, Causal Integrity & Video Production Lead
- **Technical Article URL**: `https://dev.to/campaignecho/evaluating-epistemic-integrity-in-agentic-memory` (`PENDING_PUBLICATION`, 1,200–1,500 words)
- **LinkedIn Post URL**: `https://www.linkedin.com/posts/campaignecho-evaluating-memory-agents` (`PENDING_PUBLICATION`)
- **Reddit Link Post URL**: `https://reddit.com/r/MachineLearning/comments/campaignecho-evaluation` (`PENDING_PUBLICATION`)
- **Band AI Desktop Status**: `PENDING` (Participant to confirm installation before submitting form)

---

## 4. Synthetic Data & Scientific Disclosure

- **Live Hindsight Operations**: All Vectorize Hindsight operations (`aretain`, `arecall`, `areflect`) and Z.ai model inferences are real live cloud operations against external production APIs.
- **Synthetic Test Fixtures**: The *The Taco Syndicate* brand and seeded campaign metrics (e.g. 48,200 impressions, 389 redemptions) are synthetic fixtures generated for demonstration purposes. They are flagged with `is_synthetic = True` and must not be described as genuine customer business performance.
- **Scientific Rigor**: Persistent memory provides contextual grounding and mistake avoidance; it does not claim statistically significant causal uplift.

---

## 5. Pre-Submission Checklist

Before submitting either form:
1. [ ] **Pull Request Active**: Verify PR from `feature/m7-final-release` into `main` has green CI checks.
2. [ ] **Video Uploaded**: Replace placeholder YouTube URL with actual uploaded 1080p video URL.
3. [ ] **Lead Article Published**: Replace placeholder Dev.to URL with actual published URL for `article.md`.
4. [ ] **Individual Articles Published**: Each participant has published their own individual article, LinkedIn post, and Reddit link post.
5. [ ] **Band AI Desktop Confirmed**: Each participant has verified Band Desktop on their machine.
