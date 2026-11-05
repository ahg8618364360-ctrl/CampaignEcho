# CampaignEcho Design Contract & System Blueprint (DESIGN.md)

**Product**: CampaignEcho — Marketing Intelligence Workspace  
**Tagline**: *"Every campaign teaches the next."*  
**Art Direction**: **THE CAMPAIGN DESK**  
**Governing Standard**: [Anti-Slop](https://github.com/miqdadbadjuber/anti-slop) UI, Human & Layout Rules

---

## 1. Visual Direction & Brand Philosophy

CampaignEcho is not a developer monitoring console; it is a **high-taste marketing intelligence workspace** designed for digital agencies, brand strategists, and marketing directors.

The visual direction combines the clear information architecture of modern productivity tools (Attio, Linear) with the refined, thoughtful aesthetic of an editorial strategy atelier. It feels human, calm, authoritative, and data-grounded.

---

## 2. Color Palette & Semantic Roles

| Token | Hex Value | Semantic Purpose | Usage Rules |
| :--- | :--- | :--- | :--- |
| **`canvas`** | `#F5F3EE` | Warm Ivory page ground | Applied to `<body>` and outermost container. Gives a paper-like editorial base. |
| **`surface`** | `#FFFFFF` | Primary content panels | Main cards, tables, drawers, modal sheets. Crisp white layered on warm ivory. |
| **`surface-subtle`** | `#FAF8F5` | Secondary card fills & table headers | Inset sections, table headers, hovered rows. |
| **`ink`** | `#202923` | Deep Charcoal Forest | Primary headings, table text, high-emphasis copy. |
| **`muted`** | `#707970` | Muted Olive Stone | Secondary text, timestamps, captions, field labels. |
| **`terracotta`** | `#B85C38` | Primary Brand Accent | Active tabs, primary CTAs, key focus points. Used with restraint (dose-capped). |
| **`forest`** | `#39745D` | Positive / Connected State | Verified healthy indicators, high ROI metrics, confirmed learning events. |
| **`hairline`** | `#D9D7CF` | Muted Warm Border | 1px hairline dividers between panels. Never heavy drop shadows. |
| **`alert`** | `#C2410C` | Warnings / Unreadiness | Disconnected database, API timeout warnings. |

### Forbidden Color Treatments (Anti-Slop R-01, R-29)
- ❌ No blue-to-purple or neon cyan gradients.
- ❌ No full-page dark navy default for content workspaces.
- ❌ No scattered rainbow icon backgrounds (blue, green, purple, yellow, orange on one screen).
- ❌ No blurred radial background glow orbs.

---

## 3. Typography Hierarchy

### Fonts
1. **Display / Editorial Headlines**: **`Instrument Serif`** (serif, italic options, elegant editorial authority).
2. **Interface / Body / Navigation**: **`DM Sans`** (clean geometric humanist sans-serif, high legibility at 12px-16px).
3. **Tabular Figures**: `DM Sans` with `font-variant-numeric: tabular-nums` for financial values and counts.

### Typographic Scale
- **H1 / Editorial Hero**: `text-3xl font-serif text-ink tracking-tight` (e.g. *"Your marketing workspace"* or *"Every campaign teaches the next."*)
- **H2 / Section Title**: `text-xl font-serif text-ink tracking-tight`
- **H3 / Card Headline**: `text-sm font-semibold text-ink`
- **Body / Strategy Prose**: `text-sm font-sans text-ink/90 leading-relaxed`
- **Secondary / Helper**: `text-xs font-sans text-muted`
- **Metadata / Status**: `text-[11px] font-sans font-medium text-muted uppercase tracking-wider`

---

## 4. Layout & Information Architecture

### Asymmetric, Decision-First Composition
- **Workspace Navigation (Sidebar)**: 240px clean ivory rail with the custom CampaignEcho resonance emblem, active brand selector, and focused product sections.
- **Top Bar**: Minimal breadcrumbs, brand market context, and unobtrusive environment indicator.
- **Workspace Header**: Editorial welcome with active brand posture (*The Taco Syndicate · Fast-Casual Dining · Synthetic Demo*).
- **Workspace Readiness Strip**: Compact horizontal summary showing backend and database connectivity alongside Hindsight and Groq progress.
- **Brand Intelligence Card**: Highlights audience, tone of voice, and current marketing objectives.
- **Campaign Learning Ledger**: The chronological stream of marketing insights and retained takeaways.

---

## 5. Negative Constraints (Anti-Slop Gate)

1. **No Four-Card Infrastructure Clones**: Never place four identical square boxes with colored icons across the top of the homepage.
2. **No Monospace Spam**: Monospace is reserved strictly for code, IDs, or raw terminal snippets. All UI labels use `DM Sans`.
3. **No Internal Sprint Badges**: Badges like "M2 QUEUED" or "M4" must never appear in production UI.
4. **No Heavy Shadows**: Elevation is marked by subtle 1px `#D9D7CF` borders and 1px shifts in tone, not floating dark drop shadows.
5. **No Decorative Placeholders**: Every stat shown must either be real runtime data or an explicit, clearly labeled demo fixture.

