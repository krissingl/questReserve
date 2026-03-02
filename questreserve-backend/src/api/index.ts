import { Router } from 'express';
import authRouter from './auth';
import protectedRouter from './protected';
import providerRouter from './provider';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

router.use('/auth', authRouter);
router.use('/protected', protectedRouter);
router.use('/provider', providerRouter);

export default router;
