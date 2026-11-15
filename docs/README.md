# AI Project Context

These documents describe the current implementation of this repository and the conventions an AI coding agent should preserve when extending it. Start with the root [`AGENTS.md`](../AGENTS.md).

| Guide | Read when |
|---|---|
| [Architecture](architecture.md) | You need to understand folders, dependency direction, services, repositories, and database access. |
| [Domain and database](domain-and-database.md) | You are adding or changing users, companies, jobs, articles, ratings, follows, saves, or content. |
| [Routing and API](routing-and-api.md) | You are creating a page, route handler, protected route, login flow, or HTTP operation. |
| [UI and localization](ui-and-localization.md) | You are building forms, client interactions, navigation, CSS, or translated text. |
| [Feature workflow](feature-workflow.md) | You need a repeatable sequence for implementing a complete feature. |
| [Conventions and quality](conventions-and-quality.md) | You need formatting, TypeScript, SQL, error-handling, and verification rules. |
| [Observed inconsistencies](observed-inconsistencies.md) | You want to avoid known defects or distinguish legacy behavior from intended conventions. |

## Scope and evidence

The guides were written by inspecting the uploaded project source, package/configuration files, representative pages, route handlers, components, service factories, and SQL repositories. The database guide also incorporates the PostgreSQL DDL supplied with the project description in the conversation; that DDL is not a migration file in this repository.

These documents describe what is present, not a guarantee that every dependency or runtime behavior has been tested. When code and documentation disagree, inspect the implementation and update the relevant guide with the code change.
