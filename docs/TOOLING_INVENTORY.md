# Antigravity Global Tooling & Environment Inventory

**Audit Date**: November 2026  
**Environment**: Windows 11 x64  
**Workspace**: `C:\CampaignEcho`  
**Antigravity Discovery Roots**:
- Universal Agents Global: `C:\Users\Admin\.agents\skills`
- Antigravity App Global: `C:\Users\Admin\.gemini\config\skills`
- Antigravity Built-in: `C:\Users\Admin\.gemini\antigravity\builtin\skills`
- Antigravity Global MCP: `C:\Users\Admin\.gemini\config\mcp_config.json`

---

## 1. Runtime Environments & CLI Utilities

| Utility / Runtime | Version | Path / Executable | Health / Status | Relevance to CampaignEcho |
| :--- | :--- | :--- | :--- | :--- |
| **Node.js** | v26.9.0 | `C:\Program Files\nodejs\node.exe` | Healthy (Active 64-bit runtime) | **Core**: Powers Next.js 15+ frontend, UI build toolchains, and Playwright automation |
| **npm** | v11.x (via Node 26) | `C:\Program Files\nodejs\npm.cmd` | Note: PowerShell execution policy blocks `.ps1`; call `npm.cmd` | **Core**: Package management for web frontend |
| **npx** | v11.x | `C:\Program Files\nodejs\npx.cmd` | Note: PowerShell execution policy blocks `.ps1`; call `npx.cmd` | **Core**: Package execution (Vercel Skills CLI, Playwright MCP runner) |
| **Python** | 3.13.14 | `C:\Users\Admin\AppData\Local\Programs\Python\Python313\python.exe` | Healthy | **Core**: Powers FastAPI backend, SQLAlchemy ORM, and Hindsight client SDK |
| **Git** | 2.56.0.windows.4 | `C:\Program Files\Git\cmd\git.exe` | **Newly Installed** via Windows Package Manager (`winget`) | **Core**: Version control, repository cloning, skills CLI Git operations |
| **Antigravity CLI (`agy`)** | Active | `C:\Users\Admin\.gemini\bin\agy.exe` | Healthy; native agent runner, plugin, mcp manager | **Core**: Antigravity runtime, ACP server, agent orchestration |
| **Windows Package Manager** | v1.29.380 | `winget.exe` | Healthy | Administrative system installs |

---

## 2. Global Skills Inventory

All 20 curated skills have been installed globally via the Vercel Skills CLI (`skills@latest`) and mirrored across both `~/.agents/skills/` (for CLI & universal agent interop) and `~/.gemini/config/skills/` (for native Antigravity App discovery).

