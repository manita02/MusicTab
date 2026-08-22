import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { DomainError } from '@domain/errors/DomainError';
import { TurnstileService } from './turnstile.service';

describe('TurnstileService', () => {
  const fetchMock = jest.fn();
  const originalFetch = global.fetch;

  const serviceWith = (env: Record<string, string | undefined>) =>
    new TurnstileService({
      get: (key: string) => env[key],
    } as unknown as ConfigService);

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('rejects when the secret is missing without calling Cloudflare', async () => {
    const service = serviceWith({});
    await expect(service.verify('token', '127.0.0.1')).rejects.toBeInstanceOf(DomainError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects when the token is empty', async () => {
    const service = serviceWith({ TURNSTILE_SECRET_KEY: 'secret' });
    await expect(service.verify('  ', '127.0.0.1')).rejects.toMatchObject({ code: 'TurnstileFailed' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects when Cloudflare returns success false', async () => {
    const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    fetchMock.mockResolvedValue({
      status: 200,
      json: async () => ({
        success: false,
        'error-codes': ['invalid-input-secret'],
        hostname: 'musictab-4e9.pages.dev',
      }),
    });
    const service = serviceWith({ TURNSTILE_SECRET_KEY: 'secret' });
    await expect(service.verify('bad-token', '203.0.113.10')).rejects.toMatchObject({
      code: 'TurnstileFailed',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers['Content-Type']).toBe('application/x-www-form-urlencoded');
    expect(String(init.body)).toContain('response=bad-token');
    expect(String(init.body)).not.toContain('TURNSTILE_SECRET_KEY');
    const logged = warn.mock.calls.map((c) => String(c[0])).join(' ');
    expect(logged).toContain('invalid-input-secret');
    expect(logged).toContain('musictab-4e9.pages.dev');
    expect(logged).not.toContain('bad-token');
    expect(logged).not.toContain('secret');
    warn.mockRestore();
  });

  it('resolves when Cloudflare returns success true', async () => {
    fetchMock.mockResolvedValue({ json: async () => ({ success: true }) });
    const service = serviceWith({ TURNSTILE_SECRET_KEY: 'secret' });
    await expect(service.verify('ok-token', '203.0.113.10')).resolves.toBeUndefined();
  });
});
