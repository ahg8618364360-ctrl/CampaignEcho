# Global MCP Configuration Report

**Date**: November 2026  
**Configuration File**: `C:\Users\Admin\.gemini\config\mcp_config.json`  
**Backup File**: `C:\Users\Admin\.gemini\config\mcp_config.json.bak`  
**Configuration Status**: Active, Validated JSON Schema

---

## 1. Registered MCP Servers

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

---

## 2. Server Specifications & Tools Exposed

### 1. `refero`
- **Transport**: Remote Streamable HTTP
- **URL**: `https://api.refero.design/mcp`
- **Authentication**: Official OAuth browser flow (triggered when accessing premium or protected Refero endpoints).
- **Core Capabilities**:
  - `refero_search_styles`: Discover visual directions, palettes, and brand aesthetics.
  - `refero_get_style`: Fetch style details, type scales, and hex systems.
  - `refero_search_screens`: Explore SaaS interfaces by category (e.g., Marketing, Analytics, Settings, Dashboard).
  - `refero_get_screen`: Inspect individual screen components, layout structures, and tokens.
  - `refero_search_flows`: Search multi-step user workflows (onboarding, campaign builders).
  - `refero_get_flow`: Fetch step-by-step UX flows.
- **Project Role**: Primary visual research authority for CampaignEcho's UI architecture and Reference Lock.

### 2. `context7`
- **Transport**: Remote Streamable HTTP
- **URL**: `https://mcp.context7.com/mcp`
- **Authentication**: None required for standard library documentation lookup.
- **Core Capabilities**:
  - Up-to-date documentation retrieval for rapidly moving web and AI stacks.
  - Verification of API signatures for Next.js App Router, FastAPI route handlers, Pydantic v2 schemas, SQLAlchemy 2.0 ORM patterns, Recharts, and Groq SDK.
- **Project Role**: Guarantees that no hallucinated or deprecated library methods enter CampaignEcho's codebase.

### 3. `playwright`
- **Transport**: Local Stdio via `npx`
- **Executable**: `npx -y @playwright/mcp@latest`
- **Requirements**: Node.js 20+ runtime (Node v26.9.0 available).
- **Core Capabilities**:
  - Automated browser navigation, clicking, typing, and form submissions.
  - Real responsive layout verification across mobile (375px), tablet (768px), and desktop (1280px+).
  - Full-page and element screenshot capture.
  - Browser console log inspection (zero-error verification).
- **Project Role**: Objective, automated UI verification and end-to-end acceptance testing for CampaignEcho milestones.

---

## 3. Configuration Safety & Maintenance Rules

1. **Non-Destructive Edits**: Any future modifications to `mcp_config.json` must preserve existing keys. A backup timestamp copy should be created prior to manual edits.
2. **Secret Separation**: No API keys or tokens are stored in `mcp_config.json`. Authenticated servers use browser OAuth or process-level environment variables.
3. **Health Check Protocol**: In the Antigravity UI, verify active servers via `/mcp` or navigating to **Additional Options (...) > MCP Servers**.

