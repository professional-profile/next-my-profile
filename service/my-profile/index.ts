import { DB, SaveStrings } from "onecore"
import { SqlUserRepository } from "./repository"
import { MyProfileUseCase } from "./service"
import { MyProfileService } from "./user"

export function useMyProfileController(db: DB, saveSkills?: SaveStrings, saveInterests?: SaveStrings): MyProfileService {
  const repository = new SqlUserRepository(db)
  return new MyProfileUseCase(repository)
}
