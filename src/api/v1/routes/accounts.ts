import {
  getAccountDelegations,
  getAccountDetails,
  getAccountRewards,
  getAccountUndelegations,
  getTopAccounts
} from '@controllers/account';
import { Router } from 'express';

export const accountRouter: Router = Router();
accountRouter.route('/top-accounts').get(getTopAccounts);
accountRouter.route('/:address').get(getAccountDetails);
accountRouter.route('/:address/delegations').get(getAccountDelegations);
accountRouter.route('/:address/undelegations').get(getAccountUndelegations);
accountRouter.route('/:address/rewards').get(getAccountRewards);
