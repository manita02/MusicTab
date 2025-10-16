import { IUserRepository } from "../repositories/IUserRepository";
import { IPasswordHasher } from "../services/IPasswordHasher";
import { User } from "../entities/User";
import { ConflictError } from "../errors/DomainError";

type DTO = { username: string; email: string; password: string };

export class RegisterUser {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(dto: DTO): Promise<User> {
    const existingEmail = await this.userRepo.findByEmail(dto.email.toLowerCase());
    if (existingEmail) {
      throw new ConflictError("Email already registered");
    }
    const existingUsername = await this.userRepo.findByUsername(dto.username);
    if (existingUsername) {
      throw new ConflictError("Username already taken");
    }
    const hash = await this.passwordHasher.hash(dto.password);
    const user = User.create(dto.username, dto.email, hash);
    const saved = await this.userRepo.save(user);

    return saved;
  }
}
