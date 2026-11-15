# Observed Inconsistencies and Things to Verify

This document records issues noticed during source inspection. It is not a complete audit. These are cautions for future changes; do not assume they have been fixed unless the implementation changes.

## 1. `SqlUserRepository.load()` fallback passes the wrong parameter list

File: `service/user/repository.ts`

The method builds a fallback query that, when `userId` exists, contains two positional placeholders (viewer ID and target ID), and builds `params` with both values. The final call currently passes `[slug]` instead of `params`:

```ts
return this.db.queryOne<User>(query, [slug], this.map)
```

That does not match the SQL when the viewer-aware branch is selected and also discards the constructed `params` variable. Before extending this method, correct the parameter handling and add a focused verification for both the username lookup and ID fallback, with and without `userId`.

## 2. `SqlCompanyRepository.load()` has the analogous fallback parameter issue

File: `service/company/repository.ts`

The fallback branch constructs a query with a viewer parameter plus a target ID parameter when `userId` exists, and populates `params`. The final query call currently passes `[slug]` rather than the constructed `params`. Verify and correct this as part of any work in this path. This mirrors the issue in the user repository.

## 3. Async route params type mismatch

File: `app/api/my-articles/[id]/route.ts`

The route handler types the context as `{ params: { id: string } }` but then does `await params`. In this Next.js 16 App Router project, dynamic route params are asynchronous. Use the async route-context type expected by this installed version (as the page implementations do) and keep generated Next.js types/build output in sync.

## 4. Database and JWT fallback secrets in `config.ts`

File: `config.ts`

The file contains a local PostgreSQL URL with a password and a fallback token secret. They appear to be development defaults, but should be treated as secrets until verified. Do not reproduce them in new code, documentation examples, screenshots, logs, or client bundles. For deployment, supply values through environment/secret management and rotate them if they were ever real or shared outside a trusted local environment.

`lib/db.ts` reads `DB_URL` before the configured fallback. `lib/account.ts` reads `TOKEN_SECRET` before the configured fallback. New secret-bearing settings should follow environment/secret management, not be added as public constants.

## 5. Two PostgreSQL pools are constructed

File: `lib/db.ts`

The module exports both `pool` (a `Pool`) and `db` (`PoolManager` wrapping a newly created `Pool`). The two exported globals are cached separately in development. Confirm whether both are actually needed; if the standalone `pool` is unused, this can create an unnecessary second connection pool. Do not consolidate without checking all imports and runtime ownership/lifecycle behavior.

## 6. HTML rendering must be trust-boundary aware

At least one article detail path renders article content with `dangerouslySetInnerHTML`. Ensure that content has been sanitized or is generated/controlled by a trusted authoring pipeline before rendering. Do not copy this technique for arbitrary user-supplied HTML.

## 7. Schema ID-length mismatches

The supplied DDL defines `companies.id` and `articles.id` as `varchar(80)`, while some related IDs such as rating summary/relation IDs use `varchar(40)`. Confirm real identifier lengths and the actual deployed DDL before adding new columns, narrowing types, or imposing constraints.

## 8. Build/lint and test workflow needs verification

The package declares Next.js 16 and the lint script is `next lint`. Confirm the command still exists in the installed Next CLI version; the script may need to use the supported ESLint CLI. No test script or test suite was found in the uploaded snapshot, so new behavior currently needs explicit manual verification or a deliberately introduced test setup.

## 9. Status constants overlap

`resources/index.ts` uses single-character values for multiple semantic names: `Approved` and `Active` both map to `A`; `Draft`, `Deativated`, and `Deleted` map to `D`. Treat these values as domain-scoped, not universally unique. Preserve the existing status meaning for the relevant table/workflow.

## How to use this file

These observations should inform new work without triggering unrelated refactoring. Fix an issue when the feature depends on that path, add a focused test or verification, and update this document when the issue is resolved. Keep separate product behavior from legacy defects: do not reproduce a bug merely because it exists in the current implementation.
