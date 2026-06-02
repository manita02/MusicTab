import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ITokenService } from '@domain/services/ITokenService';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class TokenService implements ITokenService {
  constructor(private readonly config: ConfigService) {}

  private get secret(): string {
    return this.config.get<string>('JWT_SECRET') || 'super_secret_key';
  }

  async generate(payload: any, expiresInSeconds: number): Promise<string> {
    return jwt.sign(payload, this.secret, { expiresIn: expiresInSeconds });
  }

  async verify(token: string): Promise<any> {
    return jwt.verify(token, this.secret);
  }
}
