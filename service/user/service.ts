import { FollowService } from "follow-service"
import { FollowRepository, SearchResult } from "onecore"
import { Article } from "../shared/article"
import { Company } from "../shared/company"
import { ArticleFilter, ArticleRepository } from "./article"
import { CompanyFilter, CompanyRepository } from "./company"
import { User, UserFilter, UserRepository, UserService } from "./user"

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
