import { getStats } from '@controllers/stats';
import { Router } from 'express';

export const statsRouter: Router = Router();
statsRouter.route('/').get(getStats);
