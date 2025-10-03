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
    const existing = await this.userRepo.findByEmail(dto.email.toLowerCase()); // Verify that a user with that email does not already exist
    if (existing) {
      throw new ConflictError("Email already registered");
    }

    const hash = await this.passwordHasher.hash(dto.password); // Generate the password hash (with IPasswordHasher)
    const user = User.create(dto.username, dto.email, hash); // Create the User entity
    const saved = await this.userRepo.save(user); // Save to repository (the actual implementation in infra will be Prisma/DB)
    return saved; // Return the newly registered User
  }
}
