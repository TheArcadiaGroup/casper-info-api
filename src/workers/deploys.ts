import { setDeploy } from '@controllers/deploy';
import { CasperServiceByJsonRPC } from 'casper-js-sdk';
import { logger } from '@logger';
import Bull from 'bull';
import { addAccountUpdate } from './accounts';
const queryAndSaveDeploy = new Bull('deploy-query-save', {
  redis: {
    host: process.env.NODE_ENV == 'dev' ? 'localhost' : process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});
export const addDeployHashes = async (hashes: string[], hashType: 'deploy' | 'transfer') => {
  await queryAndSaveDeploy.add(
    { hashes, hashType },
    {
      attempts: 10,
      removeOnComplete: true,
      removeOnFail: 1000
    }
  );
};

export const processDeployQuery = async () => {
  queryAndSaveDeploy.process(20, async (job, done) => {
    QueryAndSaveDeploys(job.data)
      .then(() => {
        done();
      })
      .catch((err) => done(new Error(err)));
  });
};
const casperService = new CasperServiceByJsonRPC(process.env.RPC_URL as string);
export const QueryAndSaveDeploys = async (data) => {
  const { hashes, hashType } = data;
  hashes?.forEach(async (hash) => {
    await casperService
      .getDeployInfo(hash)
      .then(async (deployResult) => {
        const deployRes: any = deployResult;
        await setDeploy(deployRes, hashType);
        addAccountUpdate(
          deployResult.deploy?.header?.account,
          new Date(deployResult.deploy.header.timestamp)
        );
      })
      .catch((err) => {
        logger.error({ deployRPC: { deployHash: hash, errMessage: `${err}` } });
      });
  });
};
