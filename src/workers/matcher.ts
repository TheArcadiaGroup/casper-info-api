import Bull from "bull";
import { addBlockToQueryQueue } from "@workers/blocks";
import { getBlockByHeight, getLastAddedBlock } from "@controllers/block";

export const blockMathcerQueue = new Bull('block-matcher', {
  redis: {
    host: process.env.NODE_ENV == 'dev' ? 'localhost' : process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});

export const addMissedBlocksInterval = async () => {
  await blockMathcerQueue.add(
    {},
    {
      repeat: {
        // Repeat query every 5 minutes
        every: 5 * 60 * 1000
      },
      removeOnComplete: true,
      removeOnFail: 1000,
      attempts: 10
    }
  );
};

export const addMissedBlocks = async (currentBlock: number, blockRange: number) => {
  const startBlock = currentBlock - blockRange;
  for (let i = startBlock; i <= currentBlock; i++) {
    const block = await getBlockByHeight(i);
    if (!block) addBlockToQueryQueue(i);
  }
};

export const processMissedBlocks = async () => {
  console.log('block matcher queue is started');
  const currentBlock = await getLastAddedBlock();
  const blockRange = 100;

  blockMathcerQueue.process(async (job, done) => {
    addMissedBlocks(currentBlock.blockHeight, blockRange)
      .then(() => {
        done();
      })
      .catch((err) => done(new Error(err)));
  });
};
