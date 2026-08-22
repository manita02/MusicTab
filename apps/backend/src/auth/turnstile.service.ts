import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DomainError } from '@domain/errors/DomainError';

const DEFAULT_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const VERIFY_TIMEOUT_MS = 5_000;

@Injectable()
export class TurnstileService {
  constructor(private readonly config: ConfigService) {}

  async verify(token: string, remoteIp?: string): Promise<void> {
    const secret = this.config.get<string>('TURNSTILE_SECRET_KEY')?.trim();
    if (!secret) {
      throw new DomainError('TurnstileFailed', 'Human verification failed. Please try again.');
    }
    if (!token?.trim()) {
      throw new DomainError('TurnstileFailed', 'Human verification failed. Please try again.');
    }

    const url = this.config.get<string>('TURNSTILE_VERIFY_URL')?.trim() || DEFAULT_VERIFY_URL;
    const body = new URLSearchParams();
    body.set('secret', secret);
    body.set('response', token.trim());
    if (remoteIp && remoteIp.toLowerCase() !== 'unknown') {
      body.set('remoteip', remoteIp);
    }

    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), VERIFY_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        signal: ac.signal,
      });
      const data = (await res.json()) as { success?: boolean };
      if (!data.success) {
        throw new DomainError('TurnstileFailed', 'Human verification failed. Please try again.');
      }
    } catch (err) {
      if (err instanceof DomainError) throw err;
      throw new DomainError('TurnstileFailed', 'Human verification failed. Please try again.');
    } finally {
      clearTimeout(timer);
    }
  }
}
