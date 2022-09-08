import { CasperServiceByJsonRPC, GetBlockResult } from 'casper-js-sdk';
import { logger } from 'logger';
import { queueWorker } from 'workers';
export class BlockIndexer {
  casperService: CasperServiceByJsonRPC;
  constructor() {
    this.casperService = new CasperServiceByJsonRPC(process.env.RPC_URL as string);
  }
  /*
  Add blocks to DB
  Add block deploys and transfers to the DB
  Add block to DB
  Update rewards after each switch block
  */
  async start() {
    const startBlock = Number(process.env.START_BLOCK);
    const endBlock = Number(process.env.END_BLOCK);
    for (let i = 150000; i >= 100000; i--) {
      queueWorker.addBlockToQueryQueue(i);
    }
    //  for (let i = startBlock; i >= endBlock; i--) {
    //    queueWorker.addBlockToQueryQueue(i);
    //  }
  }
}
export const indexer = new BlockIndexer();
