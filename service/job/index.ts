import { db } from "@lib/db"
import { SqlSavedRepository } from "saved-service"
import { JobService } from "./job"
import { SqlJobRepository } from "./repository"
import { JobUseCase } from "./service"
export * from "./job"

let service: JobService | undefined
export function getJobService(): JobService {
  if (!service) {
    const repository = new SqlJobRepository(db)
    const savedRepository = new SqlSavedRepository(db, "saved_jobs", "user_id", "id", "saved_at")
    service = new JobUseCase(repository, savedRepository, 200)
  }
  return service
}
