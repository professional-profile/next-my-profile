# Coding Conventions and Quality Checks

## 1. Language, formatting, and naming

- TypeScript with `strict: true` in `tsconfig.json`.
- React JSX uses the automatic runtime (`react-jsx`).
- 2-space indentation, double-quoted strings, no semicolons, trailing commas, `printWidth: 160`.
- Prettier configuration is in `.prettierrc.json`.
- ESLint extends `next/core-web-vitals` and `next/typescript` in `.eslintrc.json`.
- Most reusable component filenames use kebab-case (`follow-button.tsx`, `rating-form.tsx`). Next route files use framework-required names such as `page.tsx` and `route.ts`.
- Domain interfaces/classes use PascalCase; functions/variables use camelCase; constants use the style already established in the relevant domain. Do not rename public APIs as part of an unrelated feature.

## 2. TypeScript and models

- Prefer explicit domain interfaces and service/repository contracts over untyped objects.
- Reuse `onecore` types (`Attributes`, `Filter`, `SearchResult`, `Result`, `DB`, `Statement`) where appropriate.
- Keep DB property mapping in the model metadata (`column: "snake_case"`).
- Use optional fields only when absence is a valid domain state; match the existing contract.
- Avoid `any`; `getCurrentUser()` currently has a `any` JWT payload internally, but new code should validate or narrow untrusted input where feasible.
- Use type-only imports if required by the compiler configuration/dependency types; inspect nearby code and compiler diagnostics.

## 3. SQL and persistence quality

- No raw user input in SQL strings. Bind values with `param()`/`db.param()`.
- Whitelist sort columns and directions through model-based `buildSort` or an explicit allow-list.
- Keep parameter indices correct when conditional joins and filters are added.
- Escape wildcard characters for `ILIKE` search when literal matching is intended.
- Specify selected columns where the existing query needs only a projection.
- Keep query-builder output as `{ query, params }` following `Statement`.
- Respect the `SearchRepository` pagination contract.
- Treat app-maintained summary tables and mirrored relationships as consistency-critical data.
- Do not expose password hashes, passcodes, tokens, or private user fields in public profile/list projections.

## 4. HTTP, validation, and error semantics

- Authenticate and authorize each protected operation at the server boundary.
- Validate untrusted payloads before service calls. Server validation is required even when the UI validates.
- Keep error/status mapping consistent with neighboring routes.
- Do not leak exception messages, SQL, stack traces, or credentials to API clients.
- Log enough route/operation context to diagnose server errors, but never log secrets or raw authentication material.
- Ensure clients handle the statuses the server actually returns; avoid treating all non-2xx responses as the same error if the user can recover.

## 5. React and UI quality

- Prefer Server Components for initial page data and markup.
- Keep client boundaries small and avoid moving server-only dependencies into the browser bundle.
- Use stable keys for rendered arrays. Avoid index keys when the data has a stable identifier.
- Use semantic buttons/links and accessible labels, especially for icon-only controls.
- Provide pending/disabled states for mutations to reduce duplicate submissions.
- Preserve mobile/responsive behavior in the existing grid and card system.
- Avoid broad changes to `public/static/script.js` or global CSS for a local feature.

## 6. Security and configuration

- `config.ts` currently contains fallback database connection and token-secret values. Treat these as unsafe development defaults; never copy them into examples, commit additional secrets, or expose them to the client. Prefer required environment variables/secret management for deployments.
- `getCurrentUser()` verifies `accessToken` using server-side JWT code. Do not trust a user ID supplied by the browser when the operation should use the authenticated account.
- Check record ownership for edits/deletes and safe redirect destinations after login.
- Sanitize or trust-gate HTML before rendering with `dangerouslySetInnerHTML`.
- Consider rate limiting and abuse controls for authentication, passcode, review, and other public mutation endpoints when extending those areas.

## 7. Commands and verification

`package.json` defines:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

The `lint` script currently invokes `next lint`. Because the repository pins Next.js 16, confirm that this command is supported by the installed CLI; if it is not, use the repository's supported ESLint invocation and update the script deliberately rather than silently changing build tooling.

Before finishing a feature:

1. Run `npm run build` (or `npx tsc --noEmit` if the build environment is not configured, while noting that this is not a full runtime test).
2. Run the configured lint command or the supported ESLint CLI.
3. Inspect the changed files for Prettier consistency.
4. Exercise the page/API manually when a database and environment are available.
5. Report tests/checks as run, not merely as recommended. Separate pre-existing failures from new failures.

No dedicated test directory or test script was found in the uploaded project snapshot. Do not claim automated coverage exists unless it is added.
