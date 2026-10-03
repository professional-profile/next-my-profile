import { DB, Filter, SearchResult, Statement } from "onecore"
import { param } from "postgres-kit"
import { buildSort, SearchRepository } from "sql-core"
import { User, userModel } from "../shared/user"

export interface UserFilter extends Filter {
  companyId?: string
  userId?: string
}
export interface UserRepository {
  search(filter: UserFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<User>>
}

export class SqlUserRepository extends SearchRepository<User, UserFilter> implements UserRepository {
  constructor(db: DB) {
    super(db, "users", userModel, buildFollowerQuery)
  }
}

export function buildFollowerQuery(filter: UserFilter): Statement {
  const where: string[] = []
  const params = []
  let i = 1
  let query: string
  if (filter.userId) {
    query = `
      select u.id, u.username, u.email, u.image_url, u.display_name, u.occupation, u.headline,
        ui.follower_count, ui.following_count, cf.followed_at, ur.followed_at as user_followed_at
      from company_followers cf 
        inner join users u on cf.id = ${param(i++)} and cf.follower = u.id
        left join user_info ui on u.id = ui.id
        left join user_followers ur on ur.id = u.id and ur.follower = ${param(i++)} `
    params.push(filter.companyId, filter.userId)
  } else {
    query = `
      select u.id, u.username, u.email, u.image_url, u.display_name, u.occupation, u.headline, cf.followed_at
      from company_followers cf
        inner join users u on cf.id = ${param(i++)} and cf.follower = u.id
        left join user_info ui on u.id = ui.id `
    params.push(filter.companyId)
  }

  if (filter.q) {
    const q = filter.q.replace(/%/g, "\\%").replace(/_/g, "\\_")
    where.push(`(username ilike ${param(i++)} or display_name ilike ${param(i++)})`)
    params.push(`%${q}%`, `%${q}%`)
  }

  if (where.length > 0) {
    query = query + ` where ` + where.join(" and ")
  }
  const orderBy = buildSort(filter.sort, userModel)
  if (orderBy) {
    query = query + ` order by ${orderBy}`
  }
  return { query, params }
}
