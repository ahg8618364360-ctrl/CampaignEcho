# Antigravity Global Tooling Setup & Runbook

**Environment**: Antigravity 2.0 / Windows 11  
**Authority**: Antigravity Customization Architecture & Vercel Skills Ecosystem

---

## 1. Quick Verification Commands

To verify your global Antigravity toolkit on any development machine:

```bash
# Check installed global skills via Skills CLI
npx --yes skills@latest ls -g

# Check MCP server status in Antigravity CLI
agy mcp list

# Check local runtime dependencies
node --version       # Recommended: v20+ (Current: v26.9.0)
python --version     # Recommended: 3.11+ (Current: 3.13.14)
git --version        # Recommended: 2.40+ (Current: 2.56.0)
```

---

## 2. Directory Locations & Mirroring

Antigravity operates with two complementary global discovery locations on Windows:

1. **Universal Agents Directory**: `C:\Users\<User>\.agents\skills\`
   - Standard path managed by `npx skills add -g`.
2. **Antigravity App Global Directory**: `C:\Users\<User>\.gemini\config\skills\`
   - Native discovery path scanned by Antigravity App IDE.
3. **Antigravity Global MCP Config**: `C:\Users\<User>\.gemini\config\mcp_config.json`
   - Defines global MCP servers (Refero, Context7, Playwright).

### Automated Mirroring Script
When installing a new skill, ensure it is mirrored to both locations:
```powershell
Copy-Item -Recurse -Force "$HOME\.agents\skills\*" "$HOME\.gemini\config\skills\"
```

---

## 3. Managing Skills with Vercel Skills CLI

### Adding a New Global Skill
```bash
npx --yes skills@latest add <owner/repo> --skill <skill-name> -g -y
```

### Searching the Skill Directory
```bash
npx --yes skills@latest find <keyword>
```

### Updating All Global Skills
```bash
npx --yes skills@latest update -g
```

---

## 4. MCP Server Management

Global servers are defined in `~/.gemini/config/mcp_config.json`:

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
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

- **Refero**: Authenticate through the official OAuth browser dialog when triggered.
- **Context7**: Fully automatic remote documentation service.
- **Playwright**: Spawns locally on demand via `@playwright/mcp`.

---

## 5. Security & Permission Rules

1. **Pre-Installation Auditing**: Always inspect `SKILL.md` and dependencies prior to global installation.
2. **No Unrestricted Executables**: Avoid adding arbitrary `.exe` or binary tools to global MCP configuration without source inspection.
3. **No Committed Secrets**: Never write API keys into `mcp_config.json` or committed git repositories.

