import { DomainError } from "../errors/DomainError";

/** Bcrypt silently truncates beyond 72 bytes. */
const MIN_LENGTH = 8;
const MAX_LENGTH = 72;

export const PASSWORD_POLICY_MESSAGE =
  "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.";

export class Password {
  static assert(plain: string): string {
    const value = plain ?? "";
    if (value.length > MAX_LENGTH) {
      throw new DomainError("WeakPassword", "Password cannot exceed 72 characters");
    }
    const strong =
      value.length >= MIN_LENGTH &&
      /[a-z]/.test(value) &&
      /[A-Z]/.test(value) &&
      /\d/.test(value) &&
      /[^A-Za-z0-9]/.test(value);
    if (!strong) {
      throw new DomainError("WeakPassword", PASSWORD_POLICY_MESSAGE);
    }
    return value;
  }
}
