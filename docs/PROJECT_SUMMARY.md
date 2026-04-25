# Closed AI Project Summary

Last updated: 2026-04-25

## Implemented

- 2026-04-25: Added single-company role routing for recruiter, candidate, and employee demo sign-ins.
- 2026-04-25: Added separate candidate and employee portal views alongside the recruiter dashboard pages, organized with Next.js route groups.
- 2026-04-25: Added explicit local demo session storage and logout controls for all role workspaces.
- 2026-04-25: Initialized `@closed-ai/backend` with a clean-architecture TypeScript/Express scaffold plus shared API DTO contracts in `@closed-ai/types`.
- 2026-04-25: Mirrored workspace agent rules and skills into `cursor-specif/` for easier centralized access.
- 2026-04-25: Implemented Mongo-backed recruiter/candidate flows with backend role resolution, recruiter candidate+employee APIs, candidate resume upload (PDF/TXT), candidate status timeline, and candidate-to-employee conversion support.
- 2026-04-25: Rewired dashboard recruiter and candidate views to backend APIs with graceful loading, empty, and error states for candidate/employee lists and candidate application status.
- 2026-04-25: Added recruiter job listing creation and candidate job browsing/application flows, with status progression labels (submitted, under review, ready for screening, and later stages) reflected from backend application records.
- 2026-04-25: Added OpenAI SDK resume analysis agent in backend using Responses structured outputs to summarize resume-job fit, compute fit score/confidence, and populate recruiter metrics shown in candidate pipeline data.

## Notes

- MVP auth is intentionally shallow for now: static email and user-type selection stores a local demo session and chooses a role workspace, unknown emails fall back to the candidate portal, and production auth/RBAC remains future work.
