import { db } from "@lib/db"
import { ArticleService } from "./article"
import { SqlArticleRepository } from "./repository"
import { ArticleUseCase } from "./service"
export * from "./article"

let service: ArticleService | undefined
export function getMyArticlesService(): ArticleService {
  if (!service) {
    const repository = new SqlArticleRepository(db)
    service = new ArticleUseCase(repository)
  }
  return service
}
