import { EraSummary } from 'casper-js-sdk';
import { logger } from '@logger';
import Bull from 'bull';
import { addValidatorUpdate } from '@workers/validators';
import { casperService, getLatestState } from '@utils';
import { addRewardSave, rewardSaving } from './rewards';
import { getEraRewards, getLatestMatchedEra, setMatchedEra } from '@controllers/reward';
import { getSwitchBlockByEraId } from '@controllers/block';

export const queryEraSummary = new Bull('era-summary-query', {
  redis: {
    host: process.env.NODE_ENV == 'dev' ? 'localhost' : process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});
export const eraMatch = new Bull('era-match', {
  redis: {
    host: process.env.NODE_ENV == 'dev' ? 'localhost' : process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});
export const addEraSwitchBlockHash = async (switchBlockHash: string, timestamp: Date) => {
  await queryEraSummary.add(
    { switchBlockHash, timestamp },
    {
      attempts: 10,
      removeOnComplete: true,
      removeOnFail: 1000
    }
  );
};
export const processEraSummaryQuery = () => {
  queryEraSummary.process(100, async (job, done) => {
    QueryEraSummary(job.data.switchBlockHash, job.data.timestamp)
      .then(() => {
        done();
      })
      .catch((err) => done(new Error(err)));
  });
};
export const addEraMatch = async () => {
  await eraMatch.add(
    {},
    {
      attempts: 10,
      removeOnComplete: true,
      removeOnFail: 1000
    }
  );
};
export const processEraMatch = () => {
  eraMatch.process(100, async (job, done) => {
    try {
      await matchEra();
      done();
    } catch (error) {
      done(new Error(error));
    }
  });
};
export const QueryEraSummary = async (switchBlockHash: string, eraTimestamp) => {
  await addEraMatch();
  await casperService
    .getEraInfoBySwitchBlock(switchBlockHash)
    .then(async (eraSummary: EraSummary) => {
      const { seigniorageAllocations } = eraSummary.StoredValue.EraInfo;
      seigniorageAllocations?.forEach(async (reward) => {
        await addRewardSave(reward, eraSummary.eraId, eraTimestamp);
      });
      if (process.env.INDEXER !== 'true') {
        addValidatorUpdate(eraSummary.eraId);
      }
    })
    .catch((err) => {
      logger.error({ eraSummaryRPC: { switchBlockHash, errMessage: `${err}` } });
    });
};
export const matchEra = async () => {
  const chainState = await getLatestState();
  const currentEra = chainState?.last_added_block_info?.era_id;
  for (let i = currentEra - 200; i <= currentEra; i++) {
    // check if any pending work
    const waitingRewardsSaves = await rewardSaving.getJobCounts();
    if (
      waitingRewardsSaves.active > 1 ||
      waitingRewardsSaves.delayed > 1 ||
      waitingRewardsSaves.waiting > 1 ||
      waitingRewardsSaves.failed > 1
    ) {
      return;
    }
    const nextSwitchBlock = await getSwitchBlockByEraId(i);
    if (!nextSwitchBlock) {
      return;
    }
    // fetch the era summary
    const eraSummary =
      nextSwitchBlock && (await casperService.getEraInfoBySwitchBlock(nextSwitchBlock?.blockHash));
    const { seigniorageAllocations } = eraSummary && eraSummary.StoredValue.EraInfo;
    // fetch era saved rewards count
    const savedEraRewards = await getEraRewards(i);
    // compare saved rewards vs fetched rewards
    console.log(`${savedEraRewards.length} <> ${seigniorageAllocations.length}`);
    if (savedEraRewards.length === seigniorageAllocations.length) {
      await setMatchedEra(i);
      return;
    }
    // if no match, update rewards
    seigniorageAllocations?.forEach(async (reward) => {
      await addRewardSave(reward, eraSummary.eraId, nextSwitchBlock.timestamp);
    });
    // add new checked era
    await setMatchedEra(i);
  }
};
