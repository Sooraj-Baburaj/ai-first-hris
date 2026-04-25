<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Dashboard Frontend Agent Rules

These rules apply to `apps/dashboard-front`.

## Architecture

- Use Atomic Design for UI structure: atoms, molecules, organisms, templates, pages.
- Before creating a new UI element, search for existing reusable components in this app and `packages/ui`.
- Reuse and extend existing components with props and Tailwind utilities instead of duplicating UI code.
- Do not mirror backend `services/repositories/models` architecture in the frontend unless a dedicated feature-slice refactor is explicitly requested.

## Styling

- Use Tailwind CSS. Do not add SCSS or raw CSS files unless a highly specific global override is required.
- Keep UI components typed, composable, and accessible.
- Handle loading, error, and empty states for API-backed views.

## Next.js

- Respect Server Component and Client Component boundaries.
- Use `next/dynamic` or lazy loading for heavy modals, charts, editors, and route-sized UI.
- Before editing Next.js behavior, read the relevant local docs under `node_modules/next/dist/docs/`.

## API Types

- API callers, hooks, and components that consume backend data must use shared types from `packages/types` once that package exists.
- Do not create duplicate local request/response interfaces for the same backend payload.

## Verification

- Run `pnpm --filter dashboard-front lint` after frontend changes when dependencies are installed.
- Run stronger checks such as build/type checks when the change touches routing, data loading, or shared component contracts and the scripts exist.
