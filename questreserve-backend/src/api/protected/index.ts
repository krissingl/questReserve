import { Router, Request, Response } from 'express';
import { authenticate, requireRole } from '../../middleware';

const router = Router();

router.get(
  '/me',
  authenticate,
  requireRole('admin', 'provider', 'end_user'),
  (req: Request, res: Response) => {
    res.json(req.user);
  }
);

export default router;
