import { setDeploy } from '@controllers/deploys';
import { CasperServiceByJsonRPC } from 'casper-js-sdk';
import { logger } from 'logger';

const casperService = new CasperServiceByJsonRPC(process.env.RPC_URL as string);
export const QueryAndSaveDeploys = async (deployHashes: string[]) => {
  deployHashes?.forEach(async (hash) => {
    await casperService
      .getDeployInfo(hash)
      .then(async (deployResult) => {
        await setDeploy(deployResult);
      })
      .catch((err) => {
        logger.error({ deployRPC: { deployHash: hash, errMessage: `${err}` } });
      });
  });
};
