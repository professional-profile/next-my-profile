import { Content, ContentRepository, ContentService } from "./content"

export class ContentUseCase implements ContentService {
  constructor(protected repository: ContentRepository) {}
  async load(id: string, lang: string): Promise<Content | null> {
    const content = await this.repository.load(id, lang)
    if (!content) {
      return this.repository.load(id, "en")
    }
    return content
  }
}
