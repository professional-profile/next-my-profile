import { DB, Filter, SearchResult, Statement, TimeRange } from "onecore"
import { param } from "pg-extension"
import { buildSort, SearchRepository } from "sql-core"
import { Article, articleModel } from "../shared/article"

export interface ArticleFilter extends Filter {
  publishedAt: TimeRange
  tags?: string[]
  status?: string
  authorId?: string
  companyId?: string
  userId?: string
}
export interface ArticleRepository {
  search(filter: ArticleFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Article>>
}

export class SqlArticleRepository extends SearchRepository<Article, ArticleFilter> implements ArticleRepository {
  constructor(db: DB) {
    super(db, "articles", articleModel, buildArticleQuery)
  }
}
export function buildArticleQuery(filter: ArticleFilter): Statement {
  const where: string[] = []
  const params = []
  let i = 1
  let query: string
  if (filter.userId) {
    query = `select a.id, a.thumbnail, a.slug, a.title, a.description, a.published_at, sa.saved_at 
      from articles a 
      left join saved_articles sa 
      on sa.id = a.id and sa.user_id = ${param(i++)}`
    params.push(filter.userId)
  } else {
    query = `select a.id, a.thumbnail, a.slug, a.title, a.description, a.published_at from articles a`
  }

  if (filter.companyId) {
    params.push(filter.companyId)
    where.push(`company_id = ${param(i++)}`)
  }
  if (filter.authorId) {
    params.push(filter.authorId)
    where.push(`author_id = ${param(i++)}`)
  }
  if (filter.status) {
    params.push(filter.status)
    where.push(`status = ${param(i++)}`)
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
