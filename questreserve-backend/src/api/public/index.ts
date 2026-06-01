import { Router, Request, Response, NextFunction } from 'express';
import db from '../../db/db';
import { ProviderRepository } from '../../repositories/provider.repository';

const router = Router();
const providerRepo = new ProviderRepository(db);

router.get('/providers/:id/public', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await providerRepo.findPublicProfile(req.params.id);
    if (!profile) {
      res.status(404).json({ error: 'Provider not found' });
      return;
    }
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

export default router;
