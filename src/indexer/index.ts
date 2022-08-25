import { CasperServiceByJsonRPC } from 'casper-js-sdk';
import { setBlock } from '@controllers/block';
import { logger } from 'logger';
import { setDeploy } from '@controllers/deploys';
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
    // TODO use a worker (bull queues)
    const startBlock = Number(process.env.START_BLOCK);
    const endBlock = Number(process.env.END_BLOCK);
    for (let i = startBlock; i >= endBlock; i--) {
      await this.casperService
        .getBlockInfoByHeight(i)
        .then(async (blockInfoResult) => {
          const block: any = blockInfoResult.block;
          await setBlock(block);
          // Loop through all deploy hashes query the block and save the data to the DB
          block.block?.deploy_hashes?.forEach(async (hash) => {
            await this.casperService
              .getDeployInfo(hash)
              .then(async (deployResult) => {
                await setDeploy(deployResult);
              })
              .catch((err) => {
                logger.error({ deployRPC: { deployHash: hash, errMessage: `${err}` } });
              });
          });
        })
        .catch((err) => {
          logger.error({ blockRPC: { blockHeight: i, errMessage: `${err}` } });
        });
    }
  }
}
