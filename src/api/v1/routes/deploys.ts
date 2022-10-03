import { getDeployByHash, getDeploys, getDeployVolumes } from '@controllers/deploy';
import { Router } from 'express';

export const deployRouter: Router = Router();
deployRouter.route('/').get(getDeploys);
deployRouter.route('/:hash').get(getDeployByHash);
deployRouter.route('/volumes').get(getDeployVolumes);
