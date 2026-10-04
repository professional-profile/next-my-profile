import { DB } from "onecore"
import { ArticleService } from "./article"
import { SqlArticleRepository } from "./repository"
import { ArticleUseCase } from "./service"

let service: ArticleService | undefined
export function getMyArticlesService(db: DB): ArticleService {
  if (!service) {
    const repository = new SqlArticleRepository(db)
    service = new ArticleUseCase(repository)
  }
  return service
}
