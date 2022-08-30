import { getDeploys } from '@controllers/deploy';
import { Router } from 'express';

export const deployRouter: Router = Router();
deployRouter.route('/').get(getDeploys);
