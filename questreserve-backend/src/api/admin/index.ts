import { Router, Request, Response, NextFunction } from 'express';
import db from '../../db/db';
import { authenticate, requireRole } from '../../middleware';
import { AdminService, ProviderNotFoundError } from '../../services/admin.service';
import { ProviderStatus } from '../../types';

const router = Router();

const adminService = new AdminService(db);

const VALID_PROVIDER_STATUSES: ProviderStatus[] = ['ACTIVE', 'SUSPENDED'];

function handleAdminError(err: unknown, res: Response, next: NextFunction): void {
  if (err instanceof ProviderNotFoundError) {
    res.status(404).json({ error: 'Not found' });
  } else {
    next(err);
  }
}

router.use(authenticate, requireRole('admin'));

// --- Provider management ---

router.get('/providers', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const providers = await adminService.listProviders();
    res.json(providers);
  } catch (err) {
    handleAdminError(err, res, next);
  }
});

router.get('/providers/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const provider = await adminService.getProvider(req.params.id);
    res.json(provider);
  } catch (err) {
    handleAdminError(err, res, next);
  }
});

router.patch('/providers/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  if (typeof req.body !== 'object' || req.body === null) {
    res.status(400).json({ error: 'Request body must be a JSON object' }); return;
  }
  const { status } = req.body as Record<string, unknown>;
  if (typeof status !== 'string' || !VALID_PROVIDER_STATUSES.includes(status as ProviderStatus)) {
    res.status(400).json({ error: `status must be one of: ${VALID_PROVIDER_STATUSES.join(', ')}` });
    return;
  }
  try {
    const provider = await adminService.setProviderStatus(req.params.id, status as ProviderStatus);
    res.json(provider);
  } catch (err) {
    handleAdminError(err, res, next);
  }
});

// --- Platform booking activity ---

router.get('/bookings', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await adminService.getPlatformBookings();
    res.json(bookings);
  } catch (err) {
    handleAdminError(err, res, next);
  }
});

export default router;
