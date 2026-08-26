export const PASSWORD_POLICY_MESSAGE =
  "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.";

export const PASSWORD_POLICY_HINT =
  "Min. 8 characters, with uppercase, lowercase, a number, and a special character.";

export function isStrongPassword(password: string): boolean {
  const value = password ?? "";
  return (
    value.length >= 8 &&
    value.length <= 72 &&
    /[a-z]/.test(value) &&
    /[A-Z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  );
}
