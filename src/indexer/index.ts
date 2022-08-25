import { CasperServiceByJsonRPC } from 'casper-js-sdk';
import { setBlock } from '@controllers/block';
export class BlockIndexer {
  casperService: CasperServiceByJsonRPC;
  constructor() {
    this.casperService = new CasperServiceByJsonRPC(process.env.RPC_URL as string);
  }
  /*
  Add block deploys to the DB
  Add block to DB
  Refresh top accounts at the end of each deploy iteration
*/
  async start() {
    const startBlock = Number(process.env.START_BLOCK);
    const endBlock = Number(process.env.END_BLOCK);
    for (let i = startBlock; i >= endBlock; i--) {
      await this.casperService
        .getBlockInfoByHeight(i)
        .then(async (blockInfoResult) => {
          const block: any = blockInfoResult.block;
          await setBlock(block);
          // throw new Error('Test');
        })
        .catch((err) => {
          console.error('Error getting Block: ', err);
        });
    }
  }
}
