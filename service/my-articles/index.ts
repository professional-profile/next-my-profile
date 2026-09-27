import { DB } from "onecore"
import { ArticleService } from "./article"
import { SqlArticleRepository } from "./repository"
import { ArticleUseCase } from "./service"

export function useMyArticlesController(db: DB): ArticleService {
  const repository = new SqlArticleRepository(db)
  return new ArticleUseCase(repository)
}
