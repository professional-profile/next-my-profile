import { db } from "@lib/db"
import { nanoid } from "nanoid"
import { Contact, ContactRepository, ContactService } from "./contact"
import { SqlContactRepository } from "./repository"
export * from "./contact"

export class ContactUseCase implements ContactService {
  constructor(private repository: ContactRepository) { }
  submit(contact: Contact): Promise<number> {
    contact.id = nanoid(10)
    contact.submittedAt = new Date()
    return this.repository.create(contact)
  }
}

let contactService: ContactService | undefined
export function getContactService(): ContactService {
  if (!contactService) {
    const repository = new SqlContactRepository(db)
    contactService = new ContactUseCase(repository)
  }
  return contactService
}
