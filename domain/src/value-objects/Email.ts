import { DomainError } from "../errors/DomainError";
import { ALLOWED_EMAIL_DOMAINS } from "./allowed-email-domains";
import { DISPOSABLE_EMAIL_DOMAINS } from "./disposable-email-domains";

const FORMAT = /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/;
const ALLOWED = new Set<string>(ALLOWED_EMAIL_DOMAINS);
const DISPOSABLE = new Set<string>(DISPOSABLE_EMAIL_DOMAINS);

export class Email {
  private constructor(private readonly value: string) {}

  static create(email: string): Email {
    const normalized = (email ?? "").trim().toLowerCase();
    if (!FORMAT.test(normalized)) {
      throw new DomainError("InvalidEmail", "The email format is invalid");
    }

    const at = normalized.lastIndexOf("@");
    const local = normalized.slice(0, at);
    const domain = normalized.slice(at + 1);

    if (local.includes("+")) {
      throw new DomainError("InvalidEmail", "Plus aliases are not allowed");
    }
    if (DISPOSABLE.has(domain)) {
      throw new DomainError("InvalidEmail", "Disposable email addresses are not allowed");
    }
    if (!ALLOWED.has(domain)) {
      throw new DomainError(
        "InvalidEmail",
        "Use a well-known email provider (Gmail, Outlook, Yahoo, iCloud, Proton…)",
      );
    }

    return new Email(normalized);
  }

  toString() {
    return this.value;
  }
}
