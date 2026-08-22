import { extractClientIp } from './extract-client-ip';

describe('extractClientIp', () => {
  it('uses the first x-forwarded-for hop', () => {
    expect(
      extractClientIp({
        headers: { 'x-forwarded-for': '203.0.113.10, 10.0.0.1' },
        ip: '127.0.0.1',
      }),
    ).toBe('203.0.113.10');
  });

  it('falls back to req.ip and strips IPv4-mapped IPv6', () => {
    expect(
      extractClientIp({
        headers: {},
        ip: '::ffff:127.0.0.1',
      }),
    ).toBe('127.0.0.1');
  });

  it('falls back to socket.remoteAddress', () => {
    expect(
      extractClientIp({
        headers: {},
        socket: { remoteAddress: '::1' },
      }),
    ).toBe('::1');
  });

  it('returns unknown when nothing is present', () => {
    expect(extractClientIp({ headers: {} })).toBe('unknown');
  });
});
