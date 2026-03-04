import { Router } from 'express';
import authRouter from './auth';
import protectedRouter from './protected';
import providerRouter from './provider';
import customerRouter from './customer';
import adminRouter from './admin';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

router.use('/auth', authRouter);
router.use('/protected', protectedRouter);
router.use('/provider', providerRouter);
router.use('/customer', customerRouter);
router.use('/admin', adminRouter);

export default router;
