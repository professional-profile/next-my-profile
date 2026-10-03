import { Attributes, DB, Filter, SearchResult, Statement } from "onecore"
import { param } from "postgres-kit"
import { buildSort, SearchRepository } from "sql-core"

export interface Rate {
  rateId: string
  id: string
  author: string
  //authorURL?: string
  displayName: string
  rate: number
  time: Date
  review: string
  usefulCount: number
  replyCount: number
  reaction: number
  anonymous: boolean
}
export interface RateFilter extends Filter {
  id: string
  rate?: number
  sort?: string
  userId?: string
}

export const rateModel: Attributes = {
  rateId: {
    column: "rate_id",
    key: true,
    required: true,
  },
  id: {
    required: true,
    operator: "=",
  },
  author: {
    required: true,
    operator: "=",
  },
  rate: {
    type: "number",
  },
  time: {
    type: "datetime",
  },
  review: {
    q: true,
  },
  usefulCount: {
    column: "useful_count",
    type: "integer",
  },
  replyCount: {
    column: "reply_count",
    type: "integer",
  },
  anonymous: {
    type: "boolean",
  },
  displayName: {
    column: "display_name",
  },
}

export interface RatesRepository {
  search(filter: RateFilter, limit: number, page?: number | string, fields?: string[]): Promise<SearchResult<Rate>>
}

export class SearchRateRepository extends SearchRepository<Rate, RateFilter> implements RatesRepository {
  constructor(db: DB, buildQuery: (filter: RateFilter) => Statement) {
    super(db, "article_rates", rateModel, buildQuery)
  }
}

export class RateQueryBuilder {
  constructor(
    protected rateTable: string,
    protected reactionTable: string,
  ) {
    this.build = this.build.bind(this)
  }
  build(filter: RateFilter): Statement {
    let query: string
    const where: string[] = []
    const params = []
    let i = 1
    if (filter.userId) {
      query = `select r.*, rr.reaction, u.display_name
      from ${this.rateTable} r 
      inner join users u
        on r.author = u.id
      left join ${this.reactionTable} rr 
        on r.rate_id = rr.rate_id and rr.user_id = ${param(i++)}`
      params.push(filter.userId)
    } else {
      query = `select r.*, u.display_name from ${this.rateTable} r inner join users u on r.author = u.id`
    }

    if (filter.id) {
      params.push(filter.id)
      where.push(`r.id = ${param(i++)}`)
    }
    if (filter.rate) {
      params.push(filter.rate)
      where.push(`r.rate = ${param(i++)}`)
    }

    if (where.length > 0) {
      query = query + ` where ` + where.join(` and `)
    }
    const orderBy = buildSort(filter.sort, rateModel)
    if (orderBy) {
      query = query + ` order by ${orderBy}`
    }
    return { query, params }
  }
}

export function createSearchRateRepository(db: DB, rateTable: string, reactionTable: string): SearchRateRepository {
  const builder = new RateQueryBuilder(rateTable, reactionTable)
  return new SearchRateRepository(db, builder.build)
}
