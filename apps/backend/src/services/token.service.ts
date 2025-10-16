import { ITokenService } from "@domain/services/ITokenService";
import * as jwt from "jsonwebtoken";

export class TokenService implements ITokenService {
  private readonly secret = process.env.JWT_SECRET || "default_secret";

  async generate(payload: Record<string, any>, expiresInSeconds: number): Promise<string> {
    return jwt.sign(payload, this.secret, { expiresIn: expiresInSeconds });
  }

  async verify(token: string): Promise<Record<string, any>> {
    return jwt.verify(token, this.secret) as Record<string, any>;
  }
}