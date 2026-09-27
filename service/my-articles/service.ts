import { nanoid } from "nanoid"
import { SearchUseCase } from "onecore"
import { slugify } from "../common/slug"
import { Article, ArticleFilter, ArticleRepository, ArticleService, Draft } from "./article"

export class ArticleUseCase extends SearchUseCase<Article, ArticleFilter> implements ArticleService {
  constructor(protected repository: ArticleRepository) {
    super(repository)
  }
  load(id: string): Promise<Article | null> {
    return this.repository.load(id)
  }
  create(article: Article): Promise<number> {
    article.id = nanoid(10)
    article.slug = slugify(article.title, article.id)
    return this.repository.create(article)
  }
  async update(article: Article): Promise<number> {
    const existingArticle = await this.repository.load(article.id)
    if (!existingArticle) {
      return 0
    }
    if (existingArticle.status === Draft) {
      article.slug = slugify(article.title, article.id)
    }
    return this.repository.update(article)
  }
  async patch(article: Partial<Article>): Promise<number> {
    if (article.title) {
      const id = article.id as string
      const existingArticle = await this.repository.load(id)
      if (!existingArticle) {
        return 0
      }
      if (existingArticle.status === Draft) {
        article.slug = slugify(article.title, id)
      }
      return this.repository.patch(article)
    } else {
      delete article.slug
      return this.repository.patch(article)
    }
  }
  delete(id: string): Promise<number> {
    return this.repository.delete(id)
  }
}
