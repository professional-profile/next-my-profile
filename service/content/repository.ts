import { DB } from "onecore"
import { Content, ContentRepository } from "./content"

export class SqlContentRepository implements ContentRepository {
  constructor(protected db: DB) {}
  load(id: string, lang: string): Promise<Content | null> {
    const sql = `select id, lang, body from contents where id = ${this.db.param(1)} and lang = ${this.db.param(2)}`
    return this.db.queryOne<Content>(sql, [id, lang])
  }
}
