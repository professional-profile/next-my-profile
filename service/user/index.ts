import { db } from "@lib/db"
import { FollowUserRepository } from "follow-service"
import { SqlArticleRepository } from "./article"
import { SqlCompanyRepository } from "./company"
import { SqlUserRepository } from "./repository"
import { UserUseCase } from "./service"
import { UserService } from "./user"
export * from "./user"

let service: UserService | undefined
export function getUserService(): UserService {
  if (!service) {
    const followRepository = new FollowUserRepository<string>(
      db.executeBatch,
      "user_followers",
      "id",
      "follower",
      "followed_at",
      "user_following",
      "id",
      "following",
      "following_at",
      "user_info",
      "id",
      "follower_count",
      "following_count",
    )
    const repository = new SqlUserRepository(db)
    const articleRepository = new SqlArticleRepository(db)
    const companyRepository = new SqlCompanyRepository(db)
    service = new UserUseCase(repository, followRepository, articleRepository, companyRepository)
  }
  return service
}
