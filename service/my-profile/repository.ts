import { DB } from "onecore"
import { CRUDRepository } from "sql-core"
import { User, userModel, UserRepository } from "./user"

export class SqlUserRepository extends CRUDRepository<User, string> implements UserRepository {
  constructor(db: DB) {
    super(db, "users", userModel)
  }
}
