import { DB } from "onecore"
import { SearchRepository } from "sql-core"
import { buildQuery, Job, JobFilter, jobModel } from "../shared/job"
import { JobRepository } from "./job"

export class SqlJobRepository extends SearchRepository<Job, JobFilter> implements JobRepository {
  constructor(db: DB) {
    super(db, "jobs", jobModel, buildQuery)
  }
  async load(slug: string, userId?: string): Promise<Job | null> {
    const params: any[] = [slug]
    let query = `
      select j.*,
        c.name as company_name, c.logo
      from jobs j
      left join companies c on j.company_id = c.id where slug = ${this.db.param(1)}`
    if (userId) {
      query = `
      select j.*, sj.saved_at,
        c.name as company_name, c.logo
      from jobs j
        left join companies c on j.company_id = c.id
        left join saved_jobs sj on sj.id = j.id and sj.user_id = ${this.db.param(2)} where j.slug = ${this.db.param(1)}`
      params.push(userId)
    }
    const jobs = await this.db.query<Job>(query, params, this.map)
    return jobs && jobs.length > 0 ? jobs[0] : null
  }
}
