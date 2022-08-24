import { getDeploys } from '@controllers/deploys';
import { Router } from 'express';

export const deployRouter: Router = Router();
deployRouter.route('/').get(getDeploys);
