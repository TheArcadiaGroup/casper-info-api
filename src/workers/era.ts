import { getValidatorPerformanceAggregation, setReward } from '@controllers/reward';
import { updateValidatorPerformance } from '@controllers/validator';
import { CasperServiceByJsonRPC, EraSummary } from 'casper-js-sdk';
import { logger } from 'logger';
import { queueWorker } from 'workers';

const casperService = new CasperServiceByJsonRPC(process.env.RPC_URL as string);
export const QueryEraSummary = async (switchBlockHash: string) => {
  await casperService
    .getEraInfoBySwitchBlock(switchBlockHash)
    .then(async (eraSummary: EraSummary) => {
      const { seigniorageAllocations } = eraSummary.StoredValue.EraInfo;
      seigniorageAllocations?.forEach(async (reward) => {
        await setReward(reward, eraSummary.eraId);
      });
      // TODO move the performance calculator to the event stream
      queueWorker.addValidatorPerformanceCalculation(eraSummary.eraId);
    })
    .catch((err) => {
      logger.error({ eraSummaryRPC: { switchBlockHash, errMessage: `${err}` } });
    });
};

export const CalculateValidatorPerformance = async (eraId: number) => {
  const validatorPerformanceAggregation = await getValidatorPerformanceAggregation(eraId);
  validatorPerformanceAggregation?.forEach(async (validator) => {
    validator._id && (await updateValidatorPerformance(validator._id, validator.count / 360));
  });
};