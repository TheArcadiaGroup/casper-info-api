import { getContracts, getContract, getUref } from '@controllers/contracts';
import { getDeploysByContractHash } from '@controllers/deploy';
import { Router } from 'express';

export const contractRouter = Router();
contractRouter.route('/').get(getContracts);
contractRouter.route('/:hash').get(getContract);
contractRouter.route('/:hash/deploys').get(getDeploysByContractHash);
contractRouter.route('/uref/:uref').get(getUref);
