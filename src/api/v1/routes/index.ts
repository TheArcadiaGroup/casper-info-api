import { Router } from 'express';
import { blockRouter } from '@v1-routes/blocks';
import { deployRouter } from './deploys';

export const router = Router();
router.use('/v1/blocks', blockRouter);
router.use('/v1/deploys', deployRouter);
