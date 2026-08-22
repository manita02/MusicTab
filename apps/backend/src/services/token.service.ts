import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ITokenService } from '@domain/services/ITokenService';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class TokenService implements ITokenService {
  constructor(private readonly config: ConfigService) {}

  private get secret(): string {
    const secret = this.config.get<string>('JWT_SECRET')?.trim();
    if (secret) return secret;
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET is required in production');
    }
    return 'super_secret_key';
  }

  async generate(payload: any, expiresInSeconds: number): Promise<string> {
    return jwt.sign(payload, this.secret, { expiresIn: expiresInSeconds });
  }

  async verify(token: string): Promise<any> {
    return jwt.verify(token, this.secret);
  }
}
