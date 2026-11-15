# Architecture

## 1. Application shape

This repository is a TypeScript Next.js App Router application using React Server Components by default. The product is a professional networking and career platform. The principal runtime path is:

```text
Browser
  ├─ Server-rendered pages / layouts (app/**)
  └─ Small interactive Client Components (components/**, page-local client components)
          │
          ├─ Server Component calls domain service directly
          └─ Client Component calls an HTTP route handler (app/api/**)
                         │
                         ▼
                  Domain service / use case (service/**)
                         │
                         ▼
                  Repository implementation (service/**/repository.ts)
                         │
                         ▼
                  PostgreSQL through @lib/db + postgres-kit + sql-core
```

Keep this direction. Pages and route handlers are adapters; business rules and persistence belong below them. A page should not contain SQL, and a browser component should not import a repository or database module.

## 2. Repository map

| Path | Responsibility |
|---|---|
| `app/` | App Router layouts, pages, route handlers, Server Actions, and page-specific components. |
| `components/` | Reusable React UI, form helpers, navigation, interactions, formatting, and browser utilities. |
| `service/` | Domain contracts, models, use cases/services, and SQL repository implementations. |
| `service/shared/` | Domain models reused by multiple domains (article, company, job, user, rate). |
| `service/common/` | Domain-independent service helpers such as slug generation. |
| `lib/` | Infrastructure adapters: database, account/JWT lookup, authentication, logging, menu. |
| `resources/` | English and Vietnamese resource dictionaries and resource composition. |
| `assets/css/` | Global CSS split into feature and UI concerns. |
| `assets/` | Other source assets used by the application. |
| `public/` | Static public files. |
| `config.ts` | Runtime defaults and environment-specific configuration. Avoid adding secrets here. |
| `proxy.ts` | Request metadata propagation (`x-current-fullpath`, `x-current-path`, optional `x-language`). It is not authorization middleware. |

Path aliases are configured in `tsconfig.json`:

- `@components/*` → `components/*`
- `@service` / `@service/*` → `service/index` / `service/*`
- `@resources` → `resources/index`
- `@lib/*` → `lib/*`
- `@assets/*` → `assets/*`

Prefer these aliases where the existing code uses them. Relative imports within a domain are also normal.

## 3. Domain folder pattern

Most domains have some variation of:

```text
service/<domain>/
  <domain>.ts        # domain interfaces, filters, repository/service contracts
  repository.ts      # SQL repository and query builder
  service.ts         # use-case/service orchestration
  index.ts           # lazy factory; exports public contracts
```

Additional domain-specific repositories can exist, for example company article/job/user repositories or user article/company repositories.

Shared entity contracts and `Attributes` models are in `service/shared/` when several domains need the same representation. A domain-specific workflow can have its own model; for example, `service/my-articles/article.ts` describes the editable article workflow separately from the public article representation.

## 4. Service factory and dependency composition

Factories expose a getter such as `getCompanyService()`, `getUserService()`, `getArticleService()`, `getJobService()`, or `getMyArticlesService()`. The factory lazily constructs the service once in module scope and returns the same instance on subsequent calls.

The company factory is a representative composition root:

1. It imports the shared `db` from `@lib/db`.
2. It creates SQL repositories for companies and related records.
3. It creates follow/rating collaborators using the existing `follow-service`, `rate-service`, and `rate-sql` packages.
4. It injects the collaborators into a domain use case (`CompanyUseCase`).
5. It separately exposes the rating service factory.

Follow this pattern when adding a domain service. Keep construction/wiring in `index.ts`, not scattered across pages or route handlers. Reuse package abstractions where the project already does so; do not hand-roll a parallel follow/rating framework.

## 5. Database access stack

- `onecore` supplies shared types and contracts such as `DB`, `Statement`, `Attributes`, `Filter`, `SearchResult`, and service/repository types.
- `pg` supplies the PostgreSQL driver/pool.
- `postgres-kit` supplies PostgreSQL helpers such as `PoolManager`, `param`, and `buildToSave`.
- `sql-core` supplies SQL repository abstractions/utilities such as `SearchRepository`, `SqlLoader`, `buildSort`, `buildToInsert`, and `buildToUpdate`.
- `@lib/db` exports the shared `db` abstraction.

Typical repository shape:

```ts
export class SqlExampleRepository extends SearchRepository<Example, ExampleFilter> implements ExampleRepository {
  constructor(db: DB) {
    super(db, "examples", exampleModel, buildQuery)
  }
}

export function buildQuery(filter: ExampleFilter): Statement {
  const where: string[] = []
  const params: unknown[] = []
  let i = 1

  if (filter.status) {
    where.push(`status = ${param(i++)}`)
    params.push(filter.status)
  }

  const query = `select * from examples${where.length ? ` where ${where.join(" and ")}` : ""}`
  return { query, params }
}
```

This is an illustrative shape, not a drop-in implementation. Match the exact `Statement` and parameter types accepted by the installed dependency versions and the closest existing repository.

### SQL rules

- Bind all runtime values. Use `this.db.param(index)` in repository methods using the DB instance, or `param(index)` from `postgres-kit` in standalone query builders, following the surrounding file.
- Keep the placeholder order and `params` array order synchronized. Add one placeholder and one parameter together.
- Do not interpolate user-provided search text, identifiers, filters, or sort text into SQL. For column sorting, use `buildSort(filter.sort, model)` or a vetted allow-list.
- Escape wildcard characters in text search where the code does so (`%` and `_`) before wrapping text in `%...%` for `ILIKE`.
- Use the `Attributes` model to describe property-to-column mappings and field constraints. Reuse `buildToInsert`, `buildToUpdate`, and other `sql-core` helpers where appropriate.
- Preserve paging and sorting behavior of `SearchRepository` rather than creating a bespoke paging implementation without a reason.
- Consider transaction/atomicity when a single action writes more than one row/table (for example, both directions of a follow relationship plus aggregate counters).

## 6. Rendering and request boundaries

- Pages/layouts are Server Components unless explicitly marked with `"use client"`.
- Server pages can call `getCurrentUser()`, `getResource()`, and service factories directly.
- Client Components should communicate with the server using `fetch` to an existing `/api/...` route or a form/Server Action pattern already used in the relevant feature.
- Keep server-only modules (`lib/db`, JWT verification, repositories) out of client import graphs.
- Use `proxy.ts` request headers only as metadata. A route or page must still explicitly authorize access to protected data.

## 7. Logging and errors

Use the configured logger from `@lib/logger` for unexpected server errors. Existing pages often call `logError` and render the shared `<Error />` component; route handlers log the path/operation and return a generic JSON error. Do not return raw stack traces or database errors to the browser.

Prefer expected business outcomes to be represented through the existing result/status conventions, while unexpected exceptions are caught at the page or route boundary and logged.
