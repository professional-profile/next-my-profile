import { db } from "@lib/db"
import { SaveStrings } from "onecore"
import { SqlUserRepository } from "./repository"
import { MyProfileUseCase } from "./service"
import { MyProfileService } from "./user"

let service: MyProfileService | undefined
export function getMyProfileService(saveSkills?: SaveStrings, saveInterests?: SaveStrings): MyProfileService {
  if (!service) {
    const repository = new SqlUserRepository(db)
    service = new MyProfileUseCase(repository)
  }
  return service
}
