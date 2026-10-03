import { Filter, SearchResult, TimeRange } from "onecore"
import { Article } from "../shared/article"
import { Company } from "../shared/company"
import { Job, JobFilter } from "../shared/job"
import { RateSummary } from "../shared/rate"
import { Rate, RateFilter } from "../shared/rates"
import { User } from "../shared/user"

export interface CompanyFilter extends Filter {
  name?: string
  status?: string
  userId?: string
}
export interface ArticleFilter extends Filter {
  status?: string
  publishedAt: TimeRange
  tags?: string[]
  authorId?: string

  companyId?: string
  userId?: string
}
export interface UserFilter extends Filter {
  companyId?: string
  userId?: string
}

export interface CompanyService {
  search(filter: CompanyFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Company>>
  load(slug: string, userId?: string): Promise<Company | null>
  getIdBySlug(slug: string): Promise<string>
  getArticles(filter: ArticleFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Article>>
  getJobs(filter: JobFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Job>>
  follow(id: string, companyId: string): Promise<number>
  unfollow(id: string, companyId: string): Promise<number>
  getFollowers(filter: UserFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<User>>
  getRateSummary(id: string): Promise<RateSummary>
  searchRates(filter: RateFilter, limit: number, page?: number | string, fields?: string[]): Promise<SearchResult<Rate>>
}

export interface CompanyRepository {
  search(filter: CompanyFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Company>>
  load(slug: string, userId?: string): Promise<Company | null>
  getIdBySlug(slug: string): Promise<string>
}
export interface ArticleRepository {
  search(filter: ArticleFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Article>>
}
export interface JobRepository {
  search(filter: JobFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Job>>
}
export interface UserRepository {
  search(filter: UserFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<User>>
}
