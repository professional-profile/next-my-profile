# End-to-End Feature Workflow

Use this sequence to add a feature without breaking the current layering or conventions. Adapt it to the size of the change; a display-only change may not require every step.

## 1. Discover the closest existing implementation

Search by domain and behavior, not only by page name. For example:

- Follow a user → inspect `app/api/users/[id]/route.ts`, `components/follow-button.tsx`, `service/user/index.ts`, and the follow repository wiring.
- Save a job → inspect `app/api/jobs/[id]/route.ts`, `components/save-button.tsx`, the jobs service, and `saved_jobs` usage.
- Rate an article → inspect `app/api/articles/[id]/rate/route.ts`, `components/rating-form.tsx`, `service/shared/rate.ts`, and article rating factory code.
- Edit an article → inspect `app/my-articles/[id]/page.tsx`, `app/api/my-articles/[id]/route.ts`, and `service/my-articles/`.

Use the actual code as the primary example. These docs are a map and may not include every exception.

## 2. Establish the domain contract

Before implementing UI, define what the feature means:

- Which entity is read or changed?
- Is the action public or restricted to the current user?
- What states/statuses are valid?
- Is it a one-row write or does it update relationship mirrors/summary counts?
- Which filters, ordering, paging, or projections are required?
- Does the operation need to be idempotent?

Update the relevant TypeScript interfaces and `Attributes` model. Prefer an existing shared model in `service/shared/` where multiple domains use the same entity. Keep special authoring/editing models in the feature domain if their fields/workflow differ.

## 3. Implement or extend the data access

- Reuse the existing repository if the query is already supported.
- Extend the repository interface in the domain contract when a new operation is needed.
- Implement SQL in the domain repository, extending `SearchRepository` or `SqlLoader` when appropriate.
- Use positional parameters and keep the parameters array in exactly the same order.
- Add only the needed joins/projections; avoid `select *` for a list projection when the existing domain uses a narrow set of fields.
- Apply the same search, sort, and paging behavior as the closest endpoint.
- Keep denormalized counters and duplicated follow rows consistent. Use the available batch/transaction mechanism when multiple writes must succeed together.

Do not add a database migration based on guesswork. The schema supplied with the project description is not checked into this archive; first identify the authoritative schema rollout process.

## 4. Implement service/use-case behavior

Keep orchestration in the domain service/use case. A repository performs persistence; the use case composes repositories and applies domain behavior.

If a new service is required, wire it through a lazy singleton getter in that domain's `index.ts`, using `db` from `@lib/db`. Export the public contract from the domain index when other folders need it.

Avoid importing one domain's private repository directly into a page. If another domain needs data, expose a deliberate service method or an appropriate repository dependency, following existing patterns such as the company/user article and job repositories.

## 5. Add the server boundary

For a page:

- Prefer an async Server Component.
- Await `params` and `searchParams` according to the installed Next.js version.
- Resolve the account, language, and resources on the server.
- Enforce authentication and ownership for private data.
- Call the domain service, then render reusable components.

For a mutation:

- Add or extend a route handler under `app/api/<resource>/.../route.ts`.
- Authenticate before acting; authorize the target object/owner, not only the presence of a user.
- Parse and validate the body using the domain `Attributes` model and the user's resource dictionary.
- Call the service; map expected result states to explicit HTTP status codes.
- Catch and log unexpected exceptions; return a generic error response.

For login-like workflows, follow the Server Action + client form structure already used by `app/login/`.

## 6. Add the UI

- Use Server Components for static/rendered output and data loading.
- Add a small Client Component only when an interaction needs local state or browser behavior.
- Reuse `Input`, `SubmitButton`, `SaveButton`, `FollowButton`, `RatingForm`, search/sort/pagination, and shared UI helpers where they fit.
- Use the existing CSS class/grid system and add focused styles to the appropriate file in `assets/css/`.
- Add meaningful empty, error, and pending states. Provide accessible labels for interactive controls.

## 7. Add translations

Add all visible strings to both English and Vietnamese resource dictionaries in the relevant domain folder. Keep keys in lower_snake_case and use the shared `getResource()` dictionary.

## 8. Validate the complete behavior

At minimum, inspect:

- Anonymous user behavior and logged-in behavior.
- Authorization/ownership checks.
- Duplicate submissions and idempotency.
- Invalid input and all relevant HTTP status paths.
- Empty lists, no results, deleted/expired records, and pagination boundaries.
- Data consistency for denormalized counters and mirrored relationship rows.
- Both locales and date formatting.
- Responsive layout and accessible controls.
- SQL parameter order and query behavior.

Run the checks in `docs/conventions-and-quality.md`. If the project has no automated test covering the feature, describe manual verification steps in the completion summary rather than claiming it is tested.
