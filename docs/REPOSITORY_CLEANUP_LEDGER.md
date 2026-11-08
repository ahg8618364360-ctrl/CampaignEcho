# CampaignEcho — Repository Cleanup Ledger & Hygiene Audit

**Audit Date**: November 8, 2026  
**Milestone**: M7.2 Release Hardening  
**Auditor**: Release Engineering Team  

---

## 1. Executive Summary

In preparation for public release and evaluator inspection, a comprehensive hygiene audit was executed across the repository. The audit focused on eliminating build artifacts, removing unreferenced duplicate assets, ensuring cross-platform path portability, verifying database migration manifests, and hardening `.gitignore` rules.

---

## 2. Tracked Files Removed / Untracked

| File Path | Action | Rationale |
|:---|:---|:---|
| `frontend/tsconfig.tsbuildinfo` | **Untracked** (`git rm --cached`) | Transient TypeScript incremental build artifact. Should never be committed to git. Enforced via root `.gitignore`. |
| `docs/screenshots/page-2026-11-05T12-56-30-254Z.png` | **Deleted** (`git rm`) | Exact duplicate of `before-dark-dashboard.png` (94,607 bytes). Unreferenced timestamped scratch capture. |
| `docs/screenshots/page-2026-11-05T13-19-48-395Z.png` | **Deleted** (`git rm`) | Exact duplicate of `after-desktop-1440x900.png` (202,162 bytes). Unreferenced timestamped scratch capture. |
| `docs/screenshots/page-2026-11-05T13-20-00-148Z.png` | **Deleted** (`git rm`) | Exact duplicate of `after-tablet-768x1024.png` (228,704 bytes). Unreferenced timestamped scratch capture. |
| `docs/screenshots/page-2026-11-05T13-20-10-115Z.png` | **Deleted** (`git rm`) | Exact duplicate of `after-mobile-390x844.png` (216,914 bytes). Unreferenced timestamped scratch capture. |

---

## 3. Path Portability Remediation

| Script | Modification | Before | After |
|:---|:---|:---|:---|
| `scripts/capture_density_qa.js` | Portable `ARTIFACT_DIR` | Hardcoded `C:\\Users\\Admin\\.gemini\\...` | `process.env.ARTIFACT_DIR \|\| path.resolve(__dirname, "..", "docs", "screenshots")` |
| `scripts/capture_m32_qa.js` | Portable `ARTIFACT_DIR` | Hardcoded `C:\\Users\\Admin\\.gemini\\...` | `process.env.ARTIFACT_DIR \|\| path.resolve(__dirname, "..", "docs", "screenshots")` |

---

## 4. Configuration & Manifest Ledger

| Manifest File | Status | Notes |
|:---|:---|:---|
| `alembic.ini` (root) | **Retained** | Root migration runner pointing to `%(here)s/backend/alembic` with `prepend_sys_path = .`. Evaluators running `alembic upgrade head` from root execute cleanly. |
| `backend/alembic.ini` | **Retained** | Preserved for developers running migration tooling within `backend/` directory. |
| `pyproject.toml` | **Retained & Verified** | Flat-layout package specification explicitly defining `backend` package with exclude `["frontend*"]` to ensure seamless `pip install -e .`. |
| `.gitignore` | **Audited** | Fully blocks `*.tsbuildinfo`, `frontend/.next/`, `node_modules/`, `venv/`, `*.db`, `scripts/demo-ownership.json`, and credentials. |

---

## 5. Verified Screen Assets Ledger

The following canonical screenshot assets in `docs/screenshots/` are retained and verified:
- **Baseline Design Proofs**: `before-dark-dashboard.png`, `after-desktop-1440x900.png`, `after-tablet-768x1024.png`, `after-mobile-390x844.png`
- **M3.2 Visual QA Proofs**: `m32-overview-desktop.png`, `m32-overview-mobile-390.png`, `m32-brands-desktop.png`, `m32-campaign-studio-desktop.png`, `m32-campaign-studio-mobile-390.png`, `m32-campaign-history-desktop.png`, `m32-memory-explorer-desktop.png`, `m32-memory-explorer-mobile-390.png`, `m32-settings-desktop.png`
- **M5 Memory Evolution Proofs**: `m5-memory-evolution-desktop.png`, `m5-memory-evolution-mobile.png`
- **M6 Production Audit Proofs**: 14 breakpoint screenshots covering 7 core routes on Desktop (1440px) and Mobile (390px).
- **M7.2 User Acceptance Test (UAT) Proofs**: 21 responsive route screenshots located in `docs/screenshots/uat/` spanning Desktop (1440x900), Tablet (768x1024), and Mobile (390x844).
