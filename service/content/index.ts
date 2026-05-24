import { db } from "@lib/db"
import { Content, ContentRepository, ContentService } from "./content"
import { SqlContentRepository } from "./repository"
export * from "./content"

export class ContentUseCase implements ContentService {
  constructor(protected repository: ContentRepository) { }
  async load(id: string, lang: string): Promise<Content | null> {
    const content = await this.repository.load(id, lang)
    if (!content) {
      return this.repository.load(id, "en")
    }
    return content
  }
}

let contentService: ContentService | undefined
export function getContentService(): ContentService {
  if (!contentService) {
    const repository = new SqlContentRepository(db)
    contentService = new ContentUseCase(repository)
  }
  return contentService
}
