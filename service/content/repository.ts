import { DB } from "onecore"
import { Content, ContentRepository } from "./content"

export class SqlContentRepository implements ContentRepository {
  constructor(protected db: DB) { }
  async load(id: string, lang: string): Promise<Content | null> {
    const sql = `select id, lang, body from contents where id = ${this.db.param(1)} and lang = ${this.db.param(2)}`
    const contents = await this.db.query<Content>(sql, [id, lang])
    return contents.length === 0 ? null : contents[0]
  }
}
