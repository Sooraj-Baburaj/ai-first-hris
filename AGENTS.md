# Closed AI Agent Rules

## Project Identity

Closed AI is an AI-first workforce lifecycle platform for HR teams. It transforms HR from a passive system of records into an active multimodal AI workforce layer that can understand documents, speak with candidates and employees, automate workflows, answer questions, coordinate tasks, and surface intelligence across the employee lifecycle.

Treat the system as a production-grade, multi-tenant full-stack TypeScript monorepo. It may include a dashboard frontend, Express/MongoDB backend, shared packages, AI agents, voice/chat channels, document processing, ticketing integrations, workflow automation, and third-party communication channels.

Write clean, modular, strictly typed code. Prefer small files, focused functions, guard clauses, and existing project patterns over broad refactors. Build for reliability, auditability, and enterprise readiness.

## First-Version Product Focus

The first dashboard version is primarily for HR admins and recruiters.

Candidates and employees may interact with Closed AI through chat, voice, WhatsApp, email, or embedded agent flows, but the main dashboard should serve internal HR/recruiting teams who manage hiring, onboarding, employee support, workflows, documents, and insights.

Do not design the first dashboard as a general consumer-facing app for all user types. Candidate and employee experiences can exist as assisted workflows, portals, or communication endpoints, but the operational control surface belongs to HR teams first.

## Brand Personality

Closed AI should feel:

- Calm
- Intelligent
- Trustworthy

The product should feel premium, but not flashy. Trust matters more than spectacle. The design should communicate that Closed AI is capable, secure, accurate, and composed enough to handle sensitive HR workflows.

Avoid overly playful, loud, futuristic, or gimmicky AI visuals. The product should feel like a serious AI operating layer for modern HR teams.

## Visual Direction

Use a light-first interface, with dark mode considered later.

The first version should prioritize clarity, document readability, dense-but-calm workflows, accessibility, and enterprise comfort. HR teams will spend time reading candidate details, documents, summaries, ticket histories, timelines, and structured data, so the UI should be easy to scan for long sessions.

A refined light mode is preferred over a dramatic dark AI-console aesthetic.

## Product Feel

Closed AI should feel closest to a polished SaaS dashboard with selective premium AI-product polish.

It should not feel like a marketing landing page. It should also not feel like an overly dense command center in the first version. The right feeling is a clean HR operating system: organized, confident, workflow-driven, and quietly intelligent.

Use premium AI touches where they help: agent status, confidence indicators, summaries, suggested actions, automation timelines, conversation intelligence, document extraction, and workflow recommendations.

## Product Pillars

### 1. Agentic Talent Acquisition

Support recruiting teams with:

- Resume parsing
- Candidate profile extraction
- Job description matching
- Fit scores
- Screening summaries
- Candidate status tracking
- Pipeline management
- Interview coordination
- Optional voice-driven technical screening
- Recruiter-facing AI recommendations

### 2. Multimodal Autonomous Onboarding

Support post-offer and pre-joining workflows with:

- Offer acceptance tracking
- Outbound voice follow-up
- Start-date coordination
- Document collection
- Missing document reminders
- WhatsApp/email workflows
- Onboarding task checklists
- HR escalation when automation cannot complete a task

### 3. 24/7 Employee And Candidate Helpdesk

Support automated HR assistance through:

- Application status questions
- HR policy questions
- Employee support tickets
- IT ticket intake or routing
- HR complaints
- Internal knowledge lookup
- Voice/chat support
- Escalation to human HR teams
- Conversation history and resolution tracking

### 4. Hyper-Personalized Learning And Development

Support employee growth with:

- Role-aware learning paths
- Skill-gap analysis
- Career copiloting
- Upskilling recommendations
- Learning progress tracking
- Manager/HR insights
- Personalized development plans

## Roadmap Areas

Nice-to-have future areas include:

- Sentiment pulse checks
- Automated exit interviews
- Slack integrations
- Discord integrations
- Microsoft Teams integrations
- Advanced workforce analytics
- Internal mobility recommendations
- Employee engagement intelligence

## Dashboard UX Principles

The dashboard should be built for HR admins and recruiters who need to move quickly and confidently.

Prioritize:

- Clear navigation
- Fast scanning
- Strong information hierarchy
- Practical workflows
- Actionable AI suggestions
- Audit trails
- Human handoff states
- Multi-tenant account separation
- Secure handling of candidate and employee data

Avoid:

- Landing-page-style hero sections inside the app
- Decorative AI gimmicks
- Overly abstract visuals
- Excessive gradients
- Unnecessary animation
- Dense tables without summaries or filters
- AI decisions without explanation or confidence context

## Core Dashboard Areas

A strong first version may include:

- Overview dashboard
- Candidate pipeline
- Candidate profile pages
- Job/requisition management
- Resume/JD matching view
- AI screening summaries
- Onboarding tracker
- Document collection status
- Helpdesk inbox
- Ticket and conversation history
- AI agent activity feed
- Workflow automation logs
- Knowledge base management
- Learning recommendations
- Settings, teams, roles, and tenant controls

## AI Behavior Expectations

AI features should feel useful, accountable, and explainable.

When showing AI output, prefer:

- Summaries with source context
- Confidence indicators where appropriate
- Suggested next actions
- Clear human review states
- Editable AI-generated drafts
- Escalation paths
- Audit-friendly logs

Do not present AI as magic. Present it as a capable assistant that accelerates HR work while keeping humans in control.

## Engineering Expectations

Build as a production-grade multi-tenant TypeScript system.

Prefer:

- Strict TypeScript
- Clear domain models
- Reusable shared types
- Server-side validation
- Guard clauses
- Modular services
- Small React components
- Accessible UI primitives
- Secure API boundaries
- Tenant-aware data access
- Explicit loading, empty, and error states

Avoid:

- Broad rewrites
- Untyped objects
- Hardcoded tenant data
- Mock-only flows pretending to be production logic
- Large components with mixed responsibilities
- AI features with no persistence or audit trail
- Sensitive HR data leaking across tenants

## Data Sensitivity

Closed AI handles sensitive HR, candidate, and employee information.

Always consider:

- Privacy
- Consent
- Role-based access
- Tenant isolation
- Audit logs
- Secure document handling
- Clear escalation paths
- Compliance-friendly data flows

Candidate and employee records should be treated as sensitive by default.

## Recommended First-Version Positioning

Closed AI is a calm, intelligent, trustworthy AI workforce platform for HR teams.

The first version should be a polished SaaS dashboard for HR admins and recruiters, focused on talent acquisition, onboarding, helpdesk automation, and workforce intelligence. It should be light-first, enterprise-ready, and practical, with premium AI interactions used to make complex HR workflows faster, clearer, and easier to manage.

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
- For frontend work, prefer `pnpm --filter @closed-ai/dashboard-front lint` and type/build checks when available.
- For backend work, run the backend lint/test commands when the backend package exists.
- If a check cannot run because the package/script does not exist yet, mention that in the final response.
