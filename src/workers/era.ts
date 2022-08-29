import { setReward } from '@controllers/rewards';
import { CasperServiceByJsonRPC, EraSummary } from 'casper-js-sdk';

const casperService = new CasperServiceByJsonRPC(process.env.RPC_URL as string);
export const QueryEraSummary = async (switchBlockHeight: number) => {
  await casperService
    .getEraInfoBySwitchBlockHeight(switchBlockHeight)
    .then(async (eraSummary: EraSummary) => {
      const { seigniorageAllocations } = eraSummary.StoredValue.EraInfo;
      seigniorageAllocations?.forEach(async (reward) => {
        await setReward(reward, eraSummary.eraId);
      });
    });
};
