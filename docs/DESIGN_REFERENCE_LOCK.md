# CampaignEcho Design Reference Lock & Decision Ledger

**Status**: APPROVED & LOCKED (Overhauled per Anti-Slop Audit)  
**Application**: CampaignEcho — Marketing Intelligence Workspace  
**Art Direction**: **THE CAMPAIGN DESK**  
**Design Authorities**: Refero Research, Attio Product Architecture, Anti-Slop Quality Governance

---

## 1. Primary Design Direction

**"The Campaign Desk"** — A warm, editorial marketing intelligence workspace combining the deliberate density of Attio and Linear with the typographic poise of an editorial strategy house. Built on warm ivory paper surfaces (`#F5F3EE`), crisp white card desks (`#FFFFFF`), deep ink typography (`#202923`), and restrained terracotta accents (`#B85C38`).

---

## 2. Signature Traits (Mandatory)

1. **Editorial Typographic Contrast**: High-authority headlines set in **`Instrument Serif`**, paired with refined, highly legible interface copy set in **`DM Sans`**.
2. **Warm Paper Palette**: Replaces generic dark developer consoles with warm ivory (`#F5F3EE`), white surfaces (`#FFFFFF`), and fine warm borders (`#D9D7CF`).
3. **Restrained Dual Accents**:
   - Primary Brand Action: Terracotta (`#B85C38`)
   - Verified Success & Connection: Forest Sage (`#39745D`)
4. **Decision-Driven Information Architecture**: The homepage is a **marketing workspace**, not a server infrastructure panel. Diagnostics are housed appropriately in Settings.
5. **Memory Citation Chips**: In strategy formulation, recommendations cite originating past campaigns with explicit provenance tags.

---

## 3. Design Tokens (The Campaign Desk)

### Palette
- **Canvas (Background)**: `#F5F3EE`
- **Surface (Panels / Cards)**: `#FFFFFF`
- **Surface Subtle (Headers / Insets)**: `#FAF8F5`
- **Ink (Headings & Primary Text)**: `#202923`
- **Muted (Secondary & Labels)**: `#707970`
- **Primary Accent (Terracotta)**: `#B85C38`
- **Positive Accent (Forest Sage)**: `#39745D`
- **Hairline Border**: `#D9D7CF`

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
- [x] Zero monospace font usage on standard product copy.
- [x] Zero internal milestone tags ("M4", "M2") exposed in user navigation.
- [x] Zero fake placeholder charts without real data.
