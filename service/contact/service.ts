import { nanoid } from "nanoid"
import { Contact, ContactRepository, ContactService } from "./contact"

export class ContactUseCase implements ContactService {
  constructor(private repository: ContactRepository) {}
  submit(contact: Contact): Promise<number> {
    contact.id = nanoid(10)
    contact.submittedAt = new Date()
    return this.repository.create(contact)
  }
}
