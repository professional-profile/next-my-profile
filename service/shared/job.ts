import { Attributes, Filter, Statement, TimeRange } from "onecore"
import { param } from "postgres-kit"
import { buildSort } from "sql-core"

export const Published = "P"

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
  userId?: string
  isSaved?: boolean
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
  status: {},

  savedAt: {
    column: "saved_at",
    type: "datetime",
    noupdate: true,
    noinsert: true,
  },
  companyName: {
    column: "company_name",
    noupdate: true,
    noinsert: true,
  },
  logo: {
    noupdate: true,
    noinsert: true,
  },
}

export function buildQuery(filter: JobFilter): Statement {
  const where: string[] = []
  const params = []
  let i = 1

  let query = `
        select j.id, j.slug, j.title, j.published_at, j.expired_at,
          j.position, j.quantity, j.location, j.applicant_count,
          c.name as company_name, c.logo
        from jobs j
          left join companies c on j.company_id = c.id`
  if (filter.userId) {
    if (filter.isSaved) {
      query = `
        select j.id, j.slug, j.title, j.published_at, j.expired_at,
          j.position, j.quantity, j.location, j.applicant_count, sj.saved_at,
          c.name as company_name, c.logo
        from saved_jobs sj
          inner join jobs j on sj.user_id = ${param(i++)} and sj.id = j.id
          left join companies c on j.company_id = c.id `
    } else {
      query = `
        select j.id, j.slug, j.title, j.published_at, j.expired_at,
          j.position, j.quantity, j.location, j.applicant_count, sj.saved_at,
          c.name as company_name, c.logo
        from jobs j
          left join companies c on j.company_id = c.id
          left join saved_jobs sj on sj.id = j.id and sj.user_id = ${param(i++)} `
    }
    params.push(filter.userId)
  }

  if (filter.companyId) {
    where.push(`company_id = ${param(i++)}`)
    params.push(filter.companyId)
  }
  if (filter.status) {
    where.push(`j.status = ${param(i++)}`)
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
