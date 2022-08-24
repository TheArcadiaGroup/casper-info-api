import { getBlocks } from '@controllers/block';
import { Router } from 'express';

export const blockRouter: Router = Router();
blockRouter.route('/').get(getBlocks);
