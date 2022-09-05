import { setDeploy } from '@controllers/deploy';
import { CasperServiceByJsonRPC } from 'casper-js-sdk';
import { logger } from 'logger';
import { queueWorker } from 'workers';

const casperService = new CasperServiceByJsonRPC(process.env.RPC_URL as string);
export const QueryAndSaveDeploys = async (data) => {
  const { hashes, hashType } = data;
  console.log(`Hashes to query: ${hashes}`);
  hashes?.forEach(async (hash) => {
    await casperService
      .getDeployInfo(hash)
      .then(async (deployResult) => {
        console.log(`Queried hash: ${deployResult.deploy.hash}`);
        const deployRes: any = deployResult;
        await setDeploy(deployRes, hashType);
        queueWorker.addAccountUpdate(
          deployResult.deploy?.header?.account,
          new Date(deployResult.deploy.header.timestamp)
        );
      })
      .catch((err) => {
        logger.error({ deployRPC: { deployHash: hash, errMessage: `${err}` } });
      });
  });
};
