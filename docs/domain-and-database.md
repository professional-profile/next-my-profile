# Domain Model and PostgreSQL Schema

## 1. Product model

The platform combines professional identity, company information, recruitment, publishing, and social feedback. The main entity areas are:

- User profiles and authentication.
- Company profiles and company-to-company/user relationships.
- Jobs and saved jobs.
- Articles/news and saved articles.
- Ratings/reviews, comments, and reactions for companies and articles.
- Categories, code masters, and localized content.

The SQL schema below is based on the DDL supplied in the project conversation. It is not a checked-in migration, so verify the actual deployed database before schema changes.

## 2. Table map

### Users and authentication

| Table | Role | Key fields / relationship meaning |
|---|---|---|
| `users` | User account and public professional profile | `id` primary key; `username`, `email`, names, profile image/cover, bio, headline, interests, skills, work/education JSON arrays, settings, language/date format. |
| `passwords` | Password credential state | `id` identifies the user; password hash, success/failure timestamps, lock state, changed time, password history. |
| `passcodes` | Verification/reset code storage | `id`, code, expiration. |
| `user_info` | Denormalized user counters | `id`, `follower_count`, `following_count`. |
| `user_followers` | Follower-oriented relationship rows | `(id, follower)` primary key; `id` is the followed user, `follower` is the user following them. |
| `user_following` | Following-oriented mirror rows | `(id, following)` primary key; `id` is the user doing the following, `following` is the target. |
| `skills` | Skill catalog | `skill` primary key. |
| `interests` | Interest catalog | `interest` primary key. |

`users` stores both account and profile data. The `skills` and `interests` catalog tables coexist with array/JSON profile fields; do not assume profile values are foreign-key constrained to these catalogs.

### Companies

| Table | Role | Key fields / relationship meaning |
|---|---|---|
| `companies` | Company profile | `id` primary key, unique `slug`, name, overview, website, industry, size, logo, cover, gallery, status. |
| `company_info` | Denormalized company counters/ratings | `id`, `follower_count`, `rate`, `rate1`…`rate5`, `count`, `score`. Usually keyed by the company ID by convention. |
| `company_followers` | User-following-company perspective | `(id, follower)`; `id` is company, `follower` is user. |
| `company_following` | Company-following-company perspective | `(id, following)`; `id` is company doing the following, `following` is target company. |
| `company_rates` | Company reviews/ratings | `rate_id` primary key; `id` company, `author` user, `rate`, review, counters, history, anonymous; unique `(id, author)`. |
| `company_rate_comments` | Comments on a company review | `comment_id`, `rate_id`, `user_id`, comment, timestamps/history/anonymous. |
| `company_rate_reactions` | User reactions to a company review | `(rate_id, user_id)` primary key; `reaction` and timestamp. |

### Jobs

| Table | Role | Key fields / relationship meaning |
|---|---|---|
| `jobs` | Job posting | `id`, slug, title/description, original link, publication/expiry, `company_id`, position, quantity, location, applicant count, skills, salary bounds, status and audit fields. |
| `saved_jobs` | User-saved job relation | `(user_id, id)` primary key; save timestamp. `id` refers to the job ID by convention. |

### Articles and news

| Table | Role | Key fields / relationship meaning |
|---|---|---|
| `articles` | Article/news record | `id` primary key, unique slug, title, description, content, publication date, tags, thumbnail variants, author/company IDs, status and creation date. |
| `saved_articles` | User-saved article relation | `(user_id, id)` primary key; save timestamp. |
| `article_info` | Denormalized article rating summary | `id`, average/rating distribution, count, score. |
| `article_rates` | Article reviews/ratings | `rate_id`, `id` article, `author`, integer rate, review, useful/reply counters, history, anonymous; unique `(id, author)`. |
| `article_rate_comments` | Comments on an article review | `comment_id`, `rate_id`, `user_id`, comment, timestamps/history/anonymous. |
| `article_rate_reactions` | User reactions to an article review | `(rate_id, user_id)` primary key; reaction and timestamp. |

### Configuration and content

