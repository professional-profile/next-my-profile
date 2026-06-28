import { FollowService } from "follow-service"
import { FollowRepository, SearchResult } from "onecore"
import { Article } from "../shared/article"
import { User } from "../shared/user"
import { ArticleFilter, ArticleRepository } from "./article"
import { Company, CompanyFilter, CompanyRepository, CompanyService } from "./company"
import { UserFilter, UserRepository } from "./user"

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
    return this.userRepository.search(filter, limit, page, fields)
  }
}