| Skill Name | Canonical Publisher / Repo | Global Location | Primary Purpose | Relevant to CampaignEcho? |
| :--- | :--- | :--- | :--- | :--- |
| **`refero-design`** | `referodesign/refero_skill` | `~/.gemini/config/skills/refero-design`<br>`~/.agents/skills/refero-design` | SaaS visual reference research, layout patterns, flow analysis | **Mandatory Priority 1** (UI reference lock authority) |
| **`design-taste-frontend`** | `Leonxlnx/taste-skill` | `~/.gemini/config/skills/design-taste-frontend`<br>`~/.agents/skills/design-taste-frontend` | Distinctive visual styling, anti-generic AI typography and layout | **Mandatory Priority 1** (Frontend taste & craft) |
| **`frontend-design`** | `anthropics/skills` | `~/.gemini/config/skills/frontend-design`<br>`~/.agents/skills/frontend-design` | Supplemental visual hierarchy, typographic scale, component polish | **Priority 1** (Secondary design authority) |
| **`web-design-guidelines`** | `vercel-labs/agent-skills` | `~/.gemini/config/skills/web-design-guidelines`<br>`~/.agents/skills/web-design-guidelines` | Accessibility audits, touch targets, contrast, web interface heuristics | **Priority 1** (Verification audit) |
| **`vercel-react-best-practices`** | `vercel-labs/agent-skills` | `~/.gemini/config/skills/vercel-react-best-practices`<br>`~/.agents/skills/vercel-react-best-practices` | Next.js rendering, memoization, bundle optimization, server/client boundaries | **Priority 1** (Frontend engineering standards) |
| **`vercel-composition-patterns`** | `vercel-labs/agent-skills` | `~/.gemini/config/skills/vercel-composition-patterns`<br>`~/.agents/skills/vercel-composition-patterns` | Compound components, slots, context providers, avoid prop drilling | **Priority 1** (Component architecture) |
| **`ponytail-review`** | `DietrichGebert/ponytail` | `~/.gemini/config/skills/ponytail-review`<br>`~/.agents/skills/ponytail-review` | Code review for accidental complexity, dead code, premature abstractions | **Priority 2** (Code quality review) |
| **`ponytail-audit`** | `DietrichGebert/ponytail` | `~/.gemini/config/skills/ponytail-audit`<br>`~/.agents/skills/ponytail-audit` | Whole-repo bloat and over-engineering audit | **Priority 2** (Milestone audit checkpoints) |
| **`browser-qa`** | `affaan-m/ecc` | `~/.gemini/config/skills/browser-qa`<br>`~/.agents/skills/browser-qa` | Automated browser verification, UI regression, console error audit | **Priority 2** (Visual and interaction acceptance) |
| **`logo-design`** | `kaankiziltug/logo-design-skill` | `~/.gemini/config/skills/logo-design`<br>`~/.agents/skills/logo-design` | SVG brand marks, geometric logos, scalable identity design | **Priority 2** (CampaignEcho & Brand identity) |
| **`agent-reach`** | `panniantong/agent-reach` | `~/.gemini/config/skills/agent-reach`<br>`~/.agents/skills/agent-reach` | Read-only platform intelligence, content retrieval, platform research | **Priority 2** (Social marketing research) |
| **`living-docs-governance`** | `affaan-m/ecc` | `~/.gemini/config/skills/living-docs-governance`<br>`~/.agents/skills/living-docs-governance` | Anti-documentation drift, living decision logs, project maps | **Priority 2** (Docs governance for project lifecycle) |
| **`intent-driven-development`** | `affaan-m/ecc` | `~/.gemini/config/skills/intent-driven-development`<br>`~/.agents/skills/intent-driven-development` | Structured specs, verifiable acceptance criteria, testable intents | **Priority 2** (Specification & task scoping) |
| **`gsap-core`** | `nexu-io/motion-anything` | `~/.gemini/config/skills/gsap-core`<br>`~/.agents/skills/gsap-core` | High-performance web animation, timeline orchestration, transitions | **Priority 2** (Restrained UI motion) |
| **`brainstorming`** | `obra/superpowers` | `~/.gemini/config/skills/brainstorming`<br>`~/.agents/skills/brainstorming` | Interactive concept exploration, multi-perspective requirements check | **Priority 3** (Design & UX exploration) |
| **`writing-plans`** | `obra/superpowers` | `~/.gemini/config/skills/writing-plans`<br>`~/.agents/skills/writing-plans` | Multi-step task decomposition before writing code | **Priority 3** (Milestone planning) |
| **`test-driven-development`** | `obra/superpowers` | `~/.gemini/config/skills/test-driven-development`<br>`~/.agents/skills/test-driven-development` | Red-green-refactor workflow, rigorous unit and API testing | **Priority 3** (Backend and SDK tests) |
| **`systematic-debugging`** | `obra/superpowers` | `~/.gemini/config/skills/systematic-debugging`<br>`~/.agents/skills/systematic-debugging` | Root cause analysis before proposing fixes, evidence collection | **Priority 3** (Bug isolation) |
| **`verification-before-completion`** | `obra/superpowers` | `~/.gemini/config/skills/verification-before-completion`<br>`~/.agents/skills/verification-before-completion` | Evidence-based completion criteria; never assert without running proof | **Priority 3** (Definition of Done) |
| **`requesting-code-review`** | `obra/superpowers` | `~/.gemini/config/skills/requesting-code-review`<br>`~/.agents/skills/requesting-code-review` | Formal PR and milestone review checklist | **Priority 3** (Milestone sign-off) |

