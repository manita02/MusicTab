export interface ITokenService {
    generate(payload: Record<string, any>, expiresInSeconds: number): Promise<string>;
    verify(token: string): Promise<Record<string, any>>;
}
  