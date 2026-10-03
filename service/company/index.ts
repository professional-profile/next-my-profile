import { db } from "@lib/db"
import { SqlFollowRepository } from "follow-service"
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
    const articleRepository = new SqlArticleRepository(db)
    const jobRepository = new SqlJobRepository(db)
    const userRepository = new SqlUserRepository(db)
    const rateSummaryRepository = new SqlRateSummaryRepository(db)
    const ratesRepository = createSearchRateRepository(db, "company_rates", "company_rate_reactions")
    service = new CompanyUseCase(repository, articleRepository, jobRepository, userRepository, followRepository, rateSummaryRepository, ratesRepository)
  }
  return service
}
