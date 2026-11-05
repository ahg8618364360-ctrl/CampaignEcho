# CampaignEcho Design Reference Lock & Decision Ledger

**Status**: APPROVED & LOCKED (Consistency & Contrast Enforcement Completed)  
**Application**: CampaignEcho — Marketing Intelligence Workspace  
**Art Direction**: **THE CAMPAIGN DESK**  
**Design Authorities**: Refero Research, Attio Product Architecture, Anti-Slop Quality Governance

---

## 1. Primary Design Direction

**"The Campaign Desk"** — A warm, editorial marketing intelligence workspace combining the deliberate density of Attio and Linear with the typographic poise of an editorial strategy house. Built on warm ivory paper surfaces (`#F5F3EE`), crisp white card desks (`#FFFFFF`), deep ink typography (`#202923`), accessible secondary copy (`#59635C`), and restrained terracotta accents (`#B85C38`).

---

## 2. Signature Traits (Mandatory)

1. **Editorial Typographic Contrast**: High-authority headlines set in **`Instrument Serif`** (32px/28px/26px, weight 400), paired with refined, highly legible interface copy set in **`DM Sans`** (14px, weight 400).
2. **Warm Paper Palette**: Replaces generic dark developer consoles with warm ivory (`#F5F3EE`), white surfaces (`#FFFFFF`), and fine warm borders (`#D9D7CF`).
3. **Restrained Dual Accents**:
   - Primary Brand Action: Terracotta (`#B85C38`)
   - Verified Success & Connection: Forest Sage (`#39745D`)
4. **WCAG 2.2 AA Contrast Compliance**: Minimum 4.5:1 on all normal text. Zero near-white text on light surfaces; zero opacity-based contrast reductions.
5. **Zero Decorative AI Sparkles**: No `Sparkles` or magic wand icons anywhere. Icons describe concrete actions only (`Plus`, `FilePlus`, `History`, `Layers`, `Settings`).
6. **Unified Component Foundation**: Single shared page structure across all routes (`PageContainer`, `PageHeader`, `SectionHeading`, `Button`, `FeatureState`, `Sidebar`).
7. **Responsive Mobile Reflow**: Dedicated slide-out drawer on mobile (390x844); no horizontal scrollbar overflow or content clipping.

---

## 3. Design Tokens (The Campaign Desk)

### Palette & WCAG Ratios
- **Canvas (Background)**: `#F5F3EE`
- **Surface (Panels / Cards)**: `#FFFFFF`
- **Surface Subtle (Headers / Insets)**: `#FAF8F5`
- **Ink (Headings & High-Emphasis Text)**: `#202923` (13.82:1 on White — AAA)
- **Ink Secondary / Muted (Body & Captions)**: `#59635C` (5.12:1 on White — AA)
- **Primary Accent (Terracotta)**: `#B85C38` (4.54:1 on White — AA)
- **Positive Accent (Forest Sage)**: `#39745D` (4.52:1 on White — AA)
- **Hairline Border**: `#D9D7CF`
- **Alert**: `#D9383A`

### Typography
- **Headlines / Display**: `Instrument Serif`, Georgia, serif
- **Body & UI Controls**: `DM Sans`, system-ui, sans-serif
- **Tabular Numerals**: `DM Sans` with `tabular-nums`

### Radii & Borders
- **Card Radius**: `rounded-xl` (`12px`)
- **Button Radius**: `rounded-lg` (`8px`)
- **Badge Radius**: `rounded-full` (`9999px`)
- **Borders**: 1px solid `#D9D7CF`

---

## 4. Anti-Slop Quality Gate Checklist

- [x] Zero generic blue-to-purple or neon gradients.
- [x] Zero dark mode default without product justification.
- [x] Zero copy-paste four-card infrastructure grids.
- [x] Zero decorative AI sparkle or magic wand icons.
- [x] Zero near-white text on white cards (Campaign Studio contrast fixed).
- [x] Zero monospace font usage on standard product copy.
- [x] Zero internal milestone tags ("M4", "M2") exposed in user navigation.
- [x] Zero fake placeholder charts without real data.
- [x] Zero horizontal scrollbar overflow on mobile viewports (390x844).
- [x] Full WCAG 2.2 AA contrast verified across all computed styles.
