import { assertSafeCoverUrl, isPrivateIPv4, parseCoverUrl, UnsafeCoverUrlError } from './safe-cover-url';

describe('safe-cover-url', () => {
  it('allows http/https public hosts', () => {
    expect(parseCoverUrl('https://picsum.photos/seed/x/400/300').hostname).toBe('picsum.photos');
    expect(parseCoverUrl('http://example.com/cover.jpg').protocol).toBe('http:');
  });

  it('blocks non-http schemes and credentials', () => {
    expect(() => parseCoverUrl('file:///etc/passwd')).toThrow(UnsafeCoverUrlError);
    expect(() => parseCoverUrl('ftp://example.com/a.jpg')).toThrow(UnsafeCoverUrlError);
    expect(() => parseCoverUrl('https://user:pass@example.com/a.jpg')).toThrow(UnsafeCoverUrlError);
  });

  it('blocks localhost and private IP literals', () => {
    expect(() => parseCoverUrl('http://localhost/cover.jpg')).toThrow(UnsafeCoverUrlError);
    expect(() => parseCoverUrl('http://127.0.0.1/cover.jpg')).toThrow(UnsafeCoverUrlError);
    expect(() => parseCoverUrl('http://192.168.1.10/cover.jpg')).toThrow(UnsafeCoverUrlError);
    expect(() => parseCoverUrl('http://10.0.0.8/cover.jpg')).toThrow(UnsafeCoverUrlError);
    expect(() => parseCoverUrl('http://169.254.169.254/latest/meta-data')).toThrow(UnsafeCoverUrlError);
    expect(() => parseCoverUrl('http://[::1]/cover.jpg')).toThrow(UnsafeCoverUrlError);
  });

  it('classifies RFC1918 and loopback IPv4', () => {
    expect(isPrivateIPv4('127.0.0.1')).toBe(true);
    expect(isPrivateIPv4('10.1.2.3')).toBe(true);
    expect(isPrivateIPv4('172.16.0.1')).toBe(true);
    expect(isPrivateIPv4('8.8.8.8')).toBe(false);
    expect(isPrivateIPv4('1.1.1.1')).toBe(false);
  });

  it('blocks a public hostname that resolves to a private address', async () => {
    await expect(
      assertSafeCoverUrl('https://evil.example/cover.jpg', async () => [{ address: '127.0.0.1' }]),
    ).rejects.toBeInstanceOf(UnsafeCoverUrlError);
  });

  it('allows a public hostname that resolves to a public address', async () => {
    const url = await assertSafeCoverUrl('https://picsum.photos/x', async () => [{ address: '151.101.1.91' }]);
    expect(url.hostname).toBe('picsum.photos');
  });
});
