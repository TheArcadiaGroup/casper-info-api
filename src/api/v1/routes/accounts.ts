import { getAccountDetails } from '@controllers/account';
import { Router } from 'express';

export const accountRouter: Router = Router();
accountRouter.route('/:address').get(getAccountDetails);
