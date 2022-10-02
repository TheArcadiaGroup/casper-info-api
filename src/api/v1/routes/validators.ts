import { getAllBids, getBidByPublicKey, seedBidRewards } from '@controllers/validator';
import { Router } from 'express';

export const validatorsRouter: Router = Router();
validatorsRouter.route('/seed/:currentEraId').post(seedBidRewards);
validatorsRouter.route('/').get(getAllBids);
validatorsRouter.route('/:publicKey').get(getBidByPublicKey);
