import { Role, User } from "../entities/User";
import { DomainError } from "../errors/DomainError";

export type UserPublic = {
  id: number;
  username: string;
  email: string;
  role: Role;
  createdAt: string;
  birthDate: string;
  urlImg: string;
  signupIp?: string | null;
};

export function toUserPublic(user: User, includeSignupIp = false): UserPublic {
  if (user.id == null) {
    throw new DomainError("InvalidUser", "User must be persisted");
  }

  const dto: UserPublic = {
    id: user.id,
    username: user.username,
    email: user.email.toString(),
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    birthDate: user.birthDate.toISOString(),
    urlImg: user.urlImg.toString(),
  };

  if (includeSignupIp) {
    dto.signupIp = user.signupIp;
  }

  return dto;
}
