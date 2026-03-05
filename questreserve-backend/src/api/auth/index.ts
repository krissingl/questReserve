import { Router, Request, Response, NextFunction } from 'express';
import db from '../../db/db';
import { AuthService, InvalidCredentialsError, DuplicateAccountError, SuspendedAccountError } from '../../services/auth.service';

const router = Router();
const authService = new AuthService(db);

function validateBody(body: unknown, required: string[]): string | null {
  if (typeof body !== 'object' || body === null) return 'Request body must be a JSON object';
  const b = body as Record<string, unknown>;
  for (const field of required) {
    if (typeof b[field] !== 'string' || (b[field] as string).trim() === '') {
      return `${field} is required`;
    }
  }
  if (typeof b.password === 'string' && b.password.length > 72) {
    return 'password must not exceed 72 characters';
  }
  return null;
}

function handleAuthError(err: unknown, res: Response, next: NextFunction): void {
  if (err instanceof DuplicateAccountError) {
    res.status(409).json({ error: err.message });
  } else if (err instanceof InvalidCredentialsError) {
    res.status(401).json({ error: err.message });
  } else if (err instanceof SuspendedAccountError) {
    res.status(403).json({ error: err.message });
  } else {
    next(err);
  }
}

router.post('/end-user/register', async (req: Request, res: Response, next: NextFunction) => {
  const validationError = validateBody(req.body, ['first_name', 'last_name', 'email', 'password']);
  if (validationError) { res.status(400).json({ error: validationError }); return; }
  const { first_name, last_name, email, password } = req.body as Record<string, string>;
  try {
    const result = await authService.registerEndUser({ first_name, last_name, email, password });
    res.status(201).json(result);
  } catch (err) {
    handleAuthError(err, res, next);
  }
});

router.post('/end-user/login', async (req: Request, res: Response, next: NextFunction) => {
  const validationError = validateBody(req.body, ['email', 'password']);
  if (validationError) { res.status(400).json({ error: validationError }); return; }
  const { email, password } = req.body as Record<string, string>;
  try {
    const result = await authService.loginEndUser({ email, password });
    res.json(result);
  } catch (err) {
    handleAuthError(err, res, next);
  }
});

router.post('/provider/register', async (req: Request, res: Response, next: NextFunction) => {
  const validationError = validateBody(req.body, ['first_name', 'last_name', 'email', 'password']);
  if (validationError) { res.status(400).json({ error: validationError }); return; }
  const { first_name, last_name, email, password, organization_name } = req.body as Record<string, string>;
  try {
    const result = await authService.registerProvider({ first_name, last_name, email, password, organization_name: organization_name || undefined });
    res.status(201).json(result);
  } catch (err) {
    handleAuthError(err, res, next);
  }
});

router.post('/provider/login', async (req: Request, res: Response, next: NextFunction) => {
  const validationError = validateBody(req.body, ['email', 'password']);
  if (validationError) { res.status(400).json({ error: validationError }); return; }
  const { email, password } = req.body as Record<string, string>;
  try {
    const result = await authService.loginProvider({ email, password });
    res.json(result);
  } catch (err) {
    handleAuthError(err, res, next);
  }
});

router.post('/admin/login', async (req: Request, res: Response, next: NextFunction) => {
  const validationError = validateBody(req.body, ['email', 'password']);
  if (validationError) { res.status(400).json({ error: validationError }); return; }
  const { email, password } = req.body as Record<string, string>;
  try {
    const result = await authService.loginAdmin({ email, password });
    res.json(result);
  } catch (err) {
    handleAuthError(err, res, next);
  }
});

export default router;
