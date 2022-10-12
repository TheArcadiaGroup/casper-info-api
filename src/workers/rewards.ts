import { setReward } from '@controllers/reward';
import Bull from 'bull';
import { SeigniorageAllocation } from 'casper-js-sdk/dist/lib/StoredValue';

export const rewardSaving = new Bull('save-reward', {
  redis: {
    host: process.env.NODE_ENV == 'dev' ? 'localhost' : process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});

export const addRewardSave = async (
  reward: SeigniorageAllocation,
  eraId: number,
  eraTimestamp: Date
) => {
  await rewardSaving.add(
    { reward, eraId, eraTimestamp },
    {
      attempts: 10,
      removeOnComplete: true,
      removeOnFail: 1000
    }
  );
};
export const processRewardSave = async () => {
  rewardSaving.process(1000, async (job, done) => {
    try {
      const { reward, eraId, eraTimestamp } = job.data;
      await setReward(reward, eraId, eraTimestamp);
      done();
    } catch (error) {
      done(new Error(error));
    }
  });
};
