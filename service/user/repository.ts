import { DB, Statement } from "onecore"
import { param } from "postgres-kit"
import { buildSort, SearchRepository } from "sql-core"
import { User, UserFilter, userModel, UserRepository } from "./user"

export class SqlUserRepository extends SearchRepository<User, UserFilter> implements UserRepository {
  constructor(db: DB) {
    super(db, "users", userModel, buildQuery)
  }

  async load(slug: string, userId?: string): Promise<User | null> {
    let params = []
    let query: string

    if (userId) {
      query = `select u.*, ui.follower_count, ui.following_count, ur.followed_at
        from users u
        left join user_info ui on u.id = ui.id
        left join user_followers ur on ur.id = u.id and ur.follower = ${this.db.param(1)}
        where u.username = ${this.db.param(2)}`
      params.push(userId, slug)
    } else {
      query = `select u.*, ui.follower_count, ui.following_count
        from users u
        left join user_info ui on u.id = ui.id
        where u.username = ${this.db.param(1)}`
      params.push(slug)
    }

    let users = await this.db.query<User>(query, params, this.map)
    if (users && users.length > 0) {
      return users[0]
    }

    params = []
    query = `select * from users where id = ${this.db.param(1)}`
    if (userId) {
      query = `select u.*, ui.follower_count, ui.following_count, ur.followed_at
        from users u
        left join user_info ui on u.id = ui.id
        left join user_followers ur on ur.id = u.id and ur.follower = ${this.db.param(1)} 
        where u.id = ${this.db.param(2)}`
      params.push(userId, slug)
    } else {
      query = `select u.*, ui.follower_count, ui.following_count
        from users u
        left join user_info ui on u.id = ui.id
        where u.id = ${this.db.param(1)}`
      params.push(slug)
    }

    users = await this.db.query<User>(query, [slug], this.map)
    return users && users.length > 0 ? users[0] : null
  }

  async getIdBySlug(slug: string): Promise<string> {
    const query = `select u.id from users u where u.username = ${this.db.param(1)}`
    const users = await this.db.query<User>(query, [slug], this.map)
    return (users && users.length > 0 ? users[0].id : slug)
  }
}

export function buildQuery(filter: UserFilter): Statement {
  const where: string[] = []
  const params = []
  let i = 1
  let query: string
  let sub = ""
  if (filter.followingUserId) {
    sub = ` inner join user_following ufm on ufm.id = ${param(i++)} and ufm.following = u.id `
    params.push(filter.followingUserId)
  } else if (filter.followedUserId) {
    sub = ` inner join user_followers urm on urm.id = ${param(i++)} and urm.follower = u.id `
    params.push(filter.followedUserId)
  }
  if (filter.userId) {
    query = `select u.id, u.username, u.email, u.image_url, u.display_name, u.occupation, u.headline,
        ui.follower_count, ui.following_count, ur.followed_at
      from users u ${sub}
      left join user_info ui on u.id = ui.id
      left join user_followers ur on ur.id = u.id and ur.follower = ${param(i++)} `
    params.push(filter.userId)
  } else {
    query = `select u.id, u.username, u.email, u.image_url, u.display_name, u.occupation, u.headline from users u ${sub} `
  }

  if (filter.id) {
    where.push(`id = ${param(i++)}`)
    params.push(filter.id)
  }
  if (filter.interests && filter.interests.length > 0) {
    params.push(filter.interests)
    where.push(`interests && ${param(i++)}`)
  }
  if (filter.skills && filter.skills.length > 0) {
    const skills = []
    for (const skill of filter.skills) {
      skills.push(`${param(i++)} <@ ANY(skills)`)
      params.push(skill)
    }
    where.push(`(${skills.join(" or ")})`)
  }
  if (filter.dateOfBirth) {
    if (filter.dateOfBirth.min) {
      where.push(`date_of_birth >= ${param(i++)}`)
      params.push(filter.dateOfBirth.min)
    }
    if (filter.dateOfBirth.max) {
      where.push(`date_of_birth <= ${param(i++)}`)
      params.push(filter.dateOfBirth.max)
    }
  }

  if (filter.email) {
    where.push(`email ilike ${param(i++)}`)
    params.push(`${filter.email}%`)
  }
  if (filter.username) {
    where.push(`username ilike ${param(i++)}`)
    params.push(`%${filter.username}%`)
  }
  if (filter.phone) {
    where.push(`phone ilike ${param(i++)}`)
    params.push(`%${filter.phone}%`)
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
