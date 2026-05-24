import { db } from "@lib/db"
import { RateSummary, RateSummaryRepository, zeroSummary } from "@service/shared/rate"
import { RateFilter, RatesRepository, Rate as SearchRate, SearchRateRepository } from "@service/shared/rates"
import { SavedRepository, SearchResult } from "onecore"
import { SavedService, SqlSavedRepository } from "saved-service"
import { Article, ArticleFilter, ArticleRepository, ArticleService } from "./article"
import { SqlArticleRepository, SqlRateSummaryRepository } from "./repository"
export * from "./article"

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
  searchRates(filter: RateFilter, limit: number, page?: number | string, fields?: string[]): Promise<SearchResult<SearchRate>> {
    return this.ratesRepository.search(filter, limit, page, fields)
  }
}

let service: ArticleService | undefined
export function getArticleService(): ArticleService {
  if (!service) {
    const repository = new SqlArticleRepository(db)
    const savedRepository = new SqlSavedRepository(db, "saved_articles", "user_id", "id", "saved_at")
    const rateSummaryRepository = new SqlRateSummaryRepository(db)
    const ratesRepository = new SearchRateRepository(db)
    service = new ArticleUseCase(repository, savedRepository, 200, rateSummaryRepository, ratesRepository)
  }
  return service
}
