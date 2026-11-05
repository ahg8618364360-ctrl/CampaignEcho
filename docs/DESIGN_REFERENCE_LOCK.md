# CampaignEcho Design Reference Lock & Decision Ledger

**Status**: APPROVED & LOCKED  
**Application**: CampaignEcho — Memory-Powered AI Marketing Intelligence Platform  
**Design Authority**: Refero Design Research & Anti-AI-Slop Governance

---

## 1. Primary Design Direction

**"Editorial SaaS Darkroom"** — A restrained, high-density marketing intelligence interface combining the technical precision of Linear with the grounded provenance display of Perplexity. Built on deep obsidian/navy surfaces, crisp hairline borders, and targeted electric-blue and emerald accents.

---

## 2. Signature Traits (Mandatory)

1. **Explicit Memory Provenance Chips**: Every AI recommendation, reel concept, and strategic rationale is visually tethered to an identifiable memory citation (e.g., `[Memory #B1-04 · Past Campaign: Student Burrito Fest]`). Recommendations are never presented as ungrounded text.
2. **Tri-Color Memory Telemetry**: 
   - **Retain**: Emerald (`#10B981`) — represents stored brand wisdom, verified campaign results, and client feedback.
   - **Recall**: Electric Blue (`#3B82F6`) — represents memories retrieved for the active brief.
   - **Reflect**: Violet (`#8B5CF6`) — represents synthesis, meta-learning, and cross-campaign reasoning.
3. **Structured Strategy Architecture**: Campaign outputs are presented in a structured executive deck format: Objective → Core Concept → Positioning & Offer → 3 Multi-Angle Content Treatments → Execution KPIs → Risk & Memory Evidence Ledger.
4. **Interactive Memory Evolution Diff**: The signature comparison view uses a side-by-side synchronized view showing exactly what changes when Hindsight memory is engaged vs. disabled.

---

## 3. Secondary References

1. **Linear's Density & Keybindings**: Clean 36px table row heights, monospace metric tags (`font-mono text-xs`), subtle keyboard shortcuts (`/` to search, `N` for new campaign).
2. **PostHog Activity Stream**: Compact chronological event list showing timestamps, memory tags, and collapsible raw content previews.

---

## 4. Design Tokens & Palette

### Backgrounds & Surfaces
- **App Canvas**: `#090D16` (Deep Obsidian Navy)
- **Card / Panel Surface**: `#0E1424` (Subtle Navy Slate)
- **Raised Surface (Modals, Popovers)**: `#141C32`
- **Border / Divider**: `rgba(255, 255, 255, 0.08)` / `#1E293B`
- **Hover Surface**: `rgba(255, 255, 255, 0.04)`

### Typography
- **Primary Sans**: `Inter`, system-ui, sans-serif
  - Headings: `font-semibold tracking-tight text-slate-100`
  - Body: `font-normal text-sm leading-relaxed text-slate-300`
  - Muted Copy: `text-xs text-slate-400`
- **Monospace (Data, IDs, Bank IDs)**: `JetBrains Mono`, `ui-monospace`, monospace
  - Metric values, Memory IDs, Bank hashes, Timestamps: `font-mono text-xs text-slate-400`

### Color Accents & Semantic Roles
- **Brand Primary Accent**: Electric Blue (`#3B82F6` / `#2563EB`)
- **Memory Retain / Success**: Emerald (`#10B981` / `#059669`)
- **Memory Reflect / AI Insight**: Violet (`#8B5CF6` / `#7C3AED`)
- **Warning / Unverified**: Amber (`#F59E0B`)
- **Destructive / Error**: Rose (`#F43F5E`)

### Spacing & Metrics
- Base spacing unit: `4px` (`0.25rem`)
- Standard card padding: `p-5` (`20px`) or `p-6` (`24px`)
- Table row height: `h-11` (`44px`)
- Sidebar width: `260px` (desktop), collapsible to `64px` icon rail

### Border Radius & Shadows
- **Card & Dialog Radius**: `rounded-xl` (`12px`)
- **Button & Input Radius**: `rounded-lg` (`8px`)
- **Badge & Chip Radius**: `rounded-full` (`9999px`)
- **Shadows**: Subtle layered dark glow `shadow-sm shadow-black/40`; no heavy exaggerated drop shadows.

### Iconography
- **Set**: `Lucide React`
- **Size**: `16px` (actions/tables), `18px` (cards/navigation), `20px` (page headers)
- **Stroke Width**: `1.5px` (refined, consistent weight across the entire UI)

### Motion
- **Transitions**: `transition-all duration-150 ease-out`
- **GSAP**: Synchronized opacity and slide reveal for Memory Evolution side-by-side mode.
- **Accessibility**: Automatically disables animations when `prefers-reduced-motion: reduce` is active.

---

## 5. Interaction Guidelines

| Component | Standard Behavior |
| :--- | :--- |
| **Navigation** | Sticky left sidebar with active route indicator, top bar with current brand selector and status indicator. |
| **Tables** | Sortable columns, compact monospace metrics, right-aligned numbers, hover highlight, clickable row for drawer details. |
| **Filters** | Compact pill toggles (e.g., `All`, `Instagram`, `TikTok`, `Meta Ads`), search input with instant debounced filtering. |
| **Forms** | Labeled inputs with subtle helper text, inline Pydantic error validation, disabled submit state with loading spinner while saving. |
| **Modals / Drawers** | Slide-over drawer for campaign inspection, focused centered modal for brand creation and memory recording. |
| **Loading States** | Skeleton loaders mirroring exact layout dimensions (no generic centered circular spinners). |
| **Empty States** | Contextual vector illustration or icon, explanatory heading, and single primary CTA (e.g., "No historical campaigns yet. Add your first campaign or seed demo history"). |
| **Error Handling** | Dismissible toast notification and inline callout with actionable guidance (e.g., "Hindsight connection timed out. Check API server status in Settings"). |

---

## 6. Rejected Design Patterns (Anti-AI-Slop Rules)

- ❌ **No Generic Chatbot UI**: The Campaign Studio is an intelligent guided workspace, NOT a chat prompt window with speech bubbles.
- ❌ **No Neon Purple/Pink Gradient Blobs**: Replaced with clean, disciplined dark-slate surfaces and crisp borders.
- ❌ **No Emoji-Only Navigation**: Replaced with clean Lucide SVG icons and precise text labels.
- ❌ **No Decorative Charts**: Charts must plot actual recorded numbers with explicit units (e.g., "Reach: 14,200", "Conversions: 320", "CPA: $4.12").
- ❌ **No Fabricated Evidence**: Memory citations must correspond to real entries stored in Hindsight memory banks.

