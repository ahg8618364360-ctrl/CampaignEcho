# CampaignEcho — Official Evaluator & Form Submission Guide

**Project**: CampaignEcho — Memory-Powered AI Marketing Intelligence Platform  
**Target Track**: AI Agents That Learn Using Hindsight (Vectorize Hindsight)  
**Release**: Milestone 7 Final Release Package  
**Submission Target**: Google Forms 1 & 2  

---

## 1. Overview of Submission Deliverables

To successfully register CampaignEcho for evaluation, the team must complete two separate submission forms:
1. **Google Form 1 (Project Submission)**: Submitted once by the Team Lead (Adarsh). Contains overall project metadata, GitHub repository, demonstration video link, and technical article link.
2. **Google Form 2 (Individual Content Submission)**: Submitted by each participating team member with their individual published content piece.

---

## 2. Google Form 1: Project Submission Walkthrough

Copy and paste the exact verified values below into the corresponding Google Form fields:

| Field Name | Exact Copy-Paste Value | Verification / Source |
| :--- | :--- | :--- |
| **Team Name** | `CampaignEcho Core Team` | Registered Team Name |
| **Team Lead / Primary Contact** | `Adarsh` (`ahg8618364360-ctrl`) | Verified GitHub Account |
| **Project Title** | `CampaignEcho: Memory-Powered AI Marketing Intelligence Platform` | Venture-grade AI agent platform |
| **Problem Statement Category** | `AI Agents That Learn Using Hindsight` | Vectorize Hindsight Core Track |
| **Short Summary (1-2 sentences)** | `CampaignEcho equips autonomous marketing agents with continuous episodic and reflective memory using Vectorize Hindsight, turning campaign postmortems into compounding strategic wisdom.` | Concise, zero banned words |
| **Primary Technology Stack** | `Vectorize Hindsight Cloud (hindsight-client), FastAPI, Python 3.11+, Next.js 15+ App Router, TypeScript, Tailwind CSS, SQLite, Z.ai GLM-4.5-Flash` | Verified 39/39 passing tests |
| **Code Repository Link (GitHub)** | `https://github.com/ahg8618364360-ctrl/CampaignEcho` | Public repo with release PR |
| **Demonstration Video Link (YouTube)** | `https://youtu.be/CampaignEcho-Demo-Hindsight` *(Replace with live upload URL)* | 4-minute demo following `docs/VIDEO_SCRIPT.md` |
| **Technical Article Link** | `https://dev.to/campaignecho/building-continuous-ai-marketing-agents-with-vectorize-hindsight` *(Replace with published URL)* | 1,350-word article (`article.md`), 0 banned terms |
| **Evaluator Runbook / Quick Start** | `https://github.com/ahg8618364360-ctrl/CampaignEcho/blob/main/docs/FINAL_DEMO_RUNBOOK.md` | 5-minute judge runbook |

---

## 3. Google Form 2: Individual Content Submission Walkthrough

Each team member must submit their own entry for Form 2:

### Member 1: Adarsh (Lead Engineer / Author)
- **Role**: Memory Architecture & Backend Lead
- **Content Type**: In-Depth Technical Article
- **Platform**: Dev.to / Hashnode / Medium
- **Title**: `Building Continuous AI Marketing Agents with Vectorize Hindsight` (8 words)
- **Draft Source**: `article.md` (Repository root)
- **Compliance Checks**:
  - [x] Vectorize Hindsight explicitly featured in title and body.
  - [x] Zero occurrences of prohibited competition jargon.
  - [x] Real code snippets from `MemoryService` and `test_memory_cloud.py`.
  - [x] Tagged `@Code.in` and `@Vectorize`.

### Member 2: Full-Stack / Product Engineer
- **Role**: Frontend Architecture & UI Craft
- **Content Type**: Professional Product Deep Dive & Visual Carousel
- **Platform**: LinkedIn
- **Draft Source**: Template in `CONTENT_SUBMISSION_TRACKER.md` (Section 2)
- **Compliance Checks**:
  - [x] Visual carousel screenshots attached (`docs/screenshots/`).
  - [x] Zero occurrences of prohibited competition jargon.
  - [x] Tagged `@Code.in` and `@Vectorize`.

### Member 3: AI / Evaluation Engineer
- **Role**: Evaluation, Quality & Video Demo
- **Content Type**: Video Walkthrough & Architectural Breakdown
- **Platform**: YouTube (Unlisted or Public 1080p)
- **Draft Source**: `docs/VIDEO_SCRIPT.md` and `docs/VIDEO_SHOT_LIST.md`
- **Compliance Checks**:
  - [x] Features host Adarsh presenting real live software.
  - [x] Shows `/memory-evolution` Mode A vs. Mode B comparison.
  - [x] Shows real-time Hindsight retention and immediate fresh session recall.
  - [x] Duration: ~4 minutes.
  - [x] Zero occurrences of prohibited competition jargon.

---

## 4. Pre-Submission Compliance Checklist

Before submitting either form, verify every item below:

1. [ ] **Repository is Public**: Check `https://github.com/ahg8618364360-ctrl/CampaignEcho` in an incognito window.
2. [ ] **Pull Request Opened**: Pull request from `feature/m7-final-release` into `main` is created and visible.
3. [ ] **Tests Pass 100%**: Run `pytest` locally to confirm all 39 tests pass.
4. [ ] **No Secret Keys in Git**: Verify that `.env` is in `.gitignore` and no API keys were committed.
5. [ ] **Zero Banned Words**: No prohibited competition words in `article.md`, `docs/VIDEO_SCRIPT.md`, or social copy.
6. [ ] **Video Uploaded**: Video uploaded in 1080p with clear audio and live software capture.
7. [ ] **Article Published**: Article published on Dev.to/Hashnode with live links to GitHub.

