# Security Policy

## Supported Versions

Only the current `main` branch of CampaignEcho is actively maintained with security patches.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

The CampaignEcho development team takes security and brand memory privacy seriously.

If you discover a security vulnerability, memory isolation breach, or credential leak risk:
1. **Do not open a public GitHub issue.**
2. Send an email to the repository maintainer or open a private advisory via GitHub Security Advisories.
3. Include detailed steps to reproduce the issue, including environment configurations, curl commands, or script samples.
4. We aim to acknowledge receipt of reports within 48 hours and provide a coordinated disclosure timeline.

## Zero Secrets & Isolation Standard

CampaignEcho enforces strict security policies:
- **Tenant Isolation**: Memory banks are strictly scoped 1:1 per brand identifier (`campaignecho-brand-{id}`). Cross-tenant data leakage is treated as a critical P0 security failure.
- **Credential Hygiene**: API tokens (Vectorize Hindsight, Z.ai, Groq) and secrets must NEVER be committed to version control. All configuration is strictly managed via environment variables and `.env` files which are excluded by `.gitignore`.
