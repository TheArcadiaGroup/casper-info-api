import { GetBlockResult } from 'casper-js-sdk';
import { logger } from 'logger';
import { casperService } from 'utils';
import { queueWorker } from 'workers';

export const QueryBlock = async (blockHeight: number) => {
  await casperService
    .getBlockInfoByHeight(blockHeight)
    .then(async (blockInfoResult: GetBlockResult) => {
      // Type JsonBlock missing body.
      const block: any = blockInfoResult.block;
      queueWorker.addBlockToSaveQueue(block);
      queueWorker.addDeployHashes(block?.body?.deploy_hashes, 'deploy');
      queueWorker.addDeployHashes(block?.body?.transfer_hashes, 'transfer');
      if (block.header.era_end) {
        queueWorker.addEraSwitchBlockHeight(block.hash);
      }
    })
    .catch((err) => {
      logger.error({ blockRPC: { blockHeight, errMessage: `${err}` } });
    });
};
