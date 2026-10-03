
import { DB } from "onecore"
import { SearchRepository } from "sql-core"
import { buildQuery, Job, JobFilter, jobModel } from "../shared/job"
import { JobRepository } from "./company"

export class SqlJobRepository extends SearchRepository<Job, JobFilter> implements JobRepository {
  constructor(db: DB) {
    super(db, "jobs", jobModel, buildQuery)
  }
}
