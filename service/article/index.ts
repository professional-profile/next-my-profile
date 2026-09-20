import { db } from "@lib/db"
import { SearchRateRepository } from "@service/shared/rates"
import { SqlSavedRepository } from "saved-service"
import { ArticleService } from "./article"
import { SqlArticleRepository, SqlRateSummaryRepository } from "./repository"
import { ArticleUseCase } from "./service"
export * from "./article"

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
