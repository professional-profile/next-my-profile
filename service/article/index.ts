import { db } from "@lib/db"
import { nanoid } from "nanoid"
import { buildToSave } from "postgres-kit"
import { Rate, Rater, RateService, SqlRateRepository } from "rate-service"
import { SqlUsefulRepository } from "rate-sql"
import { SqlSavedRepository } from "saved-service"
import { buildToInsert, buildToUpdate } from "sql-core"
import { rateModel, rateReactionModel } from "../shared/rate"
import { createSearchRateRepository } from "../shared/rates"
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
    const ratesRepository = createSearchRateRepository(db, "article_rates", "article_rate_reactions")
    service = new ArticleUseCase(repository, savedRepository, 200, rateSummaryRepository, ratesRepository)
  }
  return service
}

let rateService: RateService | undefined
export function getRateService(): RateService {
  if (!rateService) {
    const rateSummaryRepository = new SqlRateSummaryRepository(db)
    const rateRepository = new SqlRateRepository<Rate>(
      db,
      "article_rates",
      rateModel,
      5,
      "article_info",
      buildToInsert,
      buildToUpdate,
      generateId,
      "rateId",
      "rate",
      "count",
      "score",
      "author",
      "id",
    )
    const usefulRepository = new SqlUsefulRepository(db, "article_rate_reactions", rateReactionModel, buildToSave, "article_rates", "rate_id", "useful_count")
    rateService = new Rater(db, rateRepository, rateSummaryRepository, usefulRepository)
  }
  return rateService
}
function generateId(): string {
  return nanoid(10)
}
