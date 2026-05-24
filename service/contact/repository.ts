import { CRUDRepository, DB } from "sql-core"
import { Contact, contactModel, ContactRepository } from "./contact"

export class SqlContactRepository extends CRUDRepository<Contact, string> implements ContactRepository {
  constructor(db: DB) {
    super(db, "contacts", contactModel)
  }
}