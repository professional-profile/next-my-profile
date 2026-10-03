
import { DB } from "onecore"
import { SearchRepository, SearchResult } from "sql-core"
import { buildQuery, Job, JobFilter, jobModel } from "../shared/job"

export interface JobRepository {
  search(filter: JobFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Job>>
}

export class SqlJobRepository extends SearchRepository<Job, JobFilter> implements JobRepository {
  constructor(db: DB) {
    super(db, "jobs", jobModel, buildQuery)
  }
}
