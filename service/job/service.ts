import { SavedRepository, SearchResult } from "onecore"
import { SavedService } from "saved-service"
import { Job, JobFilter } from "../shared/job"
import { JobRepository, JobService } from "./job"

export class JobUseCase extends SavedService<string, string> implements JobService {
  constructor(protected repository: JobRepository, protected savedRepository: SavedRepository<string, string>, protected max: number) {
    super(savedRepository, max)
  }
  search(filter: JobFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Job>> {
    return this.repository.search(filter, limit, page, fields)
  }
  load(slug: string, userId?: string): Promise<Job | null> {
    return this.repository.load(slug, userId)
  }
}
