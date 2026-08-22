import { UserPublic, toUserPublic } from "../dto/UserPublic";
import { Role, User } from "../entities/User";
import { ConflictError, DomainError, NotFoundError } from "../errors/DomainError";
import { IUserRepository } from "../repositories/IUserRepository";
import { IPasswordHasher } from "../services/IPasswordHasher";

export type UpdateUserInput = {
  actorId: number;
  actorRole: Role;
  targetId: number;
  username?: string;
  email?: string;
  password?: string;
  birthDate?: Date;
  urlImg?: string;
  role?: string;
};

function parseRole(value: string): Role {
  const normalized = value.trim().toUpperCase();
  if (normalized === Role.ADMIN) return Role.ADMIN;
  if (normalized === Role.USER) return Role.USER;
  throw new DomainError("InvalidRole", "Role must be USER or ADMIN");
}

export class UpdateUser {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(dto: UpdateUserInput): Promise<UserPublic> {
    const actorIsAdmin = dto.actorRole === Role.ADMIN;
    if (!actorIsAdmin && dto.targetId !== dto.actorId) {
      throw new DomainError("AuthError", "You can only update your own account");
    }

    const target = await this.userRepo.findById(dto.targetId);
    if (!target || target.id == null) {
      throw new NotFoundError("User not found");
    }

    let nextRole = target.role;
    if (dto.role !== undefined) {
      const requested = parseRole(dto.role);
      if (!actorIsAdmin) {
        if (requested !== target.role) {
          throw new DomainError("AuthError", "You cannot change your role");
        }
      } else {
        nextRole = requested;
      }
    }

    if (target.isAdmin() && nextRole === Role.USER) {
      const adminCount = (await this.userRepo.findAll()).filter((user) => user.isAdmin()).length;
      if (adminCount <= 1) {
        throw new ConflictError("Cannot demote the last administrator");
      }
    }

    const nextUsername = dto.username !== undefined ? dto.username : target.username;
    const nextEmail = dto.email !== undefined ? dto.email : target.email.toString();

    if (nextUsername !== target.username) {
      const taken = await this.userRepo.findByUsername(nextUsername);
      if (taken && taken.id !== target.id) {
        throw new ConflictError("Username already taken");
      }
    }

    if (nextEmail.trim().toLowerCase() !== target.email.toString()) {
      const taken = await this.userRepo.findByEmail(nextEmail.trim().toLowerCase());
      if (taken && taken.id !== target.id) {
        throw new ConflictError("Email already registered");
      }
    }

    const password = dto.password?.trim();
    const nextHash = password
      ? await this.passwordHasher.hash(password)
      : target.passwordHash;

    const updated = User.rehydrate(
      target.id,
      nextUsername,
      nextEmail,
      nextHash,
      nextRole,
      target.createdAt,
      dto.birthDate ?? target.birthDate,
      dto.urlImg ?? target.urlImg.toString(),
      target.signupIp,
    );

    const saved = await this.userRepo.save(updated);
    return toUserPublic(saved, actorIsAdmin);
  }
}
