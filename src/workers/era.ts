import { setReward } from '@controllers/reward';
import { CasperServiceByJsonRPC, EraSummary } from 'casper-js-sdk';
import { logger } from '@logger';
import Bull from 'bull';
import { addValidatorPerformanceCalculation } from './validators';
const queryEraSummary = new Bull('era-summary-query', {
  redis: {
    host: process.env.NODE_ENV == 'dev' ? 'localhost' : process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});
export const addEraSwitchBlockHeight = async (switchBlockHash: string, timestamp: Date) => {
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
  queryEraSummary.process(20, async (job, done) => {
    QueryEraSummary(job.data.switchBlockHash, job.data.timestamp)
      .then(() => {
        done();
      })
      .catch((err) => done(new Error(err)));
  });
};
const casperService = new CasperServiceByJsonRPC(process.env.RPC_URL as string);
export const QueryEraSummary = async (switchBlockHash: string, eraTimestamp) => {
  await casperService
    .getEraInfoBySwitchBlock(switchBlockHash)
    .then(async (eraSummary: EraSummary) => {
      const { seigniorageAllocations } = eraSummary.StoredValue.EraInfo;
      seigniorageAllocations?.forEach(async (reward) => {
        await setReward(reward, eraSummary.eraId, eraTimestamp);
      });
      if (process.env.INDEXER !== 'true') {
        addValidatorPerformanceCalculation(eraSummary.eraId);
      }
    })
    .catch((err) => {
      logger.error({ eraSummaryRPC: { switchBlockHash, errMessage: `${err}` } });
    });
};
