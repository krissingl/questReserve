import jwt from 'jsonwebtoken';

export type TokenType = 'admin' | 'provider' | 'end_user';

export interface TokenPayload {
  sub: string;
  type: TokenType;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is not set');
  return secret;
}

function isTokenPayload(decoded: unknown): decoded is TokenPayload {
  if (typeof decoded !== 'object' || decoded === null) return false;
  const d = decoded as Record<string, unknown>;
  return typeof d.sub === 'string' && ['admin', 'provider', 'end_user'].includes(d.type as string);
}

export function signToken(payload: TokenPayload): string {
  const expiry = Number(process.env.JWT_EXPIRY_SECONDS) || 86400;
  return jwt.sign(payload, getSecret(), { expiresIn: expiry });
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, getSecret());
  if (!isTokenPayload(decoded)) throw new jwt.JsonWebTokenError('Invalid token payload');
  return decoded;
}
