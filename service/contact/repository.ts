import { DB } from "onecore"
import { CRUDRepository } from "sql-core"
import { Contact, contactModel, ContactRepository } from "./contact"

export class SqlContactRepository extends CRUDRepository<Contact, string> implements ContactRepository {
  constructor(db: DB) {
    super(db, "contacts", contactModel)
  }
}
