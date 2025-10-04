import { Session } from "../entities/Session";

export interface ISessionRepository {
  save(session: Session): Promise<void>;
  findByToken(tokenId: string): Promise<Session | null>;
  delete(tokenId: string): Promise<void>;
}