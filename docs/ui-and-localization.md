# UI, Forms, Interactions, and Localization

## 1. Server and Client Components

Server Components are the default. Keep data loading, account lookup, resource selection, and initial rendering on the server. Add `"use client"` only where browser APIs, event handlers, React state/effects, or client hooks are required.

Examples of client interaction components include `SaveButton`, `FollowButton`, and `RatingForm`. They call server API endpoints and update local UI state. Keep these boundaries small; pass only the data needed by the interactive component.

Do not import `@lib/db`, SQL repositories, JWT verification, or other server-only dependencies into a Client Component.

## 2. Existing reusable components

| Component/helper                                | Use                                                                             |
| ----------------------------------------------- | ------------------------------------------------------------------------------- |
| `PageHeader`                                    | Page-level heading/title area.                                                  |
| `Nav`, menu components                          | Main and contextual navigation.                                                 |
| `BackButton`                                    | Browser/router back navigation.                                                 |
| `Pagination`                                    | Search-result paging.                                                           |
| `Search`, `ClientSearch`, `Sort`, `SearchLink`  | Query-driven search and sorting UI.                                             |
| `SearchResultMessage`                           | Search result/empty-state messaging.                                            |
| `Error`                                         | Shared page error presentation.                                                 |
| `Input`, `SubmitButton` (`components/form.tsx`) | Standardized form inputs and API-backed submit behavior.                        |
| `SaveButton`, `FollowButton`                    | Save/follow interactions.                                                       |
| `RatingForm`, `RatingSummary`, `Useful`         | Rating and review presentation/interaction.                                     |
| `components/ui.ts`                              | Loading, confirmation, toast, alert helpers.                                    |
| `components/client-script.ts`                   | Form decoding, validation and DOM integration utilities used by existing forms. |
| `format.ts`                                     | Resource interpolation/formatting helper.                                       |

Before creating a new reusable component, inspect these components and a similar page. Prefer reuse over a near-duplicate implementation.

## 3. Forms and mutations

The current form system is a hybrid of native HTML forms and client helpers:

- GET/search pages use query parameters and existing search components; `next/form` may be used where the existing page follows that pattern.
- `Input` is a project wrapper around the native input. It wires Material-style focus/blur behavior and validation helpers.
- `SubmitButton` reads its containing form, validates it, decodes form values, shows a confirmation dialog, sends JSON to the configured API endpoint, maps common HTTP statuses to localized messages, and handles navigation when `successUrl` is provided.
- Some domain interactions use smaller dedicated Client Components with direct `fetch` calls.

For a new form, choose the closest existing pattern. Keep validation authoritative on the server even when client validation is present. Do not assume `SubmitButton` handles every status; inspect its implementation and add explicit handling for any new response code.

Use native semantic controls and provide labels, meaningful button text, and accessible names. Some legacy icon-only controls do not provide accessible labels; do not repeat that limitation in new UI.

## 4. Client-side API interaction

Common interaction pattern:

1. Keep a small client component with local state for pending/saved/followed/rating state.
2. Call the corresponding `/api/...` endpoint using `fetch` and the HTTP method already used by the domain.
3. Send JSON and set `Content-Type: application/json` when a JSON body is sent.
4. Handle authentication and failure states (for example 401, 403, 409, 410, or 422) deliberately.
5. Use `showLoading`, `hideLoading`, `toast`, `alertError`, or existing UI helpers as appropriate.
6. Refresh or update local state only after the server confirms success.

Avoid a new global state library for one isolated interaction. Keep server-derived state as the source of truth.

## 5. Styling and layout

The project uses global CSS files under `assets/css/`, not CSS Modules or a component framework. Existing pages use utility-like class names such as `row`, `col s12 m6`, `form`, `main-body`, `section`, `card`, `chip-list`, etc.

- Inspect the relevant page and CSS before adding markup.
- Add styles to the nearest existing CSS file (for example `form.css`, `profile.css`, `article.css`, `search.css`, or `card.css`) or add a focused file only when needed and import it consistently through the existing global CSS entry.
- Preserve existing responsive grid conventions and visual vocabulary.
- Avoid broad global selectors that may affect unrelated pages.
- Use inline styles only for values that are genuinely dynamic (such as a percentage width or image background URL); prefer classes for static presentation.
- Verify narrow and wide layouts and empty/loading/error conditions.

`app/layout.tsx`, `components/layout.tsx`, and `components/client-layout.tsx` establish the global shell. `components/layout.tsx` builds navigation from menu/account/language; `ClientLayout` handles a small client-side layout concern. Do not create a second global shell for an ordinary feature.

## 6. Localization

The current locales are English (`en`) and Vietnamese (`vi`). `resources/index.ts` merges common resources with domain dictionaries:

- `resources/en.ts`, `resources/vi.ts`
- `resources/article/en.ts`, `resources/article/vi.ts`
- `resources/company/en.ts`, `resources/company/vi.ts`
- `resources/job/en.ts`, `resources/job/vi.ts`
- `resources/profile/en.ts`, `resources/profile/vi.ts`
- `resources/authentication/en.ts`, `resources/authentication/vi.ts`

Use `getResource(lang)` to get the merged dictionary. `getLang(query, loginLang)` prefers the logged-in user's language, then the query parameter, then English. `getLangByPath` maps `/vi` paths to Vietnamese; `getLangSearch` builds a language query suffix. `getDateFormat` uses an account override or the locale service default.

When adding user-facing text:

1. Add a matching key to the relevant English and Vietnamese resource files.
2. Use the existing lower_snake_case key convention, grouped with related domain entries.
3. Read the value from `resource.<key>` rather than hardcoding it in JSX.
4. Use the existing formatting helper for substitutions instead of manual string concatenation where applicable.
5. Include validation and API error messages in the resource dictionaries when they are displayed to users.

Keep resource keys semantically stable. Avoid reusing an unrelated key merely because its current text happens to match.
