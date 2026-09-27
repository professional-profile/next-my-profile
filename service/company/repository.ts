import { DB, Statement } from "onecore"
import { param } from "postgres-kit"
import { buildSort, SearchRepository } from "sql-core"
import { Company, CompanyFilter, companyModel, CompanyRepository } from "./company"

export class SqlCompanyRepository extends SearchRepository<Company, CompanyFilter> implements CompanyRepository {
  constructor(db: DB) {
    super(db, "companies", companyModel, buildQuery)
  }
  async getIdBySlug(slug: string): Promise<string> {
    const query = `select c.id from companies c where c.slug = ${this.db.param(1)}`
    const articles = await this.db.query<Company>(query, [slug], this.map)
    return (articles && articles.length > 0 ? articles[0].id : slug)
  }
  async load(slug: string, userId?: string): Promise<Company | null> {
    let params = []
    let query: string
    if (userId) {
      query = `select c.*, ci.follower_count, cr.followed_at
        from companies c
        left join company_info ci on c.id = ci.id
        left join company_followers cr on cr.id = c.id and cr.follower = ${this.db.param(1)}
        where c.slug = ${this.db.param(2)}`
      params.push(userId, slug)
    } else {
      query = `select c.*, ci.follower_count
        from companies c
        left join company_info ci on c.id = ci.id
        where c.slug = ${this.db.param(1)}`
      params.push(slug)
    }
    let companies = await this.db.query<Company>(query, params, this.map)
    if (companies && companies.length > 0) {
      return companies[0]
    }

    params = []
    if (userId) {
      query = `select c.*, ci.follower_count, cr.followed_at
        from companies c
        left join company_info ci on c.id = ci.id
        left join company_followers cr on cr.id = c.id and cr.follower = ${this.db.param(1)}
        where c.id = ${this.db.param(2)}`
      params.push(userId, slug)
    } else {
      query = `select c.*, ci.follower_count
        from companies c
        left join company_info ci on c.id = ci.id
        where c.id = ${this.db.param(1)}`
      params.push(slug)
    }
    companies = await this.db.query<Company>(query, [slug], this.map)
    return companies && companies.length > 0 ? companies[0] : null
  }
}

export function buildQuery(filter: CompanyFilter): Statement {
  let query = `select * from companies`
  const where: string[] = []
  const params = []
  let i = 1

  if (filter.userId) {
    query = `
      select c.id, c.slug, c.name, c.website, c.industry, c.size, c.logo, c.cover_url,
        ci.follower_count, cr.followed_at
      from companies c
      left join company_info ci on c.id = ci.id
      left join company_followers cr on cr.id = c.id and cr.follower = ${param(i++)} `
    params.push(filter.userId)
  } else {
    query = `select c.id, c.slug, c.name, c.website, c.industry, c.size, c.logo, c.cover_url from companies c
      left join company_info ci on c.id = ci.id`
  }

  if (filter.q) {
    const q = filter.q.replace(/%/g, "\\%").replace(/_/g, "\\_")
    where.push(`name ilike ${param(i++)}`)
    params.push(`%${q}%`)
  }

  if (where.length > 0) {
    query = query + ` where ` + where.join(` and `)
  }
  const orderBy = buildSort(filter.sort, companyModel)
  if (orderBy) {
    query = query + ` order by ${orderBy}`
  }
  return { query, params }
}
