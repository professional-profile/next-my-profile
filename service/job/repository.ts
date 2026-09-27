import { DB } from "onecore"
import { SearchRepository } from "sql-core"
import { buildQuery, Job, JobFilter, jobModel } from "../shared/job"
import { JobRepository } from "./job"

export class SqlJobRepository extends SearchRepository<Job, JobFilter> implements JobRepository {
  constructor(db: DB) {
    super(db, "jobs", jobModel, buildQuery)
  }
  async load(slug: string): Promise<Job | null> {
    const query = `select * from jobs where slug = ${this.db.param(1)}`
    const jobs = await this.db.query<Job>(query, [slug], this.map)
    return jobs && jobs.length > 0 ? jobs[0] : null
  }
}
