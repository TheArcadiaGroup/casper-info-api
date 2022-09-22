import { getValidatorPerformanceAggregation } from '@controllers/reward';
import { updateValidatorPerformance } from '@controllers/validator';
import Bull from 'bull';

const validatorPerformance = new Bull('validator-performance', {
  redis: {
    host: process.env.NODE_ENV == 'dev' ? 'localhost' : process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});
export const addValidatorPerformanceCalculation = async (eraId: number) => {
  await validatorPerformance.add(eraId, {
    attempts: 10,
    removeOnComplete: true,
    removeOnFail: 1000
  });
};
export const processValidatorPerformanceCalculation = async () => {
  validatorPerformance.process(20, async (job, done) => {
    CalculateValidatorPerformance(job.data)
      .then(() => {
        done();
      })
      .catch((err) => done(new Error(err)));
  });
};

export const CalculateValidatorPerformance = async (eraId: number) => {
  const validatorPerformanceAggregation = await getValidatorPerformanceAggregation(eraId);
  validatorPerformanceAggregation?.forEach(async (validator) => {
    validator._id && (await updateValidatorPerformance(validator._id, validator.count / 360));
  });
};
