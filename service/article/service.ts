import { SavedRepository, SearchResult } from "onecore"
import { SavedService } from "saved-service"
import { RateSummary, RateSummaryRepository, zeroSummary } from "../shared/rate"
import { Rate, RateFilter, RatesRepository } from "../shared/rates"
import { Article, ArticleFilter, ArticleRepository, ArticleService } from "./article"

export class ArticleUseCase extends SavedService<string, string> implements ArticleService {
  constructor(protected repository: ArticleRepository, protected savedRepository: SavedRepository<string, string>, protected max: number, protected rateSummaryRepository: RateSummaryRepository, protected ratesRepository: RatesRepository) {
    super(savedRepository, max)
  }
  search(filter: ArticleFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Article>> {
    return this.repository.search(filter, limit, page, fields)
  }
  load(slug: string, userId?: string): Promise<Article | null> {
    return this.repository.load(slug, userId)
  }
  getIdBySlug(slug: string): Promise<string> {
    return this.repository.getIdBySlug(slug)
  }
  async getRateSummary(id: string): Promise<RateSummary> {
    let rateSummary = await this.rateSummaryRepository.load(id)
    return (rateSummary ? rateSummary : { ...zeroSummary, id })
  }
  searchRates(filter: RateFilter, limit: number, page?: number | string, fields?: string[]): Promise<SearchResult<Rate>> {
    return this.ratesRepository.search(filter, limit, page, fields)
  }
}
