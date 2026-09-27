import { Attributes, Filter, Statement, TimeRange } from "onecore"
import { param } from "postgres-kit"
import { buildSort } from "sql-core"

export interface Job {
  id: string
  slug: string
  title: string
  description: string
  publishedAt?: Date
  expiredAt?: Date
  position?: string
  quantity?: number
  location?: string
  applicantCount?: number
  skills?: string[]
  minSalary?: number
  maxSalary?: number
  companyId?: string
  companyName?: string
  status: string
}
export interface JobFilter extends Filter {
  id?: string
  slug?: string
  title?: string
  description?: string
  publishedAt?: TimeRange
  expiredAt?: TimeRange
  skills?: string[]
  location?: string
  quantity?: number
  applicantCount?: number
  companyId?: string
  status?: string
}

export const jobModel: Attributes = {
  id: {
    length: 40,
    required: true,
    key: true,
  },
  slug: {
    length: 150,
  },
  title: {
    length: 300,
    q: true,
  },
  description: {
    length: 9800,
  },
  publishedAt: {
    column: "published_at",
    type: "datetime",
  },
  expiredAt: {
    column: "expired_at",
    type: "datetime",
  },
  position: {
    length: 100,
  },
  quantity: {
    type: "integer",
    min: 1,
  },
  location: {
    length: 120,
  },
  applicantCount: {
    column: "applicant_count",
    type: "integer",
  },
  skills: {
    type: "strings",
  },
  minSalary: {
    column: "min_salary",
    type: "integer",
  },
  maxSalary: {
    column: "max_salary",
    type: "integer",
  },
  companyId: {
    column: "company_id",
  },
  companyName: {
    column: "company_name",
  },
  status: {},
}

export function buildQuery(filter: JobFilter): Statement {
  let query = `select * from jobs`
  const where: string[] = []
  const params = []
  let i = 1

  /*
  if (filter.companyId) {
    where.push(`company_id = ${param(i++)}`)
    params.push(filter.companyId)
  }
    */
  if (filter.status) {
    where.push(`status = ${param(i++)}`)
    params.push(filter.status)
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

  if (filter.skills && filter.skills.length > 0) {
    params.push(filter.skills)
    where.push(`skills && ${param(i++)}`)
  }

  if (filter.q) {
    const q = filter.q.replace(/%/g, "\\%").replace(/_/g, "\\_")
    where.push(`title ilike ${param(i++)}`)
    params.push(`%${q}%`)
  }

  if (where.length > 0) {
    query = query + ` where ` + where.join(` and `)
  }
  const orderBy = buildSort(filter.sort, jobModel)
  if (orderBy) {
    query = query + ` order by ${orderBy}`
  }
  return { query, params }
}
