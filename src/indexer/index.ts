import { CasperServiceByJsonRPC, GetBlockResult } from 'casper-js-sdk';
import { logger } from 'logger';
import { queueWorker } from 'workers';
export class BlockIndexer {
  casperService: CasperServiceByJsonRPC;
  constructor() {
    this.casperService = new CasperServiceByJsonRPC(process.env.RPC_URL as string);
  }

  async start() {
    const startBlock = Number(process.env.START_BLOCK);
    const endBlock = Number(process.env.END_BLOCK);
    for (let i = 100000; i <= 200000; i++) {
      queueWorker.addBlockToQueryQueue(i);
    }
    //  for (let i = startBlock; i >= endBlock; i--) {
    //    queueWorker.addBlockToQueryQueue(i);
    //  }
  }
}
export const indexer = new BlockIndexer();
