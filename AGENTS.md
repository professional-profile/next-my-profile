# Agent Guide

This file is the entry point for AI coding agents working in this repository. Read it before changing code. Use the focused guides in [`docs/`](docs/README.md) when a task touches a particular layer.

## Mission and product context

This is a Next.js App Router application for a professional profile and career platform. Its main domains are users/profiles, companies, jobs, articles/news, social relationships (follow/save), ratings/reviews, authentication, and localized content. The PostgreSQL schema is described in [`docs/domain-and-database.md`](docs/domain-and-database.md).

When implementing a feature, fit it into the existing domain and layering. Do not introduce a second architecture, an ORM, a new state-management library, or a new UI framework without an explicit requirement.

## Start here

1. Identify the domain and inspect the closest existing feature before coding.
2. Read [`docs/architecture.md`](docs/architecture.md) for the layer boundaries and service/repository patterns.
3. Read [`docs/routing-and-api.md`](docs/routing-and-api.md) for App Router, authentication, route handlers, and HTTP conventions.
4. Read [`docs/ui-and-localization.md`](docs/ui-and-localization.md) for Server/Client Components, forms, interactions, CSS, and translation conventions.
5. Read [`docs/feature-workflow.md`](docs/feature-workflow.md) for the recommended end-to-end implementation sequence.
6. Read [`docs/conventions-and-quality.md`](docs/conventions-and-quality.md) before finalizing changes. Check [`docs/observed-inconsistencies.md`](docs/observed-inconsistencies.md) to avoid copying known defects.

## Non-negotiable project conventions

- Use TypeScript and the Next.js App Router. Pages and layouts are Server Components by default. Add `"use client"` only for browser interaction, React state/effects, or client-only hooks.
- Keep the normal dependency direction: `app` / route handlers → domain `service` → repository interfaces and SQL repositories → PostgreSQL. Shared domain types/models live in `service/shared` or in the relevant domain folder when they are domain-specific.
- Reuse the existing service factory (`getCompanyService()`, `getUserService()`, etc.) and service methods. Do not run SQL from a page or client component.
- Use the existing `db` from `@lib/db`, `onecore` contracts, `postgres-kit` parameter helpers, and `sql-core` repositories/builders. All user-controlled SQL values must be bound parameters; never concatenate raw input into SQL.
- Model database mapping/validation with `Attributes` from `onecore`. Map snake_case database columns to camelCase model properties with the model's `column` metadata when appropriate.
- Use the existing `@service`, `@resources`, `@components`, `@lib`, and `@assets` aliases. Preserve the established import style and file naming (kebab-case for most component and route-adjacent files; existing domain filenames may be singular nouns).
- Follow `.prettierrc.json`: 2 spaces, double quotes, no semicolons, trailing commas, print width 160. Preserve local style when editing legacy files.
- Use `getCurrentUser()` for the current authenticated account. It reads the `accessToken` cookie and verifies the JWT. Protected pages must enforce authentication server-side; `proxy.ts` only adds request headers and is not an authorization boundary.
- For API handlers, return `NextResponse.json(...)` with explicit HTTP status codes, validate input before calling the service, and log unexpected exceptions using `logger` from `@lib/logger`.
- Add and update both English and Vietnamese resource entries for user-visible text. Use `getResource(...)`; do not hardcode display messages into a page when they belong in resources.
- Keep interactions in small Client Components. Reuse existing components and helpers for loading, toast, error, confirmation, save/follow, pagination, sorting, and forms where suitable.
- Do not create or assume database foreign keys or migrations that are not in the supplied schema. The current schema has few/no declared foreign-key constraints and uses application-level joins.

## Feature implementation checklist

- [ ] Locate the closest existing domain implementation and follow its contracts.
- [ ] Define or update the domain interface, filter, and `Attributes` model.
- [ ] Add repository interface/SQL implementation only when existing repositories do not cover the use case.
- [ ] Add/extend the use case/service and its lazy singleton factory.
- [ ] Add a Server Component page or API route; keep authorization on the server.
- [ ] Add a focused Client Component only if interaction requires it.
- [ ] Add `en` and `vi` resource keys.
- [ ] Review SQL parameter ordering, paging, sorting, status handling, and aggregate updates.
- [ ] Check responsive layout, empty/error/loading states, and accessible labels/controls.
- [ ] Run `npm run build` and `npm run lint` where the installed toolchain supports them; report any existing baseline failures separately from new failures.

## Important cautions

- Do not copy the `SqlUserRepository.load()` fallback query as-is; it currently builds parameters but passes only `[slug]`. See [`docs/observed-inconsistencies.md`](docs/observed-inconsistencies.md).
- The API route `app/api/my-articles/[id]/route.ts` declares `params` as a synchronous object despite awaiting it. For current App Router conventions, use the async params type expected by the installed Next.js version and verify generated types.
- Do not copy secrets or development credentials from `config.ts` into new code. Move secrets to environment variables and do not expose them to client bundles.
- Be cautious when rendering article HTML using `dangerouslySetInnerHTML`; only render content that has been sanitized or is otherwise trusted.
- Preserve the existing project design unless the task explicitly requests a redesign. Avoid broad refactors while implementing a focused feature.

## Documentation map

- [Architecture and layers](docs/architecture.md)
- [Domain model and PostgreSQL schema](docs/domain-and-database.md)
- [Routing, authentication, and API](docs/routing-and-api.md)
- [UI, forms, interactions, and localization](docs/ui-and-localization.md)
- [End-to-end feature workflow](docs/feature-workflow.md)
- [Code conventions and quality checks](docs/conventions-and-quality.md)
- [Observed inconsistencies and risks](docs/observed-inconsistencies.md)
