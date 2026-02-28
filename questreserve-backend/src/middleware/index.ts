import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { verifyToken, TokenPayload, TokenType } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const jsonBody = express.json();

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.url} ${res.statusCode} ${ms}ms`);
  });
  next();
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }
  const token = authHeader.slice(7);
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(...roles: TokenType[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.type)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    next();
  };
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  console.error(`ERROR ${req.method} ${req.url}:`, err.message);
  res.status(500).json({ error: 'Internal Server Error' });
};
