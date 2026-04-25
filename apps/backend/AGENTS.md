# Backend Agent Rules

These rules apply to `apps/backend`.

## Clean Architecture Layers

| Layer | Location | Rules |
| --- | --- | --- |
| Domain | `packages/types` and future pure TypeScript domain code | Shared DTOs and shapes. No I/O. Single source of truth for API and WebSocket payloads. |
| Application | `src/services/` | Business rules and orchestration. Must not import `src/models/`. Use repositories for persistence. |
| Infrastructure | `src/models/`, `src/repositories/` | Mongoose schemas live in models. All queries, saves, updates, and aggregations go through repositories. |
| Interface adapters | `src/routes/`, `src/controllers/`, `src/middlewares/`, `src/helpers/` | HTTP/WebSocket wiring, auth, validation, status codes, and provider I/O. Do not import `src/models/`. Call services for use cases. Middleware/helpers may call repositories only for narrow infrastructure lookups such as loading a user for JWT. |

## Dependency Rule

Dependencies flow inward:

```txt
routes/controllers/gateways -> services -> repositories -> models
```

Do not skip layers. For example, no `Model.find(...)` in controllers, gateways, middlewares, helpers, or services.

## Where New Backend Code Goes

- New REST or WebSocket behavior: thin route/controller/gateway plus a new or existing service method.
- New business rule: service.
- New database access pattern: repository function first, then call it from a service.
- New Mongoose schema or field: update shared types first, then models, repositories, services, and callers.
- New external integration configuration: centralized typed config, not inline constants.

## Mongoose Model Imports

Only files under `src/models/` and `src/repositories/` may import from `src/models/` or relative `models/` paths.

Declaration files under `src/**/*.d.ts` may use `import type` from repositories if needed for request typing.

ESLint should enforce restricted model imports once backend lint config exists. After backend changes, run the backend lint script if present.

## API Contracts

- Any request body, response body, query/param DTO, WebSocket payload, or shared error shape belongs in `packages/types`.
- Backend controllers, validation schemas, and services should use the exported shared types for anything that crosses the wire.
- Do not define parallel request/response interfaces only in `apps/backend`.

## Error Handling And Security

- Never swallow async errors.
- Use centralized error-handling middleware.
- Throw typed application errors from services so middleware can format them consistently.
- Protected routes must use the existing JWT protection middleware.

## Multimodal Agents And Workflow Streams

- Keep WebSocket handlers modular by extracting event-specific handlers.
- Keep voice, chat, document-processing, and workflow-provider transport details out of core business logic where practical.
- Handle disconnects, latency, provider errors, retries, idempotency, and standard close/error codes.
- Close external provider streams when the client disconnects.
- Treat candidate and employee data as sensitive. Avoid logging raw resumes, documents, private HR complaints, policy conversations, or personally identifiable data unless explicitly required and redacted.
- For ticketing, messaging, email, calendar, or HRIS integrations, isolate provider APIs behind services/adapters and keep domain decisions in services.
