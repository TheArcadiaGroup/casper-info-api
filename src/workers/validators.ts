import {
  getBidDelegatorRewardsByEraId,
  getBidPerformanceAggregation,
  getBidRewardsByEraId
} from '@controllers/reward';
import { updateBidPerformanceAndRewards } from '@controllers/validator';
import Bull from 'bull';
export const bidPerformanceAndRewardsUpdate = new Bull('validator-update', {
  redis: {
    host: process.env.NODE_ENV == 'dev' ? 'localhost' : process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});
export const addValidatorUpdate = async (eraId: number) => {
  await bidPerformanceAndRewardsUpdate.add(eraId, {
    attempts: 10,
    removeOnComplete: true,
    removeOnFail: 1000
  });
};
export const processValidatorUpdate = async () => {
  bidPerformanceAndRewardsUpdate.process(50, async (job, done) => {
    updateBid(job.data)
      .then(() => {
        done();
      })
      .catch((err) => done(new Error(err)));
  });
};
export const updateBid = async (eraId: number) => {
  const validatorPerformanceAggregation = await getBidPerformanceAggregation(eraId);
  validatorPerformanceAggregation?.forEach(async (validator) => {
    const totalValidatorRewards: number =
      (await getBidRewardsByEraId(validator._id, eraId))[0]?.totalRewards || 0;
    const totalDelegatorRewards: number =
      (await getBidDelegatorRewardsByEraId(validator._id, eraId))[0]?.totalDelegatorRewards || 0;
    console
      .log
      // `Total Seed: ${validator._id} >> ${totalValidatorRewards} >> ${totalDelegatorRewards}`
      ();
    validator._id &&
      (await updateBidPerformanceAndRewards(
        validator._id,
        validator.count / 360,
        totalValidatorRewards,
        totalDelegatorRewards
      ));
  });
};
