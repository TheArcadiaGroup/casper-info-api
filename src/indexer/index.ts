import { CasperServiceByJsonRPC } from 'casper-js-sdk';
import { getBlockByHeight } from '@controllers/block';
import { addBlockToQueryQueue } from '@workers/blocks';
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
      if (!block) addBlockToQueryQueue(i);
    }
  }
}
export const indexer = new BlockIndexer();
