# CampaignEcho Design Reference Inventory

**Date**: November 2026  
**Research Lead**: Antigravity UI & Design Architecture  
**Methodology**: Refero Design Research, SaaS Architecture Analysis, Anti-AI-Slop Governance

---

## 1. Product & SaaS Visual References

### Reference A: Linear (Product Architecture & Visual Restraint)
- **Source**: [https://linear.app](https://linear.app) / Refero SaaS Architecture
- **Observed Design Patterns**:
  - High-density information display without cognitive clutter.
  - Deep dark surfaces (`#0A0D14`, `#10141E`, `#161B26`) with crisp 1px borders (`rgba(255, 255, 255, 0.08)`).
  - Monospaced metadata tags paired with clean neo-grotesque sans-serif body typography.
  - Keyboard-navigable controls, compact row-level actions, and zero superfluous decorative gradients.
- **What is Adapted**:
  - Global navigation layout (collapsible sidebar with active brand switcher).
  - Compact table rows, status chips, and metadata badge styling.
- **Where it Appears in CampaignEcho**:
  - Main App Shell, Sidebar, Campaign History table, and Brand Switcher dropdown.

### Reference B: Perplexity AI / Notion AI (AI Workspace & Grounded Citations)
- **Source**: [https://perplexity.ai](https://perplexity.ai), [https://notion.so](https://notion.so) / Refero AI Flows
- **Observed Design Patterns**:
  - Distinct visual separation between raw AI-generated prose and the underlying evidence/citations.
  - Expandable "Sources & Memory Footnotes" cards displaying exact source items.
  - Clean two-pane workflow: inputs/context on the left, structured generated output with provenance chips on the right.
- **What is Adapted**:
  - The Memory Footnote & Provenance Card pattern: every strategy recommendation has an explicit "Memory Citation" chip referencing the specific past campaign or brand rule.
- **Where it Appears in CampaignEcho**:
  - Campaign Studio (`/campaign-studio`) and Memory Explorer (`/memory-explorer`).

### Reference C: PostHog / Mixpanel (Marketing Intelligence & Memory Timelines)
- **Source**: [https://posthog.com](https://posthog.com), [https://mixpanel.com](https://mixpanel.com) / Refero Analytics Patterns
- **Observed Design Patterns**:
  - Metric sparklines with muted secondary indicators (delta vs. prior period).
  - Horizontal and vertical activity streams showing chronological events with icon-coded event types.
  - Clean data visualization using restrained dual-accent colorways rather than rainbow charts.
- **What is Adapted**:
  - Memory Activity Timeline: visual differentiation between **Retain** (green/emerald tag), **Recall** (blue/indigo tag), and **Reflect** (violet/purple tag).
  - Metric performance cards with explicit units and reporting periods.
- **Where it Appears in CampaignEcho**:
  - Overview Dashboard (`/`), Brand Performance cards, and Memory Explorer timeline.

### Reference D: Raycast / Craft Docs (Editorial Polish & Typography Hierarchy)
- **Source**: [https://raycast.com](https://raycast.com), [https://craft.do](https://craft.do)
- **Observed Design Patterns**:
  - Distinct editorial typographic hierarchy with crisp letter-spacing (`tracking-tight` on headings, generous line-height on copy).
  - High-contrast typography on dark charcoal surfaces with electric-blue active focal points.
  - Subtle interactive micro-interactions: border glow on active input focus, 150ms ease-out transitions.
- **What is Adapted**:
  - Typographic scale, heading weights, and subtle focus rings.
- **Where it Appears in CampaignEcho**:
  - Campaign Studio Brief input, Memory Evolution side-by-side comparison screen.

---

## 2. Component & Interaction References

| Source Library | Pattern / Component | Purpose in CampaignEcho | Adaptation Details |
| :--- | :--- | :--- | :--- |
| **shadcn/ui** | Dialog, Sheet, Tabs, Command, Badge, Card, Tooltip, Select | Core UI primitives | Styled with custom Tailwind design tokens, deep navy background and 1px border styling. |
| **Lucide Icons** | Unified iconography suite | Visual cues across all views | Consistent 16px/18px stroke width (1.5px), zero random emojis used as navigational elements. |
| **Recharts** | LineChart, BarChart, ResponsiveContainer | Campaign analytics & KPI visualization | Minimalist grid lines, custom dark-mode tooltips, single-accent data fills. |
| **Radix Primitives**| Accessible dropdowns, switches, popovers | Reliable keyboard navigation & ARIA compliance | Enforces full accessibility standards across interactive controls. |

---

## 3. Motion & Animation Standards

| Technology | Implementation Scope | Rules & Constraints |
| :--- | :--- | :--- |
| **Tailwind CSS Transitions** | Hover states, tab switches, dialog appearance | `150ms-200ms` cubic-bezier easing, zero sluggish 500ms+ animations. |
| **GSAP Core** | Memory Evolution comparison transitions, side-by-side diff reveal | Smooth, GPU-accelerated reveal between "Without Memory" and "With Memory" states. Always honors `prefers-reduced-motion`. |

