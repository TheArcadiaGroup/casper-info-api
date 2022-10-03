import {
  getBlockByValidatorPublicKey,
  getBlocks,
  getBlockTransfers,
  getLatestBlocks
} from '@controllers/block';
import { Router } from 'express';

export const blockRouter: Router = Router();
blockRouter.route('/').get(getBlocks);
blockRouter.route('/latest/:count').get(getLatestBlocks);
blockRouter.route('/:blockHash/transfers').get(getBlockTransfers);
blockRouter.route('/validator-blocks/:publicKey').get(getBlockByValidatorPublicKey);
