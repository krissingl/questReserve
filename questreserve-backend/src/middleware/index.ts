import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

export const jsonBody = express.json();

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.url} ${res.statusCode} ${ms}ms`);
  });
  next();
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  console.error(`ERROR ${req.method} ${req.url}:`, err.message);
  res.status(500).json({ error: 'Internal Server Error' });
};
