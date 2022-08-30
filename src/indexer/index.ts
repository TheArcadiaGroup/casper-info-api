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
    for (let i = startBlock; i >= endBlock; i--) {
      await this.casperService
        .getBlockInfoByHeight(i)
        .then(async (blockInfoResult: GetBlockResult) => {
          // Type JsonBlock missing body.
          const block: any = blockInfoResult.block;
          queueWorker.addBlockToQueue(block);
          queueWorker.addDeployHashes(block?.body?.deploy_hashes, 'deploy');
          queueWorker.addDeployHashes(block?.body?.transfer_hashes, 'transfer');
          if (block.header.era_end) {
            queueWorker.addEraSwitchBlockHeight(block.hash);
          }
        })
        .catch((err) => {
          logger.error({ blockRPC: { blockHeight: i, errMessage: `${err}` } });
        });
    }
  }
}
export const indexer = new BlockIndexer();
