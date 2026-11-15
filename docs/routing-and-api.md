# Routing, Authentication, and API Conventions

## 1. App Router patterns

The application uses `app/` with file-system routes. A representative route inventory:

| Route family | Examples | Purpose |
|---|---|---|
| Companies | `/companies`, `/companies/[slug]`, `/companies/[slug]/articles`, `/jobs`, `/followers`, `/reviews` | Company discovery and detail pages. |
| Profiles | `/profiles`, `/profiles/[slug]`, `/articles`, `/companies`, `/followers`, `/following` | User discovery and public profiles. |
| Jobs | `/jobs`, `/jobs/[slug]` | Job search and detail. |
| News/articles | `/news`, `/news/[slug]`, `/news/[slug]/review` | Content list, detail, and review. |
| Current-user | `/my-profile`, `/my-articles`, `/my-articles/[id]`, `/saved-jobs`, `/saved-news`, `/settings` | Authenticated workflows. |
| Authentication | `/login`, `/logout` | Sign-in/sign-out. |
| APIs | `/api/users/[id]`, `/api/companies/[id]`, `/api/jobs/[id]`, `/api/articles/[id]`, `/api/my-articles/[id]`, `/api/settings`, `/api/logout` | JSON mutations and account operations. |

### Dynamic route props

Pages in this Next.js version use asynchronous route params/search params. Match the current Next.js App Router type signatures and await values:

```ts
interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params
  const query = await searchParams
  // ...
}
```

This is a representative shape; use only the props actually needed. Route handlers should use the installed Next.js route context type for async `params` as well. One existing handler has a non-Promise annotation despite awaiting `params`; see `observed-inconsistencies.md`.

## 2. Server-rendered list/detail page pattern

A typical list page:

1. Gets the account with `getCurrentUser()` if personalized data or locale depends on it.
2. Awaits `searchParams`.
3. Resolves language and dictionary using `getLang(query, account?.language)` and `getResource(lang)`.
4. Builds a domain filter from query parameters using `buildFilter<ModelFilter>(query, defaultLimit, ["publishedAt"])` or the closest existing variation.
5. Sets domain constraints such as `status`, `userId`, `isSaved`, etc.
6. Calls a service factory and `service.search(filter, filter.limit, filter.page)`.
7. Formats output with existing `web-one` utilities (`datetimeToString`, `formatDateTime`, and related helpers).
8. Renders reusable components for header, search, sort, pagination, rows/cards, empty state, and error state.

Follow the nearest domain page because filters and projections vary. Do not move list fetching into a Client Component solely to use `useEffect`.

## 3. Authentication model

`lib/account.ts` exports `getCurrentUser()`:

- It reads the `accessToken` cookie using `cookies()` from `next/headers`.
- It verifies the JWT using `TOKEN_SECRET` or the configured fallback.
- It returns the payload as an `Account` (`id`, `username`, `displayName`, `language`, `dateFormat`) or `null` for missing/invalid tokens.

Protected pages use server-side checks. A common pattern reads `headers()` and the `x-current-fullpath` header, then redirects unauthenticated users to `/login?redirect=<encoded path>`. Preserve a safe redirect policy; do not accept arbitrary external redirect URLs.

`proxy.ts` propagates request metadata. It is explicitly not a replacement for `getCurrentUser()` or resource-level authorization. Every protected API operation must check the current user and verify ownership/permission before mutating data.

Never expose JWT secrets, DB credentials, or server-only account data to Client Components. Do not add secret values to `NEXT_PUBLIC_*` variables.

## 4. Route handler conventions

Current route handlers are in `app/api/**/route.ts` and export HTTP method functions such as `POST`, `PATCH`, and `DELETE`. Common behavior:

- Read current account first for authenticated operations.
- Return `401` if authentication is required and absent.
- Parse JSON with `await request.json()` when the endpoint accepts JSON.
- Validate request data using `validate(model, attributes, resource)` before calling the domain service.
- Use the domain service factory rather than repository/SQL access in the handler.
- Map business outcomes to explicit status codes. Existing conventions include `200` success, `409` conflict, `410` no-longer-available/not-found-or-stale outcome, `422` validation errors, and `401` authentication required. Some operations may additionally use `403` for forbidden.
- Catch unexpected exceptions, log context with `logger`, and return a generic `500` response.

Example shape adapted from the existing save/update flow:

```ts
export async function POST(request: NextRequest, { params }: RouteContext) {
  const account = await getCurrentUser()
  if (!account) {
    return NextResponse.json({ message: "Require authentication" }, { status: 401 })
  }

  const { id } = await params
  const payload = await request.json()
  const resource = getResource(account.language)
  const errors = validate(payload, exampleModel, resource)
  if (errors.length > 0) {
    return NextResponse.json(errors, { status: 422 })
  }

  try {
    const result = await getExampleService().save(account.id, id, payload)
    return NextResponse.json(result, { status: isSuccessful(result) ? 200 : 409 })
  } catch (err) {
    logger.error(`Error at POST /api/examples/${id}: ${err}`)
    return NextResponse.json({}, { status: 500 })
  }
}
```

The type alias `RouteContext` above is illustrative. Use the actual async route-context type required by this Next.js version; do not paste the placeholder unchanged.

Avoid logging submitted passwords, passcodes, JWTs, or other credentials. Avoid exposing internal exception details in API responses.

## 5. Existing API behavior map

| Endpoint | Observed responsibility |
|---|---|
| `POST /api/my-articles/[id]` | Validate and create/update a user's article; `id === Status.New` selects create. |
| `/api/articles/[id]` | Save/unsave article behavior. |
| `/api/jobs/[id]` | Save/unsave job behavior. |
| `/api/companies/[id]` | Follow/unfollow company. |
| `/api/users/[id]` | Follow/unfollow user. |
| `/api/companies/[id]/rate` | Submit/update or react to company rating, depending on method. |
| `/api/articles/[id]/rate` | Submit/update or react to article rating, depending on method. |
| `POST /api/settings` | Save user settings. |
| `POST /api/logout` | Clear the `accessToken` cookie. |

Inspect the actual route before relying on a method/response detail; this table is a navigation map, not a substitute for the handler source.

## 6. Login and logout

The login page uses a Server Action (`app/login/actions.ts`) and a client form (`app/login/LoginForm.tsx`) with React `useActionState`. A successful client state triggers navigation. Preserve the Server Action/client form separation when extending login UI.

Cookie changes must be performed on the server with secure cookie settings appropriate to the deployment (HttpOnly, Secure in production, SameSite, path, and expiration). Do not move token handling into browser localStorage.
