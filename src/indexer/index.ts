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
    console.log(`Indexing started: ${startBlock} >>> ${endBlock}`);
    for (let i = startBlock; i >= endBlock; i--) {
      // console.log(i);
      queueWorker.addBlockToQueryQueue(i);
    }
  }
}
export const indexer = new BlockIndexer();