### Built-in Antigravity Skills (Bundled)
Located at `C:\Users\Admin\.gemini\antigravity\builtin\skills`:
- `agy-customizations`: Reference guide for Antigravity skills, rules, MCP, hooks, plugins.
- `antigravity_guide`: Comprehensive sitemap and CLI manual for Google Antigravity.
- `automation`: Background scheduled automation designer.
- `generative_ui`: Interactive widgets and inline generative UI components.
- `migrate-workflows`: Migrates legacy Antigravity workflows to modern Agent Skills.
- `permissioned-github`: GitHub integration.
- `plugin`: Plugin lifecycle management.
- `run-workflow`: Workflow executor.
- `ui-plugin-navigation`: Navigation pills for UI plugins.

---

## 3. Global MCP Server Configurations

Configured in `C:\Users\Admin\.gemini\config\mcp_config.json`:

```json
{
  "mcpServers": {
    "refero": {
      "serverUrl": "https://api.refero.design/mcp",
      "url": "https://api.refero.design/mcp"
    },
    "context7": {
      "serverUrl": "https://mcp.context7.com/mcp",
      "url": "https://mcp.context7.com/mcp"
    },
    "playwright": {
      "command": "npx",
      "args": [
        "-y",
        "@playwright/mcp@latest"
      ]
    }
  }
}
```

### Connection and Capability Analysis
1. **`refero` (Remote Streamable HTTP)**:
   - Endpoint: `https://api.refero.design/mcp`
   - Purpose: Direct exploration of SaaS patterns, styles, screens, and multi-step user flows.
   - Status: Registered. Authenticated via OAuth in browser when required by the user. Fallback research via direct Refero web reference synthesis and offline design tokens is fully supported.
2. **`context7` (Remote Streamable HTTP)**:
   - Endpoint: `https://mcp.context7.com/mcp`
   - Purpose: Real-time, up-to-date documentation retrieval for Next.js, FastAPI, Pydantic, SQLAlchemy, Groq SDK, Tailwind CSS, Lucide.
   - Status: Registered and active.
3. **`playwright` (Local Stdio via npx)**:
   - Executable: `npx -y @playwright/mcp@latest`
   - Purpose: Headless and headed browser automation, responsive layout verification, automated visual regression screenshots, console log inspection.
   - Status: Registered. Requires local Node.js runtime (v26.9.0 available).

---

## 4. Missing Dependencies Resolved During Audit

1. **`Git` was missing**:
   - Initial state: `git : The term 'git' is not recognized`.
   - Resolution: Automatically resolved by installing `Git [Git.Git] Version 2.56.0.4` via `winget`. Verified working at `C:\Program Files\Git\cmd\git.exe`.
2. **PowerShell Script Execution Policy (`npm.ps1` / `npx.ps1`)**:
   - Issue: PowerShell prevents unverified `.ps1` execution by default.
   - Resolution: Configured invocation via Windows standard `cmd.exe /c "npx.cmd ..."` or `npm.cmd` to bypass `.ps1` restriction without altering system-wide execution policies unsafely.
3. **Dual Global Skill Directory Synchronization**:
   - Issue: The Vercel Skills CLI defaults to `~/.agents/skills/`, whereas the native Antigravity App UI traverses `~/.gemini/config/skills/`.
   - Resolution: Mirrored all 20 skills to both directories so CLI and IDE discover the identical packages seamlessly.

---

## 5. Duplicate, Incompatible, & Outdated Skills Analysis

- **Legacy Workflows**: Deprecation planned for late 2026. The environment contains the `migrate-workflows` skill to ensure modern Agent Skills (`SKILL.md`) are used exclusively.
- **Ralph Loop**: Excluded per instruction. Replaced by deterministic GSD phase execution with Antigravity native planning, progress tracking, and verification gates.
- **Mobile/Native Skills** (`animate-expo`, `write-swift`): Excluded from workspace scope as CampaignEcho is a Next.js web SaaS platform.
- **Duplicate Repositories**: Only verified canonical publishers (Refero Design, DietrichGebert, Anthropics, Vercel Labs, Obra Superpowers, Affaan ECC) were selected; community forks with conflicting naming were rejected.

