import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DomainError } from '@domain/errors/DomainError';

const DEFAULT_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const VERIFY_TIMEOUT_MS = 5_000;

type SiteverifyBody = {
  success?: boolean;
  'error-codes'?: string[];
  hostname?: string;
};

@Injectable()
export class TurnstileService {
  private readonly logger = new Logger(TurnstileService.name);

  constructor(private readonly config: ConfigService) {}

  async verify(token: string, remoteIp?: string): Promise<void> {
    const secret = this.config.get<string>('TURNSTILE_SECRET_KEY')?.trim();
    if (!secret) {
      this.logger.warn('Turnstile verify skipped: TURNSTILE_SECRET_KEY is empty');
      throw new DomainError('TurnstileFailed', 'Human verification failed. Please try again.');
    }
    if (!token?.trim()) {
      this.logger.warn('Turnstile verify skipped: token is empty');
      throw new DomainError('TurnstileFailed', 'Human verification failed. Please try again.');
    }

    const url = this.config.get<string>('TURNSTILE_VERIFY_URL')?.trim() || DEFAULT_VERIFY_URL;
    const remoteipProvided = Boolean(remoteIp && remoteIp.toLowerCase() !== 'unknown');
    const body = new URLSearchParams();
    body.set('secret', secret);
    body.set('response', token.trim());
    if (remoteipProvided && remoteIp) {
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
      const data = (await res.json()) as SiteverifyBody;
      if (!data.success) {
        const codes = JSON.stringify(data['error-codes'] ?? []);
        this.logger.warn(
          `Turnstile siteverify failed status=${res.status} codes=${codes} hostname=${data.hostname ?? 'n/a'} remoteipProvided=${remoteipProvided}`,
        );
        throw new DomainError('TurnstileFailed', 'Human verification failed. Please try again.');
      }
    } catch (err) {
      if (err instanceof DomainError) throw err;
      const name = err instanceof Error ? err.name : 'Error';
      this.logger.warn(
        `Turnstile siteverify request failed name=${name}${name === 'AbortError' ? ' (timeout)' : ''}`,
      );
      throw new DomainError('TurnstileFailed', 'Human verification failed. Please try again.');
    } finally {
      clearTimeout(timer);
    }
  }
}