| Table | Role | Key fields / relationship meaning |
|---|---|---|
| `code_masters` | Generic code/name/status lookup | Composite primary key `(master, code)`; optional name, sequence, status. |
| `categories` | Navigation/resource category metadata | ID, name, status, path, resource key, icon, sequence, type, parent, audit/version fields. Seeded examples include companies, news, jobs, profiles. |
| `contents` | Localized/versioned content | Composite primary key `(id, lang)`; title/body/tags/status, audit and version fields. |

## 3. Important relationships and aggregate semantics

```text
users ──< user_followers >── users
users ──< user_following >─> users
users ──< saved_jobs >────── jobs ────── companies
users ──< saved_articles >─ articles ─── companies
users ──< article_rates >── articles
users ──< company_rates >── companies
article_rates ──< article_rate_comments / article_rate_reactions
company_rates ──< company_rate_comments / company_rate_reactions
```

The follow tables store both directions of a logical relationship. A user follows another user by creating a row in `user_followers` for the target and a mirror row in `user_following` for the actor. The company follow service is wired similarly. When creating or modifying these relations, preserve the mirrored representation and keep denormalized counts synchronized, preferably atomically.

`user_info`, `company_info`, and `article_info` are materialized/denormalized summary records maintained by application logic. Read them for profile/list summaries rather than recalculating counts on every request. When updating ratings or follows, verify the existing service handles both the relation and summary update.

## 4. Status values and workflow

`resources/index.ts` exports a `Status` class used by the application. Values currently include:

- `New = "new"`
- `Draft = "D"`
- `Submitted = "S"`
- `Rejected = "R"`
- `Approved = "A"`
- `Published = "P"`
- `Expired = "E"`
- `RequestToEdit = "T"`
- `Active = "A"`
- `Inactive = "I"`

Some names intentionally share a one-character value (for example Approved/Active and Draft/Deleted/Deactivated). Check the domain and existing query before assuming a status is globally unique. Some domain files also export local constants such as `Published` or `Draft`; follow the relevant domain's established convention.

## 5. Mapping between database and TypeScript

The database uses snake_case column names and TypeScript models generally use camelCase properties. Model metadata maps fields, for example:

```ts
export const articleModel: Attributes = {
  id: { key: true, length: 40, required: true },
  publishedAt: { column: "published_at", type: "datetime" },
  highThumbnail: { column: "high_thumbnail", length: 400 },
  createdAt: { column: "created_at", type: "datetime", noupdate: true, createdAt: true },
}
```

Other supported metadata in this codebase/dependency ecosystem includes length, required, key, type, noinsert/noupdate, and query-related flags (`q`). Inspect the model and repository helper actually used by the domain before choosing a flag or assuming its exact semantics.

Use `Attributes` as the schema shared by validation and SQL mapping where that is the established pattern. For a new domain field, update the TypeScript interface, model metadata, repository selection/mapping, validation, forms/API, and database schema/change process together.

## 6. Schema caveats

- The supplied DDL does not declare foreign-key constraints. The application joins by ID and relies on application-level consistency. Do not claim a relation is database-enforced unless the deployed DDL confirms it.
- ID lengths are inconsistent: `companies.id` is `varchar(80)` while several related company ID columns are `varchar(40)`; `articles.id` is `varchar(80)` while `article_rates.id` and `article_info.id` are `varchar(40)`. Validate actual values and deployed schema before changing constraints or column lengths.
- `company_info.id` and `article_info.id` are conceptually summary IDs matching their parent entity IDs, but the DDL does not explicitly enforce that.
- Follow tables intentionally duplicate directional information. Do not collapse them to one table without changing repository/service behavior and every read path.
- `histories` is declared `jsonb[]`; do not silently change it to a JSONB object/array without migration and compatibility analysis.
- Arrays (`gallery`, `interests`, `skills`, tags) and JSONB fields are used for flexible attributes. Do not normalize them automatically as part of an unrelated feature.
- No migration directory was found in the uploaded project. Determine the team's actual database deployment/migration workflow before introducing a migration file or applying DDL.
