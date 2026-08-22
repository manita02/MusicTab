import { User } from "../entities/User";

export interface IUserRepository {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findBySignupIp(ip: string): Promise<User[]>;
  save(user: User): Promise<User>; // create or update
  deleteById(id: number): Promise<void>;
}
