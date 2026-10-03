import { DB } from "onecore"
import { param } from "postgres-kit"
import { buildSort, Repository, Statement } from "sql-core"
import { Article, ArticleFilter, articleModel, ArticleRepository } from "./article"

export class SqlArticleRepository extends Repository<Article, string, ArticleFilter> implements ArticleRepository {
  constructor(db: DB) {
    super(db, "articles", articleModel, buildQuery)
  }
}

export function buildQuery(filter: ArticleFilter): Statement {
  let query = `select * from articles `
  const where: string[] = []
  const params = []
  let i = 1

  if (filter.authorId) {
    params.push(filter.authorId)
    where.push(`author_id = ${param(i++)}`)
  }

  if (filter.tags && filter.tags.length > 0) {
    params.push(filter.tags)
    where.push(`tags && ${param(i++)}`)
  }

  if (filter.publishedAt) {
    if (filter.publishedAt.min) {
      where.push(`published_at >= ${param(i++)}`)
      params.push(filter.publishedAt.min)
    }
    if (filter.publishedAt.max) {
      where.push(`published_at <= ${param(i++)}`)
      params.push(filter.publishedAt.max)
    }
  }

  if (filter.status && filter.status.length > 0) {
    const arr: string[] = []
    for (const status of filter.status) {
      params.push(status)
      arr.push(`${param(i++)}`)
    }
    where.push(`status in (${arr.join(",")})`)
  }

  if (filter.q) {
    const q = filter.q.replace(/%/g, "\\%").replace(/_/g, "\\_")
    where.push(`(title ilike ${param(i++)} or description ilike ${param(i++)})`)
    params.push(`%${q}%`, `%${q}%`)
  }

  if (where.length > 0) {
    query = query + ` where ` + where.join(` and `)
  }
  const orderBy = buildSort(filter.sort, articleModel)
  if (orderBy) {
    query = query + ` order by ${orderBy}`
  }
  return { query, params }
}
