import { Router, Request, Response, NextFunction } from 'express';
import db from '../../db/db';
import { authenticate, requireRole } from '../../middleware';
import {
  AdminService,
  AdminUserNotFoundError,
  ForbiddenError,
  ProviderNotFoundError,
  SelfDeactivationError,
  UpdateAdminUserInput,
} from '../../services/admin.service';
import { ProviderRepository } from '../../repositories/provider.repository';
import { AdminRole, ProviderPlan, ProviderStatus } from '../../types';

const router = Router();

const providerRepo = new ProviderRepository(db);
const adminService = new AdminService(db, providerRepo);

const VALID_PROVIDER_STATUSES: ProviderStatus[] = ['ACTIVE', 'SUSPENDED'];
const VALID_PROVIDER_PLANS: ProviderPlan[] = ['FREE', 'STANDARD', 'PREMIUM'];
const VALID_ADMIN_ROLES: AdminRole[] = ['PLATFORM_ADMIN', 'CLIENT_SUCCESS', 'SUPERUSER'];

function handleAdminError(err: unknown, res: Response, next: NextFunction): void {
  if (err instanceof ProviderNotFoundError || err instanceof AdminUserNotFoundError) {
    res.status(404).json({ error: 'Not found' });
  } else if (err instanceof ForbiddenError) {
    res.status(403).json({ error: err.message });
  } else if (err instanceof SelfDeactivationError) {
    res.status(400).json({ error: err.message });
  } else {
    next(err);
  }
}

router.use(authenticate, requireRole('admin'));

router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const row = await db('admin_user')
      .select('id', 'first_name', 'last_name', 'email', 'role', 'created_at', 'updated_at')
      .where({ id: req.user!.sub })
      .first();
    if (!row) {
      res.status(404).json({ error: 'Admin user not found' });
      return;
    }
    res.json(row);
  } catch (err) {
    next(err);
  }
});

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

router.patch('/providers/:id/plan', async (req: Request, res: Response, next: NextFunction) => {
  if (typeof req.body !== 'object' || req.body === null) {
    res.status(400).json({ error: 'Request body must be a JSON object' }); return;
  }
  const { plan } = req.body as Record<string, unknown>;
  if (typeof plan !== 'string' || !VALID_PROVIDER_PLANS.includes(plan as ProviderPlan)) {
    res.status(400).json({ error: `plan must be one of: ${VALID_PROVIDER_PLANS.join(', ')}` });
    return;
  }
  try {
    const provider = await adminService.setProviderPlan(req.params.id, plan as ProviderPlan);
    res.json(provider);
  } catch (err) {
    handleAdminError(err, res, next);
  }
});

router.get('/bookings', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await adminService.getPlatformBookings();
    res.json(bookings);
  } catch (err) {
    handleAdminError(err, res, next);
  }
});

router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await adminService.listAdminUsers(req.user!.sub);
    res.json(users);
  } catch (err) {
    handleAdminError(err, res, next);
  }
});

router.patch('/users/:id', async (req: Request, res: Response, next: NextFunction) => {
  if (typeof req.body !== 'object' || req.body === null) {
    res.status(400).json({ error: 'Request body must be a JSON object' }); return;
  }
  const { role, is_active } = req.body as Record<string, unknown>;
  const data: UpdateAdminUserInput = {};

  if (role !== undefined) {
    if (typeof role !== 'string' || !VALID_ADMIN_ROLES.includes(role as AdminRole)) {
      res.status(400).json({ error: `role must be one of: ${VALID_ADMIN_ROLES.join(', ')}` });
      return;
    }
    data.role = role as AdminRole;
  }

  if (is_active !== undefined) {
    if (typeof is_active !== 'boolean') {
      res.status(400).json({ error: 'is_active must be a boolean' });
      return;
    }
    data.is_active = is_active;
  }

  if (data.role === undefined && data.is_active === undefined) {
    res.status(400).json({ error: 'At least one of role or is_active must be provided' });
    return;
  }

  try {
    const updated = await adminService.updateAdminUser(req.user!.sub, req.params.id, data);
    res.json(updated);
  } catch (err) {
    handleAdminError(err, res, next);
  }
});

export default router;
