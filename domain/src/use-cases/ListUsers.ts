import { UserPublic, toUserPublic } from "../dto/UserPublic";
import { IUserRepository } from "../repositories/IUserRepository";

export class ListUsers {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(): Promise<UserPublic[]> {
    const users = await this.userRepo.findAll();
    return users.map((user) => toUserPublic(user, true));
  }
}
