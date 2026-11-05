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

| Token | CSS Variable | Hex Value | Contrast Ratio (on Surface) | Semantic Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **`canvas`** | `--canvas` | `#F5F3EE` | Ground (Paper linen) | Applied to `<body>` and outermost container. |
| **`surface`** | `--surface` | `#FFFFFF` | Canvas base | Primary content panels, cards, tables, modals. |
| **`surface-subtle`** | `--surface-subtle` | `#FAF8F5` | Contrast base | Inset sections, table headers, hovered rows. |
| **`ink`** | `--ink` | `#202923` | **13.82:1** (AAA) | Primary headings, table text, high-emphasis copy. |
| **`ink-secondary`** | `--ink-secondary` | `#59635C` | **5.12:1** (AA) | Secondary text, descriptions, captions, field labels. |
| **`muted`** | `--muted` | `#59635C` | **5.12:1** (AA) | Accessible secondary labels and metadata. |
| **`terracotta`** | `--terracotta` | `#B85C38` | **4.54:1** (AA) | Primary Brand Accent (buttons, active tabs, focus). |
| **`forest`** | `--forest` | `#39745D` | **4.52:1** (AA) | Positive / Verified status indicators and confirmed memory. |
| **`hairline`** | `--hairline` | `#D9D7CF` | Structural divider | 1px hairline dividers between panels. |
| **`alert`** | `--alert` | `#D9383A` | **4.71:1** (AA) | Disconnected database, API timeout warnings. |

### Forbidden Color & Treatment Patterns (Anti-Slop R-01, R-02, R-29)
- ❌ No blue-to-purple or neon cyan gradients.
- ❌ No full-page dark navy default for content workspaces.
- ❌ No near-white text (`text-slate-100`, `text-zinc-100`) on white surfaces.
- ❌ No scattered rainbow icon backgrounds (blue, green, purple, yellow, orange on one screen).
- ❌ No blurred radial background glow orbs.
- ❌ No arbitrary `opacity-*` reductions that compromise legibility below WCAG 2.2 AA.

---

## 3. Typography Hierarchy

### Fonts
1. **Display / Editorial Headlines**: **`Instrument Serif`** (serif, 400 weight, elegant editorial authority).
2. **Interface / Body / Navigation**: **`DM Sans`** (clean geometric humanist sans-serif, high legibility at 12px-16px).
3. **Tabular Figures**: `DM Sans` with `font-variant-numeric: tabular-nums` for monetary values, timestamps, and counts.

### Typographic Scale
- **Page Title**:
  - Desktop: 32px (`Instrument Serif`, 400 weight, `#202923`)
  - Tablet: 28px (`Instrument Serif`, 400 weight, `#202923`)
  - Mobile: 26px (`Instrument Serif`, 400 weight, `#202923`)
- **Section Title**: 22px (`Instrument Serif`, 400 weight, `#202923`)
- **Card Heading**: 15–16px (`DM Sans`, 600 weight, `#202923`)
- **Body Copy**: 14–15px (`DM Sans`, 400 weight, line-height 1.6, `#59635C` or `#202923`)
- **Secondary Description**: 13–14px (`DM Sans`, 400 weight, `#59635C`)
- **Metadata & Chips**: 11–12px (`DM Sans`, 500 weight, `#59635C`)

Monospace font is strictly limited to code identifiers, database drivers, and raw endpoints. Never use monospace for labels or headings.

---

## 4. Shared Component Architecture

Every page in the application uses a unified component foundation:

1. **`AppShell` & `Sidebar`**: Responsive navigation with active route detection (`usePathname()`), acoustic resonance mark, and mobile slide-out drawer.
2. **`PageContainer`**: Unified layout container (`max-w-5xl mx-auto space-y-8`) with consistent horizontal gutters.
3. **`PageHeader`**: Standardized header presenting breadcrumb tags, `Instrument Serif` title, accessible description, and primary/secondary action buttons.
4. **`SectionHeading`**: Consistent section titles with contextual subtitles.
5. **`Button` System**:
   - **Primary**: Terracotta background (`#B85C38`), white text, 8px radius, consistent `h-9` height, accessible hit targets, clear focus ring.
   - **Secondary**: White background (`#FFFFFF`), deep ink text (`#202923`), warm border (`#D9D7CF`), same dimensions.
   - **Quiet**: Transparent background, deep ink text, subtle hover.
6. **`FeatureState`**: Dignified coming-soon / in-progress state detailing real brand capabilities, active tenant context, and navigation actions without internal sprint jargon.

---

## 5. Global Iconography Rules

1. **Zero Decorative AI Sparkles**:
   - ❌ Never use `Sparkles`, `Sparkle`, `WandSparkles`, or wand graphics.
   - ❌ Never place decorative sparkles on buttons, page headers, or navigation items.
2. **Action-Descriptive Icons Only**:
   - New campaign brief: `Plus` or `FilePlus`.
   - Campaign history: `History`.
   - Brand management: `Layers` or `Building2`.
   - Memory inspection: `BrainCircuit` (only when genuinely representing memory operations).
   - Settings: `Settings`.
   - Navigation / Overview: `LayoutDashboard`.
   - Open / Navigate: `ArrowRight`.
   - Verify / Success: `CheckCircle2`.
3. **Independent Communication**:
   - All text labels must communicate the action independently of the icon.

---

## 6. Negative Constraints (Anti-Slop Delivery Gate)

1. **No Four-Card Infrastructure Clones**: Never place four identical square boxes with colored icons across the top of the homepage.
2. **No Monospace Spam**: Monospace is reserved strictly for code, IDs, or raw terminal snippets. All UI labels use `DM Sans`.
3. **No Internal Sprint Badges**: Badges like "M2 QUEUED", "M3", or "M4" must never appear in production UI.
4. **No Heavy Shadows**: Elevation is marked by subtle 1px `#D9D7CF` borders and 1px shifts in tone, not floating dark drop shadows.
5. **No Decorative Placeholders**: Every stat shown must either be real runtime data or an explicit, clearly labeled demo fixture.
6. **No Horizontal Scrollbar Overflow**: Mobile viewports (390px) must reflow cleanly without clipping or squishing.
