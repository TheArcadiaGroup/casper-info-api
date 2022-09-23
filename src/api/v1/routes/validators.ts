import { getAllValidators, getValidatorByPublicKey, seedValidators } from '@controllers/validator';
import { Router } from 'express';

export const validatorsRouter: Router = Router();
validatorsRouter.route('/:currentEraId').post(seedValidators);
validatorsRouter.route('/').get(getAllValidators);
validatorsRouter.route('/:validatorPublicKey').get(getValidatorByPublicKey);
