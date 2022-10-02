import {
  getValidatorDelegatorRewardsByEraId,
  getValidatorPerformanceAggregation,
  getValidatorRewardsByEraId
} from '@controllers/reward';
import { updateBidPerformance } from '@controllers/validator';
import Bull from 'bull';
export const validatorUpdate = new Bull('validator-update', {
  redis: {
    host: process.env.NODE_ENV == 'dev' ? 'localhost' : process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});
export const addValidatorUpdate = async (eraId: number) => {
  await validatorUpdate.add(eraId, {
    attempts: 10,
    removeOnComplete: true,
    removeOnFail: 1000
  });
};
export const processValidatorUpdate = async () => {
  validatorUpdate.process(50, async (job, done) => {
    updateValidator(job.data)
      .then(() => {
        done();
      })
      .catch((err) => done(new Error(err)));
  });
};
export const updateValidator = async (eraId: number) => {
  const validatorPerformanceAggregation = await getValidatorPerformanceAggregation(eraId);
  validatorPerformanceAggregation?.forEach(async (validator) => {
    const totalValidatorRewards: number =
      (await getValidatorRewardsByEraId(validator._id, eraId))[0]?.totalRewards || 0;
    const totalDelegatorRewards: number =
      (await getValidatorDelegatorRewardsByEraId(validator._id, eraId))[0]?.totalDelegatorRewards ||
      0;
    console
      .log
      // `Total Seed: ${validator._id} >> ${totalValidatorRewards} >> ${totalDelegatorRewards}`
      ();
    validator._id &&
      (await updateBidPerformance(
        validator._id,
        validator.count / 360,
        totalValidatorRewards,
        totalDelegatorRewards
      ));
  });
};
