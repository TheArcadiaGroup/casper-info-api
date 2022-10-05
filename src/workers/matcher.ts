import Bull from "bull";
import { addBlockToQueryQueue } from "@workers/blocks";
import { getBlockByHeight, getLastAddedBlock } from "@controllers/block";
import { getLatestState } from "@utils";

export const blockMathcerQueue = new Bull('block-matcher', {
  redis: {
    host: process.env.NODE_ENV == 'dev' ? 'localhost' : process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});

export const addMissedBlocks = async (currentBlockHeight: number, blockRange: number) => {
  setInterval(async () => {
    const startBlock = currentBlockHeight - blockRange;

    for (let i = startBlock; i <= currentBlockHeight; i++) {
      const block = await getBlockByHeight(i);
      if (!block) addBlockToQueryQueue(i);
    }
  }, 5 * 60 * 1000 ); //repeat each 5 minutes
};

export const processMissedBlocks = async () => {
  let chainState = await getLatestState();
  const currentBlockHeight = chainState.last_added_block_info.height;
  const blockRange = 100;

  blockMathcerQueue.process(async (job, done) => {
    addMissedBlocks(currentBlockHeight, blockRange)
      .then(() => {
        done();
      })
      .catch((err) => done(new Error(err)));
  });
};
