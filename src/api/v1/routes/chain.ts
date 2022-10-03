import { getChainState } from '@controllers/chain';
import { getStats } from '@controllers/stats';
import { Router } from 'express';

export const chainRouter: Router = Router();
chainRouter.route('/latest-state').get(getChainState);
