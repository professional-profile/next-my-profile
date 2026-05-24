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

let service: ContentService | undefined
export function getContentService(): ContentService {
  if (!service) {
    const repository = new SqlContentRepository(db)
    service = new ContentUseCase(repository)
  }
  return service
}
