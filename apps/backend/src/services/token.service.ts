import { Injectable } from '@nestjs/common';
import { ITokenService } from '@domain/services/ITokenService';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class TokenService implements ITokenService {
  private readonly secret = 'super_secret_key';

  async generate(payload: any, expiresInSeconds: number): Promise<string> {
    return jwt.sign(payload, this.secret, { expiresIn: expiresInSeconds });
  }

  async verify(token: string): Promise<any> {
    return jwt.verify(token, this.secret);
  }
}
