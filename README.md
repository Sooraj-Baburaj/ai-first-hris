# Closed AI

### *An AI-first workforce lifecycle platform for HR teams.*

**Built for the Codex Hackathon.**

Closed AI transforms HR from a passive system of records into an active multimodal AI workforce layer. It empowers HR teams to understand documents, speak with candidates and employees, automate workflows, and surface intelligence across the entire employee lifecycle.

---

## 🚀 Overview

Closed AI is designed as a production-grade, single-company full-stack TypeScript monorepo. It centralizes operational control for HR admins and recruiters while providing assisted workflows for candidates and employees through multimodal channels (voice, chat, etc.).

### Core Pillars
1.  **Agentic Talent Acquisition**: Automated resume parsing, candidate profile extraction, and voice-driven screening.
2.  **Multimodal Autonomous Onboarding**: Post-offer coordination, document collection reminders, and start-date tracking.
3.  **24/7 Helpdesk**: Automated HR assistance for policy questions, status updates, and support tickets.
4.  **Hyper-Personalized L&D**: Role-aware learning paths and skill-gap analysis for employee growth.

---

## 🛠 Tech Stack

-   **Frontend**: Next.js 15+, React, Tailwind CSS.
-   **Backend**: Express, Node.js, MongoDB (Mongoose).
-   **AI Infrastructure**: LiveKit Agents (Real-time Voice/Inference), OpenAI, Deepgram, ElevenLabs.
-   **Monorepo**: Turborepo, pnpm workspaces.
-   **Language**: Strict TypeScript.

---

## 🏃 Getting Started

### Prerequisites

-   [pnpm](https://pnpm.io/installation) (Required)
-   [MongoDB](https://www.mongodb.com/docs/manual/installation/) (Running locally or a connection string)
-   [LiveKit Cloud Account](https://cloud.livekit.io/) (For voice agents and inference)

### 1. Installation

```bash
pnpm install
```

### 2. Environment Setup

Create `.env` files in the following locations based on their respective `.env.example` templates:

-   `apps/backend/.env`
-   `apps/dashboard-front/.env.local`

**Essential Keys:**
- `LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `MONGODB_URI`
- `OPENAI_API_KEY`

### 3. Development

To start all applications (Frontend, Backend API, and AI Agent) in development mode:

```bash
pnpm dev
```

#### Individual Workspace Commands:
-   **Frontend**: `pnpm --filter @closed-ai/dashboard-front dev`
-   **Backend API**: `pnpm --filter @closed-ai/backend dev:api`
-   **AI Agent**: `pnpm --filter @closed-ai/backend agent:dev`

---

## 👔 Brand Personality

Closed AI is built to be **Calm, Intelligent, and Trustworthy**. The interface prioritizes clarity, document readability, and actionable AI insights over flashy animations or gimmicks. It is designed to feel like a serious HR operating system.

---

## 📁 Repository Structure

-   `apps/dashboard-front`: Next.js dashboard for recruiters and admins.
-   `apps/backend`: Express server and LiveKit AI agents.
-   `packages/types`: Shared TypeScript definitions and API contracts.
-   `packages/typescript-config`: Shared tsconfig presets.
-   `packages/eslint-config`: Shared linting rules.

---

## ⚖️ License

Private - All rights reserved. Created for the Codex Hackathon.
