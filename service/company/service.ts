import { FollowService } from "follow-service"
import { FollowRepository, SearchResult } from "onecore"
import { Article } from "../shared/article"
import { Company } from "../shared/company"
import { Job, JobFilter } from "../shared/job"
import { RateSummary, RateSummaryRepository, zeroSummary } from "../shared/rate"
import { Rate, RateFilter, RatesRepository } from "../shared/rates"
import { User } from "../shared/user"
import { ArticleFilter, ArticleRepository, CompanyFilter, CompanyRepository, CompanyService, JobRepository, UserFilter, UserRepository } from "./company"

export class CompanyUseCase extends FollowService<string> implements CompanyService {
  constructor(private repository: CompanyRepository, protected articleRepository: ArticleRepository, protected jobRepository: JobRepository, protected userRepository: UserRepository, protected followRepository: FollowRepository<string>, protected rateSummaryRepository: RateSummaryRepository, protected ratesRepository: RatesRepository) {
    super(followRepository)
  }
  search(filter: CompanyFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Company>> {
    return this.repository.search(filter, limit, page, fields)
  }
  load(slug: string, userId?: string): Promise<Company | null> {
    return this.repository.load(slug, userId)
  }
  getIdBySlug(slug: string): Promise<string> {
    return this.repository.getIdBySlug(slug)
  }
  getArticles(filter: ArticleFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Article>> {
    return this.articleRepository.search(filter, limit, page, fields)
  }
  getJobs(filter: JobFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Job>> {
    return this.jobRepository.search(filter, limit, page, fields)
  }
  getFollowers(filter: UserFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<User>> {
    return this.userRepository.search(filter, limit, page, fields)
  }
  async getRateSummary(id: string): Promise<RateSummary> {
    let rateSummary = await this.rateSummaryRepository.load(id)
    return (rateSummary ? rateSummary : { ...zeroSummary, id })
  }
  searchRates(filter: RateFilter, limit: number, page?: number | string, fields?: string[]): Promise<SearchResult<Rate>> {
    return this.ratesRepository.search(filter, limit, page, fields)
  }
}
