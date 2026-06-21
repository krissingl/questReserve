import { Router } from 'express';
import { locationFilter } from './ai.controller';

const router = Router();

router.post('/location-filter', locationFilter);

export default router;
