import { db } from "@lib/db"
import { Article } from "@service/shared/article"
import { Company } from "@service/shared/company"
import { FollowService, FollowUserRepository } from "follow-service"
import { FollowRepository, SearchResult } from "onecore"
import { ArticleFilter, ArticleRepository, SqlArticleRepository } from "./article"
import { CompanyFilter, CompanyRepository, SqlCompanyRepository } from "./company"
import { SqlUserRepository } from "./repository"
import { User, UserFilter, UserRepository, UserService } from "./user"
export * from "./user"

export class UserUseCase extends FollowService<string> implements UserService {
  constructor(protected repository: UserRepository, protected followRepository: FollowRepository<string>, protected articleRepository: ArticleRepository, protected companyRepository: CompanyRepository) {
    super(followRepository)
  }
  search(filter: UserFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<User>> {
    return this.repository.search(filter, limit, page, fields)
  }
  load(slug: string, userId?: string): Promise<User | null> {
    return this.repository.load(slug, userId)
  }
  getIdBySlug(slug: string): Promise<string> {
    return this.repository.getIdBySlug(slug)
  }
  getArticles(filter: ArticleFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Article>> {
    return this.articleRepository.search(filter, limit, page, fields)
  }
  getCompanies(filter: CompanyFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Company>> {
    return this.companyRepository.search(filter, limit, page, fields)
  }
}

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
