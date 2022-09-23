import { Router } from 'express';
import { blockRouter } from '@v1-routes/blocks';
import { deployRouter } from './deploys';
import { accountRouter } from './accounts';
import { statsRouter } from './stats';
import { validatorsRouter } from './validators';

export const router = Router();
router.use('/v1/blocks', blockRouter);
router.use('/v1/deploys', deployRouter);
router.use('/v1/accounts', accountRouter);
router.use('/v1/stats', statsRouter);
router.use('/v1/validators', validatorsRouter);
