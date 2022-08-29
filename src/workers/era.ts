import { CasperServiceByJsonRPC } from 'casper-js-sdk';
import { logger } from 'logger';

const casperService = new CasperServiceByJsonRPC(process.env.RPC_URL as string);
export const QueryEraSummary = async (switchBlockHeight: number) => {
  await casperService.getEraInfoBySwitchBlockHeight(switchBlockHeight).then(async (eraSummary) => {
    logger.debug(eraSummary);
  });
  // await casperService.
};
