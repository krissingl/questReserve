import { Router, Request, Response, NextFunction } from 'express';
import db from '../../db/db';
import { AuthService, InvalidCredentialsError, DuplicateAccountError } from '../../services/auth.service';

const router = Router();
const authService = new AuthService(db);

function handleAuthError(err: unknown, res: Response): void {
  if (err instanceof DuplicateAccountError) {
    res.status(409).json({ error: err.message });
  } else if (err instanceof InvalidCredentialsError) {
    res.status(401).json({ error: err.message });
  } else {
    throw err;
  }
}

router.post('/end-user/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.registerEndUser(req.body);
    res.status(201).json(result);
  } catch (err) {
    try {
      handleAuthError(err, res);
    } catch {
      next(err);
    }
  }
});

router.post('/end-user/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.loginEndUser(req.body);
    res.json(result);
  } catch (err) {
    try {
      handleAuthError(err, res);
    } catch {
      next(err);
    }
  }
});

router.post('/provider/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.registerProvider(req.body);
    res.status(201).json(result);
  } catch (err) {
    try {
      handleAuthError(err, res);
    } catch {
      next(err);
    }
  }
});

router.post('/provider/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.loginProvider(req.body);
    res.json(result);
  } catch (err) {
    try {
      handleAuthError(err, res);
    } catch {
      next(err);
    }
  }
});

router.post('/admin/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.loginAdmin(req.body);
    res.json(result);
  } catch (err) {
    try {
      handleAuthError(err, res);
    } catch {
      next(err);
    }
  }
});

export default router;
