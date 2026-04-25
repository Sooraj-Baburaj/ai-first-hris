# Closed AI Agent Rules

## Project Identity

Closed AI is an AI-first workforce lifecycle platform for HR teams, candidates, and employees. It transforms HR from a passive database into an active multimodal agent by orchestrating text, voice, document understanding, and workflow automation across hiring, onboarding, employee support, and upskilling.

Treat the system as a production-grade, multi-tenant full-stack TypeScript monorepo that may include a dashboard frontend, an Express/MongoDB backend, shared packages, AI agents, voice/chat channels, document processing, ticketing integrations, and workflow automation.

Write clean, modular, strictly typed code. Prefer small files, focused functions, guard clauses, and existing project patterns over broad refactors.

## Product Pillars

Build features around these pillars:

- Agentic Talent Acquisition: resume parsing, JD matching, fit scores, screening summaries, candidate status tracking, and optional voice-driven technical screening.
- Multimodal Autonomous Onboarding: offer acceptance, outbound voice follow-up, start-date coordination, document collection, and WhatsApp/email workflows.
- 24/7 Employee And Candidate Helpdesk: voice/chat support for application status, HR policy questions, IT tickets, HR complaints, and internal knowledge lookup.
- Hyper-Personalized Learning And Development: role-aware learning paths, skill-gap analysis, career copiloting, and upskilling recommendations.

Nice-to-have roadmap areas include sentiment pulse checks, automated exit interviews, and Slack/Discord/Teams integrations.

## Domain Priorities

- Reduce the resume black hole by giving HR fast, explainable candidate screening while keeping candidates informed.
- Reduce onboarding drop-off by automating handoffs between offer acceptance, data collection, and day-one readiness.
- Reduce helpdesk bottlenecks by resolving repetitive HR/IT questions and routing actionable tickets.
- Make employee growth personalized instead of a static course library.
- Handle candidate and employee data with privacy, auditability, and least-privilege access in mind.

## Workspace Commands

- Use `pnpm` only. Do not use `npm` or `yarn`.
- Prefer workspace-scoped commands:
  - Frontend: `pnpm --filter @closed-ai/dashboard-front <script>`
  - Backend, when present: `pnpm --filter @closed-ai/backend <script>` or the actual backend package name.
  - Shared packages: use the package's workspace name.
- Do not add dependencies without checking existing packages first. Add dependencies to the smallest workspace that needs them.

## Shared Types And API Contracts

- `packages/types` is the intended single source of truth for DTOs, API payloads, WebSocket payloads, shared error shapes, query params, and route params.
- When adding or changing any cross-wire contract, update shared types first, then apply those exact types in backend validation/controllers/services and frontend API callers/hooks/components.
- Do not create duplicate local request/response interfaces in app folders for the same endpoint.
- If `packages/types` does not exist yet and the work introduces API contracts, create it or ask before proceeding if that would be too large for the requested change.

## Architecture

- Keep transport, business logic, and persistence separate.
- Controllers and gateways handle request parsing, validation, response formatting, status codes, and I/O.
- Services own business rules and orchestration.
- Repositories/models own data access.
- Never skip layers for convenience.
- Keep configuration centralized and typed. Do not hardcode environment variables, external URLs, or magic constants in feature code.

## Feature Completion Notes

When a feature is fully implemented or a partial feature is completed:

- Update `docs/PROJECT_SUMMARY.md` if it exists.
- Move the feature from backlog/partial notes to implemented notes, or narrow the remaining partial scope.
- Add a one-line description and the completion date.
- Update the `Last updated` timestamp.

If the summary file does not exist, do not create it for tiny changes. Create it when the task explicitly asks for project documentation or when completing a substantial feature.

## Verification

- Run the most specific relevant checks after changes.
- For frontend work, prefer `pnpm --filter dashboard-front lint` and type/build checks when available.
- For backend work, run the backend lint/test commands when the backend package exists.
- If a check cannot run because the package/script does not exist yet, mention that in the final response.
