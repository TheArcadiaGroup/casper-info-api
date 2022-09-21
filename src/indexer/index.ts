import { CasperServiceByJsonRPC, GetBlockResult } from 'casper-js-sdk';
import { logger } from '@logger';
import { queueWorker } from '@workers';
import { getBlockByHeight } from '@controllers/block';
export class BlockIndexer {
  casperService: CasperServiceByJsonRPC;
  constructor() {
    this.casperService = new CasperServiceByJsonRPC(process.env.RPC_URL as string);
  }

  async start() {
    const startBlock = Number(process.env.START_BLOCK);
    const endBlock = Number(process.env.END_BLOCK);
    for (let i = startBlock; i <= endBlock; i++) {
      const block = await getBlockByHeight(i);
      // console.log(block.blockHeight);
      if (!block) queueWorker.addBlockToQueryQueue(i);
    }
  }
}
export const indexer = new BlockIndexer();
