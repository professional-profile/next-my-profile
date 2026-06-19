import { db } from "@lib/db"
import { SqlFollowRepository } from "follow-service"
import { SqlArticleRepository } from "./article"
import { CompanyService } from "./company"
import { SqlCompanyRepository } from "./repository"
import { CompanyUseCase } from "./service"
import { SqlUserRepository } from "./user"
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
    const userRepository = new SqlUserRepository(db)
    service = new CompanyUseCase(repository, followRepository, articleRepository, userRepository)
  }
  return service
}
