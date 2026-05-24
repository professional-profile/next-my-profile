import { db } from "@lib/db"
import { FollowService, SqlFollowRepository } from "follow-service"
import { FollowRepository, SearchResult } from "onecore"
import { Article } from "../shared/article"
import { User } from "../shared/user"
import { ArticleFilter, ArticleRepository, SqlArticleRepository } from "./article"
import { Company, CompanyFilter, CompanyRepository, CompanyService } from "./company"
import { SqlCompanyRepository } from "./repository"
import { SqlUserRepository, UserFilter, UserRepository } from "./user"

export class CompanyUseCase extends FollowService<string> implements CompanyService {
  constructor(private repository: CompanyRepository, protected followRepository: FollowRepository<string>, protected articleRepository: ArticleRepository, protected userRepository: UserRepository) {
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
  getFollowers(filter: UserFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<User>> {
    return this.userRepository.search(filter, limit, page, fields).then(res => {
      console.log(JSON.stringify(res.list))
      return res
    })
  }
}

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
