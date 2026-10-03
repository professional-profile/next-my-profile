import { SearchResult } from "onecore"
import { Job, JobFilter } from "../shared/job"

export interface JobRepository {
  search(filter: JobFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Job>>
  load(slug: string, userId?: string): Promise<Job | null>
}
export interface JobService {
  search(filter: JobFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Job>>
  load(slug: string, userId?: string): Promise<Job | null>
  save(userId: string, id: string): Promise<number>
  remove(userId: string, id: string): Promise<number>
}
