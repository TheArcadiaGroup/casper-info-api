import {
  getAccountDelegations,
  getAccountDetails,
  getAccountUndelegations
} from '@controllers/account';
import { Router } from 'express';

export const accountRouter: Router = Router();
accountRouter.route('/:address').get(getAccountDetails);
accountRouter.route('/:address/delegations').get(getAccountDelegations);
accountRouter.route('/:address/undelegations').get(getAccountUndelegations);
