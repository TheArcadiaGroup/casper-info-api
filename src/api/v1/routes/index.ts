import { Router } from 'express';
import { blockRouter } from '@v1-routes/blocks';

export const router = Router();
router.use('/v1/blocks', blockRouter);
