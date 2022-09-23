import { GetBlockResult } from 'casper-js-sdk';
import { logger } from '@logger';
import { casperService } from '@utils';
import Bull from 'bull';
import { setBlock } from '@controllers/block';
import { addDeployHashes } from './deploys';
import { addEraSwitchBlockHash } from './era';

export const blockQuery = new Bull('block-query', {
  redis: {
    host: process.env.NODE_ENV == 'dev' ? 'localhost' : process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});
export const blockSave = new Bull('block-save', {
  redis: {
    host: process.env.NODE_ENV == 'dev' ? 'localhost' : process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});
export const addBlockToQueryQueue = async (blockHeight: number) => {
  await blockQuery
    .add(blockHeight, {
      attempts: 10,
      removeOnComplete: true,
      removeOnFail: 1000
    })
    .then((job) => {
      console.log(job.data);
    });
};
export const processBlockQuery = () => {
  blockQuery.process(40, (job, done) => {
    QueryBlock(job.data)
      .then(() => {
        done();
      })
      .catch((err) => done(new Error(err)));
  });
};

export const addBlockToSaveQueue = async (block: any) => {
  await blockSave.add(block, {
    attempts: 10,
    removeOnComplete: true,
    removeOnFail: 1000
  });
};
export const processSaveBlock = async () => {
  blockSave.process(40, async (job, done) => {
    setBlock(job.data)
      .then(() => {
        done();
      })
      .catch((err) => done(new Error(err)));
  });
};
let queriedBlockCounter = 0;
export const QueryBlock = async (blockHeight: number) => {
  await casperService
    .getBlockInfoByHeight(blockHeight)
    .then(async (blockInfoResult: GetBlockResult) => {
      queriedBlockCounter++;
      console.log(
        `Queried block: ${queriedBlockCounter} >> ${blockInfoResult.block.header.height}`
      );
      // Type JsonBlock missing body.
      const block: any = blockInfoResult.block;
      addBlockToSaveQueue(block);
      // TODO uncomment

      addDeployHashes(block?.body?.deploy_hashes, 'deploy');

      addDeployHashes(block?.body?.transfer_hashes, 'transfer');
      if (block.header.era_end) {
        addEraSwitchBlockHash(block.hash, block.header.timestamp);
      }
    })
    .catch((err) => {
      logger.error({ blockRPC: { blockHeight, errMessage: `${err}` } });
    });
};
