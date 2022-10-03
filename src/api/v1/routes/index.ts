import { Router } from 'express';
import { blockRouter } from '@v1-routes/blocks';
import { deployRouter } from '@v1-routes/deploys';
import { accountRouter } from '@v1-routes/accounts';
import { statsRouter } from '@v1-routes/stats';
import { validatorsRouter } from '@v1-routes/validators';
import { chainRouter } from '@v1-routes/chain';
import { searchRouter } from '@v1-routes/search';

export const router = Router();
router.use('/v1/blocks', blockRouter);
router.use('/v1/deploys', deployRouter);
router.use('/v1/accounts', accountRouter);
router.use('/v1/stats', statsRouter);
router.use('/v1/validators', validatorsRouter);
router.use('/v1/search', searchRouter);
router.use('/v1/chain', chainRouter);
