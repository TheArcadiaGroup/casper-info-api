import {
  getAllBids,
  getAllCurrentEraValidators,
  getAllNextEraValidators,
  getBidByPublicKey,
  getValidatorDelegators,
  seedBidRewards
} from '@controllers/validator';
import { Router } from 'express';

export const validatorsRouter: Router = Router();
validatorsRouter.route('/seed/:currentEraId').post(seedBidRewards);
validatorsRouter.route('/bids').get(getAllBids);
validatorsRouter.route('/current-era').get(getAllCurrentEraValidators);
validatorsRouter.route('/next-era').get(getAllNextEraValidators);
validatorsRouter.route('/:publicKey').get(getBidByPublicKey);
validatorsRouter.route('/:publicKey/delegators').get(getValidatorDelegators);
