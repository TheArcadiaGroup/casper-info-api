import {
  getAccountDelegations,
  getAccountDeploys,
  getAccountDetails,
  getAccountEraRewards,
  getAccountAddressype,
  getAccountRewards,
  getAccountTransfers,
  getAccountUndelegations,
  getTopAccounts
} from '@controllers/account';
import { Router } from 'express';

export const accountRouter: Router = Router();
accountRouter.route('/top-accounts').get(getTopAccounts);
accountRouter.route('/:address').get(getAccountDetails);
accountRouter.route('/:address/transfers').get(getAccountTransfers);
accountRouter.route('/:address/deploys').get(getAccountDeploys);
accountRouter.route('/:address/delegations').get(getAccountDelegations);
accountRouter.route('/:address/undelegations').get(getAccountUndelegations);
accountRouter.route('/:address/rewards').get(getAccountRewards);
accountRouter.route('/:address/era-rewards').get(getAccountEraRewards);
accountRouter.route('/:address/type').get(getAccountAddressype);
