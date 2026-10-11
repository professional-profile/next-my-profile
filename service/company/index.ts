import { db } from "@lib/db"
import { SqlFollowRepository } from "follow-service"
import { nanoid } from "nanoid"
import { buildToSave } from "postgres-kit"
import { Rate, Rater, RateService, SqlRateRepository } from "rate-service"
import { SqlUsefulRepository } from "rate-sql"
import { buildToInsert, buildToUpdate } from "sql-core"
import { rateModel, rateReactionModel } from "../shared/rate"
import { createSearchRateRepository } from "../shared/rates"
import { SqlArticleRepository } from "./article-repository"
import { CompanyService } from "./company"
import { SqlJobRepository } from "./job-repository"
import { SqlCompanyRepository, SqlRateSummaryRepository } from "./repository"
import { CompanyUseCase } from "./service"
import { SqlUserRepository } from "./user-repository"
export * from "./company"

let service: CompanyService | undefined
export function getCompanyService(): CompanyService {
  if (!service) {
    const followRepository = new SqlFollowRepository<string>(
      db.executeBatch,
      "company_followers",
      "id",
      "follower",
      "followed_at",
      "company_following",
      "id",
      "following",
      "following_at",
      "company_info",
      "id",
      "follower_count",
    )
    const repository = new SqlCompanyRepository(db)
    const companyRepository = new SqlArticleRepository(db)
    const jobRepository = new SqlJobRepository(db)
    const userRepository = new SqlUserRepository(db)
    const rateSummaryRepository = new SqlRateSummaryRepository(db)
    const ratesRepository = createSearchRateRepository(db, "company_rates", "company_rate_reactions")
    service = new CompanyUseCase(repository, companyRepository, jobRepository, userRepository, followRepository, rateSummaryRepository, ratesRepository)
  }
  return service
}

let rateService: RateService | undefined
export function getRateService(): RateService {
  if (!rateService) {
    const rateSummaryRepository = new SqlRateSummaryRepository(db)
    const rateRepository = new SqlRateRepository<Rate>(
      db,
      "company_rates",
      rateModel,
      5,
      "company_info",
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
    const usefulRepository = new SqlUsefulRepository(db, "company_rate_reactions", rateReactionModel, buildToSave, "company_rates", "rate_id", "useful_count")
    rateService = new Rater(db, rateRepository, rateSummaryRepository, usefulRepository)
  }
  return rateService
}
function generateId(): string {
  return nanoid(10)
}
