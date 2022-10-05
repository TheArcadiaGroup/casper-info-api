import { searchAddress } from '@controllers/search';
import { Router } from 'express';

export const searchRouter: Router = Router();
searchRouter.route('/:address').get(searchAddress);
