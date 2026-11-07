# Contributing to CampaignEcho

We welcome contributions to CampaignEcho! Please follow these guidelines to keep the codebase clean, robust, and verifiable.

---

## 1. Ground Rules & Code Standards

- **TypeScript Strict Mode**: The Next.js frontend strictly enforces TypeScript compilation (`tsc --noEmit`) and Next.js linting (`next lint`). All PRs must pass both without warnings or errors.
- **Python Quality**: Python code follows FastAPI and Pydantic v2 best practices with type hints throughout.
- **Real Memory Operations**: CampaignEcho relies on the official Vectorize Hindsight client (`hindsight-client`). Do not introduce mocked or fake implementations into core services.
- **Design System Fidelity**: All UI components must adhere to the Refero Design Reference Lock (`docs/DESIGN_REFERENCE_LOCK.md`) and Campaign Desk palette (`#F5F3EE`, `#202923`, `#B85C38`, `#39745D`).

---

## 2. Development Workflow

### Prerequisites
- Python 3.11+
- Node.js 20+
- Git 2.40+

### Setup
```bash
# Clone the repository
git clone https://github.com/ahg8618364360-ctrl/CampaignEcho.git
cd CampaignEcho

# Backend Setup
python -m venv venv
.\venv\Scripts\activate  # Windows (or source venv/bin/activate on Unix)
pip install -r backend/requirements.txt
cp .env.example .env

# Frontend Setup
cd frontend
npm install
```

---

## 3. Verification Before Submitting a PR

Before opening a pull request, run the verification suite to ensure all tests pass:

```bash
# 1. Backend Pytest Suite (includes Hindsight & LLM integration tests)
pytest backend/tests/ -v

# 2. Frontend Typecheck and Build
cd frontend
npm run typecheck
npm run lint
npm run build
```

Every PR must cite verified test execution output.

