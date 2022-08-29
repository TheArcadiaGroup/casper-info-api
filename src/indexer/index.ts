import { CasperServiceByJsonRPC } from 'casper-js-sdk';
import { logger } from 'logger';
import { QueueWorker } from 'workers';
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
    const queueWorker = new QueueWorker();
    for (let i = startBlock; i >= endBlock; i--) {
      await this.casperService
        .getBlockInfoByHeight(i)
        .then(async (blockInfoResult) => {
          const block: any = blockInfoResult.block;
          // console.log(block);
          queueWorker.addBlockToQueue(block);
          queueWorker.addDeployHashes(block?.body?.deploy_hashes);
        })
        .catch((err) => {
          logger.error({ blockRPC: { blockHeight: i, errMessage: `${err}` } });
        });
    }
  }
}
